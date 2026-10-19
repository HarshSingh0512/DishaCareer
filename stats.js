/* Public visitor counter (home page and footer).
   Counts each browser session once. The only thing sent is whether this is the
   device's first visit (a flag this browser keeps in its own storage), so the
   server can count unique visitors without cookies or IDs. Elements marked
   [data-stat="visitors" | "quizzes"] are filled in with a short count-up; the
   whole counter stays hidden on deploys without the API. */
(function () {
  "use strict";
  const DEVICE_KEY = "disha.visitor"; // "this device has been counted before"
  const SESSION_KEY = "disha.visit";  // "this session has been counted"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stats = null;

  const get = (store, k) => { try { return window[store].getItem(k); } catch (e) { return null; } };
  const set = (store, k) => { try { window[store].setItem(k, "1"); } catch (e) { /* storage blocked */ } };
  const fmt = n => Number(n).toLocaleString("en-IN");

  async function call(path, method, body) {
    const res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok || !(res.headers.get("Content-Type") || "").includes("application/json")) throw new Error("no stats");
    return res.json();
  }

  async function load() {
    try {
      if (get("sessionStorage", SESSION_KEY)) {
        stats = await call("/api/stats", "GET");
      } else {
        stats = await call("/api/stats/visit", "POST", { firstTime: !get("localStorage", DEVICE_KEY) });
        set("sessionStorage", SESSION_KEY);
        set("localStorage", DEVICE_KEY);
      }
      document.documentElement.dataset.stats = "on";
      paint();
    } catch (e) { /* no API on this deploy: the counter stays hidden */ }
  }

  function countUp(el, to) {
    if (reduceMotion || to < 10) { el.textContent = fmt(to); return; }
    const start = performance.now(), dur = 900;
    const step = t => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Fill every counter on the page (called again after each page render).
  function paint() {
    if (!stats) return;
    // "1 visitor" / "2 visitors": labels keep their plural text and switch to data-one for 1.
    document.querySelectorAll("[data-stat-label]").forEach(el => {
      if (!el.dataset.many) el.dataset.many = el.textContent;
      el.textContent = stats[el.dataset.statLabel] === 1 ? el.dataset.one : el.dataset.many;
    });
    document.querySelectorAll("[data-stat]").forEach(el => {
      const v = stats[el.dataset.stat];
      if (typeof v !== "number") return;
      if (el.dataset.painted === String(v)) return;
      const first = !el.dataset.painted;
      el.dataset.painted = String(v);
      if (first) countUp(el, v); else el.textContent = fmt(v);
    });
  }

  // Called by the app when a quiz is completed.
  async function quizDone() {
    try { stats = await call("/api/stats/quiz", "POST", {}); paint(); } catch (e) { /* ignore */ }
  }

  window.DishaStats = Object.freeze({ paint, quizDone });
  load();
})();
