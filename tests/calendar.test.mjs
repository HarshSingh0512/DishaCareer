// Unit tests for the Disha Plus calendar (no server needed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENTS, isRelevant, buildFeed, indiaNow } from "../server/plus-calendar.js";

const ev = id => EVENTS.find(e => e.id === id);

test("calendar data is well-formed", () => {
  const ids = new Set();
  for (const e of EVENTS) {
    assert.ok(!ids.has(e.id), "duplicate id " + e.id); ids.add(e.id);
    assert.ok(["exam", "olympiad", "scholarship", "school"].includes(e.kind), e.id);
    assert.ok(e.stages.length && e.stages.every(s => ["m", "s", "h", "c"].includes(s)), e.id);
    for (const ph of e.phases) assert.ok(ph.m.length && ph.m.every(m => Number.isInteger(m) && m >= 1 && m <= 12) && ph.label, e.id);
    if (e.site) assert.match(e.site, /^https:\/\//, e.id);
  }
});

test("exam events follow the student's careers, with whole-word matching", () => {
  const college = exams => ({ stage: "c", stream: null, exams });
  assert.equal(isRelevant(ev("cat"), college(["CAT / XAT"])), true);
  assert.equal(isRelevant(ev("cat"), college(["NDA / AFCAT"])), false); // AFCAT is not CAT
  assert.equal(isRelevant(ev("gate"), college(["CSIR-NET / GATE"])), true);

  const h = { stage: "h", stream: "PCM", exams: ["JEE Main + Advanced", "BITSAT"] };
  assert.equal(isRelevant(ev("jee-main"), h), true);
  assert.equal(isRelevant(ev("jee-adv"), h), true);
  assert.equal(isRelevant(ev("neet"), h), false);
  assert.equal(isRelevant(ev("boards"), h), true);          // no match list: everyone in the stage
  assert.equal(isRelevant(ev("jee-main"), { ...h, stage: "s" }), false); // wrong stage
});

test("feed covers the next months and wraps into the new year", () => {
  const profile = { stage: "h", stream: "PCM", exams: ["JEE Main"] };
  const feed = buildFeed(profile, { month: 11, year: 2026 }, 6);
  assert.deepEqual(feed.map(m => m.name), ["November 2026", "December 2026", "January 2027", "February 2027", "March 2027", "April 2027"]);
  const jan = feed[2].items.map(i => i.id);
  assert.ok(jan.includes("jee-main"));
  assert.ok(feed[0].items.some(i => i.id === "jee-main" && /registration/i.test(i.what)));
});

test("India time is used for the current month", () => {
  // 31 Dec 2026, 20:00 UTC is already 1 Jan 2027 in India.
  assert.deepEqual(indiaNow(Date.UTC(2026, 11, 31, 20, 0)), { month: 1, year: 2027, day: 1 });
});
