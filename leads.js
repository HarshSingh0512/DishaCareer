/* "Talk to us" enquiries from parents, schools and counsellors. */
import { HttpError, json, readJson, str, now } from "./http.js";
import { randomId } from "./crypto.js";
import { rateLimit, ipHash, HOUR } from "./rate.js";
import { sendEmail } from "./email.js";

const ROLES = ["parent", "student", "school", "counsellor", "other"];

export async function createLead({ request, env }) {
  const body = await readJson(request);
  // Honeypot: a hidden field real people leave empty. Bots that fill it get a silent "ok".
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });
  const ip = await ipHash(request, env);
  await rateLimit(env, "lead:" + ip, 5, HOUR);

  if (!ROLES.includes(body.role)) throw new HttpError(400, "invalid_role", "Please tell us who you are.");
  const lead = {
    id: randomId("lead"),
    role: body.role,
    name: str(body.name, "name", { max: 80 }),
    contact: str(body.contact, "contact", { min: 5, max: 120 }),
    message: body.message ? str(body.message, "message", { min: 0, max: 1000 }) : ""
  };
  if (!/@|\d{7,}/.test(lead.contact.replace(/[\s-]/g, ""))) {
    throw new HttpError(400, "invalid_contact", "Please give an email or phone number we can reach you on.");
  }
  await env.DB.prepare("INSERT INTO leads (id, role, name, contact, message, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(lead.id, lead.role, lead.name, lead.contact, lead.message, ip, now()).run();

  if (env.ADMIN_EMAIL) {
    // A failed notification must not lose the enquiry, which is already saved.
    await sendEmail(env, {
      to: env.ADMIN_EMAIL,
      subject: `New Disha enquiry (${lead.role}): ${lead.name}`,
      text: `Role: ${lead.role}\nName: ${lead.name}\nContact: ${lead.contact}\n\n${lead.message}`
    }).catch(e => console.error("lead notify failed", e.message));
  }
  return json({ ok: true });
}
