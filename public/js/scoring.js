/* Disha scoring: pure functions, no DOM, no state. app.js calls them with the
   student's answers; tests/scoring.test.mjs calls them directly.

   Match score (0–100) for one career combines:
     interests    50%  how the student's 6 Holland (RIASEC) scores line up with the
                       career's profile: its shape (correlation over all 6 types)
                       and the strength of the career's 3 letters
     subjects     25%  how much the student enjoys, and how well they score in, the
                       subjects this career uses (from the "Your subjects" chapter),
                       plus things they love outside class
     personality  15%  how the Big Five traits fit what the work needs
     values       10%  what the student wants from a career
   With the optional aptitude challenge: interests 45, subjects 22, personality 13,
   aptitude 10, values 10. */
window.DishaScoring = (function () {
  "use strict";

  const TYPES = ["R", "I", "A", "S", "E", "C"];
  const TRAITS = ["O", "C", "E", "A", "S"];
  const WEIGHTS = {
    base: { interest: 0.5, subjects: 0.25, personality: 0.15, values: 0.1 },
    withAptitude: { interest: 0.45, subjects: 0.22, personality: 0.13, aptitude: 0.1, values: 0.1 }
  };

  /* ---------- interests ---------- */
  function riasec(Q, A, upto) {
    const raw = {}, max = {};
    TYPES.forEach(t => { raw[t] = 0; max[t] = 0; });
    Q.chapters.slice(0, upto == null ? Q.chapters.length : upto).forEach(ch => {
      if (ch.kind === "tt") ch.items.forEach((pair, i) => {
        pair.forEach(o => { max[o.t] += 2; });
        if (A.tt[i] != null) raw[pair[A.tt[i]].t] += 2;
      });
      if (ch.kind === "rate") ch.items.forEach((it, i) => {
        max[it.t] += 4;
        if (A.rate[i] != null) raw[it.t] += A.rate[i];
      });
      if (ch.kind === "scen") ch.items.forEach((it, i) => {
        it.o.forEach(o => { max[o.t] += 3; });
        if (A.scen[i] != null) raw[it.o[A.scen[i]].t] += 3;
      });
    });
    const pct = {};
    TYPES.forEach(t => { pct[t] = max[t] ? Math.round(raw[t] / max[t] * 100) : 0; });
    return pct;
  }

  function relative(r) {
    const vals = TYPES.map(t => r[t]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const rel = {};
    TYPES.forEach(t => { rel[t] = hi === lo ? 50 : (r[t] - lo) / (hi - lo) * 100; });
    return rel;
  }

  // A career's interest profile across all 6 types: its 3 code letters high,
  // the rest low.
  const CODE_PROFILE = [100, 70, 45], OTHER = 15;
  function careerProfile(code) {
    const v = {};
    TYPES.forEach(t => { v[t] = OTHER; });
    code.split("").forEach((l, i) => { v[l] = CODE_PROFILE[i]; });
    return v;
  }

  function correlation(a, b) {
    const xs = TYPES.map(t => a[t]), ys = TYPES.map(t => b[t]);
    const mx = xs.reduce((s, v) => s + v, 0) / 6, my = ys.reduce((s, v) => s + v, 0) / 6;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < 6; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      dx += (xs[i] - mx) ** 2;
      dy += (ys[i] - my) ** 2;
    }
    return dx && dy ? num / Math.sqrt(dx * dy) : 0;
  }

  const CODE_WEIGHTS = [3, 2, 1];
  function interestFit(code, p) {
    // Shape: does the student's whole profile look like this career's?
    const shape = 50 + 50 * correlation(p.r, careerProfile(code));
    // Strength: how strong are the student's interests in this career's letters?
    const strength = code.split("").reduce((s, l, i) => s + CODE_WEIGHTS[i] * p.r[l], 0) / 6;
    return 0.65 * shape + 0.35 * strength;
  }

  /* ---------- personality ---------- */
  function bigFive(Q, A) {
    const sum = {}, n = {};
    TRAITS.forEach(k => { sum[k] = 0; n[k] = 0; });
    const ch = Q.chapters.find(c => c.kind === "likert");
    ch.items.forEach((it, i) => {
      const a = A.likert[i];
      if (a == null) return;
      sum[it.k] += it.r ? 6 - a : a;
      n[it.k]++;
    });
    const pct = {};
    TRAITS.forEach(k => { pct[k] = n[k] ? Math.round((sum[k] / n[k] - 1) / 4 * 100) : 50; });
    return pct;
  }

  // Most students score near the middle on most traits, so the raw deviation is
  // small; doubling it lets personality actually separate careers.
  function personalityFit(b5Prefs, b) {
    const prefs = Object.entries(b5Prefs);
    const weight = prefs.reduce((s, [, w]) => s + Math.abs(w), 0);
    if (!weight) return 50;
    const dev = prefs.reduce((s, [k, w]) => s + w * (b[k] - 50) / 50, 0) / weight;
    return 50 + 50 * Math.max(-1, Math.min(1, 2 * dev));
  }

  /* ---------- subjects ---------- */
  // Which school subjects to ask about, for the student's class and stream.
  function subjectSet(Q, profile) {
    const sets = Q.subjectSets;
    if (!profile) return sets.s;
    if (profile.stage === "h") return sets[profile.stream] || sets.PCM;
    // College: the subjects of their Class 12 stream, plus any other they may have studied since.
    if (profile.stage === "c" && sets[profile.stream]) {
      const base = sets[profile.stream];
      const extra = sets.c.core.concat(sets.c.optional).filter(k => !base.core.includes(k));
      return { core: base.core, optional: [...new Set(base.optional.concat(extra))] };
    }
    return sets[profile.stage] || sets.s;
  }

  // 0–100 per career-subject key (maths, physics, languages…), from the school
  // subject ratings (enjoyment 60%, usual marks 40%) and outside-class loves.
  const HOBBY_SCORE = 80;
  function subjectEvidence(Q, A) {
    const ev = {};
    const add = (k, v) => { ev[k] = Math.max(ev[k] == null ? 0 : ev[k], v); };
    Object.entries(A.subj || {}).forEach(([sk, r]) => {
      const def = Q.schoolSubjects[sk];
      if (!def || !r || !Number.isInteger(r.like) || !Number.isInteger(r.marks)) return; // half-rated: ignore
      const v = 0.6 * (r.like / 4 * 100) + 0.4 * (r.marks / 3 * 100);
      def.maps.forEach(k => add(k, v));
    });
    ((A.fav && A.fav.subjects) || []).forEach(k => add(k, HOBBY_SCORE));
    return ev;
  }

  // A career's first subjects matter most. Subjects the student hasn't told us
  // about count as slightly below average, so known strengths come first.
  const SUBJECT_WEIGHTS = [1, 0.7, 0.5, 0.4], UNKNOWN = 45;
  function subjectFit(careerSubjects, ev) {
    if (!Object.keys(ev).length) return 50; // nothing known: neutral for everyone
    let s = 0, w = 0;
    careerSubjects.forEach((k, i) => {
      const wi = SUBJECT_WEIGHTS[i] == null ? 0.3 : SUBJECT_WEIGHTS[i];
      s += wi * (ev[k] == null ? UNKNOWN : ev[k]);
      w += wi;
    });
    return w ? s / w : 50;
  }

  /* ---------- values ---------- */
  function valuesFit(mine, theirs) {
    if (!mine.length) return 50;
    const need = Math.min(2, mine.length, theirs.length);
    const hits = theirs.filter(x => mine.includes(x)).length;
    return 30 + 70 * Math.min(1, hits / need);
  }

  /* ---------- aptitude ---------- */
  function aptitude(APT, ans) {
    const right = {}, n = {};
    Object.keys(APT.areas).forEach(k => { right[k] = 0; n[k] = 0; });
    APT.items.forEach((it, i) => {
      n[it.k]++;
      if (ans[i] === it.a) right[it.k]++;
    });
    const pct = {};
    Object.keys(APT.areas).forEach(k => { pct[k] = n[k] ? Math.round(right[k] / n[k] * 100) : 0; });
    return pct;
  }

  /* ---------- putting it together ---------- */
  function profile(Q, A, aptScores) {
    const r = riasec(Q, A), b = bigFive(Q, A);
    return {
      r, b, rel: relative(r),
      order: TYPES.slice().sort((x, y) => r[y] - r[x]),
      fav: A.fav, subj: subjectEvidence(Q, A),
      apt: aptScores || null
    };
  }

  function match(c, p, careerApt) {
    const interest = interestFit(c.code, p);
    const personality = personalityFit(c.b5, p.b);
    const subjects = subjectFit(c.subjects, p.subj);
    const values = valuesFit(p.fav.values, c.values);
    const areas = careerApt && careerApt[c.id];
    const apt = p.apt && areas ? 0.6 * p.apt[areas[0]] + 0.4 * p.apt[areas[1]] : null;
    const w = apt == null ? WEIGHTS.base : WEIGHTS.withAptitude;
    const score = w.interest * interest + w.subjects * subjects + w.personality * personality +
      w.values * values + (apt == null ? 0 : w.aptitude * apt);
    return { score: Math.round(Math.max(1, Math.min(99, score))), interest, personality, subjects, values, aptitude: apt };
  }

  return Object.freeze({ TYPES, TRAITS, WEIGHTS, riasec, relative, bigFive, aptitude, subjectSet, subjectEvidence, profile, match });
})();
