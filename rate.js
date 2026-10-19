/* Fixed-window rate limiting backed by D1. */
import { HttpError } from "./http.js";
import { hmacHex } from "./crypto.js";

export async function rateLimit(env, key, limit, windowMs) {
  const t = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN window_start <= ?2 - ?3 THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN window_start <= ?2 - ?3 THEN ?2 ELSE window_start END
     RETURNING count`
  ).bind(key, t, windowMs).first();
  if (row && row.count > limit) throw new HttpError(429, "rate_limited", "Too many attempts. Please wait a few minutes and try again.");
}

// Salted hash of the client IP: lets us rate-limit without storing raw IPs.
export async function ipHash(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return (await hmacHex(env.APP_SECRET, "ip:" + ip)).slice(0, 32);
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
