/* Checkout, payment confirmation and entitlements. */
import { HttpError, json, redirect, readJson, readText, isDev, now } from "./http.js";
import { randomId } from "./crypto.js";
import { rateLimit, HOUR, DAY } from "./rate.js";
import { requireUser, requireConsent } from "./auth.js";
import { PRODUCTS } from "./products.js";
import { paymentsLive, plansOnSale, createPaymentLink, verifyCallback, verifyWebhook, callbackSignature } from "./razorpay.js";

export async function checkout({ request, env, url }) {
  const user = await requireUser(request, env);
  requireConsent(user);
  if (!plansOnSale(env)) throw new HttpError(403, "not_on_sale", "Plans are not on sale yet.");
  await rateLimit(env, "checkout:" + user.id, 10, HOUR);
  const body = await readJson(request);
  const product = PRODUCTS[body.product];
  if (!product) throw new HttpError(400, "invalid_product", "Unknown plan.");

  const orderId = randomId("ord");
  await env.DB.prepare("INSERT INTO orders (id, user_id, product, amount_paise, created_at) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind(orderId, user.id, body.product, product.pricePaise, now()).run();

  if (paymentsLive(env)) {
    const link = await createPaymentLink(env, {
      amountPaise: product.pricePaise,
      referenceId: orderId,
      description: `Disha: ${product.name}`,
      email: user.email,
      callbackUrl: `${url.origin}/api/payments/callback`
    });
    await env.DB.prepare("UPDATE orders SET rzp_link_id = ?2 WHERE id = ?1").bind(orderId, link.id).run();
    return json({ url: link.url });
  }
  if (isDev(env)) return json({ url: `/api/payments/dev-pay?order=${orderId}` });
  throw new HttpError(503, "payments_not_configured", "Payments are not set up yet.");
}

// Razorpay redirects the buyer here after paying.
export async function callback({ env, url }) {
  const p = url.searchParams;
  const params = {
    linkId: p.get("razorpay_payment_link_id") || "",
    referenceId: p.get("razorpay_payment_link_reference_id") || "",
    status: p.get("razorpay_payment_link_status") || "",
    paymentId: p.get("razorpay_payment_id") || "",
    signature: p.get("razorpay_signature") || ""
  };
  const ok = params.status === "paid" && await verifyCallback(env, params);
  if (!ok) return redirect("/#/account/payment-failed");
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?1 AND rzp_link_id = ?2").bind(params.referenceId, params.linkId).first();
  if (!order) return redirect("/#/account/payment-failed");
  await fulfil(env, order, params.paymentId);
  return redirect("/#/account/paid");
}

// Server-to-server confirmation from Razorpay. Configure it in the Razorpay
// dashboard for the `payment_link.paid` event.
export async function webhook({ request, env }) {
  const raw = await readText(request);
  if (!await verifyWebhook(env, raw, request.headers.get("X-Razorpay-Signature"))) {
    throw new HttpError(400, "bad_signature", "Invalid signature.");
  }
  const event = JSON.parse(raw);
  if (event.event !== "payment_link.paid") return json({ ok: true, ignored: event.event });
  const link = event.payload && event.payload.payment_link && event.payload.payment_link.entity;
  const payment = event.payload && event.payload.payment && event.payload.payment.entity;
  if (!link || !payment) throw new HttpError(400, "bad_payload", "Missing payment details.");
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?1 AND rzp_link_id = ?2").bind(link.reference_id, link.id).first();
  if (!order) return json({ ok: true, unknownOrder: true });
  if (Number(link.amount_paid ?? link.amount) !== order.amount_paise) throw new HttpError(400, "amount_mismatch", "Amount mismatch.");
  await fulfil(env, order, payment.id);
  return json({ ok: true });
}

// Marks the order paid exactly once and grants (or extends) what it bought.
export async function fulfil(env, order, paymentId) {
  const res = await env.DB.prepare("UPDATE orders SET status = 'paid', rzp_payment_id = ?2, paid_at = ?3 WHERE id = ?1 AND status != 'paid'")
    .bind(order.id, paymentId, now()).run();
  if (!res.meta.changes || !order.user_id) return false;
  const product = PRODUCTS[order.product];
  const grants = [order.product, ...product.includes];
  for (const key of grants) {
    const days = PRODUCTS[key].days;
    const current = await env.DB.prepare("SELECT expires_at FROM entitlements WHERE user_id = ?1 AND product = ?2")
      .bind(order.user_id, key).first();
    let expires = null;
    if (days != null) {
      if (current && current.expires_at == null) continue; // already owned forever
      const from = current && current.expires_at > now() ? current.expires_at : now();
      expires = from + days * DAY;
    }
    await env.DB.prepare(
      `INSERT INTO entitlements (user_id, product, order_id, expires_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(user_id, product) DO UPDATE SET order_id = ?3, expires_at = ?4`
    ).bind(order.user_id, key, order.id, expires).run();
  }
  return true;
}

// Local development only: simulates a successful Razorpay payment, including a
// correctly signed redirect, so the whole flow can be tested without real keys.
export async function devPay({ env, url }) {
  if (!isDev(env) || paymentsLive(env)) throw new HttpError(404, "not_found", "Not found.");
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?1").bind(url.searchParams.get("order") || "").first();
  if (!order) throw new HttpError(404, "not_found", "Order not found.");
  const linkId = "plink_dev_" + order.id.slice(4);
  await env.DB.prepare("UPDATE orders SET rzp_link_id = ?2 WHERE id = ?1").bind(order.id, linkId).run();
  const params = { linkId, referenceId: order.id, status: "paid", paymentId: "pay_dev_" + order.id.slice(4) };
  const q = new URLSearchParams({
    razorpay_payment_id: params.paymentId,
    razorpay_payment_link_id: linkId,
    razorpay_payment_link_reference_id: order.id,
    razorpay_payment_link_status: "paid",
    razorpay_signature: await callbackSignature(env, params)
  });
  return redirect(`/api/payments/callback?${q}`);
}
