// End-to-end API tests. They run against a local dev server:
//   npm run db:migrate:local && npm run dev     (in one terminal)
//   npm test                                    (in another)
// The server must run with DEV_MODE=true and no RESEND/RAZORPAY keys, and with
// PLANS_ON_SALE=true and RAZORPAY_WEBHOOK_SECRET set to the same value as WEBHOOK_SECRET below.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";

const BASE = process.env.API_BASE || "http://127.0.0.1:8788";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "test-webhook-secret";

// Each client gets its own client IP so per-IP rate limits don't spill between tests.
// (Locally the dev server passes this header through; in production Cloudflare
// sets CF-Connecting-IP itself and a client cannot override it.)
let ipCounter = 0;

class Client {
  cookie = "";
  ip = `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250 + 1}`;
  async req(path, { method = "GET", body, origin = BASE, type = "application/json", raw, headers = {} } = {}) {
    const h = { "CF-Connecting-IP": this.ip, ...headers };
    if (origin) h.Origin = origin;
    if (this.cookie) h.Cookie = this.cookie;
    if (body !== undefined || raw !== undefined) h["Content-Type"] = type;
    const res = await fetch(BASE + path, { method, headers: h, body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined, redirect: "manual" });
    const set = res.headers.get("set-cookie");
    if (set) {
      const [pair] = set.split(";");
      this.cookie = pair.endsWith("=") ? "" : pair;
    }
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* html or empty */ }
    return { status: res.status, json, text, headers: res.headers };
  }
  async login(email) {
    const s = await this.req("/api/auth/start", { method: "POST", body: { email } });
    assert.equal(s.status, 200, s.text);
    const v = await this.req("/api/auth/verify", { method: "POST", body: { email, code: s.json.devCode } });
    assert.equal(v.status, 200, v.text);
    return v.json;
  }
  async adult() {
    const r = await this.req("/api/me/profile", { method: "POST", body: { isAdult: true } });
    assert.equal(r.status, 200, r.text);
  }
  // Runs checkout + the dev payment simulator + the signed callback.
  async buy(product) {
    const c = await this.req("/api/payments/checkout", { method: "POST", body: { product } });
    assert.equal(c.status, 200, c.text);
    const dev = await this.req(c.json.url);
    assert.equal(dev.status, 302);
    const cb = await this.req(new URL(dev.headers.get("location"), BASE).pathname + new URL(dev.headers.get("location"), BASE).search);
    return cb.headers.get("location");
  }
  async owned() {
    return Object.fromEntries((await this.req("/api/me")).json.entitlements.map(e => [e.product, e.expiresAt]));
  }
}

const uniq = tag => `${tag}-${randomBytes(4).toString("hex")}@example.com`;
const DAY = 86400000;

test("signed-out /api/me lists plans and sets safe headers", async () => {
  const r = await new Client().req("/api/me");
  assert.equal(r.status, 200);
  assert.equal(r.json.user, null);
  assert.deepEqual(r.json.products.map(p => p.key), ["report", "plus", "guided"]);
  assert.equal(r.json.products[0].price, 499);
  assert.equal(r.json.plansOnSale, true);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
});

test("unknown routes and methods", async () => {
  const c = new Client();
  assert.equal((await c.req("/api/nope")).status, 404);
  assert.equal((await c.req("/api/me/state", { method: "POST", body: {} })).status, 405);
});

test("CSRF and input checks on login", async () => {
  const c = new Client();
  assert.equal((await c.req("/api/auth/start", { method: "POST", body: { email: uniq("a") }, origin: null })).json.error, "bad_origin");
  assert.equal((await c.req("/api/auth/start", { method: "POST", body: { email: uniq("a") }, origin: "https://evil.example" })).status, 403);
  assert.equal((await c.req("/api/auth/start", { method: "POST", raw: "email=x", type: "application/x-www-form-urlencoded" })).status, 415);
  assert.equal((await c.req("/api/auth/start", { method: "POST", body: { email: "not-an-email" } })).status, 400);
});

test("one-time code login, wrong codes and lockout", async () => {
  const c = new Client(), email = uniq("otp");
  const s = await c.req("/api/auth/start", { method: "POST", body: { email } });
  assert.match(s.json.devCode, /^\d{6}$/);
  const wrong = s.json.devCode === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++) {
    assert.equal((await c.req("/api/auth/verify", { method: "POST", body: { email, code: wrong } })).json.error, "invalid_code");
  }
  // After 5 wrong tries even the right code is refused and the code is burned.
  assert.equal((await c.req("/api/auth/verify", { method: "POST", body: { email, code: s.json.devCode } })).status, 429);
  assert.equal((await c.req("/api/auth/verify", { method: "POST", body: { email, code: s.json.devCode } })).json.error, "invalid_code");

  const me = await c.login(email);
  assert.equal(me.user.email, email);
  assert.equal(me.user.consentStatus, "unknown");
  assert.match(c.cookie, /^__Host-disha_session=/);
});

test("minor needs parent consent before results are saved", async () => {
  const c = new Client(), email = uniq("kid");
  await c.login(email);
  const state = JSON.stringify({ done: true, answers: { fav: { subjects: ["maths"] } } });
  assert.equal((await c.req("/api/me/state", { method: "PUT", body: { data: state } })).json.error, "consent_required");

  assert.equal((await c.req("/api/me/profile", { method: "POST", body: { isAdult: false, parentEmail: email } })).status, 400);
  const p = await c.req("/api/me/profile", { method: "POST", body: { isAdult: false, parentEmail: "Parent@Example.com" } });
  assert.equal(p.json.user.consentStatus, "pending");
  assert.equal(p.json.user.parentEmail, "p***@example.com");
  const link = new URL(p.json.devConsentUrl);
  const token = link.searchParams.get("token");

  // Opening the link (as an email scanner would) does not approve anything.
  const pg = await new Client().req(link.pathname + link.search, { origin: null });
  assert.equal(pg.status, 200);
  assert.match(pg.text, /I am the parent or guardian/);
  assert.match(pg.headers.get("content-security-policy"), /default-src 'none'/);
  assert.equal((await c.req("/api/me")).json.user.consentStatus, "pending");

  // Parent's browser submits the form (Origin: null under no-referrer).
  const form = { method: "POST", raw: "token=" + encodeURIComponent(token), type: "application/x-www-form-urlencoded", origin: "null" };
  const ok = await new Client().req("/api/consent", form);
  assert.equal(ok.status, 200);
  assert.match(ok.text, /approved/);
  assert.equal((await new Client().req("/api/consent", form)).status, 400); // single use
  assert.equal((await c.req("/api/me")).json.user.consentStatus, "granted");

  const put = await c.req("/api/me/state", { method: "PUT", body: { data: state } });
  assert.equal(put.status, 200);
  const got = await c.req("/api/me/state");
  assert.equal(got.json.data, state);
  assert.equal((await c.req("/api/me/state", { method: "PUT", body: { data: "not json" } })).status, 400);
  assert.equal((await c.req("/api/me/state", { method: "PUT", body: { data: "x".repeat(50001) } })).status, 400);
});

test("payments: checkout, signed callback, entitlements, bundles", async () => {
  const c = new Client();
  assert.equal((await c.req("/api/payments/checkout", { method: "POST", body: { product: "report" } })).status, 401);
  await c.login(uniq("buyer"));
  assert.equal((await c.req("/api/payments/checkout", { method: "POST", body: { product: "report" } })).json.error, "consent_required");
  await c.adult();
  assert.equal((await c.req("/api/payments/checkout", { method: "POST", body: { product: "free-stuff" } })).status, 400);

  assert.equal(await c.buy("report"), "/#/account/paid");
  assert.deepEqual(await c.owned(), { report: null });

  // A forged callback is rejected.
  const fake = await c.req("/api/payments/callback?razorpay_payment_id=pay_x&razorpay_payment_link_id=plink_x&razorpay_payment_link_reference_id=ord_x&razorpay_payment_link_status=paid&razorpay_signature=deadbeef");
  assert.equal(fake.headers.get("location"), "/#/account/payment-failed");

  // Booking needs the Guided plan.
  assert.equal((await c.req("/api/bookings", { method: "POST", body: { phone: "+91 98765 43210", preferredTimes: "Weekday evenings" } })).json.error, "plan_required");
  assert.equal(await c.buy("guided"), "/#/account/paid");
  const owned = await c.owned();
  assert.equal(owned.report, null);
  assert.ok(Math.abs(owned.guided - (Date.now() + 180 * DAY)) < DAY);
  assert.ok(Math.abs(owned.plus - (Date.now() + 365 * DAY)) < DAY);

  // Buying Plus again extends it by a year from the current expiry.
  await c.buy("plus");
  assert.ok(Math.abs((await c.owned()).plus - (owned.plus + 365 * DAY)) < DAY);

  assert.equal((await c.req("/api/bookings", { method: "POST", body: { phone: "abc", preferredTimes: "Weekday evenings" } })).status, 400);
  const b = await c.req("/api/bookings", { method: "POST", body: { phone: "+91 98765 43210", preferredTimes: "Weekday evenings", note: "With my parents" } });
  assert.equal(b.status, 200, b.text);
  const list = await c.req("/api/bookings");
  assert.equal(list.json.bookings.length, 1);
  assert.equal(list.json.bookings[0].status, "requested");
});

test("Razorpay webhook: signature, amount check, idempotency", async () => {
  const c = new Client();
  await c.login(uniq("hook"));
  await c.adult();
  const co = await c.req("/api/payments/checkout", { method: "POST", body: { product: "plus" } });
  const orderId = new URL(co.json.url, BASE).searchParams.get("order");
  await c.req(co.json.url); // dev simulator assigns the payment-link id; not following the redirect leaves it unpaid
  assert.deepEqual(await c.owned(), {});

  const event = amount => JSON.stringify({
    event: "payment_link.paid",
    payload: {
      payment_link: { entity: { id: "plink_dev_" + orderId.slice(4), reference_id: orderId, amount, amount_paid: amount, status: "paid" } },
      payment: { entity: { id: "pay_hook_1", amount } }
    }
  });
  const send = (raw, sig) => new Client().req("/api/payments/webhook", { method: "POST", raw, origin: null, headers: { "X-Razorpay-Signature": sig } });
  const sign = raw => createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");

  assert.equal((await send(event(199900), "bad")).json.error, "bad_signature");
  const cheap = event(100);
  assert.equal((await send(cheap, sign(cheap))).json.error, "amount_mismatch");
  const good = event(199900);
  assert.equal((await send(good, sign(good))).status, 200);
  const first = await c.owned();
  assert.ok(first.plus > Date.now());
  assert.equal((await send(good, sign(good))).status, 200); // replay
  assert.equal((await c.owned()).plus, first.plus);
  const other = JSON.stringify({ event: "payment.failed", payload: {} });
  assert.equal((await send(other, sign(other))).json.ignored, "payment.failed");
});

test("leads: honeypot, validation, success", async () => {
  const c = new Client();
  assert.equal((await c.req("/api/leads", { method: "POST", body: { role: "parent", name: "Bot", contact: "x@y.co", website: "spam.example" } })).json.ok, true);
  assert.equal((await c.req("/api/leads", { method: "POST", body: { role: "hacker", name: "A", contact: "a@b.co" } })).status, 400);
  assert.equal((await c.req("/api/leads", { method: "POST", body: { role: "school", name: "A School", contact: "call me" } })).json.error, "invalid_contact");
  const ok = await c.req("/api/leads", { method: "POST", body: { role: "school", name: "Sunrise Public School", contact: "+91 98765 43210", message: "Career guidance for Class 9-12" } });
  assert.equal(ok.status, 200, ok.text);
});

test("export, logout and account deletion", async () => {
  const c = new Client(), email = uniq("del");
  await c.login(email);
  await c.adult();
  await c.req("/api/me/state", { method: "PUT", body: { data: "{\"done\":true}" } });
  await c.buy("report");

  const ex = await c.req("/api/me/export");
  assert.match(ex.headers.get("content-disposition"), /attachment/);
  assert.equal(ex.json.account.email, email);
  assert.equal(ex.json.savedResults.data, "{\"done\":true}");
  assert.equal(ex.json.orders.length, 1);

  assert.equal((await c.req("/api/auth/logout", { method: "POST" })).status, 200);
  assert.equal((await c.req("/api/me")).json.user, null);

  await c.login(email);
  assert.equal((await c.req("/api/me", { method: "DELETE" })).status, 200);
  assert.equal((await c.req("/api/me")).json.user, null);
  const again = await c.login(email);
  assert.equal(again.user.consentStatus, "unknown");
  assert.deepEqual(again.entitlements, []);
  assert.equal((await c.req("/api/me/state")).json.data, null);
});

test("plan catalog lists features and marks unbuilt ones", async () => {
  const { json } = await new Client().req("/api/me");
  const byKey = Object.fromEntries(json.products.map(p => [p.key, p]));
  assert.ok(byKey.report.features.length >= 5);
  assert.ok(byKey.report.features.every(f => f.soon === false));
  assert.ok(byKey.plus.features.some(f => f.soon === true));
  assert.deepEqual(byKey.guided.includes, ["report", "plus"]);
});

test("Full Report content is only served to owners", async () => {
  assert.equal((await new Client().req("/api/report")).json.error, "signed_out");

  const c = new Client();
  await c.login(uniq("rp"));
  await c.adult();
  const locked = await c.req("/api/report");
  assert.equal(locked.status, 403);
  assert.equal(locked.json.error, "plan_required");
  assert.equal(locked.json.content, undefined);

  await c.buy("report");
  const open = await c.req("/api/report");
  assert.equal(open.status, 200);
  assert.deepEqual(Object.keys(open.json.content.types).sort(), ["A", "C", "E", "I", "R", "S"]);
  assert.equal(open.json.content.traits.O.length, 3);
  assert.equal(open.json.content.plans.s.length, 6);
  // "Inside your top 3 careers" (O*NET) comes with the paid content only.
  const sw = open.json.content.deep.software;
  assert.ok(sw.tasks.length >= 3 && sw.skills.length >= 3 && sw.knowledge.length >= 3 && sw.titles.length >= 3);
  assert.equal(sw.context.length, 7);
  assert.equal(open.headers.get("cache-control"), "no-store");

  // Plus includes the report.
  const plus = new Client();
  await plus.login(uniq("rp-plus"));
  await plus.adult();
  await plus.buy("plus");
  assert.equal((await plus.req("/api/report")).status, 200);
});

const CRON_SECRET = process.env.CRON_SECRET || "local-cron-secret-for-tests";
const snapshot = (r) => ({
  stage: "h",
  riasec: { R: r, I: 60, A: 20, S: 40, E: 30, C: 50 },
  b5: { O: 50, C: 70, E: 40, A: 60, S: 55 },
  apt: { num: 75, verb: 50, log: 100, spat: 25 },
  top: [{ id: "robotics", title: "Robotics Engineer", score: 80 }, { id: "drone", title: "Drone Pilot & Drone Engineer", score: 77 }]
});

test("Disha Plus: access, calendar profile, snapshots", async () => {
  const reportOnly = new Client();
  await reportOnly.login(uniq("plus-no"));
  await reportOnly.adult();
  await reportOnly.buy("report");
  assert.equal((await reportOnly.req("/api/plus/feed")).json.error, "plan_required");

  const c = new Client();
  await c.login(uniq("plus"));
  await c.adult();
  await c.buy("plus");
  const empty = await c.req("/api/plus/feed");
  assert.equal(empty.status, 200);
  assert.equal(empty.json.profile, null);
  assert.ok(empty.json.plusUntil > Date.now());

  assert.equal((await c.req("/api/plus/profile", { method: "POST", body: { stage: "x", exams: [] } })).status, 400);
  assert.equal((await c.req("/api/plus/profile", { method: "POST", body: { stage: "h", exams: ["x".repeat(81)] } })).status, 400);
  const saved = await c.req("/api/plus/profile", { method: "POST", body: { stage: "h", stream: "PCM", exams: ["JEE Main", "BITSAT"] } });
  assert.equal(saved.status, 200, saved.text);
  assert.equal(saved.json.profile.reminders, false);

  const feed = (await c.req("/api/plus/feed")).json;
  assert.equal(feed.months.length, 6);
  const ids = new Set(feed.months.flatMap(m => m.items.map(i => i.id)));
  assert.ok(!ids.has("neet"), "NEET is not in this student's careers");
  assert.ok(!ids.has("gate"), "GATE is for college students");

  // Turning reminders on keeps the rest of the profile.
  const on = await c.req("/api/plus/profile", { method: "POST", body: { reminders: true } });
  assert.equal(on.json.profile.reminders, true);
  assert.deepEqual(on.json.profile.exams, ["JEE Main", "BITSAT"]);

  assert.equal((await c.req("/api/plus/snapshots", { method: "POST", body: { ...snapshot(101) } })).status, 400);
  assert.equal((await c.req("/api/plus/snapshots", { method: "POST", body: { ...snapshot(50), top: [{ id: "<x>", title: "x", score: 1 }] } })).status, 400);
  assert.equal((await c.req("/api/plus/snapshots", { method: "POST", body: snapshot(40) })).status, 200);
  assert.equal((await c.req("/api/plus/snapshots", { method: "POST", body: snapshot(70) })).status, 200);
  const snaps = (await c.req("/api/plus/snapshots")).json.snapshots;
  assert.deepEqual(snaps.map(s => s.riasec.R), [40, 70]);
  assert.equal(snaps[1].top[0].id, "robotics");

  // Guided includes Plus.
  const g = new Client();
  await g.login(uniq("plus-guided"));
  await g.adult();
  await g.buy("guided");
  assert.equal((await g.req("/api/plus/feed")).status, 200);
});

test("daily job: secret required, cleanup, one reminder per month", async () => {
  const cron = (secret, q = "") => new Client().req("/api/cron/daily" + q, { method: "POST", origin: null, headers: secret ? { "X-Cron-Secret": secret } : {} });
  assert.equal((await cron(null)).status, 401);
  assert.equal((await cron("wrong")).status, 401);

  const c = new Client(), email = uniq("remind");
  await c.login(email);
  await c.adult();
  await c.buy("plus");
  await c.req("/api/plus/profile", { method: "POST", body: { stage: "s", exams: [], reminders: true } });

  const first = await cron(CRON_SECRET, "?force=1");
  assert.equal(first.status, 200, first.text);
  assert.ok(first.json.sent >= 1);
  const lastSent = (await c.req("/api/me/export")).json.plusCalendarProfile.last_sent;
  assert.match(lastSent, /^\d{4}-\d{2}$/);
  assert.equal((await cron(CRON_SECRET, "?force=1")).json.sent, 0); // already sent this month
});

test("public visitor counter: unique visitors, visits, quizzes", async () => {
  const c = new Client();
  const before = (await c.req("/api/stats")).json;
  assert.deepEqual(Object.keys(before).sort(), ["quizzes", "visitors", "visits"]);
  assert.match((await c.req("/api/stats")).headers.get("cache-control"), /max-age=60/);

  const first = (await c.req("/api/stats/visit", { method: "POST", body: { firstTime: true } })).json;
  assert.equal(first.visitors, before.visitors + 1);
  assert.equal(first.visits, before.visits + 1);

  const again = (await c.req("/api/stats/visit", { method: "POST", body: { firstTime: false } })).json;
  assert.equal(again.visitors, first.visitors, "a returning visitor is not counted twice");
  assert.equal(again.visits, first.visits + 1);

  const quiz = (await c.req("/api/stats/quiz", { method: "POST", body: {} })).json;
  assert.equal(quiz.quizzes, before.quizzes + 1);

  // Other sites can't bump the numbers.
  assert.equal((await c.req("/api/stats/visit", { method: "POST", body: { firstTime: true }, origin: "https://evil.example" })).status, 403);
});

test("results feedback: validation, success, other sites blocked", async () => {
  const c = new Client();
  const send = (body, opts = {}) => c.req("/api/feedback", { method: "POST", body, ...opts });
  const good = { rating: 4, method: "onet", stage: "s", top: ["software", "robotics", "ai"] };
  assert.equal((await send(good)).json.ok, true);
  assert.equal((await send({ ...good, stage: null, top: ["ux"] })).status, 200);
  for (const bad of [{ rating: 0 }, { rating: 6 }, { rating: 4.5 }, { method: "ml" }, { stage: "x" },
    { top: [] }, { top: ["a", "b", "c", "d"] }, { top: ["<script>"] }, { top: "software" }]) {
    assert.equal((await send({ ...good, ...bad })).status, 400, JSON.stringify(bad));
  }
  assert.equal((await send(good, { origin: "https://evil.example" })).status, 403);
});

test("feedback summary: owner password required, totals only", async () => {
  const ADMIN = process.env.ADMIN_SECRET || "local-admin-secret-for-tests";
  const c = new Client();
  assert.equal((await c.req("/api/feedback/summary")).status, 401);
  assert.equal((await c.req("/api/feedback/summary", { headers: { "X-Admin-Secret": "wrong-password-123456" } })).status, 401);
  await c.req("/api/feedback", { method: "POST", body: { rating: 5, method: "holland", stage: "h", top: ["lawyer"] } });
  const ok = await c.req("/api/feedback/summary", { headers: { "X-Admin-Secret": ADMIN } });
  assert.equal(ok.status, 200, ok.text);
  assert.equal(ok.headers.get("cache-control"), "no-store");
  for (const k of ["byMethod", "byStage", "byMethodStage", "last30", "careers", "spread"]) assert.ok(Array.isArray(ok.json[k]), k);
  assert.ok(ok.json.byMethod.some(r => r.method === "holland" && r.ratings >= 1));
  // Aggregates only: no row ids, days per rating or anything per person.
  assert.ok(!JSON.stringify(ok.json).includes('"id"'));
});
