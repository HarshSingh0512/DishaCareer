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

/* Routes for a student whose Class 11–12 stream doesn't match the career's usual
   stream (careers.js `streams` without "ANY"). Shown on the career page and in the
   Full Report. NIOS lets students add Class 12 subjects later; eligibility rules
   (NMC, DGCA, COA, INC) change, so the UI tells students to confirm them. */
window.BRIDGE_ROUTES = {
  software: "BCA or B.Sc Computer Science (many colleges take any stream; some need Maths in Class 12), then MCA. Many tech companies also hire on skills, so build a portfolio of real projects.",
  ai: "Data analytics is open through BA/B.Sc Economics or Statistics, BBA or B.Com, plus Python, SQL and statistics. Maths in Class 12 helps a lot; you can add it through NIOS.",
  aerospace: "Add Physics and Maths through NIOS to become eligible for JEE. Related careers open to every stream: aviation management, airline operations and drone piloting.",
  engineer: "A 3-year polytechnic diploma (admission after Class 10) leads to lateral entry into the second year of B.Tech. Or add Physics and Maths through NIOS and take JEE.",
  robotics: "A polytechnic diploma in electronics or mechatronics leads to lateral entry into B.Tech, or add Physics and Maths through NIOS and take JEE. Hobby robotics with Arduino builds real skills meanwhile.",
  doctor: "You can add Physics, Chemistry and Biology through NIOS to become eligible for NEET-UG; confirm the current NMC rules first. Related careers: public health, hospital administration and health psychology.",
  dentist: "You can add Physics, Chemistry and Biology through NIOS to become eligible for NEET-UG; confirm the current NMC and DCI rules first. Related careers: healthcare management and medical writing.",
  nurse: "B.Sc Nursing needs PCB, but the GNM nursing diploma has accepted other streams in many states; check the current Indian Nursing Council and state rules. Related careers: hospital administration, counselling and public health.",
  vet: "You can add the science subjects through NIOS to become eligible for NEET-UG; confirm the current rules first. Open to every stream: animal welfare, wildlife conservation, pet training and dairy or poultry business.",
  scientist: "Lab science needs a science degree; you can add the subjects through NIOS. Research careers that welcome every stream: economics, psychology, linguistics, archaeology and social research.",
  environment: "Environmental studies and climate policy (a BA, then an MA in environment or sustainability) are open to every stream, and sustainability and conservation jobs need these skills too.",
  agri: "B.Sc Agriculture needs science, but agribusiness management (a PGDM or MBA after any degree) and rural development roles are open to every stream.",
  finance: "CA is open to every stream, and any graduate can take the CFA or an MBA in Finance (via CAT). BA Economics with Maths is a strong base; add Maths through NIOS if you didn't take it.",
  economist: "Most Economics honours courses need Maths in Class 12, so take Maths as your optional or add it through NIOS. Otherwise do a BA with Economics and build statistics skills on the side.",
  architect: "B.Arch needs Physics and Maths in Class 12 (a Council of Architecture rule); you can add them through NIOS. Interior design, B.Des and landscape design are open to every stream.",
  pilot: "DGCA has accepted Physics and Maths cleared through NIOS for commercial pilot training; check its current rules. Cabin crew and airport operations are open to every stream.",
  marine: "Marine biology needs a science degree. Open to every stream: marine conservation and policy, ocean and nature journalism, and scuba-diving instruction.",
  forensic: "Forensic science needs science, but criminology and forensic psychology (BA/MA) are open to Arts students, and cyber forensics is open to anyone who learns computing seriously.",
  astro: "Astronomy research needs Physics and Maths; you can add them through NIOS. Science communication, planetarium education and astrophotography are open to every stream.",
  biotech: "Biotech degrees need science. Related routes open to every stream: patent and IP law (after an LLB), healthcare or bio-business management (MBA) and science writing.",
  foodsci: "Food technology needs science. Open to every stream: hotel management and culinary arts (through NCHM JEE), food entrepreneurship and food writing."
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
