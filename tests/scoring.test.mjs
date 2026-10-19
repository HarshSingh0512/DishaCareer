// Unit tests for public/js/scoring.js and the subject data (no server needed).
// Note: objects created inside the vm context have their own prototypes, so
// compare contents ([...arr], Object.keys) rather than with deepStrictEqual.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["questions", "careers", "aptitude", "scoring"]) {
  vm.runInContext(fs.readFileSync(new URL(`../public/js/${f}.js`, import.meta.url), "utf8"), ctx);
}
const { QUIZ: Q, CAREERS, CAREER_META: META, CAREER_APTITUDES: CA, DishaScoring: S } = ctx.window;

const r = (n, f) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i, f(i)]));
const rate = (like, marks) => ({ like, marks });
const STUDENTS = {
  pcm: { tt: r(12, i => [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0][i]), rate: r(18, i => [4, 4, 1, 1, 2, 2][i % 6]), likert: r(20, i => [3, 3, 4, 2, 4][i % 5]), scen: r(6, i => [0, 1, 0, 1, 2, 2][i]),
    subj: { physics: rate(4, 3), maths: rate(4, 3), chemistry: rate(2, 2), english: rate(2, 2), computers: rate(3, 2) }, fav: { subjects: ["computers"], values: ["discovery", "money"] } },
  pcb: { tt: r(12, i => [1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1][i]), rate: r(18, i => [2, 4, 1, 4, 1, 2][i % 6]), likert: r(20, i => [3, 5, 4, 2, 3][i % 5]), scen: r(6, i => [2, 0, 1, 3, 2, 1][i]),
    subj: { biology: rate(4, 3), chemistry: rate(3, 2), physics: rate(1, 1), english: rate(3, 2) }, fav: { subjects: ["cooking"], values: ["helping", "security"] } },
  commerce: { tt: r(12, i => [0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0][i]), rate: r(18, i => [1, 2, 1, 2, 4, 4][i % 6]), likert: r(20, i => [4, 3, 5, 3, 3][i % 5]), scen: r(6, i => [2, 3, 3, 1, 0, 2][i]),
    subj: { accounts: rate(4, 3), economics: rate(4, 2), business: rate(3, 2), english: rate(2, 2), maths: rate(3, 2) }, fav: { subjects: [], values: ["money", "security"] } },
  humanities: { tt: r(12, i => [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1][i]), rate: r(18, i => [1, 2, 4, 4, 2, 1][i % 6]), likert: r(20, i => [4, 5, 3, 3, 5][i % 5]), scen: r(6, i => [1, 0, 2, 3, 3, 3][i]),
    subj: { english: rate(4, 3), psychology: rate(4, 3), history: rate(3, 2), civics: rate(3, 2), geography: rate(1, 1), economics: rate(1, 1) }, fav: { subjects: ["art", "languages"], values: ["helping", "creativity"] } }
};
const ranked = A => {
  const p = S.profile(Q, A, null);
  return CAREERS.map(c => ({ id: c.id, ...S.match(c, p, CA) })).sort((a, b) => b.score - a.score);
};
const topIds = (A, n) => ranked(A).slice(0, n).map(x => x.id);
const scoreOf = (A, id) => ranked(A).find(x => x.id === id).score;

test("subject data is consistent", () => {
  const careerKeys = new Set(META.subjects.map(s => s.k));
  for (const [k, s] of Object.entries(Q.schoolSubjects)) {
    assert.ok(s.label && s.emoji && s.maps.length, k);
    for (const m of s.maps) assert.ok(careerKeys.has(m), `${k} maps to unknown ${m}`);
  }
  for (const stream of META.userStreams.map(s => s.k)) assert.ok(Q.subjectSets[stream], `no subject set for ${stream}`);
  for (const [name, set] of Object.entries(Q.subjectSets)) {
    for (const k of [...set.core, ...set.optional]) assert.ok(Q.schoolSubjects[k], `${name}: unknown subject ${k}`);
    assert.equal(new Set([...set.core, ...set.optional]).size, set.core.length + set.optional.length, `${name} has duplicates`);
  }
  for (const h of Q.hobbies) assert.ok(careerKeys.has(h.k), h.k);
  assert.ok(Q.chapters.some(c => c.kind === "subj"));
});

test("subject sets follow class and stream", () => {
  assert.deepEqual([...S.subjectSet(Q, { stage: "h", stream: "PCB" }).core], ["physics", "chemistry", "biology", "english"]);
  assert.ok(S.subjectSet(Q, { stage: "h", stream: "COM" }).core.includes("accounts"));
  assert.ok(S.subjectSet(Q, { stage: "m", stream: null }).core.includes("science"));
  assert.ok(S.subjectSet(Q, { stage: "s", stream: null }).core.includes("physics"));
});

test("sample students get sensible top careers", () => {
  const pcm = topIds(STUDENTS.pcm, 5);
  assert.ok(pcm.filter(id => ["engineer", "software", "robotics", "aerospace", "ai"].includes(id)).length >= 3, pcm.join());
  assert.deepEqual(topIds(STUDENTS.pcb, 3).filter(id => ["doctor", "nurse"].includes(id)).length, 2, topIds(STUDENTS.pcb, 3).join());
  assert.equal(topIds(STUDENTS.commerce, 1)[0], "ca");
  assert.ok(topIds(STUDENTS.commerce, 3).includes("finance"));
  assert.ok(topIds(STUDENTS.humanities, 3).some(id => ["teacher", "psychologist"].includes(id)));
});

test("a subject you find hard pulls careers that need it down", () => {
  const strong = STUDENTS.pcm;
  const weak = { ...strong, subj: { ...strong.subj, physics: rate(0, 0) } };
  assert.ok(scoreOf(strong, "engineer") - scoreOf(weak, "engineer") >= 5);
  // The PCB student is weak in physics: medicine should clearly beat core engineering.
  assert.ok(scoreOf(STUDENTS.pcb, "doctor") - scoreOf(STUDENTS.pcb, "engineer") >= 15);
});

test("enjoyment counts more than marks", () => {
  const ev = A => S.subjectEvidence(Q, A).physics;
  const lovesButAverage = ev({ subj: { physics: rate(4, 1) }, fav: { subjects: [] } });
  const scoresButBored = ev({ subj: { physics: rate(1, 3) }, fav: { subjects: [] } });
  assert.ok(lovesButAverage > scoresButBored);
});

test("personality now makes a real difference", () => {
  const calm = { ...STUDENTS.pcm, likert: r(20, () => 3) };
  const driven = { ...STUDENTS.pcm, likert: r(20, i => [4, 4, 5, 1, 5][i % 5]) };
  const diffs = CAREERS.map(c => Math.abs(scoreOf(calm, c.id) - scoreOf(driven, c.id)));
  assert.ok(Math.max(...diffs) >= 3, `largest change ${Math.max(...diffs)}`);
});

test("half-rated subjects are ignored, and old saved results still work", () => {
  assert.equal(Object.keys(S.subjectEvidence(Q, { subj: { maths: { like: 4, marks: null } }, fav: { subjects: [] } })).length, 0);
  // Saves from before the subjects chapter: only Favourites chips.
  const old = { ...STUDENTS.pcm, subj: undefined, fav: { subjects: ["maths", "physics"], values: ["money"] } };
  const ev = S.subjectEvidence(Q, old);
  assert.equal(ev.maths, 80);
  assert.ok(topIds(old, 5).length === 5);
  // Nothing at all known about subjects: neutral for every career.
  const none = { ...STUDENTS.pcm, subj: {}, fav: { subjects: [], values: [] } };
  const p = S.profile(Q, none, null);
  assert.ok(CAREERS.every(c => S.match(c, p, CA).subjects === 50));
});
