/* Disha Plus (#/plus), a paid feature: "This month for you" calendar, monthly
   email reminders, and term-by-term snapshots of how the student is changing.
   The calendar is personal: the browser sends the student's class, stream and the
   exam names of their top careers (from this device's results), and the server
   returns the matching months. */
(function () {
  "use strict";

  const App = () => window.DishaApp;
  const esc = s => App().esc(s);
  const api = (...a) => window.DishaApi(...a);
  const Q = window.QUIZ, APT = window.APTITUDE;
  const TYPES = ["R", "I", "A", "S", "E", "C"];
  const KIND = { exam: "📝", olympiad: "🏅", scholarship: "🎓", school: "🏫" };
  const isHttps = u => /^https:\/\/[\w.-]+(\/[\w./%?=&#-]*)?$/.test(u || "");
  const fmtDate = ms => new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  let flash = null;

  // What the calendar needs from this device's results.
  function profileFromResults(model) {
    const fit = model.ranked.filter(m => App().streamOk(m.c)).slice(0, 10);
    const exams = [...new Set(fit.flatMap(m => m.c.exams.map(e => e[0])))].sort();
    return { stage: model.profile.stage, stream: model.profile.stream || null, exams };
  }
  const sameProfile = (a, b) => a && b && a.stage === b.stage && (a.stream || null) === (b.stream || null) &&
    JSON.stringify([...a.exams].sort()) === JSON.stringify([...b.exams].sort());

  async function renderPlus(app) {
    app.innerHTML = `<section class="view narrow"><h1>Disha Plus</h1><p class="muted">Loading…</p></section>`;
    const model = App().reportModel();
    let feed;
    try {
      feed = await api("/api/plus/feed");
      // Keep the calendar in step with the latest results on this device.
      if (model) {
        const mine = profileFromResults(model);
        if (!sameProfile(feed.profile, mine)) {
          await api("/api/plus/profile", { method: "POST", body: mine });
          feed = await api("/api/plus/feed");
        }
      }
    } catch (e) {
      if (location.hash.split("/")[1] === "plus") renderGate(app, e);
      return;
    }
    let snaps = [];
    try { snaps = (await api("/api/plus/snapshots")).snapshots; } catch (e) { /* shown as none */ }
    if (location.hash.split("/")[1] !== "plus") return;
    app.innerHTML = page(feed, snaps, model);
    flash = null;
    wire(app, model);
  }

  async function renderGate(app, err) {
    const code = err && err.code;
    let me = null;
    try { me = await api("/api/me"); } catch (e) { /* below */ }
    const product = me && me.products.find(p => p.key === "plus");
    let action;
    if (!me || code === "offline" || code === "no_api" || code === "not_configured") {
      action = `<p>${esc(code === "offline" ? "You seem to be offline. Connect to the internet to open Disha Plus." : "Disha Plus isn't switched on for this copy of Disha yet.")}</p>`;
    } else if (code === "signed_out") {
      action = `<p>Already a member? Sign in with the same email.</p><a class="btn primary" href="#/account">Sign in →</a>`;
    } else if (code === "consent_required") {
      action = `<p>A parent needs to approve your account first.</p><a class="btn primary" href="#/account">Go to my account →</a>`;
    } else if (me.plansOnSale) {
      action = `<p class="rp-price">₹${esc(product.price.toLocaleString("en-IN"))} <span class="small muted">for one year · includes the Full Report</span></p>
        <a class="btn primary lg" href="#/account">Get Disha Plus →</a>`;
    } else {
      action = `<p>Disha Plus is coming soon. <a href="#/contact">Tell us</a> if you'd like to hear when it launches.</p>`;
    }
    app.innerHTML = `<section class="view page rp-gate">
      <span class="eyebrow">📅 Disha Plus</span>
      <h1>Guidance all year, not just once</h1>
      <p class="lead">Know what's coming up for your class and your careers every month, and see how you grow term by term.</p>
      <div class="split">
        <div class="split-main">${product ? `<div class="card"><h2>What you get</h2><ul class="acc-features">${product.features.map(f =>
          `<li class="${f.soon ? "soon" : ""}">${esc(f.text)}${f.soon ? ` <span class="acc-soon">coming soon</span>` : ""}</li>`).join("")}</ul></div>` : ""}</div>
        <aside><div class="card">${action}</div></aside>
      </div>
    </section>`;
  }

  function monthCard(m, big) {
    const items = m.items.length
      ? `<ul class="pl-items">${m.items.map(i => `<li>
          <span class="pl-kind" aria-hidden="true">${KIND[i.kind] || "•"}</span>
          <div><b>${esc(i.title)}</b><span class="pl-what">${esc(i.what)}</span>
          ${big && i.note ? `<span class="small muted">${esc(i.note)}</span>` : ""}
          ${big && isHttps(i.site) ? `<a class="small" href="${esc(i.site)}" target="_blank" rel="noopener noreferrer">Official site →</a>` : ""}</div></li>`).join("")}</ul>`
      : `<p class="muted">Nothing big on the calendar. A good month to build a skill or try a project.</p>`;
    return big
      ? `<div class="card pl-now"><span class="eyebrow">📅 This month for you</span><h2>${esc(m.name)}</h2>${items}</div>`
      : `<div class="pl-month"><h3>${esc(m.name)}</h3>${items}</div>`;
  }

  function progressCard(snaps, model) {
    const save = model
      ? `<button type="button" class="btn primary small" data-pl="snap">Save this term's results</button>`
      : `<a class="btn ghost small" href="#/start">Take the quiz to save a snapshot</a>`;
    let body = `<p class="muted">Retake the quiz each term and save a snapshot. Your interests change as you grow, and this shows how.</p>`;
    if (snaps.length) {
      body = `<p class="small muted">${snaps.length} snapshot${snaps.length > 1 ? "s" : ""} saved · first on ${esc(fmtDate(snaps[0].createdAt))}</p>`;
      if (snaps.length > 1) {
        const a = snaps[0], b = snaps[snaps.length - 1];
        const rows = TYPES.map(k => {
          const d = b.riasec[k] - a.riasec[k];
          const arrow = d > 4 ? `<span class="pl-up">▲ ${d}</span>` : d < -4 ? `<span class="pl-down">▼ ${-d}</span>` : `<span class="muted">same</span>`;
          return `<tr><td>${Q.types[k].emoji} ${esc(Q.types[k].name)}</td><td>${a.riasec[k]}%</td><td>${b.riasec[k]}%</td><td>${arrow}</td></tr>`;
        }).join("");
        const before = new Set(a.top.map(t => t.id));
        body += `<table class="pl-table"><thead><tr><th>Interest</th><th>${esc(fmtDate(a.createdAt))}</th><th>${esc(fmtDate(b.createdAt))}</th><th>Change</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="rp-cols">
            <div><h4>Top careers then</h4><ol class="rp-list">${a.top.map(t => `<li>${esc(t.title)}</li>`).join("")}</ol></div>
            <div><h4>Top careers now</h4><ol class="rp-list">${b.top.map(t => `<li>${esc(t.title)}${before.has(t.id) ? "" : ` <span class="rp-tag">new</span>`}</li>`).join("")}</ol></div>
          </div>`;
        if (a.apt && b.apt) {
          body += `<p class="small"><b>Aptitude:</b> ${Object.keys(APT.areas).map(k => `${esc(APT.areas[k].name)} ${a.apt[k]}% → ${b.apt[k]}%`).join(" · ")}</p>`;
        }
      } else {
        body += `<p class="muted">Save another snapshot next term to see how you've changed.</p>`;
      }
    }
    return `<div class="card"><h2>📈 How you're changing</h2>${body}<div class="cta-row">${save}<a class="btn ghost small" href="#/start">Retake the quiz</a></div></div>`;
  }

  function page(feed, snaps, model) {
    const [now, ...later] = feed.months;
    const reminders = feed.profile && feed.profile.reminders;
    const setup = !feed.profile
      ? `<div class="card"><p>Your calendar is built from your quiz results. Take the quiz on this device, then come back.</p><a class="btn primary" href="#/start">Take the quiz →</a></div>`
      : `${monthCard(now, true)}
        <div class="card"><h2>🗓️ Coming up</h2><div class="pl-later">${later.map(m => monthCard(m, false)).join("")}</div>
          <p class="small muted">Months are typical windows from recent years. Dates change every year, so always confirm on the official website.</p></div>
        <div class="card pl-remind">
          <label class="pl-switch"><input type="checkbox" data-pl="remind" ${reminders ? "checked" : ""}>
            <span><b>Email me on the 1st of every month</b><span class="small muted">What's happening that month and the next, for your class and careers.</span></span></label>
        </div>`;
    return `<section class="view page pl">
      <span class="eyebrow">📅 Disha Plus${feed.plusUntil ? ` · active until ${esc(fmtDate(feed.plusUntil))}` : ""}</span>
      <h1>Your year, planned</h1>
      ${flash ? `<p class="acc-flash ${flash.kind}" role="status">${esc(flash.text)}</p>` : ""}
      <div class="split">
        <div class="split-main">${setup}</div>
        <aside>
          ${progressCard(snaps, model)}
          <div class="card pl-soon"><h2>🧩 Monthly aptitude practice packs</h2><p class="muted">Coming soon: a fresh set of puzzles every month to build your weakest skill.</p></div>
        </aside>
      </div>
    </section>`;
  }

  function wire(app, model) {
    const view = app.querySelector(".pl");
    const rerender = () => renderPlus(app);
    view.addEventListener("change", async e => {
      if (e.target.dataset.pl !== "remind") return;
      const on = e.target.checked;
      e.target.disabled = true;
      try {
        await api("/api/plus/profile", { method: "POST", body: { reminders: on } });
        flash = { kind: "ok", text: on ? "Done. Look out for an email on the 1st of each month." : "Monthly emails switched off." };
      } catch (err) { flash = { kind: "err", text: err.message }; }
      rerender();
    });
    view.addEventListener("click", async e => {
      const btn = e.target.closest('button[data-pl="snap"]');
      if (!btn || !model) return;
      btn.disabled = true;
      const { p, ranked, profile } = model;
      try {
        await api("/api/plus/snapshots", { method: "POST", body: {
          stage: profile.stage, riasec: p.r, b5: p.b, apt: p.apt || null,
          top: ranked.slice(0, 5).map(m => ({ id: m.c.id, title: m.c.title, score: m.score }))
        } });
        flash = { kind: "ok", text: "Snapshot saved. Retake the quiz next term and save again to compare." };
      } catch (err) { flash = { kind: "err", text: err.message }; }
      rerender();
    });
  }

  window.DISHA_VIEWS = Object.freeze(Object.assign({}, window.DISHA_VIEWS, { plus: renderPlus }));
})();
