/* Counselling session requests (Guided plan). A counsellor follows up by phone. */
import { HttpError, json, readJson, str, now } from "./http.js";
import { randomId } from "./crypto.js";
import { rateLimit, DAY } from "./rate.js";
import { requireUser, requireConsent } from "./auth.js";
import { activeEntitlements } from "./account.js";
import { sendEmail } from "./email.js";

export async function createBooking({ request, env }) {
  const user = await requireUser(request, env);
  requireConsent(user);
  const owned = (await activeEntitlements(env, user.id)).map(e => e.product);
  if (!owned.includes("guided")) throw new HttpError(403, "plan_required", "Counselling sessions are part of the Guided plan.");
  await rateLimit(env, "booking:" + user.id, 5, DAY);

  const body = await readJson(request);
  const phone = str(body.phone, "phone", { min: 8, max: 20 });
  if (!/^\+?[\d\s-]{8,20}$/.test(phone)) throw new HttpError(400, "invalid_phone", "Please enter a valid phone number.");
  const booking = {
    id: randomId("bk"),
    phone,
    times: str(body.preferredTimes, "preferredTimes", { min: 3, max: 200 }),
    note: body.note ? str(body.note, "note", { min: 0, max: 500 }) : ""
  };
  await env.DB.prepare("INSERT INTO booking_requests (id, user_id, phone, preferred_times, note, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
    .bind(booking.id, user.id, booking.phone, booking.times, booking.note, now()).run();

  if (env.ADMIN_EMAIL) {
    await sendEmail(env, {
      to: env.ADMIN_EMAIL,
      subject: `New counselling request from ${user.email}`,
      text: `Student: ${user.email}\nPhone: ${booking.phone}\nPreferred times: ${booking.times}\n\n${booking.note}`
    }).catch(e => console.error("booking notify failed", e.message));
  }
  return json({ ok: true, id: booking.id });
}

export async function listBookings({ request, env }) {
  const user = await requireUser(request, env);
  const { results } = await env.DB.prepare(
    "SELECT id, preferred_times, note, status, created_at FROM booking_requests WHERE user_id = ?1 ORDER BY created_at DESC"
  ).bind(user.id).all();
  return json({ bookings: results.map(b => ({ id: b.id, preferredTimes: b.preferred_times, note: b.note, status: b.status, createdAt: b.created_at })) });
}
