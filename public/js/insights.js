/* Owner-only accuracy page (#/insights). Not linked anywhere. It asks for the
   ADMIN_SECRET password and shows totals from GET /api/feedback/summary: how many
   students say their top 3 feel right, O*NET vs hand-picked codes, by class, and
   the careers rated lowest. The password stays in this tab only (sessionStorage). */
(function () {
  "use strict";

  const KEY = "disha.admin";
  const esc = s => window.DishaApp.esc(s);
  const STAGES = { m: "Class 6–8", s: "Class 9–10", h: "Class 11–12", c: "College", "?": "Not given" };
  const METHODS = { onet: "O*NET profiles", holland: "Hand-picked codes" };
  const NEED = 100; // ratings per method before the comparison is worth reading
  const title = id => {
    const c = (window.CAREERS || []).find(x => x.id === id);
    return c ? c.title : id;
  };
  const get = () => { try { return sessionStorage.getItem(KEY) || ""; } catch (e) { return ""; } };
  const put = v => { try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } };

  async function load(secret) {
    const res = await fetch("/api/feedback/summary", { headers: { "X-Admin-Secret": secret }, credentials: "same-origin", cache: "no-store" });
    if (res.status === 401) throw new Error("Wrong password.");
    if (res.status === 404) throw new Error("ADMIN_SECRET isn't set on this server yet.");
    if (res.status === 429) throw new Error("Too many tries. Wait an hour and try again.");
    if (!res.ok) throw new Error("Couldn't load the numbers (" + res.status + ").");
    return res.json();
  }

  // Two-proportion z-test on "feels right" (4–5 stars): is the gap more than chance?
  function verdict(rows) {
    const o = rows.find(r => r.method === "onet"), h = rows.find(r => r.method === "holland");
    if (!o || !h || o.ratings < NEED || h.ratings < NEED) {
      return `<p>Not enough ratings to compare yet: we need about ${NEED} for each method (now ${o ? o.ratings : 0} for O*NET and ${h ? h.ratings : 0} for hand-picked codes). Keep collecting.</p>`;
    }
    const p1 = o.feelsRight / 100, p2 = h.feelsRight / 100, n1 = o.ratings, n2 = h.ratings;
    const p = (p1 * n1 + p2 * n2) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2)) || 1;
    const z = (p1 - p2) / se, diff = (o.feelsRight - h.feelsRight).toFixed(1);
    if (Math.abs(z) < 1.96) return `<p><b>No clear winner yet.</b> O*NET is ${diff >= 0 ? "+" : ""}${esc(diff)} points on "feels right", but that gap could still be chance. Keep the test running.</p>`;
    return z > 0
      ? `<p><b>O*NET is better</b>, by ${esc(diff)} points on "feels right" (statistically clear). You can set <code>abTest: false</code> in <code>public/js/app.js</code> to give everyone O*NET.</p>`
      : `<p><b>Hand-picked codes are doing better</b>, by ${esc(String(-diff))} points (statistically clear). Review the O*NET mapping before switching.</p>`;
  }

  const table = (head, rows) => `<div class="ins-table" role="table">
      <div class="ins-row ins-head" role="row">${head.map(h => `<span role="columnheader">${esc(h)}</span>`).join("")}</div>
      ${rows.map(r => `<div class="ins-row" role="row">${r.map(c => `<span role="cell">${c}</span>`).join("")}</div>`).join("")}
    </div>`;
  const pct = v => v == null ? "–" : esc(String(v)) + "%";

  function render(app, d) {
    const total = d.byMethod.reduce((s, r) => s + r.ratings, 0);
    const avg = total ? (d.byMethod.reduce((s, r) => s + r.avg * r.ratings, 0) / total).toFixed(2) : "–";
    const right = total ? (d.byMethod.reduce((s, r) => s + r.feelsRight * r.ratings, 0) / total).toFixed(1) : "–";
    const spreadMax = Math.max(1, ...d.spread.map(r => r.n));
    app.innerHTML = `<section class="view page insights">
      <span class="eyebrow">Private · owner only</span>
      <h1>How accurate is Disha?</h1>
      <p class="lead">From the "Do your top 3 careers feel right?" ratings under the results. Anonymous totals only.</p>
      <div class="ins-kpis">
        <div class="card"><b>${esc(String(total))}</b><span>ratings</span></div>
        <div class="card"><b>${esc(String(avg))}</b><span>average stars</span></div>
        <div class="card"><b>${total ? esc(right) + "%" : "–"}</b><span>say "feels right" (4–5★)</span></div>
      </div>
      <div class="card"><h2>O*NET vs hand-picked codes</h2>${verdict(d.byMethod)}
        ${table(["Method", "Ratings", "Avg ★", "Feels right"], d.byMethod.map(r => [esc(METHODS[r.method] || r.method), esc(String(r.ratings)), esc(String(r.avg)), pct(r.feelsRight)]))}</div>
      <div class="card"><h2>By class</h2>
        ${table(["Class", "Method", "Ratings", "Avg ★", "Feels right"], d.byMethodStage.map(r => [esc(STAGES[r.stage] || r.stage), esc(METHODS[r.method] || r.method), esc(String(r.ratings)), esc(String(r.avg)), pct(r.feelsRight)]))}</div>
      <div class="card"><h2>Careers rated lowest (as the #1 match)</h2>
        ${d.careers.length ? table(["Career", "Ratings", "Avg ★", "Feels right"], d.careers.slice(0, 10).map(r => [esc(title(r.career)), esc(String(r.ratings)), esc(String(r.avg)), pct(r.feelsRight)]))
          : `<p class="muted">Careers appear here once they have at least ${esc(String(d.minForCareer))} ratings as someone's #1 match.</p>`}</div>
      <div class="grid-2">
        <div class="card"><h2>Star spread</h2><ul class="rp-bars">${[1, 2, 3, 4, 5].map(n => {
          const v = (d.spread.find(r => r.rating === n) || { n: 0 }).n;
          return `<li><span>${"★".repeat(n)} <span class="small muted">(${esc(String(v))})</span></span><span class="rp-bar"><i style="width:${Math.round(v / spreadMax * 100)}%"></i></span></li>`;
        }).join("")}</ul></div>
        <div class="card"><h2>Last 30 days</h2>${d.last30.length
          ? table(["Day", "Ratings", "Avg ★"], d.last30.slice().reverse().map(r => [esc(r.day), esc(String(r.ratings)), esc(String(r.avg))]))
          : `<p class="muted">No ratings in the last 30 days.</p>`}</div>
      </div>
      <div class="cta-row"><button type="button" class="btn ghost" id="ins-refresh">Refresh</button><button type="button" class="btn ghost" id="ins-lock">Lock</button></div>
    </section>`;
    app.querySelector("#ins-refresh").addEventListener("click", () => view(app));
    app.querySelector("#ins-lock").addEventListener("click", () => { put(""); view(app); });
  }

  function askPassword(app, message) {
    app.innerHTML = `<section class="view narrow insights">
      <span class="eyebrow">Private · owner only</span>
      <h1>How accurate is Disha?</h1>
      <form class="card form" id="ins-form" autocomplete="on">
        <label class="field"><span class="field-label">Admin password</span>
          <input type="password" id="ins-pass" autocomplete="current-password" required></label>
        ${message ? `<p class="acc-flash err">${esc(message)}</p>` : ""}
        <button class="btn primary" type="submit">Show the numbers</button>
        <p class="small muted">The password is the ADMIN_SECRET you set in Cloudflare. It's kept in this tab only.</p>
      </form>
    </section>`;
    app.querySelector("#ins-form").addEventListener("submit", e => {
      e.preventDefault();
      put(app.querySelector("#ins-pass").value);
      view(app);
    });
  }

  async function view(app) {
    const secret = get();
    if (!secret) return askPassword(app);
    app.innerHTML = `<section class="view narrow"><h1>How accurate is Disha?</h1><p class="muted">Loading…</p></section>`;
    try { render(app, await load(secret)); } catch (e) { put(""); askPassword(app, e.message); }
  }

  window.DISHA_VIEWS = Object.freeze(Object.assign({}, window.DISHA_VIEWS, { insights: view }));
})();
