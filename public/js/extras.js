/* Extra, additive data used by the UI. Kept separate so the main career library
   (careers.js) is not rewritten. Everything here is general guidance; subject
   rules differ by board and state, and scholarship terms change every year, so
   the UI tells students to confirm on official sites. */

/* Recommended Class 11–12 subject choices, by career id. */
window.SUBJECT_COMBOS = {
  software: "PCM; take Computer Science / Informatics Practices as the optional subject if your school offers it.",
  ai: "PCM with a strong focus on Maths; Computer Science as the optional subject helps a lot.",
  cyber: "PCM with Computer Science; any stream can work if you learn computing seriously on the side.",
  gamedev: "PCM with Computer Science for the tech route, or any stream with a strong art portfolio for the design route.",
  aerospace: "PCM; keep Physics and Maths as strong as possible.",
  engineer: "PCM; Physics, Chemistry and Maths are the core.",
  technician: "Any stream after Class 10; Science with Maths helps for electrical and electronics trades.",
  doctor: "PCB (Physics, Chemistry, Biology); add Maths as the optional (PCMB) to keep engineering open too.",
  dentist: "PCB (Physics, Chemistry, Biology).",
  nurse: "PCB with English.",
  vet: "PCB (Physics, Chemistry, Biology).",
  psychologist: "Any stream; take Psychology as an elective in Class 11–12 if your school offers it.",
  scientist: "PCM or PCB depending on your field; PCMB keeps the most doors open.",
  environment: "PCB or PCM, with Geography as an elective if possible.",
  agri: "PCB or PCM; some boards offer Agriculture as a subject.",
  ca: "Commerce with Accountancy and Maths is ideal; any stream is allowed.",
  finance: "Commerce with Maths, or PCM; Maths is important.",
  manager: "Any stream; build Maths, Economics and communication.",
  entrepreneur: "Any stream; pick subjects you enjoy and build real skills on the side.",
  marketing: "Any stream; Economics and English help.",
  economist: "Commerce or Humanities with Maths, or PCM; Maths is a big advantage.",
  banking: "Any stream; keep practising Maths and English for aptitude tests.",
  lawyer: "Any stream; strong English, reading and reasoning matter most.",
  ias: "Any stream; Humanities overlaps most with the syllabus, but all streams work.",
  defence: "Any stream for the Army; PCM is needed for the Air Force and Navy technical wings.",
  architect: "PCM with Maths is mandatory; practise freehand drawing.",
  ux: "Any stream; build a sketchbook and learn basic design tools.",
  fashion: "Any stream; build a drawing and design portfolio.",
  animator: "Any stream; a strong art and animation portfolio matters more than the stream.",
  journalist: "Any stream; Humanities with English helps. Write regularly.",
  performer: "Any stream; keep training and take graded music or dance exams.",
  film: "Any stream; make short films or build an acting reel.",
  teacher: "Any stream; choose the subjects you would love to teach.",
  social: "Any stream; Humanities (Sociology, Political Science) helps.",
  sports: "Any stream; balance training with studies (NIOS is an option if needed).",
  pilot: "PCM; Physics and Maths in Class 12 are required.",
  chef: "Any stream with English; cook often and learn food hygiene.",
  marine: "PCB; add Maths (PCMB) if you can, it helps with ocean physics and data.",
  forensic: "PCB or PCM; Chemistry is essential, and Biology helps for DNA work.",
  drone: "Any stream for the pilot route; PCM with Physics for drone engineering.",
  robotics: "PCM with Computer Science; Physics and Maths are the core.",
  climate: "PCM for clean-energy engineering; any stream with Geography or Economics for climate policy.",
  astro: "PCM; Physics and Maths should be your strongest subjects.",
  biotech: "PCB or PCM; PCMB keeps both the engineering and the life-science routes open.",
  foodsci: "PCM or PCB; Chemistry is the core subject.",
  wildlife: "PCB for wildlife science; any stream for nature photography and media.",
  sound: "Any stream; Physics helps with acoustics, and keep training in music.",
  industrial: "Any stream; Physics helps you understand how products work. Keep a sketchbook.",
  archaeologist: "Humanities with History and Geography; any stream is allowed.",
  linguist: "Any stream; take a foreign or classical language as an elective if you can."
};

/* National scholarships worth knowing. Shown on the "How it works" page.
   Always confirm current eligibility, amounts and dates on the official site. */
window.SCHOLARSHIPS = [
  { name: "National Scholarship Portal (NSP)", who: "The single government portal for most central and state scholarships.", site: "https://scholarships.gov.in" },
  { name: "NMMS", who: "National Means-cum-Merit Scholarship for Class 9–12, for students from lower-income families (exam in Class 8).", site: "https://scholarships.gov.in" },
  { name: "INSPIRE Scholarship (SHE)", who: "For top Class 12 science students who go on to study natural sciences (B.Sc/B.S).", site: "https://online-inspire.gov.in" },
  { name: "Central Sector Scheme of Scholarships (CSSS)", who: "For college students who score in the top percentile of their Class 12 board.", site: "https://scholarships.gov.in" },
  { name: "Post-Matric Scholarships (SC/ST/OBC/EWS)", who: "For students from these categories from Class 11 onwards.", site: "https://scholarships.gov.in" },
  { name: "AICTE Pragati & Saksham", who: "For girl students and differently-abled students in technical courses.", site: "https://www.aicte-india.org" },
  { name: "Private & foundation scholarships", who: "Reliance Foundation, Tata, Aditya Birla and others; search and apply via Buddy4Study.", site: "https://www.buddy4study.com" }
];
