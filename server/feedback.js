/* "Do your top 3 careers feel right?" (1–5), shown under the results.
   This is how Disha measures its own accuracy, and how the O*NET and Holland-code
   matching methods are compared. Privacy: nothing that identifies a student is
   stored, only the day, method, class band, rating and the three career ids.
   A hashed-IP limit (see rate.js) stops one device from flooding the table. */
import { HttpError, json, readJson } from "./http.js";
import { rateLimit, ipHash, DAY, HOUR } from "./rate.js";
import { sha256Hex, safeEqual } from "./crypto.js";

const METHODS = new Set(["onet", "holland"]);
const STAGES = new Set(["m", "s", "h", "c"]);
const CAREER_ID = /^[a-z]{2,20}$/;

export async function submit({ request, env }) {
  const body = await readJson(request);
  const rating = body.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "bad_rating", "Rating must be 1 to 5.");
  if (!METHODS.has(body.method)) throw new HttpError(400, "bad_method", "Unknown method.");
  const stage = body.stage == null ? null : body.stage;
  if (stage !== null && !STAGES.has(stage)) throw new HttpError(400, "bad_stage", "Unknown class.");
  const top = body.top;
  if (!Array.isArray(top) || top.length < 1 || top.length > 3 || !top.every(id => typeof id === "string" && CAREER_ID.test(id))) {
    throw new HttpError(400, "bad_careers", "Expected up to 3 career ids.");
  }

  await rateLimit(env, "feedback:" + await ipHash(request, env), 20, DAY);
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    "INSERT INTO match_feedback (day, method, stage, rating, top1, top2, top3) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
  ).bind(day, body.method, stage, rating, top[0], top[1] || null, top[2] || null).run();
  return json({ ok: true });
}

/* GET /api/feedback/summary: the owner's private accuracy page (#/insights).
   Needs the X-Admin-Secret header to match the ADMIN_SECRET secret; answers 404
   while ADMIN_SECRET is not set. Returns totals and averages only, never rows. */
const MIN_FOR_CAREER = 5; // careers need at least this many ratings to be listed

export async function summary({ request, env }) {
  if (!env.ADMIN_SECRET || env.ADMIN_SECRET.length < 16) throw new HttpError(404, "not_found", "Not found.");
  // Slow down guessing: 20 tries an hour per device, right or wrong.
  await rateLimit(env, "feedback-summary:" + await ipHash(request, env), 20, HOUR);
  const given = request.headers.get("X-Admin-Secret") || "";
  if (!safeEqual(await sha256Hex(given), await sha256Hex(env.ADMIN_SECRET))) throw new HttpError(401, "bad_secret", "Wrong password.");

  const all = sql => env.DB.prepare(sql).all().then(r => r.results);
  const stats = "COUNT(*) AS ratings, ROUND(AVG(rating), 2) AS avg, ROUND(100.0 * SUM(rating >= 4) / COUNT(*), 1) AS feelsRight";
  const [byMethod, byStage, byMethodStage, last30, careers, spread] = await Promise.all([
    all(`SELECT method, ${stats} FROM match_feedback GROUP BY method ORDER BY method`),
    all(`SELECT COALESCE(stage, '?') AS stage, ${stats} FROM match_feedback GROUP BY stage ORDER BY stage`),
    all(`SELECT method, COALESCE(stage, '?') AS stage, ${stats} FROM match_feedback GROUP BY method, stage ORDER BY stage, method`),
    all(`SELECT day, COUNT(*) AS ratings, ROUND(AVG(rating), 2) AS avg FROM match_feedback
         WHERE day >= date('now', '-29 days') GROUP BY day ORDER BY day`),
    all(`SELECT top1 AS career, ${stats} FROM match_feedback GROUP BY top1 HAVING COUNT(*) >= ${MIN_FOR_CAREER} ORDER BY avg ASC`),
    all(`SELECT rating, COUNT(*) AS n FROM match_feedback GROUP BY rating ORDER BY rating`)
  ]);
  return json({ byMethod, byStage, byMethodStage, last30, careers, spread, minForCareer: MIN_FOR_CAREER }, 200, { "Cache-Control": "no-store" });
}
