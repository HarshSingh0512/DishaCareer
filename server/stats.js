/* Public visitor counter: unique visitors, visits and quizzes completed.
   Privacy: the browser only says "this is my first visit on this device" (a flag
   it keeps in its own storage). We store three anonymous totals, nothing per
   person. Per-IP limits (hashed IPs, see rate.js) stop one device from pumping the
   numbers, and are generous enough for a whole school lab sharing one connection. */
import { json, readJson } from "./http.js";
import { rateLimit, ipHash, HOUR, DAY } from "./rate.js";

const KEYS = ["visitors", "visits", "quizzes"];

async function read(env) {
  const { results } = await env.DB.prepare("SELECT key, value FROM site_stats").all();
  const out = { visitors: 0, visits: 0, quizzes: 0 };
  for (const r of results) if (KEYS.includes(r.key)) out[r.key] = r.value;
  return out;
}

async function bump(env, keys) {
  if (!keys.length) return;
  await env.DB.batch(keys.map(k => env.DB.prepare(
    "INSERT INTO site_stats (key, value) VALUES (?1, 1) ON CONFLICT(key) DO UPDATE SET value = value + 1"
  ).bind(k)));
}

// Over the limit means "don't count it", never an error for the visitor.
async function allowed(env, key, limit, windowMs) {
  try { await rateLimit(env, key, limit, windowMs); return true; } catch (e) {
    if (e.status === 429) return false;
    throw e;
  }
}

const fresh = data => json(data, 200, { "Cache-Control": "public, max-age=60" });

export async function getStats({ env }) {
  return fresh(await read(env));
}

export async function visit({ request, env }) {
  let body = {};
  try { body = await readJson(request); } catch (e) { /* counted as a returning visit */ }
  const ip = await ipHash(request, env);
  const keys = [];
  if (await allowed(env, "stat-visit:" + ip, 300, HOUR)) keys.push("visits");
  if (body.firstTime === true && await allowed(env, "stat-visitor:" + ip, 100, DAY)) keys.push("visitors");
  await bump(env, keys);
  return json(await read(env));
}

export async function quiz({ request, env }) {
  const ip = await ipHash(request, env);
  if (await allowed(env, "stat-quiz:" + ip, 100, DAY)) await bump(env, ["quizzes"]);
  return json(await read(env));
}
