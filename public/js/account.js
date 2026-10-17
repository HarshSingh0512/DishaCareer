/* Disha accounts: optional sign-in, parent consent, results sync, plans,
   counselling requests and the "Talk to us" form. Talks only to this site's
   own /api (same origin, so the CSP connect-src 'self' covers it).
   Everything else in the app keeps working with no account and no network.
   Registers two views (#/account and #/contact) that app.js routes to. */
(function () {
  "use strict";

  const App = () => window.DishaApp;
  const esc = s => App().esc(s);

  async function api(path, { method = "GET", body } = {}) {
    let res;
    try {
      res = await fetch(path, {
        method,
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      throw Object.assign(new Error("You seem to be offline. Please check your connection."), { code: "offline" });
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON: e.g. static host without the API */ }
    if (!res.ok || !data) {
      const err = new Error((data && data.message) || "Accounts aren't available on this site yet.");
      err.code = (data && data.error) || (res.status === 404 ? "no_api" : "error");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const fmtDate = ms => new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = ms => new Date(ms).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const rupees = n => "₹" + n.toLocaleString("en-IN");
  const canStore = u => u && (u.consentStatus === "not_required" || u.consentStatus === "granted");

  // Per-visit UI state (never persisted).
  let pendingEmail = "";
  let devCode = "";
  let devConsentUrl = "";
  let flash = null; // { kind: "ok" | "err", text }

  function shell(app, inner) {
    app.innerHTML = `<section class="view page account">
      <span class="eyebrow">Your account · optional</span>
      ${inner}
    </section>`;
  }

  // Side panel shown next to the sign-in form on wide screens.
  const WHY = `<aside><div class="card side-card">
      <h2>Why create an account?</h2>
      <ul class="side-list">
        <li><span aria-hidden="true">💾</span><b>Keep your results safe</b><span class="small muted">Open them on any phone or computer, even after clearing your browser.</span></li>
        <li><span aria-hidden="true">📄</span><b>Unlock the Full Report and Disha Plus</b><span class="small muted">Your detailed report, a monthly calendar and reminders.</span></li>
        <li><span aria-hidden="true">👪</span><b>Safe for under-18s</b><span class="small muted">A parent approves by email before anything is saved.</span></li>
        <li><span aria-hidden="true">🔒</span><b>Private by design</b><span class="small muted">No password, no ads, no tracking. Download or delete your data any time.</span></li>
      </ul>
    </div></aside>`;
  const flashHtml = () => flash ? `<p class="acc-flash ${flash.kind}" role="status">${esc(flash.text)}</p>` : "";
  const errText = e => (e && e.message) || "Something went wrong. Please try again.";

  /* ---------- #/account ---------- */
  async function renderAccount(app, arg) {
    if (arg === "paid") flash = { kind: "ok", text: "🎉 Payment received. Your plan is active below." };
    if (arg === "payment-failed") flash = { kind: "err", text: "The payment didn't go through, and you have not been charged twice. Please try again." };
    shell(app, `<h1>Your account</h1><p class="muted">Loading…</p>`);
    let me;
    try { me = await api("/api/me"); } catch (e) {
      shell(app, `<h1>Your account</h1>
        <div class="card"><p>${esc(e.code === "offline" ? errText(e) : "Accounts aren't switched on for this copy of Disha yet.")}</p>
        <p class="small muted">Everything else works without an account: your answers are saved on this device.</p></div>`);
      return;
    }
    if (location.hash.split("/")[1] !== "account") return; // user navigated away while loading
    if (!me.user) return signedOut(app);
    return signedIn(app, me);
  }

  function signedOut(app) {
    const step2 = Boolean(pendingEmail);
    shell(app, `
      <h1>Save your results to an account</h1>
      <p class="lead">Sign in with your email to keep your results safe and open them on any device. No password needed.</p>
      ${flashHtml()}
      <div class="split"><div class="split-main">
      <form class="card form acc-form" data-acc="${step2 ? "verify" : "start"}" novalidate>
        ${step2 ? `
          <p>We sent a 6-digit code to <b>${esc(pendingEmail)}</b>.</p>
          ${devCode ? `<p class="small acc-dev">Dev server: your code is <b>${esc(devCode)}</b></p>` : ""}
          <label class="field"><span class="field-label">Code</span>
            <input id="acc-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required></label>
          <button class="btn primary lg block" type="submit">Sign in →</button>
          <button class="btn ghost small" type="button" data-acc="restart">Use a different email</button>`
        : `
          <label class="field"><span class="field-label">Email</span>
            <input id="acc-email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label>
          <button class="btn primary lg block" type="submit">Email me a code</button>`}
      </form>
      <p class="small muted">Under 18? We'll ask a parent to approve before saving anything. We never sell data, show ads or track you.</p>
      </div>${WHY}</div>`);
    flash = null;
    wire(app);
    const input = app.querySelector(step2 ? "#acc-code" : "#acc-email");
    if (input) input.focus();
  }

  function consentCard(u) {
    if (u.consentStatus === "unknown") {
      return `<div class="card acc-card">
        <h2>One quick question</h2>
        <p>Are you 18 or older?</p>
        <div class="cta-row"><button type="button" class="btn primary" data-acc="adult">Yes, I'm 18+</button></div>
        <form class="acc-parent" data-acc="parent" novalidate>
          <label class="field"><span class="field-label">No, I'm under 18. My parent's email:</span>
            <input id="acc-parent" type="email" autocomplete="off" maxlength="254" required placeholder="parent@example.com"></label>
          <button class="btn ghost" type="submit">Ask my parent to approve</button>
        </form>
      </div>`;
    }
    if (u.consentStatus === "pending") {
      return `<div class="card acc-card acc-wait">
        <h2>⏳ Waiting for your parent</h2>
        <p>We emailed <b>${esc(u.parentEmail)}</b> a link to approve your account. Until they do, your results stay only on this device.</p>
        ${devConsentUrl ? `<p class="small acc-dev">Dev server: <a href="${esc(devConsentUrl)}" target="_blank" rel="noopener">open the parent's approval link</a></p>` : ""}
        <div class="cta-row"><button type="button" class="btn ghost small" data-acc="resend">Resend the email</button>
          <button type="button" class="btn ghost small" data-acc="changeParent">Change parent email</button></div>
      </div>`;
    }
    return "";
  }

  function syncCard(u, remote) {
    if (!canStore(u)) return "";
    const local = App().hasProgress();
    return `<div class="card acc-card">
      <h2>💾 Your results</h2>
      <p class="small muted">${remote && remote.updatedAt ? `Last saved to your account: ${esc(fmtTime(remote.updatedAt))}` : "Nothing saved to your account yet."}</p>
      <div class="cta-row">
        <button type="button" class="btn primary" data-acc="push" ${local ? "" : "disabled"}>Save this device's results</button>
        <button type="button" class="btn ghost" data-acc="pull" ${remote && remote.data ? "" : "disabled"}>Load saved results here</button>
      </div>
      ${local ? "" : `<p class="small muted">Take the quiz on this device first, or load results you saved before.</p>`}
    </div>`;
  }

  function plansCard(me) {
    const owned = Object.fromEntries(me.entitlements.map(e => [e.product, e]));
    const items = me.products.map(p => {
      const have = owned[p.key];
      const action = have
        ? `<span class="tag acc-owned">✓ Active${have.expiresAt ? ` until ${esc(fmtDate(have.expiresAt))}` : ""}</span>${p.days ? ` <button type="button" class="btn ghost small" data-acc="buy" data-product="${esc(p.key)}">Extend</button>` : ""}`
        : me.plansOnSale && canStore(me.user)
          ? `<button type="button" class="btn primary small" data-acc="buy" data-product="${esc(p.key)}">Get it · ${esc(rupees(p.price))}</button>`
          : `<span class="small muted">${me.plansOnSale ? "Available once your account is approved" : "Coming soon"}</span>`;
      const features = (p.features || []).map(f =>
        `<li class="${f.soon ? "soon" : ""}">${esc(f.text)}${f.soon ? ` <span class="acc-soon">coming soon</span>` : ""}</li>`).join("");
      const open = p.key === "report" && owned.report ? `<a class="btn primary small" href="#/report">Open my report →</a>`
        : p.key === "plus" && owned.plus ? `<a class="btn primary small" href="#/plus">Open Disha Plus →</a>` : "";
      return `<li class="acc-plan"><div><b>${esc(p.name)}</b> <span class="acc-price">${esc(rupees(p.price))}</span>
        <p class="small muted">${esc(p.blurb)}</p>
        ${features ? `<ul class="acc-features">${features}</ul>` : ""}</div>
        <div class="acc-plan-act">${open}${action}</div></li>`;
    }).join("");
    return `<div class="card acc-card">
      <h2>⭐ Plans</h2>
      <ul class="acc-plans">${items}</ul>
      <p class="small muted">${me.plansOnSale ? "Secure payment by Razorpay (UPI, cards, net banking). You'll return here after paying." : `Want to hear when plans launch? <a href="#/contact">Tell us</a>.`}</p>
    </div>`;
  }

  function bookingCard(me, bookings) {
    if (!me.entitlements.some(e => e.product === "guided")) return "";
    const list = bookings.length
      ? `<ul class="acc-bookings">${bookings.map(b => `<li><b>${esc(b.status === "requested" ? "Requested" : b.status)}</b> · ${esc(fmtTime(b.createdAt))}<br><span class="small muted">${esc(b.preferredTimes)}</span></li>`).join("")}</ul>` : "";
    return `<div class="card acc-card">
      <h2>🗓️ Book a counselling session</h2>
      ${list}
      <form class="form acc-form" data-acc="book" novalidate>
        <label class="field"><span class="field-label">Phone number</span><input id="bk-phone" type="tel" autocomplete="tel" maxlength="20" required placeholder="+91 98765 43210"></label>
        <label class="field"><span class="field-label">When suits you?</span><input id="bk-times" type="text" maxlength="200" required placeholder="e.g. weekday evenings after 6pm"></label>
        <label class="field"><span class="field-label">Anything we should know? <em>(optional)</em></span><textarea id="bk-note" maxlength="500" rows="3"></textarea></label>
        <button class="btn primary" type="submit">Request a session</button>
      </form>
    </div>`;
  }

  async function signedIn(app, me) {
    const u = me.user;
    let remote = null, bookings = [];
    try { if (canStore(u)) remote = await api("/api/me/state"); } catch (e) { /* shown as "nothing saved" */ }
    try { if (me.entitlements.some(e => e.product === "guided")) bookings = (await api("/api/bookings")).bookings; } catch (e) { /* ignore */ }
    shell(app, `
      <h1>Hi${u.email ? `, ${esc(u.email.split("@")[0])}` : ""} 👋</h1>
      <p class="muted">Signed in as <b>${esc(u.email)}</b></p>
      ${flashHtml()}
      <div class="split"><div class="split-main">
      ${consentCard(u)}
      ${syncCard(u, remote)}
      ${bookingCard(me, bookings)}
      <div class="card acc-card">
        <h2>🔒 Your data</h2>
        <p class="small muted">Download everything we hold about you, or delete your account and all saved results.</p>
        <div class="cta-row">
          <button type="button" class="btn ghost small" data-acc="export">Download my data</button>
          <button type="button" class="btn ghost small" data-acc="logout">Sign out</button>
          ${App().hasProgress() ? `<button type="button" class="btn ghost small" data-acc="clearDevice">Clear this device</button>` : ""}
          <button type="button" class="btn ghost small acc-danger" data-acc="delete">Delete my account</button>
        </div>
        <div class="acc-confirm" id="acc-delete-confirm" hidden>
          <p><b>Delete your account?</b> This removes your saved results, purchases, calendar and snapshots from our servers. It can't be undone.</p>
          ${App().hasProgress() ? `<label class="acc-check"><input type="checkbox" id="acc-clear-local" checked> Also clear my results from this device</label>` : ""}
          <div class="cta-row">
            <button type="button" class="btn small acc-danger-solid" data-acc="deleteConfirm">Yes, delete my account</button>
            <button type="button" class="btn ghost small" data-acc="deleteCancel">Cancel</button>
          </div>
        </div>
      </div>
      </div><aside>${plansCard(me)}</aside></div>`);
    flash = null;
    wire(app, me);
  }

  // One handler per render; every action re-renders the account view afterwards.
  function wire(app, me) {
    const view = app.querySelector(".account");
    const rerender = () => renderAccount(app);
    const run = async (btn, fn) => {
      if (btn) btn.disabled = true;
      flash = null; // drop the previous message; fn sets a new one
      const status = view.querySelector(".acc-flash");
      if (status) status.remove();
      try { await fn(); } catch (e) {
        if (e.status === 401) { pendingEmail = ""; flash = { kind: "err", text: "Please sign in again." }; }
        else flash = { kind: "err", text: errText(e) };
      }
      rerender();
    };

    view.addEventListener("submit", e => {
      e.preventDefault();
      const form = e.target, kind = form.dataset.acc, btn = form.querySelector('[type="submit"]');
      const val = id => (form.querySelector("#" + id) || {}).value || "";
      if (kind === "start") run(btn, async () => {
        const email = val("acc-email").trim();
        const r = await api("/api/auth/start", { method: "POST", body: { email } });
        pendingEmail = email; devCode = r.devCode || "";
      });
      if (kind === "verify") run(btn, async () => {
        await api("/api/auth/verify", { method: "POST", body: { email: pendingEmail, code: val("acc-code").trim() } });
        pendingEmail = ""; devCode = "";
        flash = { kind: "ok", text: "You're signed in." };
      });
      if (kind === "parent") run(btn, async () => {
        const r = await api("/api/me/profile", { method: "POST", body: { isAdult: false, parentEmail: val("acc-parent").trim() } });
        devConsentUrl = r.devConsentUrl || "";
        flash = { kind: "ok", text: "We've emailed your parent. Ask them to check their inbox." };
      });
      if (kind === "book") run(btn, async () => {
        await api("/api/bookings", { method: "POST", body: { phone: val("bk-phone").trim(), preferredTimes: val("bk-times").trim(), note: val("bk-note").trim() } });
        flash = { kind: "ok", text: "Request sent. A counsellor will call you to fix a time." };
      });
    });

    view.addEventListener("click", e => {
      const btn = e.target.closest("button[data-acc]");
      if (!btn || (btn.type === "submit" && btn.form)) return; // form submits are handled above
      const act = btn.dataset.acc;
      if (act === "restart") { pendingEmail = ""; devCode = ""; return rerender(); }
      if (act === "adult") run(btn, () => api("/api/me/profile", { method: "POST", body: { isAdult: true } }));
      if (act === "resend") run(btn, async () => {
        const r = await api("/api/me/consent/resend", { method: "POST" });
        devConsentUrl = r.devConsentUrl || devConsentUrl;
        flash = { kind: "ok", text: "Sent again." };
      });
      if (act === "changeParent") {
        // Re-show the question; the server only switches once a new email is submitted.
        me.user.consentStatus = "unknown";
        app.querySelector(".acc-wait").outerHTML = consentCard(me.user);
        return;
      }
      if (act === "push") run(btn, async () => {
        await api("/api/me/state", { method: "PUT", body: { data: App().exportState() } });
        flash = { kind: "ok", text: "Saved to your account." };
      });
      if (act === "pull") run(btn, async () => {
        if (App().hasProgress() && !confirm("Replace the results on this device with the ones saved in your account?")) return;
        const r = await api("/api/me/state");
        if (!r.data || !App().importState(r.data)) throw new Error("The saved results couldn't be loaded.");
        flash = { kind: "ok", text: "Loaded your saved results on this device." };
      });
      if (act === "buy") run(btn, async () => {
        const r = await api("/api/payments/checkout", { method: "POST", body: { product: btn.dataset.product } });
        location.assign(r.url); // Razorpay's hosted payment page (or the dev simulator)
        await new Promise(() => {}); // keep the button disabled while the browser navigates
      });
      if (act === "export") run(btn, async () => {
        const res = await fetch("/api/me/export", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Couldn't prepare your download.");
        const url = URL.createObjectURL(await res.blob());
        const a = Object.assign(document.createElement("a"), { href: url, download: "my-disha-data.json" });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
      if (act === "logout") run(btn, async () => {
        await api("/api/auth/logout", { method: "POST" });
        flash = { kind: "ok", text: "Signed out. Your results are still on this device." };
      });
      const confirmBox = view.querySelector("#acc-delete-confirm");
      if (act === "delete" && confirmBox) {
        confirmBox.hidden = false;
        confirmBox.querySelector('[data-acc="deleteConfirm"]').focus();
      }
      if (act === "deleteCancel" && confirmBox) confirmBox.hidden = true;
      if (act === "deleteConfirm") {
        const clearLocal = Boolean(view.querySelector("#acc-clear-local:checked"));
        run(btn, async () => {
          await api("/api/me", { method: "DELETE" });
          if (clearLocal) App().clearDevice();
          flash = { kind: "ok", text: clearLocal
            ? "Your account and all your results have been deleted, including on this device."
            : "Your account has been deleted. Your results are still on this device." };
        });
      }
      if (act === "clearDevice") {
        if (!confirm("Remove your quiz results from this device? Anything saved to your account stays there.")) return;
        App().clearDevice();
        flash = { kind: "ok", text: "Results cleared from this device." };
        rerender();
      }
    });
  }

  /* ---------- #/contact ---------- */
  function renderContact(app, arg) {
    const roles = [["parent", "👪 A parent"], ["student", "🎒 A student"], ["school", "🏫 A school"], ["counsellor", "🧑‍🏫 A counsellor"], ["other", "✉️ Something else"]];
    app.innerHTML = `<section class="view page account">
      <span class="eyebrow">Talk to us</span>
      <h1>How can we help?</h1>
      <p class="lead">Questions about plans, counselling or Disha for your school? Leave your details and we'll get back to you within 2 working days.</p>
      <div class="split"><div class="split-main">
      <form class="card form acc-form" id="lead-form" novalidate>
        <div class="field"><span class="field-label">I am…</span>
          <div class="chips">${roles.map(([k, l]) => `<label class="chip acc-radio"><input type="radio" name="role" value="${k}" ${arg === k ? "checked" : ""}> ${l}</label>`).join("")}</div></div>
        <label class="field"><span class="field-label">Your name</span><input id="ld-name" type="text" maxlength="80" autocomplete="name" required></label>
        <label class="field"><span class="field-label">Email or phone</span><input id="ld-contact" type="text" maxlength="120" autocomplete="email" required></label>
        <label class="field"><span class="field-label">Message <em>(optional)</em></span><textarea id="ld-msg" maxlength="1000" rows="4"></textarea></label>
        <label class="acc-hp" aria-hidden="true">Website <input id="ld-website" type="text" tabindex="-1" autocomplete="off"></label>
        <p class="acc-flash err" id="ld-err" role="alert" hidden></p>
        <button class="btn primary lg block" type="submit">Send</button>
      </form>
      </div>
      <aside><div class="card side-card">
        <h2>Who we help</h2>
        <ul class="side-list">
          <li><span aria-hidden="true">👪</span><b>Parents</b><span class="small muted">Understand your child's results, plans and the next steps.</span></li>
          <li><span aria-hidden="true">🏫</span><b>Schools</b><span class="small muted">Career guidance for whole classes, with reports for teachers and parents.</span></li>
          <li><span aria-hidden="true">🧑‍🏫</span><b>Counsellors</b><span class="small muted">Use Disha with your students, or join us for Guided sessions.</span></li>
          <li><span aria-hidden="true">⏱️</span><b>Quick replies</b><span class="small muted">We answer within 2 working days. No spam, ever.</span></li>
        </ul>
      </div></aside></div>
    </section>`;
    const form = app.querySelector("#lead-form");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]'), errEl = form.querySelector("#ld-err");
      const role = (form.querySelector('input[name="role"]:checked') || {}).value;
      const v = id => form.querySelector("#" + id).value.trim();
      errEl.hidden = true;
      if (!role) { errEl.textContent = "Please choose who you are."; errEl.hidden = false; return; }
      btn.disabled = true;
      try {
        await api("/api/leads", { method: "POST", body: { role, name: v("ld-name"), contact: v("ld-contact"), message: v("ld-msg"), website: v("ld-website") } });
        form.outerHTML = `<div class="card"><h2>Thank you! 🙌</h2><p>We've got your message and will reply within 2 working days.</p><a class="btn ghost" href="#/">Back to Disha</a></div>`;
      } catch (err) {
        errEl.textContent = errText(err); errEl.hidden = false; btn.disabled = false;
      }
    });
  }

  // Is the backend deployed? On a website-only deploy (no /api), links to account,
  // paid and contact features stay hidden (CSS: [data-needs-api]) instead of
  // leading to "not switched on" pages. They appear once /api answers with JSON.
  const root = document.documentElement;
  root.dataset.api = "checking";
  fetch("/api/me", { credentials: "same-origin" })
    .then(r => r.ok && (r.headers.get("Content-Type") || "").includes("application/json"))
    .catch(() => false)
    .then(ok => { root.dataset.api = ok ? "on" : "off"; });

  window.DISHA_VIEWS = Object.freeze(Object.assign({}, window.DISHA_VIEWS, { account: renderAccount, contact: renderContact }));
  window.DishaApi = api; // shared with js/report.js
})();
