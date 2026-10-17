/* Disha Plus calendar: the Indian student year, month by month.
   Months are TYPICAL windows from recent years; exact dates change every year and
   the app always tells students to confirm on the official site.
   stages  m Class 6–8, s Class 9–10, h Class 11–12, c college
   match   shown only if one of the student's top careers lists an exam whose
           name contains one of these strings (no match = shown to everyone in
           those stages)
   phases  what usually happens in which months (1 = January) */
export const EVENTS = [
  /* ---------- school milestones ---------- */
  { id: "boards", kind: "school", title: "Board exams (Class 10 and 12)", stages: ["s", "h"],
    phases: [{ m: [12, 1], label: "Pre-boards and practicals in most schools" }, { m: [2, 3], label: "Board exams are usually held" }, { m: [5], label: "Results are usually announced" }],
    note: "Dates differ by board (CBSE, CISCE and state boards)." },
  { id: "stream", kind: "school", title: "Choosing your Class 11 stream", stages: ["s"],
    phases: [{ m: [11, 12, 1], label: "Discuss stream options with your parents and teachers" }, { m: [4, 5], label: "Class 11 admissions and subject choices" }],
    note: "Your Disha Full Report has a stream recommendation to start the conversation." },
  { id: "summer", kind: "school", title: "Summer break: test a career for real", stages: ["m", "s", "h"],
    phases: [{ m: [5, 6], label: "Try a short course, workshop, internship or project linked to your top career" }],
    note: "One real experience teaches more than ten videos." },
  { id: "internships", kind: "school", title: "Summer internship applications", stages: ["c"],
    phases: [{ m: [12, 1, 2, 3], label: "Most summer internships are filled in these months" }],
    note: "Apply widely; a referral from a senior helps a lot." },

  /* ---------- Olympiads and competitions ---------- */
  { id: "ioqm", kind: "olympiad", title: "Maths Olympiad (IOQM)", stages: ["m", "s", "h"],
    phases: [{ m: [7, 8], label: "Registration usually open" }, { m: [9], label: "IOQM exam" }],
    note: "Open to Classes 8–12. The first step to the International Maths Olympiad.", site: "https://olympiads.hbcse.tifr.res.in" },
  { id: "nse", kind: "olympiad", title: "Science Olympiads (NSEJS, NSEP, NSEC, NSEB, NSEA)", stages: ["s", "h"],
    phases: [{ m: [8, 9], label: "Registration through your school or a centre" }, { m: [11], label: "Exams are usually held" }],
    note: "NSEJS is for Class 10 and below; the others are for Class 12 and below.", site: "https://www.iapt.org.in" },
  { id: "school-olympiads", kind: "olympiad", title: "School Olympiads (science, maths, English, cyber)", stages: ["m", "s"],
    phases: [{ m: [7, 8, 9], label: "Schools usually collect registrations" }, { m: [10, 11, 12, 1], label: "Exams are held in school" }],
    note: "Ask your class teacher which Olympiads your school runs." },

  /* ---------- scholarships ---------- */
  { id: "nmms", kind: "scholarship", title: "NMMS scholarship exam (Class 8)", stages: ["m"],
    phases: [{ m: [8, 9, 10], label: "Applications usually open (through your state)" }, { m: [11, 12], label: "Exam is usually held" }],
    note: "For Class 8 students from lower-income families; pays through Classes 9–12.", site: "https://scholarships.gov.in" },
  { id: "nsp", kind: "scholarship", title: "National Scholarship Portal", stages: ["h", "c"],
    phases: [{ m: [7, 8, 9, 10], label: "Most central and state scholarships accept applications" }],
    note: "Includes post-matric and the Central Sector Scheme for top Class 12 scorers.", site: "https://scholarships.gov.in" },

  /* ---------- entrance exams after Class 12 ---------- */
  { id: "jee-main", kind: "exam", title: "JEE Main", stages: ["h"], match: ["JEE Main", "JEE / UCEED"],
    phases: [{ m: [10, 11], label: "Session 1 registration usually open" }, { m: [1], label: "Session 1 exam" }, { m: [2, 3], label: "Session 2 registration" }, { m: [4], label: "Session 2 exam" }],
    site: "https://jeemain.nta.ac.in" },
  { id: "jee-adv", kind: "exam", title: "JEE Advanced", stages: ["h"], match: ["JEE Advanced", "JEE Main + Advanced"],
    phases: [{ m: [4, 5], label: "Registration for candidates who qualify in JEE Main" }, { m: [5, 6], label: "Exam is usually held" }],
    site: "https://jeeadv.ac.in" },
  { id: "neet", kind: "exam", title: "NEET-UG", stages: ["h"], match: ["NEET-UG"],
    phases: [{ m: [2, 3], label: "Registration usually open" }, { m: [5], label: "Exam is usually held" }],
    site: "https://neet.nta.nic.in" },
  { id: "cuet", kind: "exam", title: "CUET-UG", stages: ["h"], match: ["CUET-UG"],
    phases: [{ m: [2, 3], label: "Registration usually open" }, { m: [5, 6], label: "Exam window" }],
    site: "https://cuet.nta.nic.in" },
  { id: "clat", kind: "exam", title: "CLAT and AILET (law)", stages: ["h"], match: ["CLAT", "AILET", "MH CET Law"],
    phases: [{ m: [7, 8, 9, 10], label: "Registration usually open" }, { m: [12], label: "Exams are usually held" }],
    site: "https://consortiumofnlus.ac.in" },
  { id: "uceed", kind: "exam", title: "UCEED (design at IITs)", stages: ["h"], match: ["UCEED"],
    phases: [{ m: [10, 11], label: "Registration usually open" }, { m: [1], label: "Exam is usually held" }],
    site: "https://www.uceed.iitb.ac.in" },
  { id: "nid", kind: "exam", title: "NID DAT (design)", stages: ["h"], match: ["NID DAT"],
    phases: [{ m: [9, 10, 11], label: "Registration usually open" }, { m: [12, 1], label: "Prelims exam" }, { m: [4, 5], label: "Mains (studio test and interview)" }],
    site: "https://admissions.nid.edu" },
  { id: "nift", kind: "exam", title: "NIFT entrance (fashion and design)", stages: ["h"], match: ["NIFT"],
    phases: [{ m: [11, 12, 1], label: "Registration usually open" }, { m: [2], label: "Exam is usually held" }],
    site: "https://www.nift.ac.in" },
  { id: "nata", kind: "exam", title: "NATA (architecture)", stages: ["h"], match: ["NATA", "JEE Main Paper 2A"],
    phases: [{ m: [2, 3], label: "Registration usually opens" }, { m: [4, 5, 6], label: "Test attempts through these months" }],
    site: "https://www.nata.in" },
  { id: "nda", kind: "exam", title: "NDA (defence)", stages: ["h"], match: ["NDA"],
    phases: [{ m: [12, 1], label: "NDA (I) notification and applications" }, { m: [4], label: "NDA (I) exam" }, { m: [5, 6], label: "NDA (II) notification and applications" }, { m: [9], label: "NDA (II) exam" }],
    site: "https://upsc.gov.in" },
  { id: "iiser", kind: "exam", title: "IISER Aptitude Test", stages: ["h"], match: ["IISER"],
    phases: [{ m: [4, 5], label: "Registration usually open" }, { m: [6], label: "Exam is usually held" }],
    site: "https://iiseradmission.in" },
  { id: "nest", kind: "exam", title: "NEST (NISER and CEBS)", stages: ["h"], match: ["NEST"],
    phases: [{ m: [1, 2, 3, 4], label: "Registration usually open" }, { m: [6], label: "Exam is usually held" }] },
  { id: "bitsat", kind: "exam", title: "BITSAT", stages: ["h"], match: ["BITSAT"],
    phases: [{ m: [1, 2, 3, 4], label: "Registration usually open" }, { m: [5, 6], label: "Exam sessions" }],
    site: "https://www.bitsadmission.com" },
  { id: "isi", kind: "exam", title: "ISI and CMI entrance (maths and statistics)", stages: ["h"], match: ["ISI Admission", "CMI Entrance"],
    phases: [{ m: [2, 3, 4], label: "Applications usually open" }, { m: [5], label: "Exams are usually held" }] },
  { id: "ipmat", kind: "exam", title: "IPMAT (5-year management)", stages: ["h"], match: ["IPMAT"],
    phases: [{ m: [2, 3, 4], label: "Registration usually open" }, { m: [5], label: "Exam is usually held" }] },
  { id: "nchm", kind: "exam", title: "NCHM JEE (hotel management)", stages: ["h"], match: ["NCHM"],
    phases: [{ m: [2, 3], label: "Registration usually open" }, { m: [4], label: "Exam is usually held" }] },
  { id: "ca", kind: "exam", title: "CA Foundation", stages: ["h", "c"], match: ["CA Foundation"],
    phases: [{ m: [1, 5, 9], label: "Exam sessions (register about two months before)" }],
    site: "https://www.icai.org" },
  { id: "state-cet", kind: "exam", title: "State engineering and other CETs", stages: ["h"], match: ["State CETs", "State agriculture", "State nursing"],
    phases: [{ m: [1, 2, 3], label: "Registration in many states" }, { m: [4, 5], label: "Exams in many states" }],
    note: "Every state runs its own; check your state's CET website." },

  /* ---------- after college ---------- */
  { id: "gate", kind: "exam", title: "GATE", stages: ["c"], match: ["GATE"],
    phases: [{ m: [8, 9, 10], label: "Registration usually open" }, { m: [2], label: "Exam is usually held" }] },
  { id: "cat", kind: "exam", title: "CAT and XAT (MBA)", stages: ["c"], match: ["CAT", "XAT", "GMAT"],
    phases: [{ m: [8, 9], label: "CAT registration usually open" }, { m: [11], label: "CAT exam" }, { m: [1], label: "XAT exam" }],
    site: "https://iimcat.ac.in" },
  { id: "cuet-pg", kind: "exam", title: "CUET-PG (master's admissions)", stages: ["c"], match: ["CUET-PG"],
    phases: [{ m: [12, 1], label: "Registration usually open" }, { m: [3], label: "Exam window" }] },
  { id: "upsc", kind: "exam", title: "UPSC Civil Services", stages: ["c"], match: ["UPSC CSE", "UPSC Civil Services", "UPSC IFoS", "UPSC Indian Forest", "State PSC"],
    phases: [{ m: [1, 2], label: "Notification and applications" }, { m: [5, 6], label: "Prelims exam" }],
    site: "https://upsc.gov.in" }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Whole-word match, so "CAT" matches "CAT / XAT" but not "AFCAT".
const wordMatch = (name, key) =>
  new RegExp(`(^|[^A-Za-z])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z]|$)`).test(name);

export function isRelevant(event, profile) {
  if (!event.stages.includes(profile.stage)) return false;
  if (!event.match) return true;
  return profile.exams.some(name => event.match.some(k => wordMatch(name, k)));
}

// Current month (1–12) and year in India (IST, UTC+5:30).
export function indiaNow(t = Date.now()) {
  const d = new Date(t + 5.5 * 60 * 60 * 1000);
  return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear(), day: d.getUTCDate() };
}

// The next `count` months, each with the relevant events happening in it.
export function buildFeed(profile, { month, year }, count = 6) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const m = ((month - 1 + i) % 12) + 1;
    const y = year + Math.floor((month - 1 + i) / 12);
    const items = [];
    for (const ev of EVENTS) {
      if (!isRelevant(ev, profile)) continue;
      for (const ph of ev.phases) {
        if (ph.m.includes(m)) items.push({ id: ev.id, kind: ev.kind, title: ev.title, what: ph.label, note: ev.note || "", site: ev.site || "" });
      }
    }
    out.push({ month: m, year: y, name: `${MONTHS[m - 1]} ${y}`, items });
  }
  return out;
}
