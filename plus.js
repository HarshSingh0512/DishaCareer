/* Disha Plus: personal calendar, monthly reminders and term snapshots.
   Everything here needs an active Plus plan (Guided includes Plus). */
import { HttpError, json, readJson, now } from "./http.js";
import { randomId, sha256Hex, safeEqual } from "./crypto.js";
import { rateLimit, DAY } from "./rate.js";
import { requireUser, requireConsent } from "./auth.js";
import { activeEntitlements } from "./account.js";
import { sendEmail } from "./email.js";
import { buildFeed, indiaNow } from "./plus-calendar.js";

const STAGES = ["m", "s", "h", "c"];
const STREAMS = ["PCM", "PCB", "PCMB", "COM", "HUM"];
const RIASEC = ["R", "I", "A", "S", "E", "C"];
const BIG5 = ["O", "C", "E", "A", "S"];
const APT = ["num", "verb", "log", "spat"];
const MAX_SNAPSHOTS = 24;

async function requirePlus(request, env) {
  const user = await requireUser(request, env);
  requireConsent(user);
  const plus = (await activeEntitlements(env, user.id)).find(e => e.product === "plus");
  if (!plus) throw new HttpError(403, "plan_required", "This is part of Disha Plus.");
  return { user, plus };
}

const loadProfile = async (env, userId) => {
  const row = await env.DB.prepare("SELECT * FROM plus_profiles WHERE user_id = ?1").bind(userId).first();
  return row ? { stage: row.stage, stream: row.stream, exams: JSON.parse(row.exams), reminders: row.reminders === 1, updatedAt: row.updated_at } : null;
};

// The browser sends the student's stage, stream and the exam names of their top careers.
export async function saveProfile({ request, env }) {
  const { user } = await requirePlus(request, env);
  await rateLimit(env, "plus-profile:" + user.id, 60, DAY);
  const b = await readJson(request);
  const current = await loadProfile(env, user.id);
  const stage = b.stage === undefined && current ? current.stage : b.stage;
  if (!STAGES.includes(stage)) throw new HttpError(400, "invalid_stage", "Unknown class.");
  const stream = b.stream == null ? null : b.stream;
  if (stream !== null && !STREAMS.includes(stream)) throw new HttpError(400, "invalid_stream", "Unknown stream.");
  let exams = current ? current.exams : [];
  if (b.exams !== undefined) {
    if (!Array.isArray(b.exams) || b.exams.length > 60 || !b.exams.every(e => typeof e === "string" && e.length <= 80)) {
      throw new HttpError(400, "invalid_exams", "Exam list is not valid.");
    }
    exams = [...new Set(b.exams)];
  }
  const reminders = typeof b.reminders === "boolean" ? b.reminders : Boolean(current && current.reminders);
  await env.DB.prepare(
    `INSERT INTO plus_profiles (user_id, stage, stream, exams, reminders, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(user_id) DO UPDATE SET stage = ?2, stream = ?3, exams = ?4, reminders = ?5, updated_at = ?6`
  ).bind(user.id, stage, stream, JSON.stringify(exams), reminders ? 1 : 0, now()).run();
  return json({ ok: true, profile: await loadProfile(env, user.id) });
}

export async function feed({ request, env }) {
  const { user, plus } = await requirePlus(request, env);
  const profile = await loadProfile(env, user.id);
  return json({
    plusUntil: plus.expiresAt,
    profile,
    months: profile ? buildFeed(profile, indiaNow()) : []
  });
}

/* ---------- term snapshots ---------- */
function scoreMap(obj, keys, field) {
  if (!obj || typeof obj !== "object") throw new HttpError(400, "invalid_" + field, "Scores are not valid.");
  const out = {};
  for (const k of keys) {
    const v = obj[k];
    if (!Number.isInteger(v) || v < 0 || v > 100) throw new HttpError(400, "invalid_" + field, "Scores are not valid.");
    out[k] = v;
  }
  return out;
}

export async function addSnapshot({ request, env }) {
  const { user } = await requirePlus(request, env);
  await rateLimit(env, "snapshot:" + user.id, 10, DAY);
  const b = await readJson(request);
  if (!STAGES.includes(b.stage)) throw new HttpError(400, "invalid_stage", "Unknown class.");
  if (!Array.isArray(b.top) || b.top.length < 1 || b.top.length > 5) throw new HttpError(400, "invalid_top", "Top careers are not valid.");
  const top = b.top.map(t => {
    if (!t || typeof t.id !== "string" || !/^[a-z]{1,30}$/.test(t.id) || typeof t.title !== "string" || t.title.length > 80 ||
      !Number.isInteger(t.score) || t.score < 0 || t.score > 100) throw new HttpError(400, "invalid_top", "Top careers are not valid.");
    return { id: t.id, title: t.title, score: t.score };
  });
  const data = {
    stage: b.stage,
    riasec: scoreMap(b.riasec, RIASEC, "riasec"),
    b5: scoreMap(b.b5, BIG5, "b5"),
    apt: b.apt == null ? null : scoreMap(b.apt, APT, "apt"),
    top
  };
  const id = randomId("snap");
  await env.DB.prepare("INSERT INTO result_snapshots (id, user_id, data, created_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(id, user.id, JSON.stringify(data), now()).run();
  // Keep the most recent MAX_SNAPSHOTS.
  await env.DB.prepare(
    `DELETE FROM result_snapshots WHERE user_id = ?1 AND id NOT IN
       (SELECT id FROM result_snapshots WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2)`
  ).bind(user.id, MAX_SNAPSHOTS).run();
  return json({ ok: true, id });
}

export async function listSnapshots({ request, env }) {
  const { user } = await requirePlus(request, env);
  const { results } = await env.DB.prepare(
    "SELECT id, data, created_at FROM result_snapshots WHERE user_id = ?1 ORDER BY created_at ASC"
  ).bind(user.id).all();
  return json({ snapshots: results.map(r => ({ id: r.id, createdAt: r.created_at, ...JSON.parse(r.data) })) });
}

/* ---------- daily job: cleanup + monthly reminder emails ----------
   Runs from the Worker's cron trigger (server/worker.js → runDaily). The HTTP
   route below exists for manual runs and tests, protected by X-Cron-Secret. */
const REMINDER_BATCH = 50;

export async function daily({ request, env, url }) {
  if (!env.CRON_SECRET) throw new HttpError(503, "cron_not_configured", "CRON_SECRET is not set.");
  const given = request.headers.get("X-Cron-Secret") || "";
  if (!safeEqual(await sha256Hex(given), await sha256Hex(env.CRON_SECRET))) throw new HttpError(401, "bad_secret", "Not allowed.");
  const force = url.searchParams.get("force") === "1" && env.DEV_MODE === "true";
  return json(await runDaily(env, { force, origin: url.origin }));
}

export async function runDaily(env, { force = false, origin = env.SITE_URL || "" } = {}) {
  const t = now();
  const cleaned = await env.DB.batch([
    env.DB.prepare("DELETE FROM otp_codes WHERE expires_at < ?1").bind(t),
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?1").bind(t),
    env.DB.prepare("DELETE FROM consent_requests WHERE expires_at < ?1").bind(t),
    env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?1").bind(t - DAY)
  ]);

  // Reminders go out in the first three days of each month (in batches, so a
  // daily run that hits the batch limit simply continues the next day).
  const today = indiaNow(t);
  const ym = `${today.year}-${String(today.month).padStart(2, "0")}`;
  let sent = 0, failed = 0;
  // No reminder emails until accounts (and email sending) are switched on.
  if (env.ACCOUNTS_ENABLED === "true" && (today.day <= 3 || force)) {
    const { results } = await env.DB.prepare(
      `SELECT p.*, u.email FROM plus_profiles p
       JOIN users u ON u.id = p.user_id
       JOIN entitlements e ON e.user_id = p.user_id AND e.product = 'plus' AND (e.expires_at IS NULL OR e.expires_at > ?1)
       WHERE p.reminders = 1 AND (p.last_sent IS NULL OR p.last_sent != ?2)
       LIMIT ?3`
    ).bind(t, ym, REMINDER_BATCH).all();
    for (const row of results) {
      const profile = { stage: row.stage, stream: row.stream, exams: JSON.parse(row.exams) };
      const [thisMonth, nextMonth] = buildFeed(profile, today, 2);
      try {
        await sendEmail(env, { to: row.email, subject: `Disha: your ${thisMonth.name} plan`, text: digestText(thisMonth, nextMonth, origin) });
        await env.DB.prepare("UPDATE plus_profiles SET last_sent = ?2 WHERE user_id = ?1").bind(row.user_id, ym).run();
        sent++;
      } catch (e) {
        failed++;
        console.error("reminder failed", row.user_id, e.message);
      }
    }
  }
  return { ok: true, cleaned: cleaned.reduce((n, r) => n + (r.meta.changes || 0), 0), sent, failed };
}

function digestText(thisMonth, nextMonth, origin) {
  const lines = m => m.items.length
    ? m.items.map(i => `- ${i.title}: ${i.what}${i.site ? ` (${i.site})` : ""}`).join("\n")
    : "- Nothing big this month. A good time to build a skill or try a project.";
  return `Here's what matters for you this month.\n\n${thisMonth.name.toUpperCase()}\n${lines(thisMonth)}\n\n` +
    `COMING UP IN ${nextMonth.name.toUpperCase()}\n${lines(nextMonth)}\n\n` +
    `Months are typical windows from recent years. Always confirm dates on the official website.\n\n` +
    `See your full calendar: ${origin}/#/plus\n` +
    `To stop these emails, switch off reminders on that page.`;
}
