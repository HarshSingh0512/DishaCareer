/* Disha: routing, quiz flow, scoring and rendering. No build step, no runtime
   dependencies. Security notes:
   - All data is author-controlled and deep-frozen at load; the only user input
     is the (optional) name, which is sanitized on entry and escaped on output.
   - Rendering uses innerHTML with template strings; every value that could vary
     is passed through esc(). No eval, no Function, no inline event handlers.
   - Saved progress is validated on load and discarded if malformed or oversized. */
(function () {
  "use strict";

  /* Set this to your counsellor's booking link (an https URL, or a
     https://wa.me/<number> link) to show a "Talk to a counsellor" button.
     Leave it empty to hide the button. */
  /* abTest: while true, each device is randomly given either the O*NET matching
     or the older hand-picked Holland codes (and keeps it), so the "Do your top 3
     feel right?" ratings can show which is more accurate. Set it to false to give
     everyone O*NET once enough ratings are in (see README, "Roadmap"). */
  const CONFIG = { counsellorUrl: "", abTest: true };

  const Q = window.QUIZ;
  const CAREERS = window.CAREERS;
  const META = window.CAREER_META;
  const COMBOS = window.SUBJECT_COMBOS || {};
  const SCHOLARSHIPS = window.SCHOLARSHIPS || [];
  const APT = window.APTITUDE;
  const CAREER_APT = window.CAREER_APTITUDES || {};
  const ONET = window.CAREER_ONET || {};

  // Prevent any accidental or malicious mutation of the data at runtime.
  function deepFreeze(obj) {
    if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
      Object.freeze(obj);
      for (const k of Object.keys(obj)) deepFreeze(obj[k]);
    }
    return obj;
  }
  [Q, CAREERS, META, COMBOS, SCHOLARSHIPS, APT, CAREER_APT, ONET].forEach(deepFreeze);

  const BY_ID = Object.fromEntries(CAREERS.map(c => [c.id, c]));
  const APT_AREAS = Object.keys(APT.areas);
  const OFFBEAT_COUNT = CAREERS.filter(c => c.offbeat).length;
  const TYPES = ["R", "I", "A", "S", "E", "C"];
  const TRAITS = ["O", "C", "E", "A", "S"];
  const STORE_KEY = "disha.v1";
  const THEME_KEY = "disha.theme";
  const LANG_KEY = "disha.lang";
  const MAX_SAVE_BYTES = 50000;
  const app = document.getElementById("app");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  const I18N = window.I18N || { en: {} };
  let lang = "en";
  try { lang = localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en"; } catch (e) { /* ignore */ }

  function t(key, vars) {
    const dict = I18N[lang] || {};
    let s = dict[key] != null ? dict[key] : (I18N.en[key] != null ? I18N.en[key] : key);
    if (vars) for (const k of Object.keys(vars)) s = s.replace("{" + k + "}", String(vars[k]));
    return s;
  }
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    const lb = document.getElementById("lang-toggle");
    if (lb) {
      lb.textContent = lang === "hi" ? "EN" : "हिन्दी";
      lb.setAttribute("aria-label", lang === "hi" ? "Switch to English" : "हिन्दी में बदलें");
    }
  }

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const find = (list, k) => list.find(x => x.k === k) || { k, label: k, emoji: "" };
  const itemCount = ch => (ch.items ? ch.items.length : 1);
  const TOTAL = Q.chapters.reduce((n, ch) => n + itemCount(ch), 0);
  const level = v => (v >= 65 ? 2 : v <= 35 ? 0 : 1);
  const sortTypes = r => TYPES.slice().sort((a, b) => r[b] - r[a]);
  const isHttps = url => typeof url === "string" && /^https:\/\/[\w.-]+(\/[\w./%?=&#-]*)?$/.test(url);

  /* ---------- state ---------- */
  function freshAnswers() {
    return { tt: {}, rate: {}, likert: {}, scen: {}, subj: {}, fav: { subjects: [], values: [] } };
  }
  function blankState() {
    return { profile: null, answers: freshAnswers(), pos: { ch: 0, q: 0 }, reveal: null, done: false, saved: [], tried: {}, apt: freshApt() };
  }
  function freshApt() {
    return { ans: {}, pos: 0, done: false };
  }

  // Validate anything read back from storage; never trust its shape.
  function sanitizeState(s) {
    if (!s || typeof s !== "object") return null;
    const out = blankState();
    if (s.profile && typeof s.profile === "object") {
      const p = s.profile;
      const stage = META.userStages.find(x => x.k === p.stage) ? p.stage : null;
      if (!stage) return null;
      const needsStr = stage === "h" || stage === "c";
      const stream = META.userStreams.find(x => x.k === p.stream) ? p.stream : null;
      if (needsStr && !stream) return null;
      out.profile = { name: sanitizeName(typeof p.name === "string" ? p.name : ""), stage, stream: needsStr ? stream : null };
    }
    const a = s.answers;
    if (!a || typeof a !== "object" || !a.fav || typeof a.fav !== "object") return null;
    Q.chapters.forEach(ch => {
      if (!ch.items) return;
      const src = a[ch.id] || {};
      ch.items.forEach((item, i) => {
        const v = src[i];
        if (v == null) return;
        if (!Number.isInteger(v)) return;
        const max = ch.kind === "tt" ? 1 : ch.kind === "rate" ? 4 : ch.kind === "likert" ? 5
          : (item.o ? item.o.length - 1 : 0);
        const min = ch.kind === "likert" ? 1 : 0;
        if (v >= min && v <= max) out.answers[ch.id][i] = v;
      });
    });
    const subj = new Set(META.subjects.map(x => x.k));
    const vals = new Set(META.values.map(x => x.k));
    if (Array.isArray(a.fav.subjects)) out.answers.fav.subjects = a.fav.subjects.filter(k => subj.has(k)).slice(0, META.subjects.length);
    if (Array.isArray(a.fav.values)) out.answers.fav.values = [...new Set(a.fav.values.filter(k => vals.has(k)))].slice(0, 3);
    // Subject ratings: known subjects only; enjoyment 0–4 and marks band 0–3 (either may still be unset).
    if (a.subj && typeof a.subj === "object") {
      Object.keys(a.subj).filter(k => Q.schoolSubjects[k]).slice(0, 30).forEach(k => {
        const r = a.subj[k] || {};
        const like = Number.isInteger(r.like) && r.like >= 0 && r.like <= 4 ? r.like : null;
        const marks = Number.isInteger(r.marks) && r.marks >= 0 && r.marks < Q.marksScale.length ? r.marks : null;
        out.answers.subj[k] = { like, marks };
      });
    }

    if (s.pos && Number.isInteger(s.pos.ch) && Number.isInteger(s.pos.q) && Q.chapters[s.pos.ch] && s.pos.q >= 0 && s.pos.q < itemCount(Q.chapters[s.pos.ch])) {
      out.pos = { ch: s.pos.ch, q: s.pos.q };
    }
    if (s.reveal === null || (Number.isInteger(s.reveal) && s.reveal >= 0 && s.reveal < Q.chapters.length - 1)) out.reveal = s.reveal;
    out.done = s.done === true;
    if (Array.isArray(s.saved)) out.saved = [...new Set(s.saved.filter(id => BY_ID[id]))].slice(0, CAREERS.length);
    if (s.tried && typeof s.tried === "object") {
      Object.keys(s.tried).slice(0, 500).forEach(key => {
        const m = /^([a-z]+):(\d{1,2})$/.exec(key);
        const c = m && BY_ID[m[1]];
        if (s.tried[key] === true && c && Number(m[2]) < c.tryNow.length) out.tried[key] = true;
      });
    }
    const ap = s.apt;
    if (ap && typeof ap === "object" && ap.ans && typeof ap.ans === "object") {
      APT.items.forEach((it, i) => {
        const v = ap.ans[i];
        if (Number.isInteger(v) && v >= 0 && v < it.o.length) out.apt.ans[i] = v;
      });
      if (Number.isInteger(ap.pos) && ap.pos >= 0 && ap.pos < APT.items.length) out.apt.pos = ap.pos;
      out.apt.done = ap.done === true && Object.keys(out.apt.ans).length === APT.items.length;
    }
    return out;
  }

  function loadState() {
    try {
      const text = localStorage.getItem(STORE_KEY);
      if (text && text.length <= MAX_SAVE_BYTES) {
        const parsed = sanitizeState(JSON.parse(text));
        if (parsed) return parsed;
        localStorage.removeItem(STORE_KEY);
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    return blankState();
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode / full */ }
  }
  function resetQuiz() {
    state.answers = freshAnswers();
    state.pos = { ch: 0, q: 0 };
    state.reveal = null;
    state.done = false;
    lastPct = 0;
  }
  function answeredCount() {
    return Q.chapters.reduce((n, ch) => {
      if (ch.items) return n + Object.keys(state.answers[ch.id]).length;
      if (ch.kind === "subj") return n + (subjectsComplete() ? 1 : 0);
      return n + (state.done ? 1 : 0);
    }, 0);
  }

  // Strip control, bidi-override and angle-bracket characters; collapse spaces; cap length.
  function sanitizeName(input) {
    return String(input == null ? "" : input)
      .replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩﻿<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 30);
  }

  let state = loadState();

  /* ---------- scoring (the formulas live in js/scoring.js) ---------- */
  const SC = window.DishaScoring;
  const scoreRiasec = upto => SC.riasec(Q, state.answers, upto);
  const scoreB5 = () => SC.bigFive(Q, state.answers);
  const scoreApt = () => SC.aptitude(APT, state.apt.ans); // percent correct per aptitude area
  const buildProfile = () => SC.profile(Q, state.answers, state.apt.done ? scoreApt() : null);
  // Which matching method this device uses (see CONFIG.abTest).
  const METHOD_KEY = "disha.method";
  const METHOD = (() => {
    if (!CONFIG.abTest) return "onet";
    try {
      let m = localStorage.getItem(METHOD_KEY);
      if (!SC.METHODS.includes(m)) {
        m = crypto.getRandomValues(new Uint8Array(1))[0] < 128 ? "onet" : "holland";
        localStorage.setItem(METHOD_KEY, m);
      }
      return m;
    } catch (e) { return "onet"; } // storage blocked: no stable group, so no comparison
  })();
  const matchCareer = (c, p) => SC.match(c, p, CAREER_APT, METHOD);
  const codeOf = c => SC.codeFor(c, METHOD); // the 3 interest types shown for a career

  // The subjects asked about for this student's class/stream, and whether every
  // one they study has both an enjoyment and a marks answer.
  const subjectSetFor = () => SC.subjectSet(Q, state.profile);
  function subjectsComplete() {
    const set = subjectSetFor(), A = state.answers.subj;
    const asked = set.core.concat(set.optional.filter(k => A[k]));
    return asked.every(k => A[k] && Number.isInteger(A[k].like) && Number.isInteger(A[k].marks));
  }

  const rank = p => CAREERS.map(c => Object.assign({ c }, matchCareer(c, p))).sort((a, b) => b.score - a.score);

  function reasonsFor(c, p) {
    const out = [];
    const strong = codeOf(c).split("").filter(l => p.rel[l] >= 60).map(l => Q.types[l].noun.toLowerCase());
    if (strong.length) out.push(`Fits your ${strong.join(" + ")} side`);
    const apts = p.apt ? (CAREER_APT[c.id] || []).filter(k => p.apt[k] >= 75).map(k => APT.areas[k].name.toLowerCase()) : [];
    if (apts.length) out.push(`Plays to your strength in ${apts.join(" & ")}`);
    const subj = c.subjects.filter(s => p.subj[s] >= 65).map(s => find(META.subjects, s).label);
    if (subj.length) out.push(`Uses subjects you enjoy and do well in: ${subj.slice(0, 3).join(", ")}`);
    const vals = c.values.filter(v => p.fav.values.includes(v)).map(v => find(META.values, v).label.toLowerCase());
    if (vals.length) out.push(`Offers what you value: ${vals.join(", ")}`);
    const traits = Object.entries(c.b5).filter(([k, w]) => w * (p.b[k] - 50) >= 10).map(([k]) => Q.traits[k].name.toLowerCase());
    if (traits.length) out.push(`Your ${traits.join(" & ")} suit${traits.length > 1 ? "" : "s"} this work`);
    if (!out.length) out.push("A stretch pick, worth exploring if it sparks your interest");
    return out.slice(0, 3);
  }

  /* ---------- streams ---------- */
  function userStreams() {
    const s = state.profile && state.profile.stream;
    if (!s) return null;
    return s === "PCMB" ? ["PCM", "PCB"] : [s];
  }
  function streamOk(c) {
    const us = userStreams();
    return !us || c.streams.includes("ANY") || c.streams.some(s => us.includes(s));
  }
  // full: also spell out the routes open from the student's own stream (career page, Full Report).
  function streamWarn(c, full) {
    if (streamOk(c)) return "";
    const need = c.streams.filter(s => s !== "ANY").map(s => META.streams[s]).join(" or ");
    const college = state.profile.stage === "c";
    const head = college ? `Most people get here through ${need} in Class 12.` : `Usually needs ${need} in Class 11–12.`;
    const route = window.BRIDGE_ROUTES && window.BRIDGE_ROUTES[c.id];
    if (full && route) {
      const yours = find(META.userStreams, state.profile.stream).label;
      return `<div class="warn"><p>⚠️ ${esc(head)}</p>
        <p class="warn-route"><b>Routes from ${esc(yours)}:</b> ${esc(route)}</p></div>`;
    }
    const tip = route ? "See the roadmap for routes from your stream." : college ? "Look for related careers." : "Talk to a counsellor about your options.";
    return `<p class="warn">⚠️ ${esc(head)} ${tip}</p>`;
  }

  /* ---------- router ---------- */
  let celebrate = false;
  function route() {
    const [page, arg] = location.hash.replace(/^#\/?/, "").split("/");
    const current = page || "home";
    document.body.dataset.page = current;
    // A career page belongs to "Careers"; setting up and the quiz belong to "My route".
    const section = current === "career" ? "explore" : current === "start" || current === "quiz" ? "results" : current;
    document.querySelectorAll(".nav a, .tabbar a").forEach(a => {
      const on = a.dataset.page === section;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.getElementById("nav-results").hidden = !state.done;
    const me = document.getElementById("tab-me");
    me.setAttribute("href", state.done ? "#/results" : state.profile && answeredCount() > 0 ? "#/quiz" : "#/start");
    me.querySelector("span").textContent = state.done ? "My route" : "Start";
    const views = {
      start: renderSetup,
      quiz: renderQuiz,
      results: renderResults,
      career: () => renderCareer(arg),
      explore: () => renderExplore(arg),
      compare: () => renderCompare(arg),
      aptitude: renderAptitude,
      method: renderMethod
    };
    // Views added by other modules (js/account.js): account, contact.
    const extra = window.DISHA_VIEWS || {};
    if (!views[page] && typeof extra[page] === "function") views[page] = () => extra[page](app, arg);
    (views[page] || renderHome)();
    if (window.DishaStats) window.DishaStats.paint();
    window.scrollTo(0, 0);
    const h1 = app.querySelector("h1");
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function langNote() {
    return lang === "hi" ? `<p class="lang-note">${esc(t("lang.note"))}</p>` : "";
  }

  /* ---------- home ---------- */
  // Line-art icons (24px grid). Static markup only, never user data.
  const ICONS = {
    research: '<path d="M9 3h6M10 3v6l-5 9.5A1.6 1.6 0 0 0 6.4 21h11.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3M7.5 15h9"/>',
    india: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17h3"/>',
    route: '<path d="M4.5 20v-6l5.5-5.5h9.5M10 8.5l5 6h4.5"/><circle cx="4.5" cy="20" r="1.8"/><circle cx="19.5" cy="8.5" r="1.8"/>',
    puzzle: '<path d="M4 4h6v2a2 2 0 1 0 4 0V4h6v6h-2a2 2 0 1 0 0 4h2v6h-6v-2a2 2 0 1 0-4 0v2H4z"/>',
    compare: '<rect x="3" y="4" width="7.5" height="16" rx="2"/><rect x="13.5" y="4" width="7.5" height="16" rx="2"/>'
  };
  const icon = k => `<span class="f-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></span>`;

  // [label, career id, route-line colour]: clickable bubbles around the hero compass.
  // Deliberately offbeat: students already know doctor/engineer/CA; these spark curiosity.
  // Listed clockwise: four down the right side, then four up the left side.
  const BUBBLES = [["Game Designer", "gamedev", "com"], ["Forensic Expert", "forensic", "pcb"], ["Drone Pilot", "drone", "pcm"], ["Astronomer", "astro", "hum"],
    ["Archaeologist", "archaeologist", "hum"], ["Ethical Hacker", "cyber", "pcm"], ["Tiger Tracker", "wildlife", "pcb"], ["Robotics", "robotics", "com"]];
  // Bubbles sit on a 10-slot ring with the top (0) and bottom (5) slots left empty,
  // so nothing crowds the space directly above and below the compass.
  const bubbleSlot = i => (i < 4 ? i + 1 : i + 2);
  const COMPASS_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="cp-ring" cx="50" cy="50" r="44"></circle>
      <path class="cp-tick" d="M50 10v7M50 83v7M10 50h7M83 50h7"></path>
      <g class="cp-needle"><path class="cp-n" d="M50 16 L58 50 L42 50 Z"></path><path class="cp-s" d="M50 84 L58 50 L42 50 Z"></path></g>
      <circle class="cp-hub" cx="50" cy="50" r="6"></circle>
    </svg>`;

  // "Love something? There's a route for it.": more offbeat careers (none repeat the compass bubbles),
  // each tinted with a route-line colour.
  const OFFBEAT_PICKS = [["VFX Animator", "animator", "pcb"], ["Marine Biologist", "marine", "hum"], ["Climate Specialist", "climate", "pcm"],
    ["Genetic Engineer", "biotech", "pcb"], ["Flavour Creator", "foodsci", "com"], ["Sound Designer", "sound", "pcm"],
    ["Toy Designer", "industrial", "com"], ["Translator", "linguist", "hum"]];

  function renderHome() {
    const inProgress = state.profile && !state.done && answeredCount() > 0;
    const actions = state.done
      ? `<a class="btn primary lg" href="#/results">${esc(t("home.resume"))}</a><button class="btn ghost lg" data-act="retake">${esc(t("home.retake"))}</button>`
      : inProgress
        ? `<a class="btn primary lg" href="#/quiz">${esc(t("home.continue"))} · ${esc(Q.chapters[state.pos.ch].title)} →</a><a class="btn ghost lg" href="#/start">${esc(t("home.startOver"))}</a>`
        : `<a class="btn primary lg" href="#/start">${esc(t("home.start"))}</a><a class="btn ghost lg" href="#/explore">${esc(t("home.explore"))}</a>`;
    const feature = (k, title, d) => `<div class="card feature">${icon(k)}<h3>${esc(title)}</h3><p class="muted">${esc(d)}</p></div>`;
    const bubbles = BUBBLES.filter(([, id]) => BY_ID[id]).map(([label, id, line], i) => {
      const a = (bubbleSlot(i) / 10) * 2 * Math.PI - Math.PI / 2;
      const left = 50 + Math.cos(a) * 34, top = 50 + Math.sin(a) * 46;
      return `<a class="bubble" href="#/career/${esc(id)}" title="See the ${esc(label)} route" style="--c:var(--${line});left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;animation-delay:${(i * 0.4).toFixed(1)}s"><i></i>${esc(label)}</a>`;
    }).join("");

    app.innerHTML = `
    <section class="view hero">
      <div class="hero-text">
        <span class="eyebrow">${esc(t("home.pill"))}</span>
        <h1>${esc(t("home.title"))} <span class="grad">${esc(t("home.titleYou"))}</span>.</h1>
        <p class="lead">${esc(t("home.lead"))}</p>
        <div class="cta-row">${actions}</div>
        <ul class="hero-meta">${t("home.meta").split(" · ").map(m => `<li>${esc(m)}</li>`).join("")}</ul>
        <div class="stats-strip" aria-live="polite">
          <span class="stat-pill"><b data-stat="visitors">0</b> <span data-stat-label="visitors" data-one="visitor">visitors</span></span>
          <span class="stat-pill"><b data-stat="quizzes">0</b> <span data-stat-label="quizzes" data-one="quiz taken">quizzes taken</span></span>
        </div>
        ${langNote()}
      </div>
      <div class="hero-art">
        <a class="compass" href="#/explore/offbeat" aria-label="Explore offbeat careers" title="Explore offbeat careers">${COMPASS_SVG}</a>
        ${bubbles}
      </div>
    </section>
    <section class="view offbeat-band">
      <h2>Love something? <span>There's a route for it.</span></h2>
      <p>${CAREERS.length} careers, each with a full route from Class 6 to your first job.</p>
      <div class="ob-chips">${OFFBEAT_PICKS.filter(([, id]) => BY_ID[id]).map(([label, id, line]) => `<a href="#/career/${esc(id)}" style="--c:var(--${line})">${esc(label)}</a>`).join("")}
        <a class="all" href="#/explore/offbeat">See all offbeat careers</a></div>
    </section>
    <section class="view features">
      ${feature("research", t("home.f1t"), t("home.f1d"))}
      ${feature("india", t("home.f2t"), t("home.f2d", { n: CAREERS.length }))}
      ${feature("route", t("home.f3t"), t("home.f3d"))}
    </section>
    <section class="view">
      <h2 class="section-title">${esc(t("home.chaptersTitle"))}</h2>
      <ol class="chapters">${Q.chapters.map((ch, i) => `
        <li><span class="ch-num" aria-hidden="true">${i + 1}</span><div><b>${esc(ch.title)}</b><p class="small muted">${esc(ch.blurb)}</p></div></li>`).join("")}
      </ol>
      <a class="card bonus" href="#/aptitude">
        ${icon("puzzle")}
        <span class="bonus-body"><b>Bonus: Aptitude Challenge</b><span class="small muted">${APT.items.length} quick puzzles on numbers, words, logic and shapes. Optional, and it sharpens your matches.</span></span>
        <span class="btn ghost small">${state.apt.done ? "See my aptitude →" : "Try it →"}</span>
      </a>
      <a class="card bonus" href="#/compare">
        ${icon("compare")}
        <span class="bonus-body"><b>Compare careers side by side</b><span class="small muted">Pay, outlook, streams, exams and colleges for up to 3 careers at once.</span></span>
        <span class="btn ghost small">Compare →</span>
      </a>
    </section>`;
  }

  /* ---------- methodology ---------- */
  function renderMethod() {
    const typeRows = TYPES.map(k => `<li><span class="dot" style="background:var(--${k})"></span><b>${Q.types[k].emoji} ${esc(Q.types[k].name)}</b> — ${esc(Q.types[k].desc)}</li>`).join("");
    const traitRows = TRAITS.map(k => `<li><b>${Q.traits[k].emoji} ${esc(Q.traits[k].name)}</b> — ${esc(Q.traits[k].text[1])}</li>`).join("");
    const schol = SCHOLARSHIPS.map(s => `<li><b>${esc(s.name)}</b> — ${esc(s.who)} ${isHttps(s.site) ? `<a href="${esc(s.site)}" target="_blank" rel="noopener noreferrer">Official site →</a>` : ""}</li>`).join("");
    app.innerHTML = `
    <section class="view page method">
      <span class="eyebrow">${esc(t("nav.method"))}</span>
      <h1>${esc(t("method.title"))}</h1>
      <p class="lead">${esc(t("method.intro"))}</p>
      ${langNote()}

      <div class="method-grid">
      <div class="card m-measure">
        <h2>1. What we measure</h2>
        <p>Disha combines two of the most researched frameworks in career psychology:</p>
        <h3>Your interests — Holland's RIASEC model</h3>
        <ul class="method-list">${typeRows}</ul>
        <h3>Your personality — the Big Five</h3>
        <p class="small muted">Measured with the public-domain Mini-IPIP, a widely used short form of the Big Five personality questionnaire.</p>
        <ul class="method-list">${traitRows}</ul>
        <h3>Your subjects</h3>
        <p>For each subject you study (based on your class and stream): how much you enjoy it and what marks you usually get. Enjoyment counts a little more than marks, because marks can improve.</p>
        <h3>Your favourites</h3>
        <p>What you love doing outside class, and what you want from a career (money, helping others, creativity, and so on).</p>
        <h3>Your aptitude (optional)</h3>
        <p>The <a href="#/aptitude">Aptitude Challenge</a> has ${APT.items.length} short puzzles across ${APT_AREAS.map(k => esc(APT.areas[k].name.toLowerCase())).join(", ")}. It shows what you are naturally quick at today, which is different from what you enjoy.</p>
      </div>

      <div class="card m-match">
        <h2>2. How we match you to careers</h2>
        <p>Every career has a three-letter Holland code, the personality traits that help in it, and the subjects and values it fits. Your match score combines four things:</p>
        <ul class="method-list">
          <li><b>50% — Interests.</b> How your whole interest profile (all six types) compares with the career's, and how strong your interests are in its three main types.</li>
          <li><b>25% — Subjects.</b> How much you enjoy, and how well you score in, the subjects the career uses. A subject you find hard pulls a career down; one you love and do well in pushes it up.</li>
          <li><b>15% — Personality.</b> How your traits fit what the work usually demands.</li>
          <li><b>10% — What you value.</b></li>
        </ul>
        <p>If you finish the optional Aptitude Challenge, it becomes a fifth input worth <b>10%</b> (interests become 45%, subjects 22% and personality 13%). Each career is linked to the two aptitudes it uses most, such as logic and numbers for a software engineer.</p>
        <p>Careers that are genuinely similar for you, such as two kinds of engineering, will have close scores. That is honest, not a flaw: read the reasons on each card to choose between them.</p>
        <p>Each match card shows the main reasons it was chosen, so nothing is a black box.</p>
        <h3>Where the career profiles come from</h3>
        <p>Each career's interest profile comes from <b>O*NET</b>, a database built by surveying real workers in about 900 occupations. For each Disha career we use the closest occupations, averaged, which is more accurate than picking three letters by hand. Three careers with no fair equivalent in that data (Civil Services, Entrepreneur and Defence Officer) keep Disha's own codes.</p>
        <p>We are also measuring how accurate this is: some devices still use Disha's earlier hand-picked codes, and the "Do your top 3 careers feel right?" rating under your results tells us which method works better for Indian students.</p>
        <p class="small muted">Contains information from the <a href="https://www.onetcenter.org/database.html" target="_blank" rel="noopener noreferrer">O*NET 31.0 Database</a> by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> licence. Disha averaged related occupations into one profile per career. O*NET® is a trademark of USDOL/ETA.</p>
      </div>

      <div class="card m-limits">
        <h2>3. Honest limits</h2>
        <p>No test can decide your future, and a short quiz gives a rough signal, not a verdict. Treat your results as a starting point: explore the careers, talk to people who do them, discuss with your parents and a counsellor, and retake the quiz as you grow. Your answers stay on your device unless you choose to save them to an account.</p>
      </div>

      <div class="card m-schol">
        <h2>4. Scholarships worth knowing</h2>
        <p class="small muted">Eligibility, amounts and dates change every year — always confirm on the official site.</p>
        <ul class="method-list">${schol}</ul>
      </div>
      </div>

      <div class="cta-row center"><a class="btn primary" href="#/start">${esc(t("home.start"))}</a></div>
    </section>`;
  }

  /* ---------- setup ---------- */
  let draft = null;
  const needsStream = st => st === "h" || st === "c";
  const ready = () => draft.stage && (!needsStream(draft.stage) || draft.stream);
  // College students are asked the stream they took: it decides which degrees and exams are open to them.
  const streamLabel = st => st === "c" ? "Which stream did you take in Class 12?" : "Your stream in Class 11–12";

  function renderSetup() {
    draft = Object.assign({ name: "", stage: null, stream: null }, state.profile || {});
    app.innerHTML = `
    <section class="view page">
      <span class="eyebrow">Before we begin</span>
      <h1>Let's set up your journey</h1>
      <p class="lead">This helps us show paths that fit where you are right now.</p>
      <div class="split"><div class="split-main">
      <div class="card form setup-form">
        <label class="field"><span class="field-label">What should we call you? <em>(optional)</em></span>
          <input id="name" type="text" maxlength="30" autocomplete="given-name" placeholder="Your first name" value="${esc(draft.name)}"></label>
        <div class="field"><span class="field-label">Where are you right now?</span>
          <div class="opt-grid">${META.userStages.map(s => `
            <button type="button" class="opt ${draft.stage === s.k ? "on" : ""}" data-act="stage" data-k="${esc(s.k)}" aria-pressed="${draft.stage === s.k}">
              <span class="opt-emoji" aria-hidden="true">${s.emoji}</span><b>${esc(s.label)}</b><span class="small muted">${esc(s.hint)}</span>
            </button>`).join("")}
          </div>
        </div>
        <div class="field" id="stream-field" ${needsStream(draft.stage) ? "" : "hidden"}>
          <span class="field-label" id="stream-label">${streamLabel(draft.stage)}</span>
          <div class="chips">${META.userStreams.map(s => `
            <button type="button" class="chip ${draft.stream === s.k ? "on" : ""}" data-act="stream" data-k="${esc(s.k)}" aria-pressed="${draft.stream === s.k}">${esc(s.label)}</button>`).join("")}
          </div>
        </div>
        <button class="btn primary lg block" data-act="begin" ${ready() ? "" : "disabled"}>${state.done ? "Save & see my results →" : "Start Chapter 1 →"}</button>
      </div>
      </div>
      <aside><div class="card side-card">
        <h2>What to expect</h2>
        <ul class="side-list">${Q.chapters.map((ch, i) => `
          <li><span aria-hidden="true">${ch.emoji}</span><b>${i + 1}. ${esc(ch.title)}</b><span class="small muted">${esc(ch.blurb)}</span></li>`).join("")}
        </ul>
        <p class="small muted">⏱ About 10 minutes · No right or wrong answers · Your answers stay on this device.</p>
      </div></aside></div>
    </section>`;
  }

  function refreshSetup() {
    app.querySelectorAll('[data-act="stage"], [data-act="stream"]').forEach(b => {
      const on = b.dataset.k === (b.dataset.act === "stage" ? draft.stage : draft.stream);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
    document.getElementById("stream-field").hidden = !needsStream(draft.stage);
    document.getElementById("stream-label").textContent = streamLabel(draft.stage);
    app.querySelector('[data-act="begin"]').disabled = !ready();
  }

  /* ---------- quiz ---------- */
  let bump = false;
  let lastPct = 0;
  const HINTS = { tt: "Keys: ← or →", rate: "Keys: 1–5", likert: "Keys: 1–5", scen: "Keys: 1–4", subj: "", fav: "" };

  // Chapters as stations on a route line; --p is how far along the line you are.
  function journey(ci) {
    const along = (ci / (Q.chapters.length - 1) * 80).toFixed(1);
    return `<ol class="journey" aria-label="Chapters" style="--p:${along}%">${Q.chapters.map((ch, i) => `
      <li class="${i < ci ? "done" : i === ci ? "now" : ""}"${i === ci ? ' aria-current="step"' : ""}><span class="j-dot" aria-hidden="true">${i < ci ? "✓" : i + 1}</span><span class="j-label">${esc(ch.title)}</span></li>`).join("")}
    </ol>`;
  }

  function renderQuiz() {
    if (!state.profile) return go("#/start");
    if (state.done) return go("#/results");
    if (state.reveal != null) return renderReveal();
    const ci = state.pos.ch, ch = Q.chapters[ci], qi = state.pos.q;
    const body = { tt: qThisOrThat, rate: qRate, likert: qLikert, scen: qScenario, subj: qSubjects, fav: qFavourites }[ch.kind](ch, qi);
    const done = answeredCount();
    // Revisiting an answered question (via Back or "Review answers"): offer Next
    // so the student doesn't have to re-pick the same answer to move on.
    const answered = Boolean(ch.items) && state.answers[ch.id][qi] != null;
    app.innerHTML = `
    <section class="view quiz">
      <h1 class="sr-only">Chapter ${ci + 1}: ${esc(ch.title)}</h1>
      ${journey(ci)}
      <div class="q-meta">
        <span><b>${esc(ch.title)}</b> · ${ch.items ? `${qi + 1} of ${ch.items.length}` : ch.kind === "fav" ? "Last step" : "One page"}</span>
        <span class="xp ${bump ? "bump" : ""}">${done * 10} XP</span>
      </div>
      <div class="progress" role="progressbar" aria-label="Overall progress" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="${done}">
        <span style="width:${lastPct}%"></span>
      </div>
      <div class="q-wrap">${body}</div>
      <div class="q-foot">
        <button class="btn ghost small" data-act="back">${esc(t("common.back"))}</button>
        <span class="small muted hint">${esc(HINTS[ch.kind])}${answered ? " · Enter: next" : ""}</span>
        ${answered ? `<button class="btn primary small" data-act="forward" id="q-next">Next →</button>` : ""}
      </div>
    </section>`;
    bump = false;
    if (ch.kind === "subj") refreshSubjects();
    const pct = (done / TOTAL * 100).toFixed(1);
    const bar = app.querySelector(".progress span");
    requestAnimationFrame(() => { bar.style.width = pct + "%"; });
    lastPct = pct;
  }

  function qThisOrThat(ch, qi) {
    const pair = ch.items[qi], cur = state.answers.tt[qi];
    const card = (o, v, key) => `
      <button class="tt-card ${cur === v ? "sel" : ""}" data-act="pick" data-v="${v}">
        <span class="tt-emoji" aria-hidden="true">${o.e}</span><span>${esc(o.x)}</span><kbd aria-hidden="true">${key}</kbd>
      </button>`;
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <div class="tt">${card(pair[0], 0, "←")}<span class="tt-or" aria-hidden="true">or</span>${card(pair[1], 1, "→")}</div>`;
  }

  function qRate(ch, qi) {
    const it = ch.items[qi], cur = state.answers.rate[qi];
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <div class="q-card"><span class="q-emoji" aria-hidden="true">${it.e}</span><h2 class="q-text">${esc(it.x)}</h2></div>
      <div class="scale" role="group" aria-label="How much would you enjoy this?">${Q.rateScale.map((s, i) => `
        <button class="scale-btn ${cur === i ? "sel" : ""}" data-act="pick" data-v="${i}">
          <span class="se" aria-hidden="true">${s.e}</span><span class="sl">${esc(s.x)}</span>
        </button>`).join("")}
      </div>`;
  }

  function qLikert(ch, qi) {
    const it = ch.items[qi], cur = state.answers.likert[qi];
    const S = Q.likertScale;
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <div class="q-card"><h2 class="q-text">“${esc(it.x)}”</h2></div>
      <div class="likert" role="group" aria-label="How true is this about you?">${S.map((label, i) => `
        <button class="lk lk${i + 1} ${cur === i + 1 ? "sel" : ""}" data-act="pick" data-v="${i + 1}" aria-label="${esc(label)}" title="${esc(label)}"></button>`).join("")}
      </div>
      <div class="lk-labels" aria-hidden="true"><span>${esc(S[0])}</span><span>${esc(S[4])}</span></div>`;
  }

  function qScenario(ch, qi) {
    const it = ch.items[qi], cur = state.answers.scen[qi];
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <div class="q-card"><span class="q-emoji" aria-hidden="true">${it.e}</span><h2 class="q-text">${esc(it.x)}</h2></div>
      <div class="scen">${it.o.map((o, i) => `
        <button class="scen-btn ${cur === i ? "sel" : ""}" data-act="pick" data-v="${i}">
          <span class="scen-emoji" aria-hidden="true">${o.e}</span><span>${esc(o.x)}</span><kbd aria-hidden="true">${i + 1}</kbd>
        </button>`).join("")}
      </div>`;
  }

  /* "Your Subjects": enjoyment + usual marks for each subject the student studies. */
  function subjectRow(k, optional) {
    const s = Q.schoolSubjects[k], r = state.answers.subj[k] || {};
    return `<div class="subj-row ${Number.isInteger(r.like) && Number.isInteger(r.marks) ? "done" : ""}" data-subj="${esc(k)}">
      <div class="subj-head"><span class="subj-emoji" aria-hidden="true">${s.emoji}</span><b>${esc(s.label)}</b>
        ${optional ? `<button type="button" class="subj-remove" data-act="subjOpt" data-k="${esc(k)}" aria-label="Remove ${esc(s.label)}">✕</button>` : ""}</div>
      <div class="subj-q"><span class="small muted">How much do you enjoy it?</span>
        <div class="subj-like" role="group" aria-label="How much do you enjoy ${esc(s.label)}?">${Q.rateScale.map((o, i) => `
          <button type="button" class="subj-btn ${r.like === i ? "sel" : ""}" data-act="subjLike" data-k="${esc(k)}" data-v="${i}" aria-pressed="${r.like === i}" title="${esc(o.x)}"><span aria-hidden="true">${o.e}</span><span class="sr-only">${esc(o.x)}</span></button>`).join("")}
        </div></div>
      <div class="subj-q"><span class="small muted">Your usual marks?</span>
        <div class="subj-marks" role="group" aria-label="Your usual marks in ${esc(s.label)}">${Q.marksScale.map((m, i) => `
          <button type="button" class="chip ${r.marks === i ? "on" : ""}" data-act="subjMarks" data-k="${esc(k)}" data-v="${i}" aria-pressed="${r.marks === i}">${esc(m)}</button>`).join("")}
        </div></div>
    </div>`;
  }

  function qSubjects(ch) {
    const set = subjectSetFor(), A = state.answers.subj;
    const taking = set.optional.filter(k => A[k]);
    const notTaking = set.optional.filter(k => !A[k]);
    const stage = find(META.userStages, state.profile.stage).label;
    const stream = state.profile.stream ? ` · ${find(META.userStreams, state.profile.stream).label}` : "";
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <p class="subj-for small muted">Subjects for <b>${esc(stage)}${esc(stream)}</b></p>
      <div class="subj-list">${set.core.map(k => subjectRow(k, false)).join("")}${taking.map(k => subjectRow(k, true)).join("")}</div>
      ${notTaking.length ? `<div class="card subj-more"><h2 class="fav-h">Do you also study any of these? <span class="small muted">(tap to add)</span></h2>
        <div class="chips">${notTaking.map(k => `<button type="button" class="chip" data-act="subjOpt" data-k="${esc(k)}">+ ${Q.schoolSubjects[k].emoji} ${esc(Q.schoolSubjects[k].label)}</button>`).join("")}</div></div>` : ""}
      <p class="small muted subj-status" id="subj-status" role="status"></p>
      <button class="btn primary lg block" data-act="subjNext" id="subj-next">Next: ${Q.chapters[state.pos.ch + 1].emoji} ${esc(Q.chapters[state.pos.ch + 1].title)} →</button>`;
  }

  // Updates the "3 of 5 subjects done" line and the Next button without a full re-render.
  function refreshSubjects() {
    const set = subjectSetFor(), A = state.answers.subj;
    const asked = set.core.concat(set.optional.filter(k => A[k]));
    const done = asked.filter(k => A[k] && Number.isInteger(A[k].like) && Number.isInteger(A[k].marks)).length;
    const st = document.getElementById("subj-status"), next = document.getElementById("subj-next");
    if (st) st.textContent = done === asked.length ? "All subjects done ✓" : `${done} of ${asked.length} subjects done · answer both questions for each`;
    if (next) next.disabled = done !== asked.length;
  }

  function rateSubject(btn, field) {
    const k = btn.dataset.k, v = Number(btn.dataset.v);
    if (!Q.schoolSubjects[k]) return;
    const r = state.answers.subj[k] || (state.answers.subj[k] = { like: null, marks: null });
    r[field] = v;
    btn.parentElement.querySelectorAll("button").forEach(b => {
      const on = b === btn;
      b.classList.toggle(field === "like" ? "sel" : "on", on);
      b.setAttribute("aria-pressed", on);
    });
    btn.closest(".subj-row").classList.toggle("done", Number.isInteger(r.like) && Number.isInteger(r.marks));
    saveState();
    refreshSubjects();
  }

  function qFavourites(ch) {
    const f = state.answers.fav;
    const chip = (group, s) => {
      const on = f[group].includes(s.k);
      return `<button type="button" class="chip ${on ? "on" : ""}" data-act="fav" data-group="${group}" data-k="${esc(s.k)}" aria-pressed="${on}">${s.emoji} ${esc(s.label)}</button>`;
    };
    return `<p class="q-intro">${esc(ch.intro)}</p>
      <div class="card fav">
        <h2 class="fav-h">Outside class, I love… <span class="small muted">(pick any)</span></h2>
        <div class="chips">${Q.hobbies.map(s => chip("subjects", s)).join("")}</div>
        <h2 class="fav-h">What matters most to you in a career? <span class="small muted" id="val-count">(pick up to 3 · ${f.values.length}/3)</span></h2>
        <div class="chips">${META.values.map(v => chip("values", v)).join("")}</div>
      </div>
      <button class="btn primary lg block" data-act="finish">✨ Reveal my career matches</button>`;
  }

  function insightFor(ci) {
    const kind = Q.chapters[ci].kind;
    if (kind === "subj") {
      const A = state.answers.subj;
      const score = k => 0.6 * A[k].like / 4 + 0.4 * A[k].marks / 3;
      const rated = Object.keys(A).filter(k => A[k] && Number.isInteger(A[k].like) && Number.isInteger(A[k].marks))
        .sort((a, b) => score(b) - score(a));
      const best = rated.slice(0, 2).map(k => `<b>${Q.schoolSubjects[k].emoji} ${esc(Q.schoolSubjects[k].label)}</b>`).join(" and ");
      return `<div class="insight"><span class="big-emoji" aria-hidden="true">📚</span>
        ${best ? `<p>Your strongest subjects: ${best}</p>` : ""}
        <p class="muted">Careers that use the subjects you enjoy and score well in will rise to the top of your matches.</p></div>`;
    }
    if (kind === "likert") {
      const b = scoreB5();
      const k = TRAITS.slice().sort((x, y) => Math.abs(b[y] - 50) - Math.abs(b[x] - 50))[0];
      const trait = Q.traits[k], lvl = level(b[k]);
      return `<div class="insight"><span class="big-emoji" aria-hidden="true">${trait.emoji}</span>
        <p>Your standout trait: <b>${esc(trait.tags[lvl])}</b></p><p class="muted">${esc(trait.text[lvl])}</p></div>`;
    }
    const r = scoreRiasec(ci + 1), order = sortTypes(r), top = Q.types[order[0]];
    if (ci === 0) {
      return `<div class="insight"><span class="big-emoji" aria-hidden="true">${top.emoji}</span>
        <p>Early signal: you lean <b style="color:var(--${order[0]})">${esc(top.name)}</b>, the <b>${esc(top.noun)}</b>.</p>
        <p class="muted">${esc(top.desc)}</p><p class="small muted">Let's see if the next chapter agrees…</p></div>`;
    }
    const tops = order.slice(0, 3).map(k => `<b style="color:var(--${k})">${Q.types[k].emoji} ${esc(Q.types[k].noun)}</b>`).join(" · ");
    const tail = kind === "scen"
      ? `<p class="muted">Two quick steps left: your subjects and what you love. Then we'll match you against ${CAREERS.length} careers.</p>`
      : `<p class="muted">Your interest map is taking shape.</p>`;
    return `<div class="insight">${hexChart(r, true)}<p>Top three right now: ${tops}</p>${tail}</div>`;
  }

  function renderReveal() {
    const ci = state.reveal, ch = Q.chapters[ci], next = Q.chapters[ci + 1];
    app.innerHTML = `
    <section class="view reveal">
      <div class="card reveal-card">
        <div class="badge-burst" aria-hidden="true">${ch.emoji}</div>
        <span class="eyebrow">Chapter ${ci + 1} complete · +${itemCount(ch) * 10} XP</span>
        <h1>Badge unlocked: ${esc(ch.badge)}</h1>
        ${insightFor(ci)}
        <p class="fact"><b>💡 Did you know?</b> ${esc(Q.facts[ci % Q.facts.length])}</p>
        <div class="cta-row center">
          <button class="btn ghost" data-act="back">← Review answers</button>
          <button class="btn primary" data-act="continue" id="continue">Next: ${next.emoji} ${esc(next.title)} →</button>
        </div>
      </div>
    </section>`;
    window.scrollTo(0, 0);
    document.getElementById("continue").focus({ preventScroll: true });
  }

  let locked = false;
  function pick(btn) {
    if (locked) return;
    locked = true;
    btn.classList.add("picked");
    setTimeout(() => { locked = false; answer(Number(btn.dataset.v)); }, reduceMotion ? 0 : 180);
  }

  function answer(v) {
    const ch = Q.chapters[state.pos.ch];
    state.answers[ch.id][state.pos.q] = v;
    if (state.pos.q < ch.items.length - 1) state.pos.q++;
    else state.reveal = state.pos.ch;
    bump = true;
    saveState();
    renderQuiz();
  }

  // Move on from an already-answered question, keeping the answer.
  function forward() {
    const ch = Q.chapters[state.pos.ch];
    if (!ch.items || state.answers[ch.id][state.pos.q] == null) return;
    if (state.pos.q < ch.items.length - 1) state.pos.q++;
    else state.reveal = state.pos.ch;
    saveState();
    renderQuiz();
    window.scrollTo(0, 0);
  }

  function back() {
    if (state.reveal != null) state.reveal = null;
    else if (state.pos.q > 0) state.pos.q--;
    else if (state.pos.ch > 0) {
      state.pos.ch--;
      state.pos.q = itemCount(Q.chapters[state.pos.ch]) - 1;
    } else return go("#/start");
    saveState();
    renderQuiz();
    window.scrollTo(0, 0);
  }

  function toggleFav(btn) {
    const group = btn.dataset.group, list = state.answers.fav[group], k = btn.dataset.k;
    const i = list.indexOf(k);
    if (i < 0 && group === "values" && list.length >= 3) {
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 400);
      return;
    }
    if (i >= 0) list.splice(i, 1); else list.push(k);
    btn.classList.toggle("on", i < 0);
    btn.setAttribute("aria-pressed", i < 0);
    document.getElementById("val-count").textContent = `(pick up to 3 · ${state.answers.fav.values.length}/3)`;
    saveState();
  }

  /* ---------- charts ---------- */
  function hexChart(r, mini) {
    const cx = 170, cy = 165, R = 110;
    const pt = (i, v) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
    };
    const poly = vals => vals.map((v, i) => pt(i, v).map(n => n.toFixed(1)).join(",")).join(" ");
    const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon class="hex-ring" points="${poly(TYPES.map(() => f))}"/>`).join("");
    const axes = TYPES.map((_, i) => {
      const [x, y] = pt(i, 1);
      return `<line class="hex-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join("");
    const vals = TYPES.map(t => Math.max(0.04, r[t] / 100));
    const dots = TYPES.map((t, i) => {
      const [x, y] = pt(i, vals[i]);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="var(--${t})"/>`;
    }).join("");
    const labels = TYPES.map((t, i) => {
      const [x, y] = pt(i, 1.24);
      return `<text class="hex-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${Q.types[t].emoji} ${esc(Q.types[t].noun)}</text>`;
    }).join("");
    const aria = TYPES.map(t => `${Q.types[t].name} ${r[t]}%`).join(", ");
    return `<svg class="hex ${mini ? "mini" : ""}" viewBox="0 0 340 330" role="img" aria-label="Interest profile: ${esc(aria)}">
      ${rings}${axes}<polygon class="hex-shape" points="${poly(vals)}"/>${dots}${labels}</svg>`;
  }

  function traitBars(b) {
    return `<div class="traits">${TRAITS.map(k => {
      const trait = Q.traits[k], v = b[k], lvl = level(v);
      return `<div class="trait">
        <div class="trait-head"><span>${trait.emoji} ${esc(trait.name)}</span><b>${esc(trait.tags[lvl])}</b></div>
        <div class="bar" aria-hidden="true"><span style="width:${Math.max(4, v)}%"></span></div>
        <p class="small muted">${esc(trait.text[lvl])}</p>
      </div>`;
    }).join("")}</div>`;
  }

  /* ---------- results ---------- */
  function starBtn(c) {
    const on = state.saved.includes(c.id);
    return `<button class="star ${on ? "on" : ""}" data-act="star" data-id="${esc(c.id)}" aria-pressed="${on}" aria-label="Save ${esc(c.title)}" title="Save">${on ? "★" : "☆"}</button>`;
  }

  function matchCard(m, p, big) {
    const c = m.c;
    return `<article class="match">
      <div class="match-top">
        <span class="m-emoji" aria-hidden="true">${c.emoji}</span>
        <div class="m-title"><h3>${esc(c.title)}</h3><span class="small muted">${esc(c.cluster)}</span></div>
        ${starBtn(c)}
      </div>
      <div class="meter" aria-hidden="true"><span style="width:${m.score}%"></span></div>
      <p class="m-pct"><b>${m.score}%</b> match</p>
      ${big ? `<ul class="reasons">${reasonsFor(c, p).map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
      ${streamWarn(c)}
      <a class="btn small ${big ? "primary" : "ghost"}" href="#/career/${esc(c.id)}">See the roadmap →</a>
    </article>`;
  }

  // Suggested Class 11 stream from the top 6 matches.
  // keys: the stream keys the suggestion covers (for the Full Report's stream notes).
  function streamRecommendation(ranked) {
    const top = ranked.slice(0, 6);
    const tally = {};
    top.forEach(m => m.c.streams.forEach(s => { if (s !== "ANY") tally[s] = (tally[s] || 0) + m.score; }));
    const sorted = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
    let rec = "Any stream", keys = ["ANY"];
    let why = "Your top careers are open to every stream, so pick the subjects you enjoy most.";
    if (sorted.length) {
      const best = sorted[0], second = sorted[1];
      const n = top.filter(m => m.c.streams.includes(best)).length;
      const both = second && [best, second].sort().join() === "PCB,PCM" && tally[second] > tally[best] * 0.6;
      if (both) {
        rec = "Science (PCMB)"; keys = ["PCM", "PCB"];
        why = "Your matches include both engineering/tech and medicine/biology. PCMB keeps both doors open.";
      } else if (n >= 2) {
        rec = META.streams[best]; keys = [best];
        why = `${n} of your top 6 careers use it${n < 4 ? ", and most of the others are open to any stream" : ""}.`;
      } else {
        const lead = top.find(m => m.c.streams.includes(best)).c;
        keys = ["ANY", best];
        why += ` If ${lead.title} excites you most, choose ${META.streams[best]}.`;
      }
    }
    return { rec, why, keys };
  }

  function guidance(ranked) {
    const stage = state.profile.stage;
    const box = (title, body) => `<section class="card guide"><h2>${esc(title)}</h2>${body}</section>`;
    const top = ranked.slice(0, 6);

    if (stage === "m" || stage === "s") {
      const { rec, why } = streamRecommendation(ranked);
      const fields = [...new Set(top.map(m => m.c.cluster))].slice(0, 3).join(", ");
      if (stage === "m") {
        return box("🌱 You're early, and that's a superpower",
          `<p>You don't need to decide anything yet. This year, explore <b>${esc(fields)}</b>: join a club, watch a deep-dive video or talk to someone who works in one of your top careers.</p>
          <p>Early leaning for Class 11: <b>${esc(rec)}</b>. ${esc(why)}</p>`);
      }
      return box("🧭 Your stream decision",
        `<p>Suggested stream for Class 11: <span class="big-rec">${esc(rec)}</span></p>
        <p class="muted">${esc(why)}</p>
        <p class="small muted">Not sure yet? Talk it over with your parents and a school counsellor, and use the roadmaps below to compare options.</p>`);
    }

    const picks = ranked.filter(m => streamOk(m.c));
    if (stage === "h") {
      const seen = new Set(), exams = [];
      for (let i = 0; i < 3; i++) {
        picks.slice(0, 4).forEach(m => {
          const e = m.c.exams[i];
          if (e && !seen.has(e[0]) && exams.length < 6) {
            seen.add(e[0]);
            exams.push(`<li><b>${esc(e[0])}</b> <span class="small muted">· ${esc(e[1])}</span><br><span class="small">For ${esc(m.c.title)}: ${esc(e[2])}</span></li>`);
          }
        });
      }
      const streamLabel = find(META.userStreams, state.profile.stream).label;
      return box("📝 Exams to put on your radar",
        `<p>Based on your top matches that fit <b>${esc(streamLabel)}</b>:</p>
        <ul class="guide-list">${exams.join("")}</ul>
        <p class="small muted">Dates and patterns change every year. Always check the official websites (nta.ac.in and each exam's own site).</p>`);
    }

    return box("🎓 Your next moves",
      `<ul class="guide-list">${picks.slice(0, 3).map(m => `<li><b>${m.c.emoji} ${esc(m.c.title)}:</b> ${esc(m.c.path.c)}</li>`).join("")}</ul>
      <p class="small muted">In college, internships, projects and skills often matter as much as marks. Start building a portfolio now.</p>`);
  }

  // A short, data-driven plan the student can act on and share with a parent.
  function actionPlan(ranked) {
    const top = ranked.filter(m => streamOk(m.c))[0] || ranked[0];
    const c = top.c, stageKey = state.profile.stage;
    const stageStep = c.path[stageKey] || (META.streamDefaults[c.streams[0]] || {})[stageKey] || c.path.c;
    return [
      `Explore your top match, <b>${esc(c.title)}</b> — open its roadmap and see if it excites you.`,
      `For your stage: ${esc(stageStep)}`,
      `Build one skill this term: <b>${esc(c.skills[0])}</b>.`,
      `Do this soon: ${esc(c.tryNow[0])}`,
      `Talk your results over with a parent, teacher or counsellor — this is a conversation starter, not a final answer.`
    ];
  }

  function parentSummary(p, ranked) {
    const name = state.profile.name ? esc(state.profile.name) : "Your child";
    const t0 = Q.types[p.order[0]], t1 = Q.types[p.order[1]];
    const topThree = ranked.slice(0, 3).map(m => m.c.title).join(", ");
    const stageLabel = find(META.userStages, state.profile.stage).label;
    return `<p>${name} is in <b>${esc(stageLabel)}</b> and shows strong <b>${esc(t0.name)}</b> interests, with ${esc(t1.short)}.</p>
      <p>The three careers that fit best right now are <b>${esc(topThree)}</b>. These come from ${name}'s own interests, personality and favourite subjects — not from marks or pressure.</p>
      <p class="small muted">Please treat this as a starting point for a supportive conversation. The best next step is to explore these options together and, if you can, speak with a school counsellor.</p>`;
  }

  function shareCardDataUrl(p, ranked) {
    const W = 1080, H = 1080, dpr = 1;
    const canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#4f46e5"); grad.addColorStop(0.6, "#7c3aed"); grad.addColorStop(1, "#db2777");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.beginPath(); ctx.arc(W / 2, 300, 150, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "center"; ctx.fillStyle = "#fff";
    ctx.font = "700 120px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🧭", W / 2, 345);
    ctx.font = "600 42px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("My Disha career result", W / 2, 520);
    const t0 = Q.types[p.order[0]], t1 = Q.types[p.order[1]];
    ctx.font = "800 76px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`The ${t1.adj} ${t0.noun}`, W / 2, 620);
    ctx.font = "500 40px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("Top career matches:", W / 2, 730);
    ctx.font = "700 48px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#fff";
    ranked.slice(0, 3).forEach((m, i) => {
      ctx.fillText(`${i + 1}. ${m.c.title}  ${m.score}%`, W / 2, 800 + i * 70);
    });
    ctx.font = "600 38px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Take the free test · Disha Career Compass", W / 2, 1020);
    try { return canvas.toDataURL("image/png"); } catch (e) { return null; }
  }

  function shareText(p, ranked) {
    const t0 = Q.types[p.order[0]], t1 = Q.types[p.order[1]];
    const tops = ranked.slice(0, 3).map((m, i) => `${i + 1}. ${m.c.title} (${m.score}%)`).join("\n");
    return `My Disha career result: The ${t1.adj} ${t0.noun}.\nTop matches:\n${tops}\n\nTake the free career test on Disha Career Compass.`;
  }

  function aptBars(s) {
    return `<div class="traits">${APT_AREAS.map(k => {
      const a = APT.areas[k];
      return `<div class="trait">
        <div class="trait-head"><span>${a.emoji} ${esc(a.name)}</span><b>${s[k]}%</b></div>
        <div class="bar" aria-hidden="true"><span style="width:${Math.max(4, s[k])}%"></span></div>
        <p class="small muted">${esc(a.desc)}</p>
      </div>`;
    }).join("")}</div>`;
  }

  function aptCard(p) {
    if (!p.apt) {
      return `<section class="card apt-cta no-print">
        <div><h2>🧩 Add the 6th dimension: your aptitude</h2>
        <p class="muted">${APT.items.length} quick puzzles on numbers, words, logic and shapes (about 6 minutes). Your matches will then also reflect what you're naturally quick at.</p></div>
        <a class="btn primary" href="#/aptitude">Take the challenge →</a>
      </section>`;
    }
    return `<section class="card report">
      <h2>🧩 Your aptitude</h2>
      <p class="small muted">From the Aptitude Challenge. It counts for 10% of every match score.</p>
      ${aptBars(p.apt)}
      <p class="small no-print"><a href="#/aptitude">See your answers or retake →</a></p>
    </section>`;
  }

  // An offbeat career outside the top 6, to widen the student's horizon.
  function wildcard(m, p) {
    const c = m.c;
    return `<section class="card wildcard">
      <span class="w-emoji" aria-hidden="true">${c.emoji}</span>
      <div class="w-body">
        <span class="eyebrow">🃏 Wildcard pick · ${m.score}% match</span>
        <h2>Ever heard of this? ${esc(c.title)}</h2>
        <p>${esc(c.summary)}</p>
        <p class="small muted">${esc(reasonsFor(c, p)[0])}. It's one of ${OFFBEAT_COUNT} offbeat careers most students never hear about at school.</p>
        <div class="cta-row">
          <a class="btn primary small" href="#/career/${esc(c.id)}">Peek inside →</a>
          <a class="btn ghost small no-print" href="#/explore/offbeat">✨ See all offbeat careers</a>
        </div>
      </div>
    </section>`;
  }

  /* "Do your top 3 feel right?" Sends one anonymous rating (see server/feedback.js)
     and remembers on this device which top 3 it has rated, so it asks once per
     result. Hidden on deploys without the API (CSS keys off data-stats="on"). */
  const FEEDBACK_KEY = "disha.feedback";
  const FEEDBACK_WORDS = ["Not at all", "Not really", "Partly", "Mostly", "Spot on"];
  const feedbackId = top => METHOD + ":" + top.join(",");
  function feedbackCard(top) {
    let done = false;
    try { done = localStorage.getItem(FEEDBACK_KEY) === feedbackId(top); } catch (e) { /* storage blocked */ }
    if (done) return `<p class="feedback-done small muted no-print">Thanks for rating your matches. It helps make Disha more accurate.</p>`;
    return `<div class="card feedback no-print" data-top="${esc(top.join(","))}">
      <h2>Do your top 3 careers feel right?</h2>
      <p class="small muted">One tap. Anonymous, and it helps make Disha more accurate for everyone.</p>
      <div class="fb-stars" role="group" aria-label="How right do your top 3 careers feel?">${FEEDBACK_WORDS.map((w, i) => `
        <button type="button" class="fb-star" data-act="feedback" data-v="${i + 1}" aria-label="${i + 1} of 5: ${esc(w)}" title="${esc(w)}">★</button>`).join("")}
      </div>
      <p class="fb-scale small muted" aria-hidden="true"><span>${esc(FEEDBACK_WORDS[0])}</span><span>${esc(FEEDBACK_WORDS[4])}</span></p>
    </div>`;
  }
  async function sendFeedback(b) {
    const card = b.closest(".feedback"), rating = Number(b.dataset.v);
    const top = card.dataset.top.split(",").filter(id => BY_ID[id]).slice(0, 3);
    if (!(rating >= 1 && rating <= 5) || !top.length) return;
    card.innerHTML = `<p class="feedback-done">Thanks! You rated your matches <b>${esc(FEEDBACK_WORDS[rating - 1].toLowerCase())}</b>.</p>`;
    try { localStorage.setItem(FEEDBACK_KEY, feedbackId(top)); } catch (e) { /* storage blocked */ }
    try {
      await fetch("/api/feedback", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, method: METHOD, stage: state.profile ? state.profile.stage : null, top })
      });
    } catch (e) { /* offline: the thank-you still shows; one lost rating is fine */ }
  }

  function renderResults() {
    if (!state.done) return go("#/");
    const p = buildProfile(), ranked = rank(p);
    const top6 = new Set(ranked.slice(0, 6).map(m => m.c.id));
    const wild = ranked.find(m => m.c.offbeat && !top6.has(m.c.id));
    const more = ranked.slice(6).filter(m => m !== wild).slice(0, 6);
    const [k0, k1, k2] = p.order, t0 = Q.types[k0], t1 = Q.types[k1];
    const name = state.profile.name ? `${esc(state.profile.name)}, you're` : "You're";
    const stage = find(META.userStages, state.profile.stage).label;
    const counsellor = isHttps(CONFIG.counsellorUrl)
      ? `<a class="btn ghost" href="${esc(CONFIG.counsellorUrl)}" target="_blank" rel="noopener noreferrer">${esc(t("results.counsellor"))}</a>` : "";

    app.innerHTML = `
    <section class="view results">
      <div class="res-hero">
        <span class="eyebrow">Your Disha profile · ${esc(stage)}</span>
        <h1>${name} <span class="grad">The ${esc(t1.adj)} ${esc(t0.noun)}</span></h1>
        <div class="code-row">${[k0, k1, k2].map(k => `<span class="code-chip" style="--c:var(--${k})">${Q.types[k].emoji} ${esc(Q.types[k].name)}</span>`).join("")}</div>
        <p class="lead">${esc(t0.desc)} You also have ${esc(t1.short)}.</p>
        <div class="cta-row center no-print">
          <a class="btn primary" href="#/report" data-needs-api>📄 My Full Report</a>
          <button class="btn ghost" data-act="print">${esc(t("results.print"))}</button>
          <a class="btn ghost" href="#/compare/${ranked.slice(0, 3).map(m => esc(m.c.id)).join(",")}">${esc(t("results.compareTop"))}</a>
          <a class="btn ghost" href="#/explore">${esc(t("results.exploreAll"))}</a>
          <a class="btn ghost" href="#/account" data-needs-api>💾 Save to my account</a>
          <a class="btn ghost" href="#/start">${esc(t("results.change"))}</a>
          ${counsellor}
          <button class="btn ghost" data-act="retake">${esc(t("results.retake"))}</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h2>Your interest map</h2>
          <p class="small muted">Holland RIASEC: the kinds of work that energise you.</p>
          ${hexChart(p.r)}
          <ul class="type-list">${p.order.map(k => `<li><span class="dot" style="background:var(--${k})"></span>${esc(Q.types[k].name)}<b>${p.r[k]}%</b></li>`).join("")}</ul>
        </div>
        <div class="card">
          <h2>Your personality</h2>
          <p class="small muted">Big Five: how you naturally think, feel and act.</p>
          ${traitBars(p.b)}
        </div>
      </div>

      ${aptCard(p)}

      ${guidance(ranked)}

      <h2 class="section-title">Your top career matches</h2>
      <div class="matches">${ranked.slice(0, 6).map(m => matchCard(m, p, true)).join("")}</div>

      ${feedbackCard(ranked.slice(0, 3).map(m => m.c.id))}

      ${wild ? wildcard(wild, p) : ""}

      <h2 class="section-title">Also worth exploring</h2>
      <div class="matches compact">${more.map(m => matchCard(m, p, false)).join("")}</div>

      <div class="card report">
        <h2>✅ ${esc(t("results.actionTitle"))}</h2>
        <ol class="action-plan">${actionPlan(ranked).map(s => `<li>${s}</li>`).join("")}</ol>
      </div>

      <div class="card report">
        <h2>👪 ${esc(t("results.parentTitle"))}</h2>
        ${parentSummary(p, ranked)}
      </div>

      <section class="card share no-print" id="share">
        <h2>${esc(t("results.shareTitle"))}</h2>
        <div class="share-wrap">
          <img id="share-img" alt="Your result card" width="300" height="300">
          <div class="share-actions">
            <a class="btn primary small" id="share-download" download="my-disha-result.png">${esc(t("results.download"))}</a>
            <button class="btn ghost small" data-act="copyShare">${esc(t("results.copy"))}</button>
            <p class="small muted">On a phone you can also press and hold the card to save it.</p>
          </div>
        </div>
      </section>

      <section class="card note">
        <h2>🤔 How accurate is this?</h2>
        <p>Disha combines two of the most researched tools in career psychology: <b>Holland's RIASEC interest model</b> and the <b>Big Five personality traits</b> (measured with the public-domain Mini-IPIP). <a href="#/method">See exactly how it works →</a></p>
        <p>No test can decide your future. Use these results to <b>explore</b>: talk to people in these jobs, try the weekly challenges, discuss them with your parents and a counsellor, and retake the quiz every year as you grow.</p>
      </section>
    </section>`;

    // Build the share card after layout.
    const url = shareCardDataUrl(p, ranked);
    const img = document.getElementById("share-img");
    const dl = document.getElementById("share-download");
    if (url && img && dl) { img.src = url; dl.href = url; }
    else if (document.getElementById("share")) { document.getElementById("share").hidden = true; }

    if (celebrate) { celebrate = false; confetti(); }
  }

  /* ---------- career detail ---------- */
  function tile(c, score) {
    return `<a class="tile" href="#/career/${esc(c.id)}">
      <span class="t-emoji" aria-hidden="true">${c.emoji}</span>
      <span class="t-body"><b>${esc(c.title)}</b><span class="small muted">${esc(c.summary)}</span></span>
      ${score != null ? `<span class="t-score">${score}%</span>` : ""}
    </a>`;
  }

  // "Aptitudes it uses: Logic (75%), Numbers (50%)", with the student's score once known.
  function aptUses(c) {
    const areas = CAREER_APT[c.id];
    if (!areas) return "";
    const mine = state.apt.done ? scoreApt() : null;
    const list = areas.map(k => `${APT.areas[k].emoji} ${esc(APT.areas[k].name)}${mine ? ` <b>(you: ${mine[k]}%)</b>` : ""}`).join(" · ");
    const cta = state.apt.done ? "" : ` <a class="no-print" href="#/aptitude">Test yours →</a>`;
    return `<p class="small apt-uses"><b>🧩 Aptitudes it uses:</b> ${list}.${cta}</p>`;
  }

  function renderCareer(id) {
    const c = BY_ID[id];
    if (!c) return go("#/explore");
    const p = state.done ? buildProfile() : null;
    const m = p ? matchCareer(c, p) : null;
    const here = state.profile ? state.profile.stage : null;
    const hereIdx = META.stages.findIndex(s => s.k === here);
    const defaults = META.streamDefaults[c.streams[0]] || META.streamDefaults.ANY;
    const combo = COMBOS[c.id];

    const steps = META.stages.map((s, i) => {
      const cls = hereIdx < 0 ? "" : i < hereIdx ? "past" : i === hereIdx ? "now" : "";
      const comboLine = (s.k === "h" && combo) ? `<p class="combo"><b>📚 Subjects:</b> ${esc(combo)}</p>` : "";
      return `<li class="${cls}">
        <span class="tl-dot" aria-hidden="true">${s.emoji}</span>
        <div class="tl-body">
          <span class="tl-stage">${esc(s.label)}${i === hereIdx ? ` <span class="here">📍 You are here</span>` : ""}</span>
          <p>${esc(c.path[s.k] || defaults[s.k])}</p>
          ${comboLine}
        </div>
      </li>`;
    }).join("");

    const related = CAREERS
      .filter(x => x.id !== c.id && (x.cluster === c.cluster || codeOf(x)[0] === codeOf(c)[0]))
      .map(x => ({ x, s: p ? matchCareer(x, p).score : null }))
      .sort((a, b) => (b.s || 0) - (a.s || 0))
      .slice(0, 3);

    app.innerHTML = `
    <section class="view career">
      <a class="back-link no-print" href="${state.done ? "#/results" : "#/explore"}">← ${state.done ? "Back to my results" : "All careers"}</a>

      <div class="card c-hero">
        <span class="c-emoji" aria-hidden="true">${c.emoji}</span>
        <div class="c-head">
          <span class="eyebrow">${esc(c.cluster)}</span>
          <h1>${esc(c.title)}</h1>
          <p class="lead">${esc(c.summary)}</p>
          <div class="tags">
            ${c.streams.map(s => `<span class="tag">${esc(META.streams[s])}</span>`).join("")}
            ${codeOf(c).split("").map(ty => `<span class="tag" style="--c:var(--${ty})">${Q.types[ty].emoji} ${esc(Q.types[ty].name)}</span>`).join("")}
            ${c.offbeat ? `<span class="tag offbeat-tag">✨ Offbeat</span>` : ""}
          </div>
          ${streamWarn(c, true)}
        </div>
        <div class="c-side">
          ${m ? `<div class="ring" style="--p:${m.score}"><div><b>${m.score}%</b><span>match</span></div></div>`
            : `<a class="btn primary small" href="#/start">Find my match %</a>`}
          ${starBtn(c)}
          <a class="btn ghost small no-print" href="#/compare/${esc(c.id)}">⚖️ Compare</a>
        </div>
      </div>

      <div class="facts">
        <div class="card"><h2>☀️ A day in the life</h2><p>${esc(c.day)}</p></div>
        <div class="card"><h2>💰 Starting pay <span class="small muted">(approx.)</span></h2><p>${esc(c.pay)}</p></div>
        <div class="card"><h2>📈 Future outlook</h2><p>${esc(c.outlook)}</p></div>
      </div>

      <div class="card">
        <h2>🗺️ Your roadmap</h2>
        <ol class="timeline">${steps}</ol>
      </div>

      <div class="grid-2">
        <div class="card">
          <h2>📝 Entrance exams</h2>
          <div class="exams">${c.exams.map(e => `<div class="exam"><b>${esc(e[0])}</b><span class="small muted">${esc(e[1])}</span><p class="small">${esc(e[2])}</p></div>`).join("")}</div>
        </div>
        <div class="card">
          <h2>🏫 Top places to study</h2>
          <ol class="colleges">${c.colleges.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
          <p class="small muted">Rankings change every year. Compare on <a href="https://www.nirfindia.org" target="_blank" rel="noopener noreferrer">NIRF</a> and each institute's official website.</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h2>🧰 Skills to build</h2>
          <div class="chips static">${c.skills.map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div>
          ${aptUses(c)}
        </div>
        <div class="card">
          <h2>🎯 Try this week</h2>
          <ul class="try">${c.tryNow.map((tx, i) => {
            const k = `${c.id}:${i}`;
            return `<li><label><input type="checkbox" data-try="${esc(k)}" ${state.tried[k] ? "checked" : ""}><span>${esc(tx)}</span></label></li>`;
          }).join("")}</ul>
        </div>
      </div>

      ${related.length ? `<h2 class="section-title">Related careers</h2>
        <div class="grid-cards">${related.map(r => tile(r.x, r.s)).join("")}</div>` : ""}
    </section>`;
  }

  /* ---------- explore ---------- */
  const filt = { q: "", cluster: "All", saved: false, offbeat: false };

  function renderExplore(arg) {
    if (arg === "offbeat") { filt.offbeat = true; filt.cluster = "All"; }
    const clusters = ["All", ...new Set(CAREERS.map(c => c.cluster))];
    app.innerHTML = `
    <section class="view explore">
      <h1>Explore careers</h1>
      <p class="muted">${CAREERS.length} careers with clear roadmaps, entrance exams and top colleges. ${state.done ? "Sorted by your match." : `<a href="#/start">Take the quiz</a> to see your match %.`} <a href="#/compare">⚖️ Compare careers</a></p>
      <div class="toolbar">
        <input id="search" type="search" placeholder="Search careers, exams or colleges (e.g. NEET, design, IIT)" value="${esc(filt.q)}" aria-label="Search careers">
        <div class="chips scroll" role="group" aria-label="Filter careers">
          <button class="chip ${filt.saved ? "on" : ""}" data-act="savedOnly" aria-pressed="${filt.saved}">⭐ Saved (${state.saved.length})</button>
          <button class="chip ${filt.offbeat ? "on" : ""}" data-act="offbeatOnly" aria-pressed="${filt.offbeat}">✨ Offbeat (${OFFBEAT_COUNT})</button>
          ${clusters.map(k => `<button class="chip ${filt.cluster === k ? "on" : ""}" data-act="cluster" data-k="${esc(k)}" aria-pressed="${filt.cluster === k}">${esc(k)}</button>`).join("")}
        </div>
      </div>
      <div id="grid" class="grid-cards"></div>
    </section>`;
    drawGrid();
  }

  function drawGrid() {
    const grid = document.getElementById("grid");
    if (!grid) return;
    const p = state.done ? buildProfile() : null;
    const q = filt.q.trim().toLowerCase();
    let list = CAREERS.map(c => ({ c, score: p ? matchCareer(c, p).score : null }));
    if (q) list = list.filter(({ c }) =>
      [c.title, c.cluster, c.summary, ...c.exams.map(e => e[0]), ...c.colleges].join(" ").toLowerCase().includes(q));
    if (filt.cluster !== "All") list = list.filter(({ c }) => c.cluster === filt.cluster);
    if (filt.saved) list = list.filter(({ c }) => state.saved.includes(c.id));
    if (filt.offbeat) list = list.filter(({ c }) => c.offbeat);
    if (p) list.sort((a, b) => b.score - a.score);
    grid.innerHTML = list.length
      ? list.map(({ c, score }) => tile(c, score)).join("")
      : `<p class="empty">${filt.saved ? "No saved careers yet. Tap ☆ on any career to save it." : "No careers match that search."}</p>`;
  }

  /* ---------- compare ---------- */
  const shortTitle = c => c.title.split(/ & | \(| \/ |, /)[0];
  const COMPARE_IDEAS = [["doctor", "biotech"], ["software", "robotics"], ["lawyer", "forensic"], ["pilot", "drone"], ["ca", "economist"], ["film", "sound"]];

  function careerSelect(i, cur) {
    const clusters = [...new Set(CAREERS.map(c => c.cluster))];
    const groups = clusters.map(cl => `<optgroup label="${esc(cl)}">${CAREERS.filter(c => c.cluster === cl).map(c =>
      `<option value="${esc(c.id)}" ${c.id === cur ? "selected" : ""}>${c.emoji} ${esc(c.title)}</option>`).join("")}</optgroup>`).join("");
    return `<label class="cmp-pick"><span class="small muted">Career ${i + 1}${i === 2 ? " (optional)" : ""}</span>
      <select data-slot="${i}"><option value="">${i === 2 ? "+ Add a third career" : "Choose a career…"}</option>${groups}</select></label>`;
  }

  function renderCompare(arg) {
    const p = state.done ? buildProfile() : null;
    let ids = [...new Set(String(arg || "").split(",").filter(id => BY_ID[id]))].slice(0, 3);
    if (!arg && p) return go("#/compare/" + rank(p).slice(0, 3).map(m => m.c.id).join(","));
    const cs = ids.map(id => BY_ID[id]);
    const scores = p ? cs.map(c => matchCareer(c, p).score) : [];
    const best = Math.max(...scores);

    const row = (label, cell) => `<div class="cmp-row">
        <h2 class="cmp-label">${label}</h2>
        <div class="cmp-cells">${cs.map((c, i) => `<div class="cmp-cell">${cell(c, i)}</div>`).join("")}</div>
      </div>`;
    const list = items => `<ul class="cmp-list">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    const mine = state.apt.done ? scoreApt() : null;

    const table = cs.length < 2 ? "" : `
      <div class="cmp" style="--n:${cs.length}">
        <div class="cmp-row cmp-top">
          <div class="cmp-cells">${cs.map(c => `
            <a class="cmp-head" href="#/career/${esc(c.id)}">
              <span class="cmp-emoji" aria-hidden="true">${c.emoji}</span>
              <b>${esc(c.title)}</b>
              <span class="small muted">${esc(c.cluster)}</span>
              ${c.offbeat ? `<span class="tag offbeat-tag">✨ Offbeat</span>` : ""}
            </a>`).join("")}
          </div>
        </div>
        ${p ? row("🎯 Your match", (c, i) => `<span class="cmp-score ${scores[i] === best ? "best" : ""}">${scores[i]}%</span>${scores[i] === best ? `<span class="small muted"> best fit</span>` : ""}`) : ""}
        ${row("💡 In one line", c => esc(c.summary))}
        ${row("💰 Starting pay", c => esc(c.pay))}
        ${row("📈 Future outlook", c => esc(c.outlook))}
        ${row("📚 Stream in Class 11–12", c => `<div class="tags">${c.streams.map(s => `<span class="tag">${esc(META.streams[s])}</span>`).join("")}</div>${streamWarn(c)}`)}
        ${row("🎨 Suits people who are", c => `<div class="tags">${codeOf(c).split("").map(ty => `<span class="tag" style="--c:var(--${ty})">${Q.types[ty].emoji} ${esc(Q.types[ty].name)}</span>`).join("")}</div>`)}
        ${row("🧩 Aptitudes it uses", c => (CAREER_APT[c.id] || []).map(k => `${APT.areas[k].emoji} ${esc(APT.areas[k].name)}${mine ? ` <b>(you: ${mine[k]}%)</b>` : ""}`).join("<br>"))}
        ${row("📝 Key entrance exams", c => list(c.exams.slice(0, 3).map(e => e[0])))}
        ${row("🏫 Top places to study", c => list(c.colleges.slice(0, 3)))}
        ${row("🧰 Skills to build", c => list(c.skills.slice(0, 3)))}
        ${row("☀️ A day in the life", c => esc(c.day))}
        <div class="cmp-row no-print">
          <div class="cmp-cells">${cs.map(c => `<div class="cmp-cell"><a class="btn primary small" href="#/career/${esc(c.id)}">Roadmap →</a></div>`).join("")}</div>
        </div>
      </div>`;

    const ideas = cs.length >= 2 ? "" : `
      <div class="card cmp-empty">
        <h2>${cs.length ? "Pick one more career to compare" : "Not sure where to start? Try one of these"}</h2>
        <div class="chips">${COMPARE_IDEAS.map(pair => `<a class="chip" href="#/compare/${pair.join(",")}">${pair.map(id => `${BY_ID[id].emoji} ${esc(shortTitle(BY_ID[id]))}`).join(" vs ")}</a>`).join("")}</div>
      </div>`;

    app.innerHTML = `
    <section class="view compare">
      <h1>Compare careers</h1>
      <p class="muted">Put up to 3 careers side by side: pay, outlook, streams, exams and colleges.${p ? " Your match % is included." : ` <a href="#/start">Take the quiz</a> to add your match %.`}</p>
      <div class="card cmp-pickers no-print">${[0, 1, 2].map(i => careerSelect(i, ids[i])).join("")}</div>
      ${ideas}
      ${table}
    </section>`;
  }

  /* ---------- aptitude challenge ---------- */
  let aptIntroSeen = false;

  function renderAptitude() {
    const A = state.apt;
    if (A.done) return renderAptResult();
    if (!Object.keys(A.ans).length && !aptIntroSeen) return renderAptIntro();
    const N = APT.items.length, i = A.pos, it = APT.items[i], area = APT.areas[it.k];
    const chosen = A.ans[i], answered = chosen != null;
    const right = APT.items.filter((x, j) => A.ans[j] === x.a).length;
    const done = Object.keys(A.ans).length;
    const opts = it.o.map((o, j) => {
      const cls = !answered ? "" : j === it.a ? "right" : j === chosen ? "wrong" : "dim";
      return `<button class="apt-opt ${cls}" data-act="aptPick" data-v="${j}" ${answered ? "disabled" : ""}>
        <span>${esc(o)}</span>${answered && j === it.a ? `<span aria-hidden="true">✅</span>` : answered && j === chosen ? `<span aria-hidden="true">❌</span>` : `<kbd aria-hidden="true">${j + 1}</kbd>`}
      </button>`;
    }).join("");
    app.innerHTML = `
    <section class="view quiz apt">
      <h1 class="sr-only">Aptitude Challenge: puzzle ${i + 1} of ${N}</h1>
      <div class="q-meta">
        <span><b>${area.emoji} ${esc(area.name)}</b> · ${i + 1} of ${N}</span>
        <span class="xp">✅ ${right} correct</span>
      </div>
      <div class="progress" role="progressbar" aria-label="Aptitude progress" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${done}">
        <span style="width:${(done / N * 100).toFixed(1)}%"></span>
      </div>
      <div class="q-wrap">
        <div class="q-card"><h2 class="q-text">${esc(it.x)}</h2></div>
        <div class="apt-opts" role="group" aria-label="Answer options">${opts}</div>
        ${answered ? `
          <div class="apt-feedback ${chosen === it.a ? "ok" : "no"}" role="status">
            <b>${chosen === it.a ? "✅ Correct!" : "❌ Not quite."}</b> ${esc(it.why)}
          </div>
          <button class="btn primary lg block" data-act="aptNext" id="apt-next">${i < N - 1 ? "Next puzzle →" : "See my aptitude profile →"}</button>` : ""}
      </div>
      <div class="q-foot">
        <a class="btn ghost small" href="#/">Save & exit</a>
        <span class="small muted hint">Keys: 1–4${answered ? " · Enter for next" : ""}</span>
      </div>
    </section>`;
  }

  function renderAptIntro() {
    app.innerHTML = `
    <section class="view reveal">
      <div class="card reveal-card">
        <div class="badge-burst" aria-hidden="true">🧩</div>
        <span class="eyebrow">Bonus chapter · optional</span>
        <h1>Aptitude Challenge</h1>
        <p class="lead">${APT.items.length} quick puzzles, about 6 minutes. No timer, and you see the answer after each one.</p>
        <ul class="apt-areas">${APT_AREAS.map(k => `<li><span aria-hidden="true">${APT.areas[k].emoji}</span><b>${esc(APT.areas[k].name)}</b><span class="small muted">${esc(APT.areas[k].desc)}</span></li>`).join("")}</ul>
        <p class="small muted">Interests show what you enjoy; aptitude shows what you're quick at today. Both grow with practice, so treat this as a snapshot, not a label.</p>
        <div class="cta-row center"><button class="btn primary lg" data-act="aptStart">Start the challenge →</button></div>
      </div>
    </section>`;
  }

  function renderAptResult() {
    const s = scoreApt();
    const order = APT_AREAS.slice().sort((a, b) => s[b] - s[a]);
    const total = APT.items.filter((it, i) => state.apt.ans[i] === it.a).length;
    const top = APT.areas[order[0]];
    const p = state.done ? buildProfile() : null;
    const uses = CAREERS.filter(c => (CAREER_APT[c.id] || [])[0] === order[0])
      .map(c => ({ c, s: p ? matchCareer(c, p).score : null }))
      .sort((a, b) => (b.s || 0) - (a.s || 0) || (b.c.offbeat ? 1 : 0) - (a.c.offbeat ? 1 : 0))
      .slice(0, 6);
    const next = state.done
      ? `<a class="btn primary" href="#/results">See my updated matches →</a>`
      : state.profile
        ? `<a class="btn primary" href="#/quiz">Continue the career quiz →</a>`
        : `<a class="btn primary" href="#/start">Take the career quiz →</a>`;
    app.innerHTML = `
    <section class="view narrow apt-result">
      <span class="eyebrow">Aptitude Challenge · ${total} of ${APT.items.length} correct</span>
      <h1>${s[order[0]] > 0 ? `Your sharpest skill: <span class="grad">${esc(top.name)}</span>` : "Thanks for trying the challenge"}</h1>
      <p class="lead">${s[order[0]] > 0 ? esc(top.desc) : "Every skill here grows with practice. Try again any time."}</p>
      <div class="card">${aptBars(s)}</div>
      <p class="small muted">${state.done ? "Your aptitude now counts for 10% of every match score." : "Finish the career quiz and your aptitude will count for 10% of every match score."} A short challenge is a rough signal, not a verdict.</p>
      <div class="cta-row">${next}<button class="btn ghost" data-act="aptRetake">Retake challenge</button></div>
      ${uses.length && s[order[0]] > 0 ? `<h2 class="section-title">Careers that lean on ${esc(top.name.toLowerCase())}</h2>
        <div class="grid-cards">${uses.map(u => tile(u.c, u.s)).join("")}</div>` : ""}
    </section>`;
  }

  function aptPick(btn) {
    const i = state.apt.pos;
    if (state.apt.ans[i] != null) return;
    state.apt.ans[i] = Number(btn.dataset.v);
    saveState();
    renderAptitude();
    const nextBtn = document.getElementById("apt-next");
    if (nextBtn) nextBtn.focus({ preventScroll: true });
  }

  function markChips(act, isOn) {
    app.querySelectorAll(`[data-act="${act}"]`).forEach(b => {
      const on = isOn(b);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
  }

  /* ---------- confetti ---------- */
  function confetti() {
    if (reduceMotion) return;
    const box = document.createElement("div");
    box.className = "confetti";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 70; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "vw";
      s.style.background = `var(--${TYPES[i % 6]})`;
      s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
      s.style.animationDuration = (2.2 + Math.random() * 1.6).toFixed(2) + "s";
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4500);
  }

  function copyShare(btn) {
    if (!state.done) return;
    const p = buildProfile(), ranked = rank(p);
    const text = shareText(p, ranked);
    const done = () => { btn.textContent = t("results.copied"); setTimeout(() => { btn.textContent = t("results.copy"); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    ta.remove();
  }

  /* ---------- events ---------- */
  const actions = {
    pick,
    back,
    forward,
    feedback: sendFeedback,
    fav: toggleFav,
    subjLike: b => rateSubject(b, "like"),
    subjMarks: b => rateSubject(b, "marks"),
    subjOpt(b) {
      const k = b.dataset.k, set = subjectSetFor();
      if (!set.optional.includes(k)) return;
      if (state.answers.subj[k]) delete state.answers.subj[k];
      else state.answers.subj[k] = { like: null, marks: null };
      saveState();
      renderQuiz();
    },
    subjNext() {
      if (!subjectsComplete()) return;
      state.reveal = state.pos.ch;
      bump = true;
      saveState();
      renderQuiz();
      window.scrollTo(0, 0);
    },
    copyShare,
    continue() {
      state.pos = { ch: state.reveal + 1, q: 0 };
      state.reveal = null;
      saveState();
      renderQuiz();
      window.scrollTo(0, 0);
    },
    finish() {
      state.done = true;
      state.reveal = null;
      celebrate = true;
      saveState();
      if (window.DishaStats) window.DishaStats.quizDone();
      go("#/results");
    },
    stage(b) {
      draft.stage = b.dataset.k;
      if (!needsStream(draft.stage)) draft.stream = null;
      refreshSetup();
    },
    stream(b) {
      draft.stream = b.dataset.k;
      refreshSetup();
    },
    begin() {
      draft.name = sanitizeName(document.getElementById("name").value);
      state.profile = { name: draft.name, stage: draft.stage, stream: needsStream(draft.stage) ? draft.stream : null };
      if (state.done) { saveState(); return go("#/results"); }
      resetQuiz();
      saveState();
      go("#/quiz");
    },
    retake() {
      resetQuiz();
      saveState();
      go(state.profile ? "#/quiz" : "#/start");
    },
    star(b) {
      const id = b.dataset.id, i = state.saved.indexOf(id);
      if (!BY_ID[id]) return;
      if (i >= 0) state.saved.splice(i, 1); else state.saved.push(id);
      saveState();
      app.querySelectorAll(`[data-act="star"][data-id="${CSS.escape(id)}"]`).forEach(el => {
        el.classList.toggle("on", i < 0);
        el.setAttribute("aria-pressed", i < 0);
        el.textContent = i < 0 ? "★" : "☆";
      });
    },
    cluster(b) {
      filt.cluster = b.dataset.k;
      markChips("cluster", el => el.dataset.k === filt.cluster);
      drawGrid();
    },
    savedOnly() {
      filt.saved = !filt.saved;
      markChips("savedOnly", () => filt.saved);
      drawGrid();
    },
    offbeatOnly() {
      filt.offbeat = !filt.offbeat;
      markChips("offbeatOnly", () => filt.offbeat);
      drawGrid();
    },
    aptStart() {
      aptIntroSeen = true;
      renderAptitude();
      window.scrollTo(0, 0);
    },
    aptPick,
    aptNext() {
      if (state.apt.ans[state.apt.pos] == null) return;
      if (state.apt.pos < APT.items.length - 1) state.apt.pos++;
      else {
        state.apt.done = true;
        if (state.done) confetti();
      }
      saveState();
      renderAptitude();
      window.scrollTo(0, 0);
      const h1 = app.querySelector("h1");
      if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    },
    aptRetake() {
      state.apt = freshApt();
      aptIntroSeen = true;
      saveState();
      renderAptitude();
      window.scrollTo(0, 0);
    },
    print() { window.print(); }
  };

  app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (el && actions[el.dataset.act]) actions[el.dataset.act](el, e);
  });
  app.addEventListener("input", e => {
    if (e.target.id === "search") { filt.q = e.target.value; drawGrid(); }
  });
  app.addEventListener("change", e => {
    if (e.target.dataset && e.target.dataset.slot != null) {
      const picked = [...app.querySelectorAll("select[data-slot]")].map(s => s.value).filter(id => BY_ID[id]);
      go("#/compare/" + [...new Set(picked)].join(","));
      return;
    }
    const k = e.target.dataset && e.target.dataset.try;
    if (!k) return;
    if (!/^[a-z]+:\d{1,2}$/.test(k) || !BY_ID[k.split(":")[0]]) return;
    if (e.target.checked) state.tried[k] = true; else delete state.tried[k];
    saveState();
  });

  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    if (location.hash.startsWith("#/aptitude")) {
      const n = Number(e.key);
      const opt = n >= 1 && n <= 4 && app.querySelector(`[data-act="aptPick"][data-v="${n - 1}"]:not([disabled])`);
      if (opt) { e.preventDefault(); aptPick(opt); }
      return;
    }
    if (!location.hash.startsWith("#/quiz") || state.reveal != null || state.done) return;
    const ch = Q.chapters[state.pos.ch];
    // Enter on an answered question = Next (unless a button has focus: let it act).
    if (e.key === "Enter" && !/^(button|a)$/i.test(e.target.tagName) && document.getElementById("q-next")) {
      e.preventDefault();
      forward();
      return;
    }
    const n = Number(e.key);
    let v = null;
    if (ch.kind === "tt") {
      if (e.key === "ArrowLeft" || e.key === "1") v = 0;
      if (e.key === "ArrowRight" || e.key === "2") v = 1;
    } else if (ch.kind === "rate" && n >= 1 && n <= 5) v = n - 1;
    else if (ch.kind === "likert" && n >= 1 && n <= 5) v = n;
    else if (ch.kind === "scen" && n >= 1 && n <= 4) v = n - 1;
    if (v == null) return;
    const btn = app.querySelector(`[data-act="pick"][data-v="${v}"]`);
    if (btn) { e.preventDefault(); pick(btn); }
  });

  /* ---------- theme & language ---------- */
  const themeBtn = document.getElementById("theme-toggle");
  const isDark = () => {
    const th = document.documentElement.dataset.theme;
    return th ? th === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const ICON_SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  const ICON_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
  function syncThemeBtn() {
    themeBtn.innerHTML = isDark() ? ICON_SUN : ICON_MOON;
    themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  }
  themeBtn.addEventListener("click", () => {
    const th = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = th;
    try { localStorage.setItem(THEME_KEY, th); } catch (e) { /* ignore */ }
    syncThemeBtn();
  });
  syncThemeBtn();

  // English only for now. A language switcher can be added back here later;
  // the i18n layer (t / applyStaticI18n / per-language dicts) is already in place.
  applyStaticI18n();

  /* ---------- service worker (offline / installable) ---------- */
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => { /* offline unavailable */ }); });
  }

  // The narrow interface js/account.js uses to sync progress with an account.
  // Imported data goes through the same validation as localStorage.
  window.DishaApp = Object.freeze({
    esc,
    // Everything js/report.js needs to build the Full Report from this device's answers.
    reportModel() {
      if (!state.done || !state.profile) return null;
      const p = buildProfile();
      return { p, ranked: rank(p), profile: Object.assign({}, state.profile), streamRec: streamRecommendation(rank(p)) };
    },
    hexChart, traitBars, aptBars, reasonsFor, streamOk, streamWarn, parentSummary, level,
    exportState: () => JSON.stringify(state),
    hasProgress: () => state.done || state.apt.done || answeredCount() > 0,
    // Forget all progress on this device (after deleting an account, or on a shared computer).
    clearDevice() {
      state = blankState();
      lastPct = 0;
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* storage blocked */ }
      document.getElementById("nav-results").hidden = true;
    },
    importState(text) {
      if (typeof text !== "string" || text.length > MAX_SAVE_BYTES) return false;
      let parsed;
      try { parsed = sanitizeState(JSON.parse(text)); } catch (e) { return false; }
      if (!parsed) return false;
      state = parsed;
      saveState();
      return true;
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
