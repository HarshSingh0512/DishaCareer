/* Account profile, parental consent, saved results, data export and deletion. */
import { HttpError, json, page, readJson, readText, escapeHtml, email as parseEmail, isDev, now } from "./http.js";
import { sha256Hex, randomToken } from "./crypto.js";
import { rateLimit, DAY } from "./rate.js";
import { sendEmail } from "./email.js";
import { currentUser, requireUser, requireConsent, sessionCookie } from "./auth.js";
import { publicCatalog } from "./products.js";
import { plansOnSale } from "./razorpay.js";

const MAX_STATE = 50000; // same cap the app applies to its local save
const CONSENT_DAYS = 7;

const maskEmail = e => (e ? e.replace(/^(.)[^@]*(@.*)$/, "$1***$2") : null);

export async function activeEntitlements(env, userId) {
  const { results } = await env.DB.prepare(
    "SELECT product, expires_at FROM entitlements WHERE user_id = ?1 AND (expires_at IS NULL OR expires_at > ?2)"
  ).bind(userId, now()).all();
  return results.map(r => ({ product: r.product, expiresAt: r.expires_at }));
}

export async function mePayload(env, user) {
  const base = { products: publicCatalog(), plansOnSale: plansOnSale(env) };
  if (!user) return { user: null, entitlements: [], ...base };
  return {
    user: {
      email: user.email,
      isAdult: user.is_adult == null ? null : user.is_adult === 1,
      consentStatus: user.consent_status,
      parentEmail: maskEmail(user.parent_email)
    },
    entitlements: await activeEntitlements(env, user.id),
    ...base
  };
}

export async function me({ request, env }) {
  return json(await mePayload(env, await currentUser(request, env)));
}

// The student says whether they are 18+. Under 18, a parent must approve by email.
export async function profile({ request, env }) {
  const user = await requireUser(request, env);
  const body = await readJson(request);
  if (typeof body.isAdult !== "boolean") throw new HttpError(400, "invalid_isAdult", "Please tell us if you are 18 or older.");

  let dev = {};
  if (body.isAdult) {
    await env.DB.prepare("UPDATE users SET is_adult = 1, parent_email = NULL, consent_status = 'not_required' WHERE id = ?1")
      .bind(user.id).run();
  } else {
    const parent = parseEmail(body.parentEmail, "parentEmail");
    if (parent === user.email) throw new HttpError(400, "invalid_parentEmail", "Please enter your parent's email, not your own.");
    const keep = user.consent_status === "granted" && user.parent_email === parent;
    await env.DB.prepare("UPDATE users SET is_adult = 0, parent_email = ?2, consent_status = ?3 WHERE id = ?1")
      .bind(user.id, parent, keep ? "granted" : "pending").run();
    if (!keep) dev = await sendConsentEmail(request, env, user, parent);
  }
  return json({ ...(await mePayload(env, await currentUser(request, env))), ...dev });
}

export async function resendConsent({ request, env }) {
  const user = await requireUser(request, env);
  if (user.consent_status !== "pending" || !user.parent_email) throw new HttpError(400, "not_pending", "No approval is waiting.");
  return json({ ok: true, ...(await sendConsentEmail(request, env, user, user.parent_email)) });
}

async function sendConsentEmail(request, env, user, parent) {
  await rateLimit(env, "consent:" + user.id, 5, DAY);
  const token = randomToken();
  await env.DB.prepare("DELETE FROM consent_requests WHERE user_id = ?1").bind(user.id).run();
  await env.DB.prepare("INSERT INTO consent_requests (token_hash, user_id, parent_email, expires_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(await sha256Hex(token), user.id, parent, now() + CONSENT_DAYS * DAY).run();
  const link = `${new URL(request.url).origin}/api/consent?token=${encodeURIComponent(token)}`;
  const sent = await sendEmail(env, {
    to: parent,
    subject: "Please approve your child's Disha account",
    text: `Hello,\n\nA student (${user.email}) has created a Disha career-guidance account and named you as their parent or guardian.\n\n` +
      `Because they are under 18, we need your approval before we save their quiz answers and results to their account.\n\n` +
      `Review and approve here (link valid for ${CONSENT_DAYS} days):\n${link}\n\n` +
      `If you don't recognise this, you can ignore this email and nothing will be saved.`
  });
  // The link is only ever returned to the browser on a local dev server with no email provider.
  return sent.dev && isDev(env) ? { devConsentUrl: link } : {};
}

async function findConsent(env, token) {
  if (!token || token.length > 100) return null;
  return env.DB.prepare(
    `SELECT c.user_id, c.parent_email, u.email AS student_email FROM consent_requests c
     JOIN users u ON u.id = c.user_id WHERE c.token_hash = ?1 AND c.expires_at > ?2`
  ).bind(await sha256Hex(token), now()).first();
}

const expiredPage = () => page("Link expired", `<h1>This link has expired</h1>
  <p>Ask your child to send a new approval request from their Disha account.</p>`, 400);

// GET shows a confirmation page. Approval needs a deliberate POST, so email
// link-scanners that "click" links cannot approve on a parent's behalf.
export async function consentPage({ env, url }) {
  const token = url.searchParams.get("token") || "";
  const c = await findConsent(env, token);
  if (!c) return expiredPage();
  return page("Approve Disha account", `
    <h1>Approve your child's Disha account</h1>
    <p><b>${escapeHtml(c.student_email)}</b> asked to save their career-guidance results to a Disha account.</p>
    <p>If you approve, we will store:</p>
    <ul>
      <li>their email address and yours,</li>
      <li>their quiz and aptitude answers and results,</li>
      <li>any purchases and counselling requests.</li>
    </ul>
    <p>We never sell data, show ads or use tracking. Your child can download or delete everything at any time from their account page, which also withdraws this approval.</p>
    <form method="post" action="/api/consent">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <button type="submit">I am the parent or guardian, and I approve</button>
    </form>`);
}

export async function consentConfirm({ request, env }) {
  const form = new URLSearchParams(await readText(request));
  const c = await findConsent(env, form.get("token") || "");
  if (!c) return expiredPage();
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET consent_status = 'granted', consent_at = ?2 WHERE id = ?1 AND parent_email = ?3")
      .bind(c.user_id, now(), c.parent_email),
    env.DB.prepare("DELETE FROM consent_requests WHERE user_id = ?1").bind(c.user_id)
  ]);
  return page("Approved", `<h1>Thank you, approved ✅</h1>
    <p>Your child can now save their Disha results to their account. You can close this page.</p>`);
}

export async function getState({ request, env }) {
  const user = await requireUser(request, env);
  const row = await env.DB.prepare("SELECT data, updated_at FROM saved_state WHERE user_id = ?1").bind(user.id).first();
  return json({ data: row ? row.data : null, updatedAt: row ? row.updated_at : null });
}

export async function putState({ request, env }) {
  const user = await requireUser(request, env);
  requireConsent(user);
  await rateLimit(env, "state:" + user.id, 120, 60 * 60 * 1000);
  const body = await readJson(request);
  const data = body.data;
  if (typeof data !== "string" || data.length > MAX_STATE) throw new HttpError(400, "invalid_data", "Saved data is missing or too large.");
  let parsed;
  try { parsed = JSON.parse(data); } catch { throw new HttpError(400, "invalid_data", "Saved data is not valid."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new HttpError(400, "invalid_data", "Saved data is not valid.");
  const t = now();
  await env.DB.prepare(
    `INSERT INTO saved_state (user_id, data, updated_at) VALUES (?1, ?2, ?3)
     ON CONFLICT(user_id) DO UPDATE SET data = ?2, updated_at = ?3`
  ).bind(user.id, data, t).run();
  return json({ ok: true, updatedAt: t });
}

// Everything we hold about the user, as a JSON download.
export async function exportData({ request, env }) {
  const user = await requireUser(request, env);
  const q = sql => env.DB.prepare(sql).bind(user.id);
  const [state, orders, ents, bookings, plusProfile, snapshots] = await env.DB.batch([
    q("SELECT data, updated_at FROM saved_state WHERE user_id = ?1"),
    q("SELECT id, product, amount_paise, status, created_at, paid_at FROM orders WHERE user_id = ?1"),
    q("SELECT product, expires_at FROM entitlements WHERE user_id = ?1"),
    q("SELECT phone, preferred_times, note, status, created_at FROM booking_requests WHERE user_id = ?1"),
    q("SELECT stage, stream, exams, reminders, last_sent, updated_at FROM plus_profiles WHERE user_id = ?1"),
    q("SELECT data, created_at FROM result_snapshots WHERE user_id = ?1 ORDER BY created_at")
  ]);
  const out = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, isAdult: user.is_adult, parentEmail: user.parent_email, consentStatus: user.consent_status, consentAt: user.consent_at, createdAt: user.created_at },
    savedResults: state.results[0] || null,
    orders: orders.results,
    entitlements: ents.results,
    bookingRequests: bookings.results,
    plusCalendarProfile: plusProfile.results[0] || null,
    termSnapshots: snapshots.results
  };
  return json(out, 200, { "Content-Disposition": 'attachment; filename="my-disha-data.json"' });
}

// Deletes the account and everything linked to it. Payment records are kept
// (without the user link) because tax law requires keeping financial records.
export async function deleteMe({ request, env }) {
  const user = await requireUser(request, env);
  // Child rows are deleted explicitly rather than relying on foreign-key cascades.
  const del = table => env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?1`).bind(user.id);
  await env.DB.batch([
    env.DB.prepare("UPDATE orders SET user_id = NULL WHERE user_id = ?1").bind(user.id),
    del("sessions"), del("consent_requests"), del("saved_state"), del("entitlements"), del("booking_requests"),
    del("plus_profiles"), del("result_snapshots"),
    env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(user.id),
    env.DB.prepare("DELETE FROM otp_codes WHERE email = ?1").bind(user.email)
  ]);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}
