/* Disha Full Report (#/report), a paid feature.
   The premium writing (interpretation, study tips, plans, parent guide) comes from
   GET /api/report, which only answers for owners of the report. Scores come from
   this device's answers via window.DishaApp, so nothing personal is sent anywhere.
   "Save as PDF" uses the browser's print dialog (Save as PDF on phones and PCs). */
(function () {
  "use strict";

  const App = () => window.DishaApp;
  const esc = s => App().esc(s);
  const Q = window.QUIZ, META = window.CAREER_META, APT = window.APTITUDE;
  const CAREER_APT = window.CAREER_APTITUDES || {}, COMBOS = window.SUBJECT_COMBOS || {};
  const TYPES = ["R", "I", "A", "S", "E", "C"], TRAITS = ["O", "C", "E", "A", "S"];

  const SECTIONS = [
    ["glance", "Your profile at a glance"],
    ["interests", "Your interests in depth"],
    ["personality", "Your personality in depth"],
    ["aptitude", "Your aptitude"],
    ["careers", "Your top 10 careers"],
    ["inside", "Inside your top 3 careers"],
    ["stream", "Stream and subjects"],
    ["exams", "Your entrance-exam timeline"],
    ["plan", "Your 6-month action plan"],
    ["parents", "For your parents"]
  ];

  const list = items => `<ul class="rp-list">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;

  /* ---------- "Inside your top 3 careers" (O*NET data from GET /api/report) ---------- */
  // O*NET knowledge areas -> the Disha subject scores that show readiness for them.
  const KNOW_SUBJ = {
    "Mathematics": ["maths"], "Physics": ["physics"], "Chemistry": ["chemistry"], "Biology": ["biology"],
    "Medicine and Dentistry": ["biology"], "Computers and Electronics": ["computers"],
    "Engineering and Technology": ["physics", "maths"], "Mechanical": ["physics"],
    "English Language": ["languages"], "Foreign Language": ["languages"], "Communications and Media": ["languages"],
    "Economics and Accounting": ["economics", "accounts"], "Sales and Marketing": ["economics", "accounts"],
    "Psychology": ["psychology"], "Sociology and Anthropology": ["psychology", "history"], "Therapy and Counseling": ["psychology"],
    "Geography": ["geography"], "History and Archeology": ["history"], "Law and Government": ["civics"],
    "Fine Arts": ["art", "music"], "Design": ["art"], "Food Production": ["cooking", "biology"]
  };
  // Bars for 1–5 ratings (importance or how often).
  const bars = items => `<ul class="rp-bars">${items.map(([name, v]) => `
      <li><span>${esc(name)}</span><span class="rp-bar" aria-hidden="true"><i style="width:${Math.round(Math.max(4, Math.min(100, (v - 1) / 4 * 100)))}%"></i></span></li>`).join("")}</ul>`;
  const importance = v => v >= 4 ? "essential" : v >= 3.5 ? "very important" : "important";
  function gapFor(name, p) {
    const keys = KNOW_SUBJ[name];
    if (!keys) return ["learn", "Learned in college or on the job"];
    const vals = keys.map(k => p.subj[k]).filter(x => typeof x === "number");
    if (!vals.length) return ["unknown", "You haven't rated this subject yet"];
    const best = Math.max(...vals);
    return best >= 65 ? ["strong", "A strength for you"] : best >= 45 ? ["ok", "On track: keep building"] : ["build", "Worth building up"];
  }
  function insideCareer(m, i, p, deep) {
    const c = m.c, d = deep && deep[c.id];
    const head = `<h3>${i + 1}. ${c.emoji} ${esc(c.title)} <span class="rp-pct">${m.score}%</span></h3>`;
    if (!d) return `<div class="rp-block rp-inside">${head}<p class="muted">Detailed O*NET data isn't available for this India-specific career. Its full roadmap is in section 5.</p></div>`;
    return `<div class="rp-block rp-inside">${head}
      <p class="small muted">Based on: ${esc(d.occupations.join("; "))}</p>
      <h4>A day in this work</h4>${list(d.tasks)}
      <div class="rp-cols">
        <div><h4>Skills you'll use most</h4>${bars(d.skills)}<p class="small muted">Longer bar = more important in this work.</p></div>
        <div><h4>What the work is like</h4>${bars(d.context)}<p class="small muted">Longer bar = more often, or more of it.</p></div>
      </div>
      <h4>Knowledge you'll need, and your gap</h4>
      <div class="rp-gap">${d.knowledge.map(([k, v]) => {
        const [cls, text] = gapFor(k, p);
        return `<div class="rp-gap-row"><span><b>${esc(k)}</b> <span class="small muted">· ${importance(v)}</span></span><span class="gap gap-${cls}">${esc(text)}</span></div>`;
      }).join("")}</div>
      ${d.titles.length ? `<h4>Job titles you'll see</h4><div class="tags">${d.titles.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
    </div>`;
  }
  const section = (id, n, body) => `<section class="card rp-section" id="rp-${id}">
      <span class="rp-num">${n}</span><h2>${esc(SECTIONS[n - 1][1])}</h2>${body}</section>`;

  async function renderReport(app) {
    const model = App().reportModel();
    if (!model) {
      app.innerHTML = `<section class="view narrow"><h1>Your Full Report</h1>
        <div class="card"><p>Your report is built from your quiz answers on this device. Take the quiz first, then come back here.</p>
        <a class="btn primary" href="#/start">Start the quiz →</a></div></section>`;
      return;
    }
    app.innerHTML = `<section class="view narrow"><h1>Your Full Report</h1><p class="muted">Loading…</p></section>`;
    let content = null, gate = null;
    try { content = (await window.DishaApi("/api/report")).content; } catch (e) { gate = e; }
    if (location.hash.split("/")[1] !== "report") return; // navigated away while loading
    if (!content) return renderGate(app, gate);
    app.innerHTML = buildReport(model, content);
    app.querySelector('[data-rp="print"]').addEventListener("click", () => window.print());
  }

  /* ---------- not owned / not signed in: what's inside + how to get it ---------- */
  async function renderGate(app, err) {
    const code = err && err.code;
    let me = null;
    try { me = await window.DishaApi("/api/me"); } catch (e) { /* shown below */ }
    const product = me && me.products.find(p => p.key === "report");
    const features = product ? product.features.map(f => f.text) : [];
    let action;
    if (!me || code === "offline" || code === "no_api" || code === "not_configured") {
      action = `<p>${esc(code === "offline" ? "You seem to be offline. Connect to the internet to open your report." : "The Full Report isn't switched on for this copy of Disha yet.")}</p>`;
    } else if (code === "signed_out") {
      action = `<p>Already bought it? Sign in with the same email to open it.</p>
        <a class="btn primary" href="#/account">Sign in →</a>`;
    } else if (me.plansOnSale) {
      action = `<p class="rp-price">${esc("₹" + product.price.toLocaleString("en-IN"))} <span class="small muted">one-time · yours forever · also included in Disha Plus</span></p>
        <a class="btn primary lg" href="#/account">Get my Full Report →</a>`;
    } else {
      action = `<p>The Full Report is coming soon. <a href="#/contact">Tell us</a> if you'd like to hear when it launches.</p>`;
    }
    app.innerHTML = `<section class="view page rp-gate">
      <span class="eyebrow">📄 Full Report</span>
      <h1>Your complete career report</h1>
      <p class="lead">A detailed, personal report built from your answers, to read, print and discuss with your parents.</p>
      <div class="split">
        <div class="split-main"><div class="card">
          <h2>What's inside</h2>
          <ol class="rp-toc">${SECTIONS.map(([, t]) => `<li>${esc(t)}</li>`).join("")}</ol>
          ${features.length ? `<ul class="acc-features">${features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
        </div></div>
        <aside><div class="card">${action}</div>
          <p class="small muted"><a href="#/results">← Back to your free results</a></p></aside>
      </div>
    </section>`;
  }

  /* ---------- the report ---------- */
  function buildReport({ p, ranked, profile, streamRec }, C) {
    const stage = profile.stage;
    const stageLabel = (META.userStages.find(s => s.k === stage) || {}).label || "";
    const name = profile.name || "Your report";
    const [k0, k1, k2] = p.order;
    const t0 = Q.types[k0], t1 = Q.types[k1];
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const fit = ranked.filter(m => App().streamOk(m.c));
    const lead = (fit[0] || ranked[0]).c;

    // 1. At a glance
    const glance = `<div class="grid-2 rp-glance">
        <div>${App().hexChart(p.r)}
          <ul class="type-list">${p.order.map(k => `<li><span class="dot" style="background:var(--${k})"></span>${esc(Q.types[k].name)}<b>${p.r[k]}%</b></li>`).join("")}</ul></div>
        <div>${App().traitBars(p.b)}</div>
      </div>
      ${p.apt ? `<h3>Aptitude</h3>${App().aptBars(p.apt)}` : ""}`;

    // 2. Interests
    const interests = [k0, k1, k2].map((k, i) => {
      const t = Q.types[k], c = C.types[k];
      return `<div class="rp-block" style="--c:var(--${k})">
        <h3>${i + 1}. ${t.emoji} ${esc(t.name)}: the ${esc(t.noun)} <span class="rp-pct">${p.r[k]}%</span></h3>
        <p>${esc(t.desc)}</p>
        <div class="rp-cols">
          <div><h4>Your strengths</h4>${list(c.strengths)}</div>
          <div><h4>How to grow</h4>${list(c.grow)}</div>
        </div>
        <p><b>Where you'll thrive:</b> ${esc(c.environments)}</p>
        <p class="rp-watch"><b>Watch out:</b> ${esc(c.watchOut)}</p>
      </div>`;
    }).join("");

    // 3. Personality
    const personality = TRAITS.map(k => {
      const tr = Q.traits[k], lvl = App().level(p.b[k]), c = C.traits[k][lvl];
      return `<div class="rp-block">
        <h3>${tr.emoji} ${esc(tr.name)}: <span class="rp-tag">${esc(tr.tags[lvl])}</span></h3>
        <p>${esc(tr.text[lvl])}</p>
        <p><b>📚 How you study best:</b> ${esc(c.study)}</p>
        <p><b>💼 At work:</b> ${esc(c.work)}</p>
      </div>`;
    }).join("");

    // 4. Aptitude
    const areas = Object.keys(APT.areas);
    const aptitude = p.apt
      ? areas.slice().sort((a, b) => p.apt[b] - p.apt[a]).map((k, i) => {
          const a = APT.areas[k], c = C.aptitude[k];
          return `<div class="rp-block">
            <h3>${a.emoji} ${esc(a.name)} <span class="rp-pct">${p.apt[k]}%</span>${i === 0 ? ` <span class="rp-tag">Your strongest</span>` : ""}</h3>
            <p>${esc(c.means)}</p>
            ${i >= areas.length - 2 ? `<h4>How to build it</h4>${list(c.practice)}` : ""}
          </div>`;
        }).join("")
      : `<p>You haven't taken the Aptitude Challenge yet. It takes about 6 minutes, adds this section and fine-tunes your match scores.</p>
         <a class="btn ghost small no-print" href="#/aptitude">Take the Aptitude Challenge →</a>`;

    // 5. Top 10 careers
    const defaults = c => META.streamDefaults[c.streams[0]] || META.streamDefaults.ANY;
    const careers = ranked.slice(0, 10).map((m, i) => {
      const c = m.c;
      const apts = (CAREER_APT[c.id] || []).map(k => APT.areas[k].name).join(" and ");
      return `<div class="rp-career">
        <div class="rp-career-head"><span class="rp-rank">${i + 1}</span><span class="m-emoji" aria-hidden="true">${c.emoji}</span>
          <div><h3>${esc(c.title)}</h3><span class="small muted">${esc(c.cluster)}</span></div><b class="rp-score">${m.score}%</b></div>
        <p>${esc(c.summary)}</p>
        ${list(App().reasonsFor(c, p))}
        <dl class="rp-facts">
          <dt>Starting pay</dt><dd>${esc(c.pay)}</dd>
          <dt>Outlook</dt><dd>${esc(c.outlook)}</dd>
          <dt>Stream</dt><dd>${c.streams.map(s => esc(META.streams[s])).join(", ")}</dd>
          ${apts ? `<dt>Aptitudes</dt><dd>${esc(apts)}</dd>` : ""}
          <dt>Key exams</dt><dd>${c.exams.slice(0, 3).map(e => esc(e[0])).join(", ")}</dd>
          <dt>Where to study</dt><dd>${c.colleges.slice(0, 3).map(esc).join(", ")}</dd>
          <dt>Your next step</dt><dd>${esc(c.path[stage] || defaults(c)[stage] || c.path.c)}</dd>
        </dl>
        ${App().streamWarn(c, true)}
      </div>`;
    }).join("");

    // 6. Inside your top 3 careers (O*NET)
    const inside = `<p>What your top three careers are really like day to day, the skills and knowledge they use, and where you already stand. "Your gap" compares each knowledge area with how you rated your own subjects.</p>
      ${ranked.slice(0, 3).map((m, i) => insideCareer(m, i, p, C.deep)).join("")}
      <p class="small muted">Contains information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under the CC BY 4.0 licence; Disha selected the top items and averaged related occupations. Tasks and job titles describe the work in the United States: the core of each career is similar in India, but titles and settings can differ.</p>`;

    // 7. Stream and subjects
    let stream;
    if (stage === "m" || stage === "s") {
      stream = `<p>Suggested stream for Class 11: <span class="big-rec">${esc(streamRec.rec)}</span></p>
        <p class="muted">${esc(streamRec.why)}</p>
        ${streamRec.keys.map(k => streamNotes(C.streams[k], META.streams[k])).join("")}`;
    } else {
      const mine = profile.stream === "PCMB" ? ["PCM", "PCB"] : [profile.stream];
      stream = `<p>You are in <b>${esc((META.userStreams.find(s => s.k === profile.stream) || {}).label || "")}</b>.
        ${fit.length ? `Your best-fitting careers that use it start with <b>${esc(fit[0].c.title)}</b>.` : ""}</p>
        ${mine.filter(k => C.streams[k]).map(k => streamNotes(C.streams[k], META.streams[k])).join("")}`;
    }
    const combos = ranked.slice(0, 3).filter(m => COMBOS[m.c.id])
      .map(m => `<li><b>${m.c.emoji} ${esc(m.c.title)}:</b> ${esc(COMBOS[m.c.id])}</li>`).join("");
    if (combos) stream += `<h3>Subjects for your top careers</h3><ul class="rp-list">${combos}</ul>`;

    // 8. Exam timeline
    const seen = new Set(), rows = [];
    fit.slice(0, 5).forEach(m => m.c.exams.forEach(e => {
      if (!seen.has(e[0]) && rows.length < 10) { seen.add(e[0]); rows.push({ e, c: m.c }); }
    }));
    const exams = rows.length
      ? `<div class="rp-table" role="table">${rows.map(({ e, c }) => `
          <div class="rp-row" role="row"><div role="cell"><b>${esc(e[0])}</b><br><span class="small muted">${esc(e[1])}</span></div>
          <div role="cell">${esc(e[2])}<br><span class="small muted">For ${esc(c.title)}</span></div></div>`).join("")}</div>
         <p class="small muted">Dates and patterns change every year. Confirm on each exam's official website (start with nta.ac.in).</p>`
      : `<p>None of your top careers fit your current stream directly. Talk to a counsellor about bridge routes.</p>`;

    // 9. Action plan
    const article = /^[aeiou]/i.test(lead.title) ? "an" : "a";
    const fill = s => s.replace(/\ba \{career\}/g, `${article} ${lead.title}`).replace(/\{career\}/g, lead.title)
      .replace(/\{skill\}/g, lead.skills[0]).replace(/\{try\}/g, lead.tryNow[0]);
    const plan = `<p>Built around your top match for your stage, <b>${esc(lead.title)}</b>. Tick each month off as you go.</p>
      <ol class="rp-plan">${(C.plans[stage] || C.plans.c).map((s, i) => `<li><span class="rp-month">Month ${i + 1}</span>${esc(fill(s))}</li>`).join("")}</ol>`;

    // 10. Parents
    const P = C.parents;
    const parents = `${App().parentSummary(p, ranked)}
      <p><b>At this stage:</b> ${esc(P.byStage[stage] || "")}</p>
      <h3>Conversation starters</h3>${list(P.starters)}
      <div class="rp-cols">
        <div><h4>✅ Helpful</h4>${list(P.dos)}</div>
        <div><h4>⚠️ Best avoided</h4>${list(P.donts)}</div>
      </div>`;

    const bodies = {
      glance, interests, aptitude, inside, stream, exams, plan, parents,
      personality: `<div class="rp-pair">${personality}</div>`,
      careers: `<div class="rp-careers">${careers}</div>`
    };
    return `<section class="view rp">
      <a class="back-link no-print" href="#/results">← Back to my results</a>
      <div class="card rp-cover">
        <span class="eyebrow">Disha Full Report · ${esc(stageLabel)} · ${esc(today)}</span>
        <h1>${esc(name)}${profile.name ? ", you're" : ":"} <span class="grad">The ${esc(t1.adj)} ${esc(t0.noun)}</span></h1>
        <div class="code-row">${[k0, k1, k2].map(k => `<span class="code-chip" style="--c:var(--${k})">${Q.types[k].emoji} ${esc(Q.types[k].name)}</span>`).join("")}</div>
        <p class="lead">${esc(t0.desc)} You also have ${esc(t1.short)}.</p>
        <div class="cta-row no-print"><button type="button" class="btn primary" data-rp="print">⬇️ Save as PDF / Print</button></div>
        <h2 class="rp-toc-h">Contents</h2>
        <ol class="rp-toc">${SECTIONS.map(([id, t]) => `<li><a href="#/report" data-jump="rp-${id}">${esc(t)}</a></li>`).join("")}</ol>
      </div>
      ${SECTIONS.map(([id], i) => section(id, i + 1, bodies[id])).join("")}
      <div class="card rp-note">
        <p><b>About this report.</b> It combines Holland's RIASEC interests, the Big Five personality traits${p.apt ? ", your aptitude" : ""}, the subjects you enjoy and what you value. It is a starting point for exploring and talking, not a final verdict. Retake the quiz as you grow.</p>
      </div>
    </section>`;
  }

  function streamNotes(c, label) {
    if (!c) return "";
    return `<div class="rp-block"><h3>${esc(label)}</h3>
      <p><b>Who thrives:</b> ${esc(c.who)}</p>
      <p><b>Subjects:</b> ${esc(c.subjects)}</p>
      <p class="rp-watch">${esc(c.myth)}</p></div>`;
  }

  // Contents links scroll within the page without changing the route.
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-jump]");
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.DISHA_VIEWS = Object.freeze(Object.assign({}, window.DISHA_VIEWS, { report: renderReport }));
})();
