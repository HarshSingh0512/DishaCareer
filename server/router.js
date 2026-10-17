/* Routes every /api request. Mounted by functions/api/[[path]].js. */
import { HttpError, json } from "./http.js";
import * as auth from "./auth.js";
import * as account from "./account.js";
import { createLead } from "./leads.js";
import * as payments from "./payments.js";
import * as bookings from "./bookings.js";
import { reportContent } from "./report.js";
import * as plus from "./plus.js";

// [method, path, handler, options]
const ROUTES = [
  ["POST", "/api/auth/start", auth.start],
  ["POST", "/api/auth/verify", auth.verify],
  ["POST", "/api/auth/logout", auth.logout],
  ["GET", "/api/me", account.me],
  ["DELETE", "/api/me", account.deleteMe],
  ["POST", "/api/me/profile", account.profile],
  ["POST", "/api/me/consent/resend", account.resendConsent],
  ["GET", "/api/me/state", account.getState],
  ["PUT", "/api/me/state", account.putState],
  ["GET", "/api/me/export", account.exportData],
  ["GET", "/api/consent", account.consentPage],
  // A plain HTML form POST: browsers send `Origin: null` under our no-referrer
  // policy, and the single-use token in the body is what authorises it.
  ["POST", "/api/consent", account.consentConfirm, { external: true }],
  ["POST", "/api/leads", createLead],
  ["POST", "/api/payments/checkout", payments.checkout],
  ["GET", "/api/payments/callback", payments.callback],
  ["POST", "/api/payments/webhook", payments.webhook, { external: true }],
  ["GET", "/api/payments/dev-pay", payments.devPay],
  ["GET", "/api/report", reportContent],
  ["GET", "/api/plus/feed", plus.feed],
  ["POST", "/api/plus/profile", plus.saveProfile],
  ["GET", "/api/plus/snapshots", plus.listSnapshots],
  ["POST", "/api/plus/snapshots", plus.addSnapshot],
  // Server-to-server, authenticated by the X-Cron-Secret header.
  ["POST", "/api/cron/daily", plus.daily, { external: true }],
  ["GET", "/api/bookings", bookings.listBookings],
  ["POST", "/api/bookings", bookings.createBooking]
];

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function handle(request, env) {
  const url = new URL(request.url);
  try {
    if (!env.DB || !env.APP_SECRET || env.APP_SECRET.length < 32) {
      throw new HttpError(503, "not_configured", "The server is not configured yet.");
    }
    const route = ROUTES.find(([m, p]) => m === request.method && p === url.pathname);
    if (!route) {
      const known = ROUTES.some(([, p]) => p === url.pathname);
      throw new HttpError(known ? 405 : 404, known ? "method_not_allowed" : "not_found", "Not found.");
    }
    const [, , handler, opts = {}] = route;
    // CSRF defence: state-changing requests must come from our own pages.
    // (Razorpay's webhook is server-to-server and is authenticated by its signature instead.)
    if (UNSAFE.has(request.method) && !opts.external && request.headers.get("Origin") !== url.origin) {
      throw new HttpError(403, "bad_origin", "Request blocked.");
    }
    return await handler({ request, env, url });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code, message: err.message }, err.status);
    console.error("unhandled", err && err.stack || err);
    return json({ error: "server_error", message: "Something went wrong. Please try again." }, 500);
  }
}
