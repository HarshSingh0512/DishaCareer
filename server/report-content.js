/* Paid Full Report content. It is served only to signed-in users who own the
   report (GET /api/report), so free users never download it. The browser combines
   it with the student's own scores to build the report.
   Plan tokens {career}, {skill} and {try} are filled in by the browser from the
   student's top career. */
export const REPORT_CONTENT = {
  version: 1,

  // Holland RIASEC interest types.
  types: {
    R: {
      strengths: ["You learn fastest by doing, building and fixing.", "You stay practical when others get stuck in theory.", "You're at ease with tools, machines, nature and physical challenges."],
      environments: "Labs, workshops, field sites, the outdoors, sports grounds, hospitals and factories: places where your work produces something you can see and touch.",
      watchOut: "Purely desk-bound, theory-heavy work can feel draining. Choose courses with practicals, projects and internships.",
      grow: ["Join a robotics, maker or science-practical club.", "Take on one hands-on project every term: repair, build, grow or cook something.", "Try a workshop or summer internship to test what the real work feels like."]
    },
    I: {
      strengths: ["You ask \"why?\" and keep going until you understand.", "You're good at spotting patterns and solving problems.", "You can focus deeply on a hard question."],
      environments: "Research labs, tech teams, hospitals, universities and data teams: places that reward careful thinking.",
      watchOut: "You may over-research and delay decisions. Set yourself deadlines, and practise explaining your ideas simply.",
      grow: ["Enter an Olympiad or a science fair.", "Read one long article or book chapter a week on a topic you love.", "Learn basic coding or statistics; they boost almost every investigative career."]
    },
    A: {
      strengths: ["You see original ideas where others see the usual.", "You express yourself through words, visuals, sound or movement.", "You care about how things look, feel and sound."],
      environments: "Studios, agencies, media houses, design teams, theatres and startups: flexible places that value originality.",
      watchOut: "Creative careers reward portfolios more than marks. Start one early, and learn the business side too: clients, pricing and deadlines.",
      grow: ["Keep a portfolio and add your best piece every month.", "Learn one professional tool: Figma, Canva, Blender, a music app or a video editor.", "Share your work or enter competitions to get honest feedback."]
    },
    S: {
      strengths: ["People trust you and open up to you.", "You explain things patiently and kindly.", "You notice when someone needs help."],
      environments: "Schools, hospitals, NGOs, counselling centres, HR teams and community programmes: places built around people.",
      watchOut: "Caring careers can be emotionally tiring. Learn to set boundaries and look after your own wellbeing too.",
      grow: ["Tutor a younger student or volunteer every week.", "Take a first-aid or peer-support course.", "Practise active listening: sum up what someone said before you reply."]
    },
    E: {
      strengths: ["You take charge and get people moving.", "You're persuasive and comfortable speaking up.", "You enjoy goals, competition and making things happen."],
      environments: "Startups, sales and marketing teams, law, public life, management and your own business: fast places with targets and influence.",
      watchOut: "Big energy can turn into rushing. Pair your drive with planning, and listen before you decide.",
      grow: ["Lead a club, event or fundraiser at school.", "Join debate, MUN or a business-plan competition.", "Start a tiny side business and track every rupee."]
    },
    C: {
      strengths: ["You're accurate, organised and reliable.", "You like clear systems and make them work better.", "You finish what you start."],
      environments: "Finance, accounting, banking, government offices, operations and data teams: structured places where accuracy matters.",
      watchOut: "Fast-changing, unstructured work can feel stressful. Practise adapting, and pair your precision with creative problem-solving.",
      grow: ["Learn spreadsheets properly: formulas, charts and pivot tables.", "Manage the budget or records for a club or family event.", "Try a beginner course in accounting, coding or data analysis."]
    }
  },

  // Big Five traits; index 0 = low, 1 = middle, 2 = high (same bands as the free results).
  traits: {
    O: [
      { study: "Proven methods suit you: past papers, clear notes and steady revision.", work: "You'll do well in roles with clear, practical goals and established ways of working." },
      { study: "Mix routine revision with the odd creative project to stay engaged.", work: "You handle both structured and open-ended work, which keeps many doors open." },
      { study: "Link topics to big ideas and real-world questions; mind maps and explaining to others help you.", work: "You'll thrive where new ideas are valued: research, design, media, strategy and startups." }
    ],
    C: [
      { study: "Short timed bursts (25 minutes on, 5 off) and a visible checklist work better for you than long plans.", work: "Look for varied, flexible work, and build simple habits so deadlines don't sneak up on you." },
      { study: "A weekly plan with a little slack works best for you.", work: "You're reliable when it matters; strengthen this before board and entrance exams." },
      { study: "Your planning is a superpower in exam prep; just protect time to rest.", work: "Careers with long preparation, like medicine, CA, civil services and research, reward your discipline." }
    ],
    E: [
      { study: "You probably learn best alone or one-to-one; quiet, focused sessions suit you.", work: "Roles that need deep focus, like research, coding, writing, design and analysis, fit your energy." },
      { study: "Combine solo study with occasional group revision.", work: "You work well both in teams and alone, so most work styles are open to you." },
      { study: "Study groups, teaching others and discussion help you remember.", work: "People-facing roles in teaching, sales, law, management, media and healthcare will energise you." }
    ],
    A: [
      { study: "Competition motivates you; use rankings and personal challenges.", work: "You can make tough calls and negotiate; law, business and leadership roles value this." },
      { study: "You balance teamwork and independence well.", work: "You can collaborate and still stand your ground, which helps in almost any team." },
      { study: "Group projects and helping classmates bring out your best.", work: "Caring, team-centred careers in healthcare, teaching, counselling and social work fit you naturally." }
    ],
    S: [
      { study: "Build a calm-down routine for exams: proper sleep, short breaks and someone you trust to talk to.", work: "Look for supportive teams and manageable pressure; habits like mindfulness make a real difference." },
      { study: "You handle most pressure; plan ahead for exam season to stay steady.", work: "You cope with normal workplace stress well." },
      { study: "You stay steady under pressure, a big advantage in entrance exams.", work: "High-pressure careers in medicine, aviation, defence, finance and emergency services suit your calm." }
    ]
  },

  aptitude: {
    num: {
      means: "Comfort with numbers, percentages and quick estimates. Used in engineering, finance, data, science and business.",
      practice: ["Do 10 mental-maths questions a day: percentages, fractions and ratios.", "Track your family's monthly budget in a spreadsheet.", "Try the quantitative section of a past Olympiad or CUET general test paper."]
    },
    verb: {
      means: "Understanding and using language precisely. Key for law, journalism, civil services, teaching, psychology and management.",
      practice: ["Read one newspaper editorial a day and sum it up in three lines.", "Learn five new words a week and use them in sentences.", "Join debate, or write one short blog post a month."]
    },
    log: {
      means: "Spotting patterns and reasoning step by step. The core of coding, research, law and medicine.",
      practice: ["Solve puzzles: Sudoku, logic grids or chess problems.", "Try beginner coding challenges.", "Practise CLAT- or CUET-style logical reasoning questions."]
    },
    spat: {
      means: "Picturing shapes, space and movement in your head. Used by architects, designers, engineers, pilots, surgeons and athletes.",
      practice: ["Sketch everyday objects from different angles.", "Build models with LEGO, origami or free 3D tools like Tinkercad.", "Play spatial games like Tetris, or read maps on walks and trips."]
    }
  },

  streams: {
    PCM: {
      who: "Students who enjoy maths and physics problem-solving.",
      subjects: "Physics, Chemistry and Maths; add Computer Science or Informatics Practices if your school offers it.",
      myth: "Myth: PCM is only for engineering. In fact it also leads to architecture, data science, economics, defence, pilot training and the pure sciences."
    },
    PCB: {
      who: "Students curious about living things, health and the environment.",
      subjects: "Physics, Chemistry and Biology; add Maths (PCMB) to keep engineering and data routes open.",
      myth: "Myth: PCB means MBBS or nothing. In fact biotech, psychology, nursing, pharmacy, veterinary science, forensics, marine and food science all start here."
    },
    COM: {
      who: "Students who like numbers, money and how businesses work.",
      subjects: "Accountancy, Business Studies and Economics; take Maths if you can, as it opens CA, finance, economics and data careers.",
      myth: "Myth: commerce is for students who \"couldn't get science\". In fact CA, investment banking, economics and entrepreneurship are among the best-paid paths."
    },
    HUM: {
      who: "Students who love reading, writing, people, society and ideas.",
      subjects: "History, Political Science, Economics, Psychology, Sociology, Geography and English; add Maths for economics.",
      myth: "Myth: arts has no scope. In fact law, civil services, psychology, design, journalism, economics and policy are strong, growing careers."
    },
    ANY: {
      who: "Your top careers are open to every stream.",
      subjects: "Choose subjects you genuinely enjoy and score well in, and build career skills on the side.",
      myth: "Myth: your stream locks your future. In fact many careers, including law, design, management, media and civil services, accept any stream."
    }
  },

  // Six steps, one per month, by stage (m Class 6–8, s 9–10, h 11–12, c college).
  plans: {
    m: [
      "Explore your top career, {career}: watch two \"day in the life\" videos and note what excites you.",
      "Try this: {try}",
      "Join or start a club linked to your interests: science, art, coding, debate or sport.",
      "Read about two careers in your top 10 that you had never heard of.",
      "Start building one skill: {skill}. Practise for 20 minutes, three times a week.",
      "Retake the Disha quiz and compare: what changed, and what stayed the same?"
    ],
    s: [
      "Go through this report with your parents and agree on 2–3 careers to explore.",
      "Talk to someone who works as a {career} (a relative, an alumnus or someone on LinkedIn) and ask about their day.",
      "Check which stream your top careers need, and ask your school about subject options.",
      "Try this: {try}",
      "Start building {skill}, and take one Olympiad or competition.",
      "Finalise your Class 11 stream and subjects, with a backup plan."
    ],
    h: [
      "List the entrance exams for your top 3 careers and note their registration months.",
      "Make a weekly study plan that balances board exams and entrance preparation.",
      "Take a full-length mock test for your main exam and review every mistake.",
      "Shortlist 8–10 colleges (dream, target and safe) and check their cut-offs and fees.",
      "Build {skill} through a small project you can show in interviews or a portfolio.",
      "Apply for the scholarships you're eligible for, starting with scholarships.gov.in."
    ],
    c: [
      "Map the gap: what does a {career} need that your degree doesn't teach?",
      "Start a project or a certificate course in {skill}.",
      "Update your resume and LinkedIn, and ask a senior to review them.",
      "Apply for 10 internships or part-time roles linked to {career}.",
      "Try this: {try}",
      "Decide your next step (a job, higher studies or a switch) and list the exams or applications it needs."
    ]
  },

  parents: {
    starters: [
      "What did you enjoy most about the quiz, and did anything surprise you?",
      "Which of these careers would you love to try for a day?",
      "What worries you about choosing a stream or a career?",
      "Who do we know who works in one of these fields?",
      "What is one small thing we can try together this month?"
    ],
    dos: [
      "Ask questions before giving your opinion.",
      "Praise effort and curiosity, not only marks.",
      "Arrange real exposure: visits, short internships and conversations with professionals.",
      "Keep options open; interests often change in the teenage years."
    ],
    donts: [
      "Compare your child with siblings, cousins or classmates.",
      "Rule out a career just because it is unfamiliar; many newer careers are well paid.",
      "Treat this report as a final verdict. It is a starting point.",
      "Make the decision alone. Decide together."
    ],
    byStage: {
      m: "This is the time to explore. Support hobbies and clubs, and avoid pushing a fixed career.",
      s: "The stream choice is coming. Use this report to discuss options, and look at the careers each stream opens, not only marks.",
      h: "Help with structure: an exam calendar, a calm study space and realistic backup options. Watch for signs of exam stress.",
      c: "Support internships and skill-building, and remember that a first job or course is a step, not a final destination."
    }
  }
};
