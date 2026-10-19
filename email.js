/* Transactional email via Resend (https://resend.com). Any provider with an HTTP
   API works the same way; only this file needs to change. In DEV_MODE without an
   API key, emails are printed to the dev-server console instead of being sent. */
import { HttpError, isDev } from "./http.js";

export async function sendEmail(env, { to, subject, text }) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) {
      console.log(`[dev email] to=${to} subject=${subject}\n${text}`);
      return { dev: true };
    }
    throw new HttpError(503, "email_not_configured", "Email is not set up on this server yet.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text })
  });
  if (!res.ok) {
    console.error("email send failed", res.status, await res.text().catch(() => ""));
    throw new HttpError(502, "email_failed", "We couldn't send the email. Please try again.");
  }
  return { dev: false };
}
