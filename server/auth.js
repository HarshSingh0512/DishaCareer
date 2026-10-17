/* Email one-time-code login and cookie sessions. */
import { HttpError, json, readJson, getCookie, email as parseEmail, isDev, now } from "./http.js";
import { hmacHex, sha256Hex, safeEqual, randomToken, randomCode, randomId } from "./crypto.js";
import { rateLimit, ipHash, MINUTE, DAY } from "./rate.js";
import { sendEmail } from "./email.js";
import { mePayload } from "./account.js";

const COOKIE = "__Host-disha_session";
const SESSION_DAYS = 30;
const OTP_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const otpHash = (env, addr, code) => hmacHex(env.APP_SECRET, `otp:${addr}:${code}`);

export async function start({ request, env }) {
  const body = await readJson(request);
  const addr = parseEmail(body.email);
  await rateLimit(env, "otp-ip:" + await ipHash(request, env), 10, 15 * MINUTE);
  await rateLimit(env, "otp-email:" + await sha256Hex(addr), 3, 15 * MINUTE);

  const code = randomCode();
  await env.DB.prepare(
    `INSERT INTO otp_codes (email, code_hash, expires_at, attempts) VALUES (?1, ?2, ?3, 0)
     ON CONFLICT(email) DO UPDATE SET code_hash = ?2, expires_at = ?3, attempts = 0`
  ).bind(addr, await otpHash(env, addr, code), now() + OTP_MINUTES * MINUTE).run();

  const sent = await sendEmail(env, {
    to: addr,
    subject: `${code} is your Disha sign-in code`,
    text: `Your Disha sign-in code is ${code}.\n\nIt expires in ${OTP_MINUTES} minutes. If you didn't ask for it, you can ignore this email.`
  });
  // The code is only ever returned to the browser on a local dev server with no email provider.
  return json({ ok: true, ...(sent.dev && isDev(env) ? { devCode: code } : {}) });
}

export async function verify({ request, env }) {
  const body = await readJson(request);
  const addr = parseEmail(body.email);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, "invalid_code", "Enter the 6-digit code from your email.");
  await rateLimit(env, "verify-ip:" + await ipHash(request, env), 30, 15 * MINUTE);

  const row = await env.DB.prepare("SELECT code_hash, expires_at, attempts FROM otp_codes WHERE email = ?1").bind(addr).first();
  if (!row || row.expires_at < now()) throw new HttpError(400, "invalid_code", "That code has expired. Ask for a new one.");
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await env.DB.prepare("DELETE FROM otp_codes WHERE email = ?1").bind(addr).run();
    throw new HttpError(429, "too_many_attempts", "Too many wrong codes. Ask for a new one.");
  }
  if (!safeEqual(row.code_hash, await otpHash(env, addr, code))) {
    await env.DB.prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE email = ?1").bind(addr).run();
    throw new HttpError(400, "invalid_code", "That code isn't right. Please check and try again.");
  }
  await env.DB.prepare("DELETE FROM otp_codes WHERE email = ?1").bind(addr).run();

  await env.DB.prepare("INSERT INTO users (id, email, created_at) VALUES (?1, ?2, ?3) ON CONFLICT(email) DO NOTHING")
    .bind(randomId("usr"), addr, now()).run();
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?1").bind(addr).first();

  const token = randomToken();
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(await sha256Hex(token), user.id, now(), now() + SESSION_DAYS * DAY).run();

  return json(await mePayload(env, user), 200, { "Set-Cookie": sessionCookie(token, SESSION_DAYS * 86400) });
}

export async function logout({ request, env }) {
  const token = getCookie(request, COOKIE);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?1").bind(await sha256Hex(token)).run();
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}

export function sessionCookie(token, maxAge) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

// The signed-in user for this request, or null.
export async function currentUser(request, env) {
  const token = getCookie(request, COOKIE);
  if (!token || token.length > 100) return null;
  return env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2`
  ).bind(await sha256Hex(token), now()).first();
}

export async function requireUser(request, env) {
  const user = await currentUser(request, env);
  if (!user) throw new HttpError(401, "signed_out", "Please sign in first.");
  return user;
}

// Personal data may be stored only for adults or with a parent's consent (DPDP Act 2023).
export const canStoreData = user => user.consent_status === "not_required" || user.consent_status === "granted";

export function requireConsent(user) {
  if (!canStoreData(user)) throw new HttpError(403, "consent_required", "A parent needs to approve your account first.");
}
