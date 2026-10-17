/* Disha career library.
   code     Holland RIASEC code, strongest letter first
   b5       Big Five traits that help in this work, weight -1..1
            (O imagination, C discipline, E social energy, A kindness, S calmness)
   streams  Class 11–12 streams that lead here (PCM, PCB, COM, HUM, ANY)
   path     roadmap by stage: m Class 6–8, s Class 9–10, h Class 11–12,
            a entrance exams, c college, j career launch.
            m and s fall back to streamDefaults for the first stream.
   exams    [name, who / when, why it matters]
   offbeat  true for lesser-known careers, shown on the home compass and the
            "Offbeat" filter, and used for the results "Wildcard" pick.
   Exam patterns, dates, pay and rankings change every year: verify on official sites. */

window.CAREER_META = {
  streams: {
    PCM: "Science (PCM)", PCB: "Science (PCB)", COM: "Commerce",
    HUM: "Arts / Humanities", ANY: "Any stream"
  },
  userStages: [
    { k: "m", label: "Class 6–8", emoji: "🎒", hint: "Exploring what I like" },
    { k: "s", label: "Class 9–10", emoji: "📚", hint: "Choosing my stream" },
    { k: "h", label: "Class 11–12", emoji: "🧪", hint: "Picking a course & exams" },
    { k: "c", label: "College", emoji: "🎓", hint: "Planning my next move" }
  ],
  userStreams: [
    { k: "PCM", label: "Science (PCM)" },
    { k: "PCB", label: "Science (PCB)" },
    { k: "PCMB", label: "Science (PCMB)" },
    { k: "COM", label: "Commerce" },
    { k: "HUM", label: "Arts / Humanities" }
  ],
  stages: [
    { k: "m", label: "Class 6–8", emoji: "🎒" },
    { k: "s", label: "Class 9–10", emoji: "📚" },
    { k: "h", label: "Class 11–12", emoji: "🧪" },
    { k: "a", label: "Entrance exams", emoji: "📝" },
    { k: "c", label: "College / Degree", emoji: "🎓" },
    { k: "j", label: "Career launch", emoji: "🚀" }
  ],
  streamDefaults: {
    PCM: {
      m: "Build strong Maths and Science basics. Try coding, robotics or a science club. Curiosity matters more than marks right now.",
      s: "Keep Maths and Science strong, because they decide your Class 11 stream. Olympiads like NSEJS are great practice. Choose PCM in Class 11."
    },
    PCB: {
      m: "Stay curious about living things: plants, animals and the human body. Read, watch documentaries and keep asking 'why?'.",
      s: "Focus on Science, especially Biology. Choose PCB (or PCMB) in Class 11."
    },
    COM: {
      m: "Get comfortable with numbers and money. Track your pocket money or run a mock shop.",
      s: "Strong Maths helps a lot. Commerce with Maths in Class 11 suits this path best."
    },
    HUM: {
      m: "Read widely, write, debate and ask questions about society.",
      s: "Keep your marks steady and your reading habit strong. Humanities in Class 11 suits this path well."
    },
    ANY: {
      m: "Explore hobbies, clubs and competitions. Every interest you try teaches you something about yourself.",
      s: "Any stream works for this path. Choose subjects you genuinely enjoy and keep building skills outside class."
    }
  },
  subjects: [
    { k: "maths", label: "Maths", emoji: "➗" },
    { k: "physics", label: "Physics", emoji: "⚛️" },
    { k: "chemistry", label: "Chemistry", emoji: "⚗️" },
    { k: "biology", label: "Biology", emoji: "🧬" },
    { k: "computers", label: "Computers", emoji: "💻" },
    { k: "languages", label: "English & languages", emoji: "📖" },
    { k: "history", label: "History", emoji: "🏺" },
    { k: "geography", label: "Geography", emoji: "🌍" },
    { k: "civics", label: "Civics / Political science", emoji: "🏛️" },
    { k: "economics", label: "Economics", emoji: "📈" },
    { k: "accounts", label: "Accounts & business", emoji: "🧮" },
    { k: "psychology", label: "Psychology / Sociology", emoji: "🧠" },
    { k: "art", label: "Art & craft", emoji: "🎨" },
    { k: "music", label: "Music & dance", emoji: "🎵" },
    { k: "sports", label: "Sports & PE", emoji: "⚽" },
    { k: "cooking", label: "Cooking / Home science", emoji: "🍳" }
  ],
  values: [
    { k: "money", label: "Good money", emoji: "💰" },
    { k: "helping", label: "Helping people", emoji: "❤️" },
    { k: "creativity", label: "Creativity", emoji: "🎨" },
    { k: "security", label: "Job security", emoji: "🛡️" },
    { k: "prestige", label: "Respect & status", emoji: "🏅" },
    { k: "adventure", label: "Adventure & travel", emoji: "✈️" },
    { k: "independence", label: "Being my own boss", emoji: "🚀" },
    { k: "discovery", label: "Discovering new things", emoji: "🔬" },
    { k: "fame", label: "Being known / fame", emoji: "⭐" }
  ]
};

window.CAREERS = [
  /* ---------------- Technology ---------------- */
  {
    id: "software", title: "Software Engineer", emoji: "💻", cluster: "Technology",
    code: "IRC", b5: { O: 0.5, C: 1 },
    subjects: ["maths", "computers", "physics"], values: ["money", "discovery", "independence"],
    streams: ["PCM"],
    summary: "Designs and builds the apps, websites and systems millions of people use every day.",
    day: "Break a feature into small tasks, write and test code, review a teammate's work and fix a bug a user reported.",
    pay: "≈ ₹4–12 LPA to start; top product companies pay much more",
    outlook: "High demand. AI tools are changing how code gets written, so strong fundamentals and constant learning matter.",
    skills: ["Programming (Python, C++ or Java)", "Data structures & algorithms", "Problem solving", "Git & teamwork"],
    tryNow: ["Make a small game in Scratch or Python", "Solve 5 beginner problems on a coding practice site", "Build a one-page website about your hobby"],
    path: {
      h: "Take PCM (Computer Science as an extra subject helps). Prepare for JEE Main or your state CET alongside board exams.",
      a: "Write JEE Main (and JEE Advanced for IITs), BITSAT or your state CET. BCA through CUET-UG is another route.",
      c: "B.Tech/BE in CSE or IT (4 yrs), or BCA + MCA. Build projects, contribute to open source and do 1–2 internships.",
      j: "Start as a Software Developer / SDE, then grow into senior engineer, architect or engineering manager."
    },
    exams: [
      ["JEE Main", "NTA · January & April", "Admission to NITs, IIITs and many colleges; also qualifies you for JEE Advanced"],
      ["JEE Advanced", "IITs · after JEE Main", "The route into IIT B.Tech programmes"],
      ["BITSAT", "BITS · online test", "For BITS Pilani, Goa and Hyderabad campuses"],
      ["State CETs", "MHT CET, KCET, WBJEE, EAPCET…", "Admission to engineering colleges in your state"]
    ],
    colleges: ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIIT Hyderabad", "BITS Pilani", "NIT Tiruchirappalli"]
  },
  {
    id: "ai", title: "Data Scientist / AI Engineer", emoji: "🤖", cluster: "Technology",
    code: "ICR", b5: { O: 1, C: 0.5 },
    subjects: ["maths", "computers"], values: ["discovery", "money", "independence"],
    streams: ["PCM", "COM"],
    summary: "Teaches computers to find patterns in data, from predicting crop prices to powering chatbots.",
    day: "Clean a messy dataset, train and test a model, then explain the results to your team with clear charts.",
    pay: "≈ ₹6–15 LPA to start; AI specialists earn much more",
    outlook: "One of the fastest-growing fields worldwide. Strong maths and statistics set you apart.",
    skills: ["Statistics & probability", "Python & SQL", "Machine learning", "Explaining insights clearly"],
    tryNow: ["Chart your class's test marks in a spreadsheet", "Train an image classifier with Google's Teachable Machine", "Try a free intro course like Elements of AI"],
    path: {
      h: "PCM is the most common route; Commerce with Maths also works for data analytics. Keep Maths very strong.",
      a: "JEE Main/Advanced for B.Tech (CSE, AI, Data Science), ISI or CMI entrance for maths and statistics, or CUET-UG for B.Sc programmes.",
      c: "B.Tech in CSE/AI, B.Stat or B.Sc Maths/Statistics. Do data projects and research internships; consider an M.Tech/M.S. later.",
      j: "Start as Data Analyst, Data Scientist or ML Engineer; grow into AI research or product leadership."
    },
    exams: [
      ["JEE Main + Advanced", "NTA / IITs", "B.Tech in CSE, AI and Data Science at IITs, NITs and IIITs"],
      ["ISI Admission Test", "Indian Statistical Institute", "B.Stat and B.Math, a top choice for statistics lovers"],
      ["CMI Entrance", "Chennai Mathematical Institute", "B.Sc in Mathematics & Computer Science"],
      ["CUET-UG", "NTA · May–June", "B.Sc Statistics, Maths and CS at central universities"]
    ],
    colleges: ["IIT Madras", "IIT Bombay", "IISc Bengaluru", "ISI Kolkata", "Chennai Mathematical Institute", "IIIT Hyderabad"]
  },
  {
    id: "cyber", title: "Cybersecurity Specialist", emoji: "🔐", cluster: "Technology", offbeat: true,
    code: "ICR", b5: { C: 1, O: 0.5 },
    subjects: ["computers", "maths"], values: ["discovery", "money", "security"],
    streams: ["PCM", "ANY"],
    summary: "Defends people, banks and governments from hackers by thinking like one, ethically.",
    day: "Watch systems for attacks, test apps for weaknesses, investigate incidents and teach teams to stay safe.",
    pay: "≈ ₹5–12 LPA to start; skilled specialists earn much more",
    outlook: "A huge talent shortage worldwide, and demand keeps growing.",
    skills: ["Networking & Linux", "Programming", "Curiosity & patience", "Ethics"],
    tryNow: ["Try beginner challenges on picoCTF", "Learn 10 basic Linux commands", "Set up strong passwords and 2FA for your family"],
    path: {
      h: "PCM is common, but any stream works if you learn computing seriously.",
      a: "JEE Main/Advanced or state CETs for B.Tech CSE; CUET-UG for BCA or B.Sc Computer Science.",
      c: "B.Tech/BCA with security electives. Play CTF competitions and earn certifications (CompTIA Security+, CEH, OSCP).",
      j: "Security analyst, penetration tester, incident responder or security engineer."
    },
    exams: [
      ["JEE Main / State CETs", "NTA / states", "B.Tech in Computer Science"],
      ["CUET-UG", "NTA", "BCA and B.Sc Computer Science"],
      ["GATE", "IITs / IISc", "M.Tech in cybersecurity"]
    ],
    colleges: ["IIT Kanpur", "IIT Madras", "IIIT Hyderabad", "IIIT Delhi", "National Forensic Sciences University, Gandhinagar", "Amrita Vishwa Vidyapeetham, Coimbatore"]
  },
  {
    id: "gamedev", title: "Game Developer", emoji: "🎮", cluster: "Technology", offbeat: true,
    code: "IAR", b5: { O: 1, C: 0.5 },
    subjects: ["computers", "maths", "art"], values: ["creativity", "discovery", "independence"],
    streams: ["PCM", "ANY"],
    summary: "Codes and designs video games, from mobile puzzles to huge multiplayer worlds.",
    day: "Program game mechanics, fix bugs, test levels with players and work closely with artists and designers.",
    pay: "≈ ₹4–10 LPA to start",
    outlook: "India's gaming market is among the fastest-growing in the world.",
    skills: ["Programming (C#, C++)", "Game engines (Unity, Unreal, Godot)", "Maths & physics", "Creativity"],
    tryNow: ["Build a simple game in Scratch", "Follow a beginner Godot or Unity tutorial", "Design a board game with friends"],
    path: {
      h: "PCM helps for a CS degree; any stream works for game design. Start making small games now.",
      a: "JEE or state CETs for CSE, CUET-UG for BCA, or UCEED / NID DAT for game design.",
      c: "B.Tech CSE, BCA or B.Des in Game Design. Join game jams and build a portfolio of playable games.",
      j: "Game programmer, gameplay designer, technical artist or indie developer."
    },
    exams: [
      ["JEE Main / State CETs", "NTA / states", "B.Tech in Computer Science"],
      ["CUET-UG", "NTA", "BCA and B.Sc programmes"],
      ["UCEED / NID DAT", "IIT Bombay / NID", "Game and interaction design"]
    ],
    colleges: ["IIIT Hyderabad", "IIT Bombay", "Dhirubhai Ambani University (DA-IICT), Gandhinagar", "NID Ahmedabad", "Backstage Pass Institute of Gaming, Hyderabad", "MIT Institute of Design, Pune"]
  },

  /* ---------------- Engineering & Trades ---------------- */
  {
    id: "aerospace", title: "Aerospace / Space Engineer", emoji: "🛰️", cluster: "Engineering & Trades",
    code: "IRC", b5: { O: 1, C: 1 },
    subjects: ["physics", "maths"], values: ["discovery", "prestige", "adventure"],
    streams: ["PCM"],
    summary: "Designs rockets, satellites, aircraft and drones: the engineering behind missions like Chandrayaan.",
    day: "Run simulations, design and test parts, analyse flight data and work with a team towards a launch.",
    pay: "≈ ₹6–15 LPA to start",
    outlook: "India's space and drone sectors are opening up to private companies. Exciting times!",
    skills: ["Physics & maths", "CAD & simulation", "Problem solving", "Teamwork"],
    tryNow: ["Build and launch a water-bottle rocket", "Watch ISRO's next launch live", "Test which paper glider design flies farthest"],
    path: {
      h: "PCM with very strong Physics and Maths.",
      a: "JEE Advanced (for IIST and IIT aerospace) or JEE Main for NITs and other colleges.",
      c: "B.Tech in Aerospace, Mechanical or Electronics; then GATE for M.Tech or PSU jobs, or ISRO recruitment.",
      j: "Engineer at ISRO, DRDO, HAL, private space startups or aircraft maintenance companies."
    },
    exams: [
      ["JEE Advanced", "IITs", "IIST Thiruvananthapuram and IIT aerospace programmes"],
      ["JEE Main", "NTA", "Engineering at NITs and other colleges"],
      ["GATE", "IITs / IISc", "M.Tech and PSU jobs"],
      ["ISRO ICRB", "ISRO", "Scientist / Engineer recruitment"]
    ],
    colleges: ["IIST Thiruvananthapuram", "IIT Bombay", "IIT Kanpur", "IIT Madras", "IIT Kharagpur", "Madras Institute of Technology, Chennai"]
  },
  {
    id: "engineer", title: "Core Engineer (Mech / Civil / Electrical)", emoji: "⚙️", cluster: "Engineering & Trades",
    code: "RIC", b5: { C: 1, S: 0.5 },
    subjects: ["physics", "maths", "chemistry"], values: ["security", "discovery", "money"],
    streams: ["PCM"],
    summary: "Builds the machines, power grids, roads and buildings that keep India running.",
    day: "Design and test systems, visit sites or factory floors, solve technical problems and manage projects.",
    pay: "≈ ₹3.5–10 LPA to start; PSU jobs add strong security",
    outlook: "Infrastructure, EVs, renewable energy and manufacturing are all growing fast.",
    skills: ["Physics & maths", "CAD / technical drawing", "Practical problem solving", "Project management"],
    tryNow: ["Take apart (and rebuild!) an old gadget", "Build a circuit with a battery, LED and switch", "Visit a construction site or workshop with an adult"],
    path: {
      h: "PCM. Prepare for JEE Main and your state CET.",
      a: "JEE Main/Advanced, BITSAT or state CETs.",
      c: "B.Tech/BE in Mechanical, Civil, Electrical or Electronics. GATE opens M.Tech and PSU jobs; UPSC ESE leads to government engineering services.",
      j: "Design, site, production or maintenance engineer; later project manager."
    },
    exams: [
      ["JEE Main + Advanced", "NTA / IITs", "B.Tech at IITs, NITs and others"],
      ["State CETs", "MHT CET, KCET, WBJEE…", "State engineering colleges"],
      ["GATE", "IITs / IISc", "M.Tech and PSU recruitment (NTPC, ONGC, IOCL…)"],
      ["UPSC ESE", "UPSC", "Indian Engineering Services"]
    ],
    colleges: ["IIT Bombay", "IIT Madras", "IIT Delhi", "NIT Tiruchirappalli", "Jadavpur University, Kolkata", "COEP Technological University, Pune"]
  },
  {
    id: "technician", title: "Skilled Technician (ITI / Polytechnic)", emoji: "🔧", cluster: "Engineering & Trades",
    code: "RCI", b5: { C: 1 },
    subjects: ["physics", "maths", "computers"], values: ["security", "independence", "money"],
    streams: ["ANY"],
    summary: "The skilled hands India runs on: electricians, mechanics and technicians in EVs, solar and electronics.",
    day: "Install and repair equipment, read wiring diagrams, troubleshoot faults and keep machines running safely.",
    pay: "≈ ₹1.5–4 LPA to start; skilled specialists and business owners earn much more",
    outlook: "Huge demand in EVs, solar, manufacturing and railways, with paths open right after Class 10.",
    skills: ["Hands-on skills", "Safety first", "Troubleshooting", "Reading technical drawings"],
    tryNow: ["Help fix something at home (with an adult)", "Learn how a switchboard is wired, safely", "Find out how a rooftop solar system works"],
    path: {
      s: "After Class 10 you can join an ITI (1–2 year trades) or a 3-year Polytechnic diploma.",
      h: "You can also join after Class 12. Diploma holders can enter B.Tech directly in the 2nd year (lateral entry).",
      a: "Polytechnic entrance (e.g. JEECUP, Delhi CET, AP POLYCET) or ITI admission, mostly on merit.",
      c: "ITI or diploma plus a paid apprenticeship. Optional lateral entry to B.Tech.",
      j: "Technician in factories, railways, power, EV or solar companies, or your own service business."
    },
    exams: [
      ["Polytechnic CET", "State boards (JEECUP, POLYCET…)", "3-year engineering diplomas"],
      ["ITI Admission", "State DTE · mostly merit", "1–2 year trade courses (NCVT)"],
      ["Apprenticeship", "apprenticeshipindia.gov.in", "Paid on-the-job training"],
      ["RRB ALP / Technician", "Railway Recruitment Boards", "Railway jobs for ITI and diploma holders"]
    ],
    colleges: ["Government ITIs in your district", "Government Polytechnics", "National Skill Training Institutes (NSTI)", "CIPET (plastics technology)"]
  },

  /* ---------------- Healthcare ---------------- */
  {
    id: "doctor", title: "Doctor (MBBS)", emoji: "🩺", cluster: "Healthcare",
    code: "ISR", b5: { C: 1, A: 0.5, S: 0.5 },
    subjects: ["biology", "chemistry", "physics"], values: ["helping", "prestige", "security"],
    streams: ["PCB"],
    summary: "Diagnoses and treats illness, saves lives and guides people towards better health.",
    day: "See patients in the OPD, examine and diagnose, order tests, plan treatment and handle emergencies on ward duty.",
    pay: "≈ ₹6–12 LPA after MBBS; much higher after MD/MS specialisation",
    outlook: "India needs many more doctors. A long road, but one of the most stable and respected careers.",
    skills: ["Biology & chemistry", "Patience & empathy", "Decisions under pressure", "Lifelong learning"],
    tryNow: ["Learn basic first aid and CPR", "Read how one organ works and explain it to your family", "Ask a doctor about their toughest and best days"],
    path: {
      h: "Take PCB. NEET covers Class 11 and 12 Physics, Chemistry and Biology, so study both years seriously.",
      a: "Clear NEET-UG. Your rank decides between government seats (low fees) and private seats.",
      c: "MBBS: 4.5 years + a 1-year internship. Then NEET-PG / INI-CET for MD/MS specialisation.",
      j: "Work in hospitals, start a practice, specialise (cardiology, paediatrics…) or move into public health and research."
    },
    exams: [
      ["NEET-UG", "NTA · once a year (May)", "The single entrance for MBBS, BDS and AYUSH, including AIIMS and JIPMER"],
      ["NEET-PG / INI-CET", "After MBBS", "MD/MS specialisation; INI-CET covers AIIMS, JIPMER and PGIMER"],
      ["NExT", "NMC · proposed", "Planned licensing exit exam. Check the latest NMC updates"]
    ],
    colleges: ["AIIMS New Delhi", "CMC Vellore", "JIPMER Puducherry", "Maulana Azad Medical College, Delhi", "AFMC Pune", "KGMU Lucknow"]
  },
  {
    id: "dentist", title: "Dentist (BDS)", emoji: "🦷", cluster: "Healthcare",
    code: "IRS", b5: { C: 1, S: 0.5 },
    subjects: ["biology", "chemistry"], values: ["helping", "independence", "security"],
    streams: ["PCB"],
    summary: "Keeps teeth and smiles healthy: part doctor, part precision craftsperson.",
    day: "Check-ups, fillings, root canals and braces planning: precise hand-work plus patient care.",
    pay: "≈ ₹3–8 LPA to start; your own clinic can earn much more",
    outlook: "Steady demand, especially in growing cities. Specialising (MDS) boosts earnings.",
    skills: ["Steady hands", "Biology", "Patient communication", "Running a clinic"],
    tryNow: ["Make a clay model of a tooth and label its parts", "Ask a dentist what each tool does", "Find out how braces actually move teeth"],
    path: {
      h: "PCB is required.",
      a: "NEET-UG decides BDS admissions.",
      c: "BDS (4 yrs + 1-year internship). Then NEET-MDS to specialise, e.g. in orthodontics.",
      j: "Join a clinic or hospital, then start your own practice or specialise."
    },
    exams: [
      ["NEET-UG", "NTA · May", "BDS admission across India"],
      ["NEET-MDS", "NBEMS · after BDS", "Postgraduate dental specialisation"]
    ],
    colleges: ["Maulana Azad Institute of Dental Sciences, Delhi", "Manipal College of Dental Sciences", "Government Dental College & Hospital, Mumbai", "Nair Hospital Dental College, Mumbai", "Saveetha Dental College, Chennai", "KGMU Faculty of Dental Sciences, Lucknow"]
  },
  {
    id: "nurse", title: "Nurse", emoji: "💉", cluster: "Healthcare",
    code: "SIR", b5: { A: 1, C: 1, S: 0.5 },
    subjects: ["biology", "chemistry"], values: ["helping", "security", "adventure"],
    streams: ["PCB"],
    summary: "Cares for patients round the clock: the backbone of every hospital, in India and abroad.",
    day: "Check patients' vitals, give medicines, assist doctors, comfort families and keep careful records.",
    pay: "≈ ₹3–6 LPA to start; much higher in many countries abroad",
    outlook: "Huge demand in India and worldwide.",
    skills: ["Care & empathy", "Attention to detail", "Calm in emergencies", "Teamwork"],
    tryNow: ["Learn first aid and CPR basics", "Volunteer at a health camp or old-age home", "Interview a nurse about a typical shift"],
    path: {
      h: "PCB with English is required for B.Sc Nursing.",
      a: "AIIMS B.Sc (Hons) Nursing exam, NEET-UG (used by a growing number of nursing colleges) or your state nursing entrance.",
      c: "4-year B.Sc Nursing with hospital training, then registration with your State Nursing Council. M.Sc Nursing to specialise.",
      j: "Staff nurse, ICU/OT specialist, nurse educator, or nursing abroad after licensing exams."
    },
    exams: [
      ["AIIMS B.Sc Nursing (Hons)", "AIIMS · yearly", "Nursing seats at the AIIMS institutes"],
      ["NEET-UG", "NTA", "Used for B.Sc Nursing by many colleges and states"],
      ["State nursing CETs", "State boards", "Government and private nursing colleges"]
    ],
    colleges: ["AIIMS New Delhi", "CMC Vellore", "PGIMER Chandigarh", "Rajkumari Amrit Kaur College of Nursing, Delhi", "College of Nursing, AFMC Pune", "JIPMER Puducherry"]
  },
  {
    id: "vet", title: "Veterinarian", emoji: "🐾", cluster: "Healthcare",
    code: "IRS", b5: { A: 1, C: 1 },
    subjects: ["biology", "chemistry"], values: ["helping", "discovery"],
    streams: ["PCB"],
    summary: "A doctor for animals: pets, farm animals and wildlife.",
    day: "Treat sick animals, perform surgery, vaccinate livestock and guide owners and farmers on care.",
    pay: "≈ ₹4–8 LPA to start; government veterinary officer posts are stable",
    outlook: "The pet care and dairy industries are growing fast.",
    skills: ["Biology", "Love for animals", "Calm hands", "Talking with owners"],
    tryNow: ["Volunteer at an animal shelter", "Learn the basic care needs of a pet or farm animal", "Visit a veterinary clinic"],
    path: {
      h: "PCB is required.",
      a: "NEET-UG for the All-India quota (via the Veterinary Council of India) and many state seats.",
      c: "B.V.Sc & A.H. (5.5 yrs including internship), then registration with the Veterinary Council.",
      j: "Veterinary officer, private clinic, wildlife vet or researcher."
    },
    exams: [
      ["NEET-UG", "NTA", "15% All-India quota via VCI plus many state seats"],
      ["State veterinary admissions", "States", "Remaining seats in state colleges"]
    ],
    colleges: ["IVRI, Izatnagar (Bareilly)", "Madras Veterinary College, Chennai", "GADVASU, Ludhiana", "Bombay Veterinary College, Mumbai", "LUVAS, Hisar", "College of Veterinary Science, Hyderabad"]
  },
  {
    id: "psychologist", title: "Psychologist & Counsellor", emoji: "🧠", cluster: "Healthcare",
    code: "SIA", b5: { A: 1, O: 0.5, S: 0.5 },
    subjects: ["psychology", "biology", "languages"], values: ["helping", "discovery", "independence"],
    streams: ["ANY"],
    summary: "Understands how minds work and helps people cope with stress, anxiety and life's challenges.",
    day: "Listen to clients, use assessments and therapy techniques, write session notes and plan next steps together.",
    pay: "≈ ₹3–7 LPA to start; private practice grows with experience",
    outlook: "Mental-health awareness is rising fast in India, with growing demand in schools, companies and clinics.",
    skills: ["Deep listening", "Empathy", "Research methods", "Confidentiality & ethics"],
    tryNow: ["Watch an episode of CrashCourse Psychology", "Keep a one-week mood journal and spot patterns", "Practise active listening: only ask questions for 5 minutes"],
    path: {
      h: "Any stream; Psychology as a subject in Class 11–12 is a great head start.",
      a: "CUET-UG for BA/B.Sc Psychology at central universities; private universities run their own tests.",
      c: "BA/B.Sc Psychology → MA/M.Sc. Clinical work needs an RCI-recognised professional qualification and RCI registration.",
      j: "School counsellor, clinical psychologist, organisational (HR) psychologist or researcher."
    },
    exams: [
      ["CUET-UG", "NTA", "BA/B.Sc Psychology at DU, BHU, Jamia and more"],
      ["CUET-PG", "NTA", "MA/M.Sc Psychology at central universities"],
      ["Clinical programme entrances", "NIMHANS, CIP Ranchi and others", "RCI-recognised clinical training"]
    ],
    colleges: ["Lady Shri Ram College, Delhi", "Christ University, Bengaluru", "Fergusson College, Pune", "Jamia Millia Islamia, Delhi", "TISS Mumbai (postgraduate)", "NIMHANS Bengaluru (clinical)"]
  },

  /* ---------------- Science & Nature ---------------- */
  {
    id: "scientist", title: "Research Scientist", emoji: "🔬", cluster: "Science & Nature",
    code: "IRA", b5: { O: 1, C: 1 },
    subjects: ["physics", "chemistry", "biology", "maths"], values: ["discovery", "prestige"],
    streams: ["PCM", "PCB"],
    summary: "Asks big questions and runs experiments to discover something nobody has known before.",
    day: "Design an experiment, collect and analyse data, read research papers and discuss findings with your lab.",
    pay: "PhD fellowship ≈ ₹37,000/month; scientist posts ≈ ₹8–15 LPA",
    outlook: "India is expanding research in space, energy, health and AI. Patience pays off.",
    skills: ["Curiosity", "Maths & data analysis", "Experiment design", "Persistence"],
    tryNow: ["Do a kitchen science experiment and record the results", "Take part in a science olympiad such as NSEJS", "Read about C.V. Raman or Asima Chatterjee"],
    path: {
      h: "PCM or PCB (PCMB keeps more doors open). Olympiads can lead to national training camps.",
      a: "IISER Aptitude Test (BS-MS), NEST (NISER & UM-DAE CEBS), JEE Advanced (IISc, IITs) or CUET-UG for B.Sc.",
      c: "BS-MS or B.Sc → M.Sc (IIT JAM) → PhD (CSIR-NET, GATE, institute interviews). Do summer research internships.",
      j: "Research scientist at ISRO, DRDO, BARC, CSIR labs, universities or industry R&D."
    },
    exams: [
      ["IISER Aptitude Test (IAT)", "IISERs", "5-year BS-MS at the IISERs"],
      ["NEST", "NISER & UM-DAE CEBS", "Integrated M.Sc in basic sciences"],
      ["IIT JAM", "IITs", "M.Sc at IITs and IISc"],
      ["CSIR-NET / GATE", "For PhD", "Research fellowships"]
    ],
    colleges: ["IISc Bengaluru", "IISER Pune", "IISER Kolkata", "NISER Bhubaneswar", "TIFR Mumbai", "IIT Kanpur"]
  },
  {
    id: "environment", title: "Environmental Scientist & Forest Officer", emoji: "🌳", cluster: "Science & Nature",
    code: "IRS", b5: { O: 1, A: 0.5 },
    subjects: ["biology", "geography", "chemistry"], values: ["discovery", "helping", "adventure"],
    streams: ["PCB", "PCM"],
    summary: "Protects forests, wildlife, rivers and air, and fights climate change with science.",
    day: "Do field surveys, test water and soil samples, track wildlife and advise on conservation plans.",
    pay: "≈ ₹4–8 LPA to start; IFS officers receive central government pay",
    outlook: "Climate action, renewable energy and sustainability roles are growing worldwide.",
    skills: ["Field research", "Biology & chemistry", "Data analysis", "Love for nature"],
    tryNow: ["Count the birds or trees in your area", "Start a waste-segregation drive at school", "Track your family's electricity use for a month"],
    path: {
      h: "PCB or PCM. Join eco-clubs and nature camps.",
      a: "CUET-UG for B.Sc Environmental Science or Forestry; IISER IAT for research routes.",
      c: "B.Sc + M.Sc in Environmental Science, Forestry or Wildlife. UPSC IFoS needs a science or engineering degree.",
      j: "Environmental consultant, conservation scientist, climate analyst or Indian Forest Service officer."
    },
    exams: [
      ["CUET-UG", "NTA", "B.Sc Environmental Science and Forestry"],
      ["UPSC IFoS", "UPSC", "Indian Forest Service officers"],
      ["IISER IAT", "IISERs", "Research route in earth and environmental sciences"]
    ],
    colleges: ["Forest Research Institute, Dehradun", "TERI School of Advanced Studies, Delhi", "Wildlife Institute of India, Dehradun (PG)", "IISER Bhopal", "Pondicherry University", "University of Delhi"]
  },
  {
    id: "agri", title: "Agricultural Scientist & Agritech", emoji: "🌾", cluster: "Science & Nature",
    code: "IRE", b5: { C: 0.5, O: 0.5 },
    subjects: ["biology", "chemistry", "geography"], values: ["helping", "discovery", "independence"],
    streams: ["PCB", "PCM"],
    summary: "Uses science and technology to help farmers grow more food with less water and less damage to soil.",
    day: "Test new crop varieties, advise farmers, use drones and sensors in fields and analyse yields.",
    pay: "≈ ₹3–7 LPA to start; agritech startups and research posts pay more",
    outlook: "Agritech is one of India's most exciting growth areas.",
    skills: ["Biology & chemistry", "Field work", "Technology & data", "Talking with farmers"],
    tryNow: ["Grow vegetables in pots and compare fertilisers", "Ask a farmer about their biggest challenge", "Learn how drip irrigation works"],
    path: {
      h: "PCB or PCM (some boards offer Agriculture as a subject).",
      a: "CUET-UG (ICAR's all-India seats) or your state agriculture CET.",
      c: "B.Sc Agriculture (4 yrs) → M.Sc (ICAR AIEEA-PG) → PhD, or join agritech companies.",
      j: "Agricultural officer, scientist (ASRB-NET), agribusiness manager or agritech founder."
    },
    exams: [
      ["CUET-UG", "NTA", "B.Sc Agriculture seats under ICAR"],
      ["State agriculture CETs", "States", "State agricultural universities"],
      ["ICAR AIEEA-PG", "NTA", "M.Sc in agricultural sciences"]
    ],
    colleges: ["IARI, New Delhi (PG)", "Punjab Agricultural University, Ludhiana", "Tamil Nadu Agricultural University, Coimbatore", "GBPUAT, Pantnagar", "UAS Bengaluru", "ICAR-NDRI, Karnal"]
  },

  /* ---------------- Business & Finance ---------------- */
  {
    id: "ca", title: "Chartered Accountant", emoji: "📊", cluster: "Business & Finance",
    code: "CEI", b5: { C: 1, S: 0.5 },
    subjects: ["accounts", "maths", "economics"], values: ["money", "security", "prestige"],
    streams: ["COM", "ANY"],
    summary: "The money expert businesses trust: audits accounts, plans taxes and advises on big decisions.",
    day: "Audit a company's books, prepare tax filings, advise a client on GST and meet tight deadlines.",
    pay: "≈ ₹7–12 LPA for newly qualified CAs; much more at top firms",
    outlook: "Always in demand. Every business needs accounting, audit and tax help.",
    skills: ["Accounting", "Tax & law basics", "Attention to detail", "Discipline for long study"],
    tryNow: ["Track your pocket money in a spreadsheet for a month", "Calculate the GST on a restaurant bill", "Read a simple summary of a company's annual report"],
    path: {
      h: "Commerce with Accounts and Maths is ideal, though any stream is allowed. Register with ICAI for CA Foundation on time.",
      a: "Clear CA Foundation after Class 12, then CA Intermediate. Graduates can enter Intermediate directly.",
      c: "Articleship (practical training at a CA firm) plus CA Final. Many do a B.Com side by side.",
      j: "Audit, tax and advisory at Big 4 firms, finance roles in companies, or your own CA practice."
    },
    exams: [
      ["CA Foundation", "ICAI · several attempts a year", "Entry level of the CA course"],
      ["CA Intermediate", "ICAI", "Second level, alongside articleship"],
      ["CA Final", "ICAI", "Final level to become a Chartered Accountant"]
    ],
    colleges: ["ICAI (the CA course itself)", "SRCC, Delhi (B.Com)", "St. Xavier's College, Kolkata", "Narsee Monjee College, Mumbai", "Loyola College, Chennai", "Christ University, Bengaluru"]
  },
  {
    id: "finance", title: "Investment Banker & Financial Analyst", emoji: "💹", cluster: "Business & Finance",
    code: "ECI", b5: { C: 1, E: 0.5, S: 0.5 },
    subjects: ["maths", "economics", "accounts"], values: ["money", "prestige"],
    streams: ["COM", "PCM"],
    summary: "Helps companies raise money, value businesses and invest wisely in markets.",
    day: "Build financial models in Excel, study companies, prepare pitch decks and work on deals with tight deadlines.",
    pay: "≈ ₹8–20 LPA to start at top firms",
    outlook: "Competitive and demanding, but rewarding. Data and coding skills are a big plus.",
    skills: ["Excel & financial modelling", "Economics", "Number sense", "Working under pressure"],
    tryNow: ["Follow the Nifty for two weeks and note why it moved", "Run a virtual stock portfolio", "Work out what compounding does to ₹1,000 over 20 years"],
    path: {
      h: "Commerce with Maths, or PCM. Maths is important.",
      a: "CUET-UG for B.Com or Economics at top universities, or IPMAT for the 5-year IIM programme.",
      c: "B.Com, Economics or BBA → MBA (via CAT) or CFA. Intern at banks and financial firms.",
      j: "Analyst at an investment bank, equity research, private equity or corporate finance."
    },
    exams: [
      ["CUET-UG", "NTA", "B.Com and Economics at SRCC, St. Stephen's and other DU colleges"],
      ["IPMAT", "IIM Indore / IIM Rohtak", "5-year management programme straight after Class 12"],
      ["CAT", "IIMs · November", "MBA at IIMs and top B-schools"],
      ["CFA", "CFA Institute", "Global investment credential"]
    ],
    colleges: ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "SRCC, Delhi", "St. Stephen's College, Delhi", "Delhi School of Economics"]
  },
  {
    id: "manager", title: "Business Manager (MBA)", emoji: "💼", cluster: "Business & Finance",
    code: "ESC", b5: { E: 1, C: 0.5 },
    subjects: ["economics", "accounts", "languages"], values: ["money", "prestige", "independence"],
    streams: ["ANY"],
    summary: "Leads teams and runs parts of a business: operations, sales, HR, strategy and more.",
    day: "Set goals with your team, review numbers, solve problems, meet clients and make decisions.",
    pay: "≈ ₹3–6 LPA after a BBA; ₹15–30 LPA+ after a top MBA",
    outlook: "Leaders are needed in every industry. A good MBA plus work experience opens many doors.",
    skills: ["Leadership", "Communication", "Problem solving", "Data-driven decisions"],
    tryNow: ["Organise a club event from start to finish", "Run a mini business for one week", "Read one business story in the newspaper every day"],
    path: {
      h: "Any stream. Build communication and maths skills.",
      a: "IPMAT for 5-year IIM programmes, or CUET-UG / university tests for a BBA.",
      c: "BBA or any degree, then CAT/XAT/GMAT for an MBA (2–3 years of work experience helps).",
      j: "Management trainee or associate; grow into manager, director or CEO."
    },
    exams: [
      ["CAT", "IIMs · November", "MBA at IIMs, FMS and hundreds of B-schools"],
      ["XAT", "XLRI · January", "XLRI and many top B-schools"],
      ["IPMAT", "IIM Indore / Rohtak", "Integrated BBA + MBA after Class 12"],
      ["GMAT", "GMAC", "ISB and business schools abroad"]
    ],
    colleges: ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "XLRI Jamshedpur", "FMS Delhi", "ISB Hyderabad"]
  },
  {
    id: "entrepreneur", title: "Entrepreneur", emoji: "🚀", cluster: "Business & Finance",
    code: "EAI", b5: { O: 1, E: 1, S: 0.5 },
    subjects: ["economics", "computers", "accounts"], values: ["independence", "money", "creativity"],
    streams: ["ANY"],
    summary: "Spots a problem, builds a solution and turns it into a business that can change lives.",
    day: "Talk to customers, build and test your product, pitch to investors, hire people and fix whatever breaks.",
    pay: "Unpredictable: from zero to life-changing. Most founders earn little at first",
    outlook: "India has one of the world's largest startup ecosystems. Failure is part of the journey.",
    skills: ["Problem solving", "Selling ideas", "Resilience", "Learning fast"],
    tryNow: ["Find one problem in your school and sketch a solution", "Sell something small and track your profit", "Listen to a founder's story on a podcast"],
    path: {
      h: "Any stream. Learn coding, design or business basics on the side and start tiny projects now.",
      a: "No single exam. Many founders study engineering (JEE), management (IPMAT/BBA) or design (UCEED/NID) first.",
      c: "Join your college E-Cell, build side projects, enter hackathons and apply to incubators and Startup India programmes.",
      j: "Found a startup, or join an early-stage one to learn; raise funding as you grow."
    },
    exams: [
      ["No mandatory exam", "—", "Skills, customers and persistence matter most"],
      ["IPMAT / CUET-UG", "For business degrees", "IIM IPM and BBA programmes"],
      ["JEE / UCEED", "For tech or design founders", "Engineering or design degrees"]
    ],
    colleges: ["IIM Indore (IPM)", "IIT campuses (E-Cells & incubators)", "ISB Hyderabad", "BITS Pilani", "Ashoka University", "IIM Ahmedabad (CIIE incubator)"]
  },
  {
    id: "marketing", title: "Marketing & Brand Manager", emoji: "📣", cluster: "Business & Finance",
    code: "EAS", b5: { E: 1, O: 0.5 },
    subjects: ["languages", "economics", "art"], values: ["creativity", "money", "fame"],
    streams: ["ANY"],
    summary: "Makes people fall in love with brands through ads, social media, campaigns and data.",
    day: "Study customers, plan a campaign, brief designers, track results on dashboards and pitch new ideas.",
    pay: "≈ ₹4–10 LPA to start; more after an MBA",
    outlook: "Digital and performance marketing are booming.",
    skills: ["Creativity", "Communication", "Customer insight", "Analytics"],
    tryNow: ["Create an ad for your favourite snack", "Grow a small social media page about a hobby", "Work out why a viral ad worked"],
    path: {
      h: "Any stream.",
      a: "CUET-UG, IPMAT, NPAT (NMIMS) or SET (Symbiosis) for BBA/BMS.",
      c: "BBA/BMS or any degree → MBA (CAT) or MICA (MICAT). Intern at ad agencies and brands.",
      j: "Brand executive, digital marketer, ad strategist or growth manager."
    },
    exams: [
      ["IPMAT", "IIM Indore / Rohtak", "Integrated management programme"],
      ["NPAT / SET", "NMIMS / Symbiosis", "BBA programmes"],
      ["MICAT", "MICA", "Strategic marketing and communication"],
      ["CAT", "IIMs", "MBA in marketing"]
    ],
    colleges: ["MICA, Ahmedabad", "IIM Ahmedabad", "IIM Calcutta", "Shaheed Sukhdev College of Business Studies, Delhi", "NMIMS, Mumbai", "Symbiosis Institute of Business Management, Pune"]
  },
  {
    id: "economist", title: "Economist & Policy Analyst", emoji: "📈", cluster: "Business & Finance",
    code: "ICS", b5: { O: 1, C: 1 },
    subjects: ["economics", "maths", "civics"], values: ["discovery", "prestige", "helping"],
    streams: ["COM", "HUM", "PCM"],
    summary: "Studies how money, markets and policies work, and advises governments and companies.",
    day: "Analyse data, build economic models, read reports, write policy briefs and present findings.",
    pay: "≈ ₹5–12 LPA to start",
    outlook: "Data-skilled economists are needed in banks, think tanks, consulting and government.",
    skills: ["Maths & statistics", "Critical thinking", "Writing", "Data tools (Excel, R, Python)"],
    tryNow: ["Track the prices of 5 items at your local market for a month", "Read a simple explainer on the Union Budget", "Chart India's GDP growth over 10 years"],
    path: {
      h: "Commerce or Humanities with Maths, or PCM. Maths is a big advantage.",
      a: "CUET-UG for BA (Hons) Economics; ISI Admission Test for B.Stat.",
      c: "BA/B.Sc Economics → MA (via CUET-PG) → PhD or jobs. UPSC IES leads to government economist roles.",
      j: "Economic analyst, researcher, policy advisor or Indian Economic Service officer."
    },
    exams: [
      ["CUET-UG", "NTA", "BA Economics at DU, JNU and more"],
      ["ISI Admission Test", "ISI", "B.Stat and quantitative economics"],
      ["UPSC IES", "UPSC", "Indian Economic Service"]
    ],
    colleges: ["Delhi School of Economics", "St. Stephen's College, Delhi", "SRCC, Delhi", "Ashoka University", "Gokhale Institute, Pune", "Madras School of Economics"]
  },
  {
    id: "banking", title: "Banking & Government Officer", emoji: "🏦", cluster: "Business & Finance",
    code: "CES", b5: { C: 1, S: 0.5 },
    subjects: ["maths", "economics", "accounts"], values: ["security", "prestige"],
    streams: ["ANY"],
    summary: "Secure bank and government jobs: managing branches, loans, policies and public offices.",
    day: "Approve loans, help customers, manage branch staff and targets, or handle files in a government department.",
    pay: "≈ ₹6–9 LPA as a bank PO (including allowances), with strong job security",
    outlook: "Thousands of vacancies across banks, SSC and state services each year, but competition is high.",
    skills: ["Quantitative aptitude", "Reasoning", "English", "General awareness"],
    tryNow: ["Solve 10 aptitude puzzles a day for a week", "Find out how a bank loan and its interest work", "Read business news for 10 minutes daily"],
    path: {
      h: "Any stream. Regular Maths practice helps a lot with aptitude tests.",
      a: "Most of these exams need a degree, so start with a graduation you enjoy.",
      c: "Graduate in any subject and prepare for IBPS/SBI PO, SSC CGL or RBI Grade B.",
      j: "Probationary Officer → branch manager, or officer posts in central and state government."
    },
    exams: [
      ["IBPS PO / Clerk", "IBPS", "Public sector banks"],
      ["SBI PO", "SBI", "State Bank of India officers"],
      ["RBI Grade B", "RBI", "Officer posts at the Reserve Bank"],
      ["SSC CGL", "SSC", "Central government Group B and C posts"]
    ],
    colleges: ["Any recognised graduation", "University of Delhi colleges", "National Institute of Bank Management, Pune (PG)"]
  },

  /* ---------------- Law & Public Service ---------------- */
  {
    id: "lawyer", title: "Lawyer", emoji: "⚖️", cluster: "Law & Public Service",
    code: "EIS", b5: { E: 0.5, C: 1, O: 0.5 },
    subjects: ["languages", "history", "civics"], values: ["prestige", "money", "independence"],
    streams: ["ANY"],
    summary: "Argues cases, drafts contracts and protects people's rights in courts, companies and government.",
    day: "Research case law, meet clients, draft documents, and argue in court or negotiate deals.",
    pay: "≈ ₹6–18 LPA at top law firms; courtroom practice starts low but can grow big",
    outlook: "Strong demand in corporate law, tech and privacy law, and litigation.",
    skills: ["Reading & reasoning", "Public speaking", "Writing", "Negotiation"],
    tryNow: ["Join a debate or Model UN", "Summarise one newspaper editorial every day", "Watch a Supreme Court hearing livestream"],
    path: {
      h: "Any stream works. Build English, reading speed and logical reasoning, the core of CLAT.",
      a: "CLAT for the NLUs, AILET for NLU Delhi, plus MH CET Law and university tests. Mock tests are essential.",
      c: "5-year BA/BBA LLB (or a 3-year LLB after any degree). Intern every vacation. Clear AIBE to practise in court.",
      j: "Join a law firm, a senior advocate's chamber, a company's legal team or the judicial services."
    },
    exams: [
      ["CLAT", "Consortium of NLUs · December", "5-year law at 20+ National Law Universities"],
      ["AILET", "NLU Delhi", "Admission to NLU Delhi"],
      ["MH CET Law", "Maharashtra CET Cell", "Law colleges in Maharashtra"],
      ["AIBE", "Bar Council of India · after LLB", "Licence to practise as an advocate"]
    ],
    colleges: ["NLSIU Bengaluru", "NLU Delhi", "NALSAR Hyderabad", "WBNUJS Kolkata", "NLU Jodhpur", "Faculty of Law, University of Delhi"]
  },
  {
    id: "ias", title: "Civil Services (IAS / IPS / IFS)", emoji: "🏛️", cluster: "Law & Public Service",
    code: "SEC", b5: { C: 1, S: 1, A: 0.5 },
    subjects: ["history", "civics", "geography", "economics"], values: ["prestige", "helping", "security"],
    streams: ["ANY"],
    summary: "Runs the country from the ground up: districts, policing, foreign policy and national programmes.",
    day: "As a District Collector: review schemes, hold public hearings, manage a flood or an election, and solve problems for lakhs of people.",
    pay: "≈ ₹56,100/month basic + DA, housing and other benefits to start",
    outlook: "Extremely competitive: around 10 lakh people apply each year and roughly 1,000 are selected.",
    skills: ["General awareness", "Clear answer writing", "Decision making", "Integrity & patience"],
    tryNow: ["Read a newspaper (or its student edition) every day", "Find out who your District Collector is and what they did this month", "Explain one government scheme to your family"],
    path: {
      m: "Read newspapers and NCERT books with curiosity, and take part in quizzes and debates.",
      h: "Any stream works. Toppers come from engineering, medicine and humanities; Humanities overlaps most with the syllabus.",
      a: "There's no exam right after Class 12. Do any graduation you enjoy.",
      c: "Graduate in any subject, build general-studies knowledge and start focused preparation in your final years (minimum age is 21).",
      j: "Clear UPSC Prelims → Mains → Interview, train at LBSNAA or SVPNPA, and serve as an IAS, IPS or IFS officer."
    },
    exams: [
      ["UPSC CSE", "UPSC · Prelims (May–June), Mains, Interview", "IAS, IPS, IFS and 20+ central services; needs a degree and age 21+"],
      ["State PSC", "Your state commission", "State civil services (SDM, DSP and more)"]
    ],
    colleges: ["Any graduation counts", "St. Stephen's College, Delhi", "Hindu College, Delhi", "Presidency University, Kolkata", "JNU, New Delhi", "LBSNAA Mussoorie (training after selection)"]
  },
  {
    id: "defence", title: "Defence Officer", emoji: "🎖️", cluster: "Law & Public Service",
    code: "RES", b5: { C: 1, E: 0.5, S: 1 },
    subjects: ["sports", "physics", "maths"], values: ["adventure", "prestige", "security", "helping"],
    streams: ["ANY", "PCM"],
    summary: "Leads soldiers, sailors or aircrew to protect the nation: a life of discipline, adventure and honour.",
    day: "PT at dawn, lead your unit through training, plan missions and look after your team's welfare.",
    pay: "≈ ₹56,100/month basic as a Lieutenant + Military Service Pay and allowances",
    outlook: "A stable, respected career with excellent training, travel and benefits. Women can join through NDA too.",
    skills: ["Fitness", "Leadership", "Courage & discipline", "Teamwork"],
    tryNow: ["Start a daily fitness routine: running, push-ups and stretching", "Join NCC, Scouts or Guides", "Read a biography of Field Marshal Sam Manekshaw"],
    path: {
      m: "Stay fit, play team sports and join Scouts or Guides. Sainik Schools admit students in Class 6 and 9 through AISSEE.",
      s: "Join NCC if your school has it, stay fit and look after your eyesight. NDA tests Maths and General Ability, so study well.",
      h: "Any stream for the Army; PCM is needed for the Air Force and Navy wings of NDA and for 10+2 Technical Entry.",
      a: "NDA exam (twice a year, roughly age 16.5–19.5) → 5-day SSB interview → medicals. PCM students can also try 10+2 TES.",
      c: "Graduates can enter through CDS, AFCAT, NCC Special Entry or technical graduate entries.",
      j: "Commissioned as Lieutenant (Army), Sub-Lieutenant (Navy) or Flying Officer (Air Force)."
    },
    exams: [
      ["NDA & NA", "UPSC · April & September", "Join the National Defence Academy after Class 12"],
      ["SSB Interview", "Services Selection Board", "5-day test of personality, intelligence and leadership"],
      ["CDS", "UPSC · for graduates", "IMA, INA, AFA and OTA"],
      ["AFCAT", "Indian Air Force", "Flying and ground-duty branches for graduates"]
    ],
    colleges: ["NDA Khadakwasla, Pune", "Indian Military Academy, Dehradun", "Indian Naval Academy, Ezhimala", "Air Force Academy, Dundigal", "Officers Training Academy, Chennai", "Rashtriya Indian Military College, Dehradun"]
  },

  /* ---------------- Design & Creative ---------------- */
  {
    id: "architect", title: "Architect", emoji: "📐", cluster: "Design & Creative",
    code: "AIR", b5: { O: 1, C: 1 },
    subjects: ["maths", "art", "physics"], values: ["creativity", "prestige", "independence"],
    streams: ["PCM"],
    summary: "Designs buildings and spaces that are beautiful, safe and useful, from homes to airports.",
    day: "Sketch ideas, build 3D models on the computer, visit construction sites and present designs to clients.",
    pay: "≈ ₹3–7 LPA to start; well-known architects earn much more",
    outlook: "Steady demand from India's rapid urban growth; green and sustainable design is rising.",
    skills: ["Drawing & sketching", "3D design software", "Maths & structures", "Presenting ideas"],
    tryNow: ["Sketch your dream room from three angles", "Build a model house from cardboard", "Photograph 5 interesting buildings in your city"],
    path: {
      h: "PCM with Maths is mandatory for B.Arch. Practise drawing and perspective sketching.",
      a: "NATA (Council of Architecture) or JEE Main Paper 2A; IITs need JEE Advanced + AAT.",
      c: "5-year B.Arch with an internship, then registration with the Council of Architecture.",
      j: "Join an architecture firm, work in urban planning, or start your own studio."
    },
    exams: [
      ["NATA", "Council of Architecture", "B.Arch admission at most colleges"],
      ["JEE Main Paper 2A", "NTA", "B.Arch at NITs, SPAs and others"],
      ["JEE Advanced + AAT", "IITs", "B.Arch at IIT Kharagpur, Roorkee and others"]
    ],
    colleges: ["SPA Delhi", "IIT Kharagpur", "IIT Roorkee", "CEPT University, Ahmedabad", "Sir JJ College of Architecture, Mumbai", "NIT Tiruchirappalli"]
  },
  {
    id: "ux", title: "UX/UI & Product Designer", emoji: "📱", cluster: "Design & Creative",
    code: "AIS", b5: { O: 1, A: 0.5 },
    subjects: ["art", "computers", "psychology"], values: ["creativity", "money", "discovery"],
    streams: ["ANY"],
    summary: "Designs how apps and websites look, feel and work, so they're easy and delightful to use.",
    day: "Interview users, sketch screens, build prototypes in Figma, test them with real people and improve.",
    pay: "≈ ₹5–12 LPA to start",
    outlook: "High demand as every company goes digital.",
    skills: ["Visual design", "Empathy for users", "Figma & prototyping", "Storytelling"],
    tryNow: ["Redesign your favourite app's home screen on paper", "Watch 3 people use an app and note where they get stuck", "Try Figma's free beginner tutorials"],
    path: {
      h: "Any stream. Keep a sketchbook, learn basic design tools and practise drawing what you observe.",
      a: "UCEED for B.Des at IITs, NID DAT for NIDs, plus NIFT and private design-school tests.",
      c: "B.Des (4 yrs) in interaction or communication design. Build a strong portfolio and intern at product companies. CEED leads to an M.Des.",
      j: "UX/UI Designer, Product Designer or UX Researcher."
    },
    exams: [
      ["UCEED", "IIT Bombay · January", "B.Des at IIT Bombay, Guwahati, Hyderabad and others"],
      ["NID DAT", "NID · prelims + mains", "B.Des at NID Ahmedabad and other NIDs"],
      ["NIFT Entrance", "NIFT", "Communication design and other B.Des programmes"],
      ["CEED", "IIT Bombay", "M.Des after graduation"]
    ],
    colleges: ["IDC School of Design, IIT Bombay", "NID Ahmedabad", "IIT Guwahati (Design)", "IIT Hyderabad (Design)", "MIT Institute of Design, Pune", "Srishti Manipal Institute, Bengaluru"]
  },
  {
    id: "fashion", title: "Fashion Designer", emoji: "👗", cluster: "Design & Creative",
    code: "AER", b5: { O: 1, E: 0.5 },
    subjects: ["art"], values: ["creativity", "independence", "fame"],
    streams: ["ANY"],
    summary: "Creates clothing and accessories, from runway collections to the next big streetwear brand.",
    day: "Research trends, sketch collections, choose fabrics, work with tailors on samples and plan a launch.",
    pay: "≈ ₹3–6 LPA to start; your own label can go much higher",
    outlook: "India's fashion and textile industry is huge, and sustainable and online brands are booming.",
    skills: ["Sketching", "Colour & fabric sense", "Trend research", "Business basics"],
    tryNow: ["Redesign an old T-shirt", "Make a mood board of a style you love", "Sketch 5 outfits for a festival theme"],
    path: {
      h: "Any stream. Keep a sketchbook and portfolio, and learn basic stitching.",
      a: "NIFT Entrance (written test + situation test), NID DAT, and private-school tests like Pearl Academy's.",
      c: "B.Des in Fashion, Textile or Accessory Design (4 yrs) with internships at design houses.",
      j: "Assistant designer, merchandiser or stylist, or launch your own label."
    },
    exams: [
      ["NIFT Entrance", "NIFT · January–February", "B.Des at NIFT campuses across India"],
      ["NID DAT", "NID", "Textile and apparel design"],
      ["Institute tests", "Pearl Academy, Symbiosis and others", "Private fashion design programmes"]
    ],
    colleges: ["NIFT Delhi", "NIFT Mumbai", "NIFT Bengaluru", "NID Ahmedabad", "Pearl Academy", "Symbiosis Institute of Design, Pune"]
  },
  {
    id: "animator", title: "Animator & VFX Artist", emoji: "🎞️", cluster: "Design & Creative", offbeat: true,
    code: "ARI", b5: { O: 1, C: 0.5 },
    subjects: ["art", "computers"], values: ["creativity", "independence"],
    streams: ["ANY"],
    summary: "Brings characters and worlds to life for films, games, ads and apps.",
    day: "Storyboard a scene, model or draw characters, animate them frame by frame and polish with lighting and effects.",
    pay: "≈ ₹3–6 LPA to start; skilled VFX artists earn much more",
    outlook: "India is a global hub for animation and VFX for Hollywood and OTT.",
    skills: ["Drawing", "Blender / Maya", "Storytelling", "Patience"],
    tryNow: ["Make a flipbook animation", "Follow a beginner Blender tutorial (it's free)", "Shoot a 10-second stop-motion video on a phone"],
    path: {
      h: "Any stream. Build a portfolio of drawings and short animations.",
      a: "NID DAT, UCEED, and tests at design and animation schools (MIT-ID, Whistling Woods).",
      c: "B.Des in Animation, or a BFA/B.Sc in Animation. Build a showreel and intern at studios.",
      j: "2D/3D animator, VFX artist, character designer or game artist."
    },
    exams: [
      ["NID DAT", "NID", "Animation film design"],
      ["UCEED", "IIT Bombay", "B.Des at IITs"],
      ["Institute tests", "MIT-ID, Whistling Woods and others", "Animation and VFX programmes"]
    ],
    colleges: ["NID Ahmedabad", "IDC School of Design, IIT Bombay", "Whistling Woods International, Mumbai", "MIT Institute of Design, Pune", "Srishti Manipal Institute, Bengaluru", "Symbiosis Institute of Design, Pune"]
  },

  /* ---------------- Media & Performing Arts ---------------- */
  {
    id: "journalist", title: "Journalist & Content Creator", emoji: "📰", cluster: "Media & Performing Arts",
    code: "AES", b5: { O: 1, E: 1 },
    subjects: ["languages", "history", "civics"], values: ["creativity", "fame", "adventure"],
    streams: ["ANY"],
    summary: "Finds the truth and tells stories that matter, in print, on TV, in podcasts and online.",
    day: "Chase a lead, interview people, verify facts, write or shoot your story and publish before the deadline.",
    pay: "≈ ₹3–6 LPA to start; creators' income varies widely",
    outlook: "Digital media and video are growing; fact-checking and data journalism skills stand out.",
    skills: ["Writing", "Curiosity", "Interviewing", "Fact-checking"],
    tryNow: ["Start a school newsletter or blog", "Interview a grandparent and write their story", "Make a 60-second news video about your neighbourhood"],
    path: {
      h: "Any stream; Humanities with English helps. Write for your school magazine.",
      a: "CUET-UG for BA Journalism / Mass Communication, plus tests at private media schools.",
      c: "BA in Journalism or Mass Communication, or any degree + a PG diploma (IIMC, ACJ). Intern at newsrooms.",
      j: "Reporter, editor, anchor, podcaster or independent creator."
    },
    exams: [
      ["CUET-UG", "NTA", "BA Journalism at DU, Jamia and other central universities"],
      ["IIMC admission", "IIMC · postgraduate", "India's top public journalism institute. Check its current admission method"],
      ["ACJ Entrance", "Asian College of Journalism", "PG Diploma in Journalism"],
      ["SET", "Symbiosis", "BA Mass Communication at Symbiosis"]
    ],
    colleges: ["IIMC, New Delhi", "Asian College of Journalism, Chennai", "Symbiosis Institute of Media & Communication, Pune", "AJK MCRC, Jamia Millia Islamia", "Xavier Institute of Communications, Mumbai", "Lady Shri Ram College, Delhi"]
  },
  {
    id: "performer", title: "Musician & Performer", emoji: "🎵", cluster: "Media & Performing Arts",
    code: "ASE", b5: { O: 1, E: 1 },
    subjects: ["music", "languages"], values: ["creativity", "fame", "independence"],
    streams: ["ANY"],
    summary: "Creates and performs music or dance on stage, in studios, in films and online.",
    day: "Practise for hours, compose or choreograph, rehearse with your group, record content and perform.",
    pay: "Irregular at first: shows, teaching, sessions and online income add up",
    outlook: "Streaming, social media and live events have created more ways to earn than ever.",
    skills: ["Daily practice", "Creativity", "Stage confidence", "Self-promotion"],
    tryNow: ["Practise 20 minutes daily and record yourself weekly", "Perform at a school event", "Try a free music-production app"],
    path: {
      m: "Learn an instrument, singing or dance from a teacher, and perform whenever you can.",
      s: "Take graded exams (e.g. Gandharva, Trinity) and compete in inter-school events.",
      h: "Any stream. Keep practising daily and build a recording portfolio.",
      a: "CUET-UG for BA/B.Mus at central universities, and auditions at conservatories.",
      c: "BA/B.Mus/BPA in music or dance. Perform, collaborate and build an audience.",
      j: "Performer, session musician, composer, music teacher or producer."
    },
    exams: [
      ["CUET-UG", "NTA", "BA Music at DU, BHU and others"],
      ["Auditions", "Conservatories & universities", "Practical skill tests"],
      ["Graded exams", "Gandharva Mahavidyalaya, Trinity", "Recognised music qualifications"]
    ],
    colleges: ["KM Music Conservatory, Chennai", "Faculty of Performing Arts, BHU", "Bhatkhande Sanskriti Vishwavidyalaya, Lucknow", "Kalakshetra Foundation, Chennai", "Faculty of Music & Fine Arts, University of Delhi", "True School of Music, Mumbai"]
  },
  {
    id: "film", title: "Filmmaker & Actor", emoji: "🎬", cluster: "Media & Performing Arts",
    code: "AES", b5: { O: 1, E: 0.5 },
    subjects: ["art", "languages", "music"], values: ["creativity", "fame", "adventure"],
    streams: ["ANY"],
    summary: "Tells stories on screen as a director, actor, writer, editor or cinematographer.",
    day: "Write or study a script, rehearse, shoot scenes with the crew and edit the final cut.",
    pay: "Project-based; assistants start around ₹2–5 LPA",
    outlook: "OTT platforms and regional cinema have opened up many more opportunities.",
    skills: ["Storytelling", "Camera & editing", "Acting or directing", "Collaboration"],
    tryNow: ["Shoot a 1-minute short film on a phone", "Act in a school play", "Edit a video with a free editor"],
    path: {
      m: "Join drama, read lots of stories and make phone videos.",
      s: "Act in plays, make short films and enter school film festivals.",
      h: "Any stream. Build a portfolio of short films or acting reels.",
      a: "CUET-UG for BA Mass Media; institute entrances for film schools.",
      c: "A degree in mass media or film; FTII/SRFTI (via JET) or NSD for specialised training.",
      j: "Assistant director, actor, cinematographer, editor, writer or independent filmmaker."
    },
    exams: [
      ["FTII-SRFTI JET", "FTII & SRFTI", "Film and TV courses at India's top film schools"],
      ["NSD Admission", "National School of Drama", "3-year acting and theatre programme"],
      ["Institute tests", "Whistling Woods and others", "Film and media degrees"]
    ],
    colleges: ["FTII Pune", "SRFTI Kolkata", "National School of Drama, New Delhi", "Whistling Woods International, Mumbai", "AJK MCRC, Jamia Millia Islamia", "L.V. Prasad Film & TV Academy, Chennai"]
  },

  /* ---------------- People & Community ---------------- */
  {
    id: "teacher", title: "Teacher & Professor", emoji: "🧑‍🏫", cluster: "People & Community",
    code: "SAI", b5: { A: 1, C: 0.5, E: 0.5 },
    subjects: ["languages", "maths", "history"], values: ["helping", "security", "discovery"],
    streams: ["ANY"],
    summary: "Shapes young minds: explains ideas, sparks curiosity and guides students' futures.",
    day: "Plan lessons, teach through activities, check work, help a struggling student and talk with parents.",
    pay: "≈ ₹3–8 LPA in schools; government schools and universities pay more",
    outlook: "India needs lakhs of good teachers, and the new 4-year ITEP is the modern route in.",
    skills: ["Explaining clearly", "Patience", "Subject knowledge", "Creative teaching"],
    tryNow: ["Teach a younger sibling or friend a topic you love", "Make a 3-minute explainer video", "Volunteer to tutor at a local NGO"],
    path: {
      h: "Any stream. Pick the subjects you'd love to teach.",
      a: "NCET for the 4-year Integrated Teacher Education Programme (ITEP), or CUET-UG for a degree followed by a B.Ed.",
      c: "ITEP (B.A./B.Sc./B.Com + B.Ed in 4 yrs) or a degree + 2-year B.Ed. Clear CTET or your State TET. For college teaching: a Master's + UGC-NET.",
      j: "School teacher, lecturer or professor, curriculum designer or ed-tech educator."
    },
    exams: [
      ["NCET", "NTA", "4-year Integrated Teacher Education Programme"],
      ["CTET / State TET", "CBSE / states", "Eligibility to teach in schools"],
      ["UGC-NET", "NTA", "Assistant Professor posts and research fellowships"]
    ],
    colleges: ["Regional Institutes of Education (NCERT)", "Jamia Millia Islamia", "Banaras Hindu University", "Lady Irwin College, Delhi", "Azim Premji University, Bengaluru", "TISS Mumbai"]
  },
  {
    id: "social", title: "Social Worker & Development Professional", emoji: "🌍", cluster: "People & Community",
    code: "SEA", b5: { A: 1, O: 0.5 },
    subjects: ["civics", "history", "psychology"], values: ["helping", "adventure"],
    streams: ["ANY"],
    summary: "Works with communities to fight poverty, improve health and education, and shape better policy.",
    day: "Visit communities, run programmes, measure impact, write reports and work with government and donors.",
    pay: "≈ ₹3–7 LPA to start; CSR and policy roles pay more",
    outlook: "Growing CSR spending and development work need skilled professionals.",
    skills: ["Empathy", "Communication", "Project management", "Research"],
    tryNow: ["Volunteer with an NGO for a weekend", "Pick a local problem and talk to the people affected", "Organise a donation drive"],
    path: {
      h: "Any stream; Humanities helps.",
      a: "CUET-UG for BA Social Work or related degrees.",
      c: "BSW/BA → MSW or MA Development (TISS, DSSW). IRMA for rural management.",
      j: "NGO programme officer, CSR manager, policy researcher or social entrepreneur."
    },
    exams: [
      ["CUET-UG", "NTA", "BA Social Work and social sciences"],
      ["CUET-PG", "NTA", "MSW/MA at TISS, DU and others"],
      ["CAT / XAT", "For IRMA", "Rural management at IRMA"]
    ],
    colleges: ["TISS Mumbai", "Delhi School of Social Work (DU)", "IRMA, Anand", "Azim Premji University, Bengaluru", "Madras School of Social Work", "Loyola College, Chennai"]
  },

  /* ---------------- Sports, Travel & Hospitality ---------------- */
  {
    id: "sports", title: "Sportsperson & Coach", emoji: "🏅", cluster: "Sports, Travel & Hospitality",
    code: "RES", b5: { C: 1, E: 0.5, S: 1 },
    subjects: ["sports"], values: ["fame", "adventure", "security"],
    streams: ["ANY"],
    summary: "Competes at the highest level, or coaches, trains and manages the next generation of athletes.",
    day: "Train twice a day, recover, study your game on video, travel for tournaments and keep up with studies.",
    pay: "Varies widely; sports-quota government jobs offer stability",
    outlook: "Khelo India and leagues in cricket, kabaddi, football and more have grown the opportunities.",
    skills: ["Fitness & skill", "Discipline", "Mental toughness", "Teamwork"],
    tryNow: ["Pick one sport and train 4 days a week", "Enter a district or inter-school tournament", "Keep a training diary"],
    path: {
      m: "Pick 1–2 sports and train consistently; play school and district tournaments.",
      s: "Move up to state-level competitions, and look at SAI centres and Khelo India talent programmes.",
      h: "Balance training and studies (NIOS is an option if needed) and compete at nationals.",
      a: "B.P.Ed or B.Sc Sports Science entrances, or turn professional. Sports quotas exist in colleges and jobs.",
      c: "Coaching diploma at NIS Patiala, or sports science, physiotherapy or sports management.",
      j: "Professional athlete, coach, fitness trainer, sports analyst or sports manager."
    },
    exams: [
      ["SAI selection trials", "Sports Authority of India", "Training at SAI centres"],
      ["LNIPE Entrance", "LNIPE Gwalior", "B.P.Ed and sports science"],
      ["NIS Coaching Diploma", "NSNIS Patiala", "Certified coaching"],
      ["Sports quota trials", "Universities, Railways, Services", "Admissions and jobs for athletes"]
    ],
    colleges: ["LNIPE, Gwalior", "NSNIS, Patiala", "National Sports University, Manipur", "Symbiosis School of Sports Sciences, Pune", "Tamil Nadu Physical Education & Sports University", "SAI / Khelo India centres"]
  },
  {
    id: "pilot", title: "Commercial Pilot", emoji: "✈️", cluster: "Sports, Travel & Hospitality",
    code: "RIE", b5: { C: 1, S: 1 },
    subjects: ["physics", "maths"], values: ["adventure", "money", "prestige"],
    streams: ["PCM"],
    summary: "Flies passengers or cargo safely across cities and continents.",
    day: "Check the weather and flight plan, run pre-flight checks, fly with your co-pilot, talk to air traffic control and land smoothly.",
    pay: "≈ ₹1–2 lakh/month as a First Officer; captains earn much more",
    outlook: "Indian aviation is growing fast, but training is expensive (often ₹40 lakh–₹1 crore).",
    skills: ["Physics & maths", "Calm decision making", "Multitasking", "Excellent health"],
    tryNow: ["Try a free flight simulator", "Learn the phonetic alphabet (Alpha, Bravo, Charlie…)", "Get a basic eye and health check-up"],
    path: {
      h: "PCM is needed (Physics and Maths in Class 12). Keep your health and eyesight in good shape.",
      a: "Get a DGCA Class 2, then Class 1, medical. Apply to flying schools (IGRUA entrance) or airline cadet programmes, or NDA for Air Force pilots.",
      c: "CPL training: DGCA ground exams + about 200 flying hours, then a type rating on an airliner.",
      j: "Join an airline as First Officer and become Captain with experience."
    },
    exams: [
      ["DGCA Medical (Class 2 & 1)", "DGCA-approved doctors", "Mandatory fitness check before training"],
      ["DGCA CPL exams", "DGCA", "Navigation, meteorology, regulations and technical subjects"],
      ["IGRUA Entrance", "IGRUA, Amethi", "India's premier government flying academy"],
      ["NDA / AFCAT", "For Air Force pilots", "Fighter, transport or helicopter flying"]
    ],
    colleges: ["IGRUA, Fursatganj (Amethi)", "National Flying Training Institute, Gondia", "Air Force Academy, Dundigal", "Bombay Flying Club", "Government Flying Training School, Bengaluru", "Airline cadet programmes"]
  },
  {
    id: "chef", title: "Chef & Hospitality Manager", emoji: "👨‍🍳", cluster: "Sports, Travel & Hospitality",
    code: "RAE", b5: { E: 0.5, C: 0.5, S: 0.5 },
    subjects: ["cooking", "art", "languages"], values: ["creativity", "adventure", "independence"],
    streams: ["ANY"],
    summary: "Creates amazing food and experiences in top hotels, restaurants, cruise ships or your own café.",
    day: "Plan the menu, prep ingredients, run a busy service, taste everything and train junior cooks.",
    pay: "≈ ₹2.5–5 LPA to start; grows fast in top hotels, cruise lines and abroad",
    outlook: "India's hospitality and food business is booming; cloud kitchens and cafés offer new routes.",
    skills: ["Cooking techniques", "Creativity", "Speed under pressure", "Teamwork & hygiene"],
    tryNow: ["Cook a full meal for your family", "Recreate a dish from another state", "Start a recipe journal with photos"],
    path: {
      h: "Any stream, with English. Cook at home often and learn basic food hygiene.",
      a: "NCHM JEE for IHMs (government hotel management institutes), plus private institute tests.",
      c: "B.Sc Hospitality & Hotel Administration (3–4 yrs) with industrial training in hotels.",
      j: "Commis chef → sous chef → executive chef, or hotel operations, or your own food business."
    },
    exams: [
      ["NCHM JEE", "NTA · April", "B.Sc Hospitality at IHMs across India"],
      ["Institute tests", "WGSHA Manipal, IIHM and others", "Private hotel management programmes"]
    ],
    colleges: ["IHM Pusa, New Delhi", "IHM Mumbai", "IHM Bengaluru", "IHM Kolkata", "WGSHA, Manipal", "Oberoi Centre of Learning & Development, Delhi"]
  },

  /* ---------------- Offbeat & emerging (v3) ----------------
     Lesser-known careers that students rarely hear about at school. */
  {
    id: "marine", title: "Marine Biologist & Ocean Scientist", emoji: "🐋", cluster: "Science & Nature", offbeat: true,
    code: "IRA", b5: { O: 1, C: 0.5 },
    subjects: ["biology", "chemistry", "geography"], values: ["discovery", "adventure", "helping"],
    streams: ["PCB", "PCM"],
    summary: "Studies whales, coral reefs, plankton and the ocean itself, and helps protect India's coasts and seas.",
    day: "Sail or dive out to collect samples, identify species under a microscope, analyse the data back at the lab and write up what you found.",
    pay: "≈ ₹3–7 LPA to start; research fellowships (JRF) pay a monthly stipend",
    outlook: "Ocean science is growing with India's Deep Ocean Mission, fisheries, climate research and coastal protection.",
    skills: ["Biology & ecology", "Swimming & field work", "Data analysis", "Scientific writing"],
    tryNow: ["Visit an aquarium or a beach and list every creature you spot", "Watch an ocean documentary and note 5 surprising facts", "Learn to swim confidently"],
    path: {
      h: "Take PCB (PCMB keeps more doors open). Keep Biology and Chemistry strong.",
      a: "CUET-UG for B.Sc Zoology, Marine Science or Fisheries, or the IISER Aptitude Test for a BS-MS in biology.",
      c: "B.Sc Zoology / Marine Science or B.F.Sc, then M.Sc Marine Biology. Join field trips, learn scuba diving and do a research internship.",
      j: "Research fellow, scientist at institutes like NIO or CMFRI, conservation NGO, or fisheries and aquaculture specialist."
    },
    exams: [
      ["CUET-UG", "NTA · May–June", "B.Sc Zoology, Marine Science and Fisheries at central universities"],
      ["IISER Aptitude Test (IAT)", "IISERs", "BS-MS programmes with a biology major"],
      ["CSIR-UGC NET / GATE", "After your master's", "Research fellowships (JRF) and PhD admissions"]
    ],
    colleges: ["CAS in Marine Biology, Annamalai University", "Cochin University of Science & Technology (CUSAT)", "Goa University", "Andhra University, Visakhapatnam", "Kerala University of Fisheries & Ocean Studies (KUFOS)", "IISERs (BS-MS)"]
  },
  {
    id: "forensic", title: "Forensic Scientist", emoji: "🕵️", cluster: "Law & Public Service", offbeat: true,
    code: "IRC", b5: { C: 1, S: 0.5, O: 0.5 },
    subjects: ["chemistry", "biology", "physics"], values: ["discovery", "helping", "security"],
    streams: ["PCB", "PCM"],
    summary: "Uses science to solve crimes: fingerprints, DNA, handwriting, poisons and digital evidence.",
    day: "Examine evidence from a crime scene, run DNA or chemical tests, write a careful report and sometimes explain your findings in court.",
    pay: "≈ ₹3–6 LPA to start; government forensic labs offer stable jobs",
    outlook: "Demand is rising: India's new criminal laws (2023) require forensic experts to visit the scene of serious crimes.",
    skills: ["Chemistry & biology", "Attention to detail", "Careful record-keeping", "Clear report writing"],
    tryNow: ["Lift fingerprints at home with cocoa powder and clear tape", "Read a Feluda or Sherlock Holmes story and list every clue", "Separate the colours in a felt-pen ink with paper chromatography"],
    path: {
      h: "PCB or PCM; Chemistry is the core subject.",
      a: "NFSU's admission test for its B.Sc–M.Sc Forensic Science, or CUET-UG for B.Sc Forensic Science at other universities.",
      c: "B.Sc–M.Sc Forensic Science (5-yr integrated) or B.Sc + M.Sc. Specialise in DNA, toxicology, ballistics, documents or cyber forensics.",
      j: "Scientific officer in a state forensic lab or CFSL, crime-scene expert, cyber-forensics analyst or private investigator."
    },
    exams: [
      ["NFSU admission test", "National Forensic Sciences University", "Integrated B.Sc–M.Sc Forensic Science and related programmes"],
      ["CUET-UG", "NTA", "B.Sc Forensic Science at central and other universities"],
      ["UPSC / State PSC / SSC recruitment", "After your degree", "Scientific officer posts in government forensic labs"]
    ],
    colleges: ["National Forensic Sciences University, Gandhinagar", "NFSU Delhi Campus", "Institute of Forensic Science, Mumbai", "Punjabi University, Patiala", "Dr. Harisingh Gour University, Sagar", "Amity Institute of Forensic Sciences, Noida"]
  },
  {
    id: "drone", title: "Drone Pilot & Drone Engineer", emoji: "🚁", cluster: "Engineering & Trades", offbeat: true,
    code: "RIC", b5: { C: 1, S: 0.5 },
    subjects: ["physics", "computers", "geography", "maths"], values: ["adventure", "independence", "discovery"],
    streams: ["ANY", "PCM"],
    summary: "Flies and builds drones that map land, spray crops, film movies, inspect bridges and deliver medicines.",
    day: "Plan a flight on a digital map, check the drone and the weather, fly a survey or a film shoot, then process the photos and data.",
    pay: "≈ ₹2.5–6 LPA to start; skilled survey, agri and film pilots can earn more per project",
    outlook: "Fast-growing: the Drone Rules 2021 and schemes like Drone Shakti and Namo Drone Didi are creating new jobs.",
    skills: ["Hand–eye coordination", "Maps & GPS", "Basic electronics", "Safety rules & discipline"],
    tryNow: ["Practise on a free drone flight simulator", "Find your school and home on a satellite map and measure the distance", "Build a simple circuit or a paper glider and test it"],
    path: {
      h: "Any stream works for the pilot route (you need Class 10 pass and age 18+). PCM opens the drone-engineering route.",
      a: "Train at a DGCA-authorised Remote Pilot Training Organisation (RPTO) for your Remote Pilot Certificate, or write JEE Main / state CETs for aerospace, electronics or mechatronics.",
      c: "A short RPC course, then specialise in surveying, agriculture or filming. Engineers do a B.Tech in Aerospace or Electronics and build drones.",
      j: "Drone pilot, GIS / survey analyst, agri-drone operator, aerial cinematographer, or drone design engineer at a startup."
    },
    exams: [
      ["DGCA Remote Pilot Certificate", "DGCA-authorised RPTOs · age 18+", "Your licence to fly drones commercially in India"],
      ["JEE Main / State CETs", "NTA / states", "B.Tech in aerospace, electronics or mechatronics"],
      ["Skill India drone courses", "Skill India / state skill missions", "Short courses in drone flying and repair"]
    ],
    colleges: ["DGCA-authorised RPTOs (listed on the DigitalSky portal)", "IIT Kanpur (Aerospace)", "IIT Bombay (Aerospace)", "Madras Institute of Technology, Anna University", "Punjab Engineering College, Chandigarh", "Manipal Institute of Technology"]
  },
  {
    id: "robotics", title: "Robotics Engineer", emoji: "🦾", cluster: "Engineering & Trades", offbeat: true,
    code: "RIC", b5: { O: 0.5, C: 1 },
    subjects: ["physics", "maths", "computers"], values: ["discovery", "creativity", "money"],
    streams: ["PCM"],
    summary: "Designs and programs robots that build cars, help surgeons, explore planets and run warehouses.",
    day: "Design a part in CAD, wire up sensors, write code to make the robot move, test it and fix whatever breaks.",
    pay: "≈ ₹4–10 LPA to start",
    outlook: "Factories, hospitals, farms and space missions are all adding robots and automation.",
    skills: ["Maths & physics", "Electronics & sensors", "Programming (Python, C++)", "Designing & building"],
    tryNow: ["Build a simple robot with an Arduino kit or at your school's Atal Tinkering Lab", "Enter a robotics contest like WRO or FIRST LEGO League", "Use block coding to make a robot or a sprite move"],
    path: {
      h: "PCM, with Computer Science if possible. Join robotics clubs and competitions.",
      a: "JEE Main / Advanced, BITSAT or state CETs for Robotics & AI, Mechatronics, Electronics or Mechanical.",
      c: "B.Tech in Robotics, Mechatronics, Electronics or Mechanical. Build robots in student teams (Robocon, rover and drone teams).",
      j: "Robotics or automation engineer, R&D in drones, EVs or medical devices, or start a robotics company."
    },
    exams: [
      ["JEE Main + Advanced", "NTA / IITs", "B.Tech at IITs, NITs and IIITs"],
      ["BITSAT", "BITS", "Electronics and mechanical programmes at BITS"],
      ["State CETs", "MHT CET, KCET, WBJEE…", "Robotics and mechatronics at state colleges"]
    ],
    colleges: ["IIT Kanpur", "IIT Madras", "IIT Bombay", "IIT Delhi", "IIIT Hyderabad", "Manipal Institute of Technology (Mechatronics)"]
  },
  {
    id: "climate", title: "Climate & Clean-Energy Specialist", emoji: "☀️", cluster: "Engineering & Trades", offbeat: true,
    code: "IRE", b5: { O: 1, C: 0.5 },
    subjects: ["physics", "geography", "maths", "economics"], values: ["helping", "discovery", "security"],
    streams: ["PCM", "ANY"],
    summary: "Builds a cleaner future with solar, wind, EVs and green cities, and helps communities cope with a changing climate.",
    day: "Design a solar plant or study energy data, visit a site, calculate carbon savings and explain the plan to clients or officials.",
    pay: "≈ ₹4–9 LPA to start",
    outlook: "One of the big job-creators of the next decade: India aims for 500 GW of non-fossil power capacity by 2030.",
    skills: ["Physics & maths", "Data & spreadsheets", "Understanding policy", "Explaining clearly"],
    tryNow: ["Do an energy audit at home: list every appliance and its watts", "Build a small solar-powered car or fan kit", "Track your family's electricity bill for 3 months and find ways to cut it"],
    path: {
      h: "PCM for clean-energy engineering; any stream works for climate policy and sustainability roles.",
      a: "JEE Main / Advanced or state CETs for Electrical, Mechanical or Energy Engineering; CUET-UG for Environmental Science, Geography or Economics.",
      c: "B.Tech in Electrical or Energy Engineering, or a B.Sc / BA in Environmental Science or Economics, then specialise in renewables or climate policy.",
      j: "Solar or wind project engineer, EV engineer, energy analyst, sustainability consultant or climate policy researcher."
    },
    exams: [
      ["JEE Main + Advanced", "NTA / IITs", "Electrical, mechanical and energy engineering"],
      ["State CETs", "States", "Engineering at state colleges"],
      ["CUET-UG", "NTA", "Environmental Science, Geography and Economics degrees"]
    ],
    colleges: ["IIT Bombay (Energy Science & Engineering)", "IIT Delhi", "TERI School of Advanced Studies, Delhi", "NIT Tiruchirappalli", "Pandit Deendayal Energy University, Gandhinagar", "Azim Premji University, Bengaluru"]
  },
  {
    id: "astro", title: "Astronomer & Space Scientist", emoji: "🔭", cluster: "Science & Nature", offbeat: true,
    code: "IRA", b5: { O: 1, C: 1 },
    subjects: ["physics", "maths", "computers"], values: ["discovery", "prestige", "adventure"],
    streams: ["PCM"],
    summary: "Studies stars, black holes and planets, and works on missions like Chandrayaan and Aditya-L1.",
    day: "Analyse telescope or satellite data with code, test a theory against what you observe, discuss ideas with your team and write a research paper.",
    pay: "PhD fellowships pay a monthly stipend; scientists at ISRO or research institutes earn ≈ ₹8–14 LPA to start",
    outlook: "India's space programme and private space startups are growing. It is competitive, so strong physics and coding matter.",
    skills: ["Physics & maths", "Coding (Python)", "Patience & curiosity", "Data analysis"],
    tryNow: ["Find the Moon, Jupiter and Orion on a clear night with a free sky-map app", "Visit a planetarium", "Join an online citizen-science project like Zooniverse"],
    path: {
      h: "PCM; Physics and Maths matter most. Try the astronomy Olympiad (NSEA, then INAO).",
      a: "JEE Advanced for IIST and the IITs, the IISER Aptitude Test, NEST for NISER / UM-DAE CEBS, or CUET-UG for B.Sc Physics.",
      c: "B.Sc, BS-MS or B.Tech in Physics or Engineering Physics, then an M.Sc and a PhD in astrophysics. Do summer projects at IUCAA, RRI or IIA.",
      j: "Researcher at ISRO, PRL, IUCAA or IIA, professor, or data scientist at a space startup."
    },
    exams: [
      ["JEE Advanced", "IITs", "IITs and IIST (Indian Institute of Space Science & Technology)"],
      ["IISER Aptitude Test (IAT)", "IISERs", "BS-MS in physics"],
      ["NEST", "NISER & UM-DAE CEBS", "Integrated M.Sc in physics"],
      ["JEST", "After graduation", "PhD admission at top research institutes"]
    ],
    colleges: ["IIST, Thiruvananthapuram", "IISc, Bengaluru", "IISERs (Pune, Mohali, Kolkata and others)", "NISER, Bhubaneswar", "IIT Bombay (Engineering Physics)", "IUCAA, Pune (research)"]
  },
  {
    id: "biotech", title: "Biotechnologist & Genetic Engineer", emoji: "🧬", cluster: "Science & Nature", offbeat: true,
    code: "IRC", b5: { O: 1, C: 1 },
    subjects: ["biology", "chemistry", "maths"], values: ["discovery", "helping", "money"],
    streams: ["PCB", "PCM"],
    summary: "Edits genes and engineers cells to make vaccines, medicines, hardier crops and green fuels.",
    day: "Run experiments with DNA and cells, analyse the results on a computer, read new research and plan the next experiment.",
    pay: "≈ ₹3–7 LPA to start; research and pharma roles grow with a master's or PhD",
    outlook: "India is a global vaccine hub, and gene editing and biomanufacturing (the BioE3 policy) are growing.",
    skills: ["Biology & chemistry", "Lab techniques", "Data & coding (bioinformatics)", "Patience"],
    tryNow: ["Extract DNA from a banana with salt, soap and rubbing alcohol", "Read how CRISPR gene editing works", "Grow two plants in different conditions and compare them for a month"],
    path: {
      h: "PCB or PCM (PCMB is ideal). Keep Biology and Chemistry strong.",
      a: "JEE Main / Advanced for B.Tech Biotechnology, the IISER Aptitude Test, or CUET-UG for B.Sc Biotechnology.",
      c: "B.Tech / B.Sc Biotechnology, then an M.Sc / M.Tech (through GAT-B) or a PhD. Do summer research at labs.",
      j: "Research scientist, biotech or pharma R&D, bioinformatics analyst, or biotech startup founder."
    },
    exams: [
      ["JEE Main + Advanced", "NTA / IITs", "B.Tech Biotechnology at IITs and NITs"],
      ["IISER Aptitude Test (IAT)", "IISERs", "BS-MS in biological sciences"],
      ["CUET-UG", "NTA", "B.Sc Biotechnology at central universities"],
      ["GAT-B", "NTA · after graduation", "M.Sc / M.Tech biotechnology with DBT support"]
    ],
    colleges: ["IIT Madras", "IIT Kharagpur", "IISc, Bengaluru", "IISERs", "JNU School of Biotechnology", "VIT, Vellore"]
  },
  {
    id: "foodsci", title: "Food Scientist & Flavour Creator", emoji: "🧁", cluster: "Science & Nature", offbeat: true,
    code: "IRA", b5: { O: 0.5, C: 1 },
    subjects: ["chemistry", "biology", "cooking"], values: ["creativity", "discovery", "security"],
    streams: ["PCB", "PCM"],
    summary: "Invents new foods and flavours, from millet snacks to ice-cream, and makes sure what we eat is safe and healthy.",
    day: "Test a new recipe in the lab, check samples for safety and shelf-life, run a taste panel and help the factory make it at scale.",
    pay: "≈ ₹3–7 LPA to start",
    outlook: "India's food-processing and nutrition industry is growing fast, and food-safety jobs are steady.",
    skills: ["Chemistry & biology", "Experimenting & tasting", "Food safety & hygiene", "Attention to detail"],
    tryNow: ["Run a kitchen experiment: what makes dough rise?", "Read and compare the labels on 3 snack packets", "Invent a healthy snack and ask your family to rate it"],
    path: {
      h: "PCM or PCB; Chemistry matters most.",
      a: "JEE Main for B.Tech Food Technology (including NIFTEM), state CETs, or CUET-UG for B.Sc / B.Tech food courses at agricultural universities.",
      c: "B.Tech Food Technology or B.Sc Food Science, then an M.Tech / M.Sc. Intern at food companies or at CSIR-CFTRI.",
      j: "Product developer, quality and safety officer, flavourist, nutrition scientist or food entrepreneur."
    },
    exams: [
      ["JEE Main", "NTA", "B.Tech Food Technology at NIFTEM and other institutes"],
      ["CUET-UG", "NTA", "B.Sc / B.Tech food courses, including ICAR agricultural universities"],
      ["State CETs", "MHT CET and others", "Food technology at state colleges like ICT Mumbai"]
    ],
    colleges: ["NIFTEM, Kundli (Haryana)", "NIFTEM, Thanjavur", "ICT Mumbai", "CSIR-CFTRI, Mysuru", "Anand Agricultural University", "Lady Irwin College, Delhi (Food & Nutrition)"]
  },
  {
    id: "wildlife", title: "Wildlife Biologist & Photographer", emoji: "📸", cluster: "Science & Nature", offbeat: true,
    code: "RIA", b5: { O: 1, S: 0.5, C: 0.5 },
    subjects: ["biology", "geography", "art"], values: ["adventure", "discovery", "helping"],
    streams: ["ANY", "PCB"],
    summary: "Tracks tigers, birds and elephants in the wild, photographs them and works to protect their homes.",
    day: "Wake before sunrise, set camera traps or count animals in a forest, log what you saw, and edit photos or data in the evening.",
    pay: "Varies widely; ≈ ₹3–6 LPA in research and conservation jobs to start",
    outlook: "Conservation, eco-tourism and nature media are growing; strong field skills and a portfolio stand out.",
    skills: ["Patience & fieldcraft", "Photography", "Biology & ecology", "Storytelling"],
    tryNow: ["Spot and photograph 10 birds near your home", "Join a nature walk or a bird count like the Great Backyard Bird Count", "Keep a nature journal for a month"],
    path: {
      h: "PCB is best for wildlife science; any stream works for photography and nature media.",
      a: "CUET-UG for B.Sc Zoology, Forestry or Environmental Science; later the WII or NCBS entrance for a master's.",
      c: "B.Sc Zoology, Forestry or Environmental Science, then an M.Sc in Wildlife Science. Volunteer on field projects and build a photo portfolio.",
      j: "Wildlife researcher, conservation officer at an NGO, naturalist, nature photographer or filmmaker, or Indian Forest Service."
    },
    exams: [
      ["CUET-UG", "NTA", "B.Sc Zoology, Forestry and Environmental Science"],
      ["WII / NCBS master's entrance", "After graduation", "M.Sc Wildlife Science and Wildlife Biology & Conservation"],
      ["UPSC Indian Forest Service", "After graduation", "Officer posts managing India's forests and wildlife"]
    ],
    colleges: ["Wildlife Institute of India, Dehradun", "NCBS, Bengaluru (M.Sc Wildlife)", "Forest Research Institute, Dehradun", "SACON, Coimbatore", "Pondicherry University (Ecology)", "Bombay Natural History Society (courses)"]
  },
  {
    id: "sound", title: "Sound Designer & Music Producer", emoji: "🎧", cluster: "Media & Performing Arts", offbeat: true,
    code: "ARI", b5: { O: 1, C: 0.5 },
    subjects: ["music", "computers", "physics"], values: ["creativity", "independence", "fame"],
    streams: ["ANY"],
    summary: "Creates the sound of films, games, podcasts and songs: recording, mixing and designing every beat and footstep.",
    day: "Record voices or instruments in the studio, add sound effects to a film scene, balance the mix and deliver the final track on deadline.",
    pay: "≈ ₹2.5–6 LPA to start; top film and music producers earn much more",
    outlook: "Streaming, podcasts, games and Indian cinema all need skilled sound people.",
    skills: ["A sharp ear", "Audio software (DAWs)", "Physics of sound", "Patience & teamwork"],
    tryNow: ["Record a podcast or song on your phone and edit it in free software like Audacity", "Re-create every sound in a 30-second film clip at home (foley)", "Make a beat in a free music app"],
    path: {
      h: "Any stream; Physics helps you understand acoustics. Keep learning an instrument or music theory.",
      a: "Entrance tests and auditions at audio and music schools; after graduation, the FTII / SRFTI JET for sound recording & design.",
      c: "A diploma or degree in audio engineering, music production or sound design. Assist in studios and build a showreel.",
      j: "Recording engineer, film sound designer, game audio designer, music producer or live-sound engineer."
    },
    exams: [
      ["Institute entrance & audition", "Whistling Woods, KM Conservatory and others", "Audio engineering and music production programmes"],
      ["JET (FTII & SRFTI)", "After graduation", "PG programme in Sound Recording & Sound Design"],
      ["Trinity / ABRSM grades", "Optional", "Graded music exams that strengthen your profile"]
    ],
    colleges: ["FTII, Pune", "SRFTI, Kolkata", "Whistling Woods International, Mumbai", "KM Music Conservatory, Chennai", "Studio internships and assistant roles"]
  },
  {
    id: "industrial", title: "Product & Toy Designer", emoji: "🧸", cluster: "Design & Creative", offbeat: true,
    code: "ARI", b5: { O: 1, C: 0.5 },
    subjects: ["art", "physics", "computers"], values: ["creativity", "independence", "money"],
    streams: ["ANY"],
    summary: "Designs the things we use and play with, from toys and water bottles to e-scooters and furniture.",
    day: "Sketch ideas, build quick models from cardboard or 3D prints, test them with real users and refine the design with engineers.",
    pay: "≈ ₹4–8 LPA to start",
    outlook: "Made-in-India manufacturing and the national push for Indian toys are creating new design jobs.",
    skills: ["Sketching", "Model-making & 3D design (CAD)", "Understanding users", "Problem solving"],
    tryNow: ["Redesign a toy or your school bag to make it better, and sketch it", "Build a working model out of cardboard", "Try free 3D design in Tinkercad"],
    path: {
      h: "Any stream; keep a sketchbook and practise drawing everyday objects.",
      a: "UCEED for B.Des at IITs, NID DAT, and other design entrance tests.",
      c: "B.Des in Industrial or Product Design (4 yrs). Build a portfolio and intern at design studios or manufacturers.",
      j: "Product designer, toy designer, furniture designer, automotive designer or your own product brand."
    },
    exams: [
      ["UCEED", "IIT Bombay · January", "B.Des at IITs and IIITDM Jabalpur"],
      ["NID DAT", "NID", "B.Des at NID campuses"],
      ["CEED", "IIT Bombay · after graduation", "M.Des at IITs and IISc"]
    ],
    colleges: ["NID Ahmedabad", "IIT Bombay (IDC School of Design)", "IIT Guwahati", "IIT Delhi", "IIITDM Jabalpur", "MIT Institute of Design, Pune"]
  },
  {
    id: "archaeologist", title: "Archaeologist & Museum Curator", emoji: "🏺", cluster: "Languages & Heritage", offbeat: true,
    code: "IRA", b5: { O: 1, C: 1 },
    subjects: ["history", "geography", "art"], values: ["discovery", "adventure", "creativity"],
    streams: ["HUM", "ANY"],
    summary: "Digs up and decodes the past, from Harappan cities to old temples, and brings it to life in museums.",
    day: "Excavate a site layer by layer, label every find, study old scripts and objects in the lab and plan a museum display.",
    pay: "≈ ₹3–6 LPA to start; government heritage and museum posts offer job security",
    outlook: "A small but steady field; heritage tourism, museums and digital archives are growing.",
    skills: ["History & reading", "Careful field work", "Drawing & photography", "Research & writing"],
    tryNow: ["Visit a museum or heritage site and sketch 3 objects", "Interview a grandparent about an old family object", "Read about Dholavira or Rakhigarhi"],
    path: {
      h: "Humanities with History and Geography is ideal; any stream is allowed.",
      a: "CUET-UG for BA History or Ancient Indian History; later CUET-PG or university tests for MA Archaeology.",
      c: "BA History, then an MA in Archaeology or Museology or a PG Diploma in Archaeology. Volunteer on excavations.",
      j: "Archaeologist with the ASI or state departments, museum curator, heritage conservator, researcher or professor."
    },
    exams: [
      ["CUET-UG", "NTA", "BA History and Archaeology at central universities"],
      ["CUET-PG / university tests", "After graduation", "MA Archaeology and Museology"],
      ["UGC-NET", "After your master's", "Lectureship and research fellowships"]
    ],
    colleges: ["Deccan College, Pune", "M.S. University of Baroda", "Banaras Hindu University", "University of Delhi", "University of Calcutta", "Indian Institute of Heritage, Noida"]
  },
  {
    id: "linguist", title: "Linguist, Translator & Interpreter", emoji: "🗣️", cluster: "Languages & Heritage", offbeat: true,
    code: "AIS", b5: { O: 1, A: 0.5, C: 0.5 },
    subjects: ["languages", "history", "psychology"], values: ["discovery", "adventure", "independence"],
    streams: ["ANY"],
    summary: "Masters languages to translate books, interpret for diplomats, subtitle films and teach AI to understand Indian languages.",
    day: "Translate a document or film subtitles, interpret live at a meeting, research how a word is used, or prepare language data for an AI team.",
    pay: "≈ ₹3–7 LPA to start; skilled interpreters in in-demand languages earn well",
    outlook: "Demand is rising from Indian-language tech (like Bhashini), tourism, embassies and global companies.",
    skills: ["Fluency in 2–3 languages", "Reading & writing", "Cultural awareness", "Listening & focus"],
    tryNow: ["Learn 20 words of a new language with a free app", "Translate a short poem or song between two languages you know", "Watch a film with subtitles and notice how jokes get translated"],
    path: {
      h: "Any stream; take a foreign or classical language if your school offers one.",
      a: "CUET-UG for a BA in a foreign language or Linguistics at JNU, DU, EFLU and others.",
      c: "BA / MA in a language or Linguistics; add certificates like DELF (French), Goethe (German) or JLPT (Japanese).",
      j: "Translator, interpreter, subtitler, language teacher, computational linguist for AI, or embassy and foreign-service roles."
    },
    exams: [
      ["CUET-UG", "NTA", "BA foreign languages at JNU, DU, EFLU and more"],
      ["Language certificates", "DELF, Goethe, JLPT, HSK…", "Internationally recognised proof of your level"],
      ["UPSC Civil Services (IFS)", "After graduation", "A career as a diplomat"]
    ],
    colleges: ["JNU, New Delhi (School of Languages)", "EFLU, Hyderabad", "University of Delhi", "Banaras Hindu University", "University of Mumbai", "Central Institute of Indian Languages, Mysuru"]
  }
];
