/* Razorpay Payment Links.
   We redirect the buyer to a Razorpay-hosted payment page instead of embedding
   Razorpay's checkout script, so the site keeps its strict CSP and loads no
   third-party code. Payment is confirmed twice, idempotently:
   1. the signed redirect back to /api/payments/callback, and
   2. the signed `payment_link.paid` webhook (covers closed tabs and lost redirects). */
import { HttpError, isDev } from "./http.js";
import { hmacHex, safeEqual } from "./crypto.js";

const DEV_SECRET = "dev-only-razorpay-secret";

export const paymentsLive = env => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
export const paymentsAvailable = env => paymentsLive(env) || isDev(env);
// Selling is switched on separately (PLANS_ON_SALE=true) so nothing can be bought
// before the paid features exist, even once Razorpay keys are configured.
export const plansOnSale = env => env.PLANS_ON_SALE === "true" && paymentsAvailable(env);

function keySecret(env) {
  if (env.RAZORPAY_KEY_SECRET) return env.RAZORPAY_KEY_SECRET;
  if (isDev(env)) return DEV_SECRET;
  throw new HttpError(503, "payments_not_configured", "Payments are not set up yet.");
}

export async function createPaymentLink(env, { amountPaise, referenceId, description, email, callbackUrl }) {
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const res = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      accept_partial: false,
      reference_id: referenceId,
      description,
      customer: { email },
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: callbackUrl,
      callback_method: "get",
      expire_by: Math.floor(Date.now() / 1000) + 2 * 60 * 60
    })
  });
  if (!res.ok) {
    console.error("razorpay payment link failed", res.status, await res.text().catch(() => ""));
    throw new HttpError(502, "payment_link_failed", "We couldn't start the payment. Please try again.");
  }
  const data = await res.json();
  return { id: data.id, url: data.short_url };
}

// Signature on the redirect back from a payment link.
export async function callbackSignature(env, { linkId, referenceId, status, paymentId }) {
  return hmacHex(keySecret(env), `${linkId}|${referenceId}|${status}|${paymentId}`);
}

export async function verifyCallback(env, params) {
  const expected = await callbackSignature(env, params);
  return safeEqual(expected, params.signature || "");
}

export async function verifyWebhook(env, rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) throw new HttpError(503, "webhook_not_configured", "Webhook secret is not set.");
  const expected = await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return safeEqual(expected, signature || "");
}
