/* Disha question bank.
   Interests use Holland's RIASEC model (R Realistic, I Investigative, A Artistic,
   S Social, E Enterprising, C Conventional). Personality uses the public-domain
   Mini-IPIP Big Five items (Donnellan et al., 2006), lightly reworded for students.
   Trait keys: O imagination, C discipline, E social energy, A kindness, S calmness
   (S is the reverse of "neuroticism"). r: 1 marks a reverse-scored item. */
window.QUIZ = {
  types: {
    R: { name: "Realistic", noun: "Builder", adj: "Hands-on", emoji: "🛠️",
      desc: "You like real, practical things: tools, machines, nature and sport. You learn best by doing.",
      short: "a practical, hands-on streak" },
    I: { name: "Investigative", noun: "Thinker", adj: "Curious", emoji: "🔬",
      desc: "You love figuring out how and why things work: puzzles, science and big ideas.",
      short: "a curious, analytical mind" },
    A: { name: "Artistic", noun: "Creator", adj: "Creative", emoji: "🎨",
      desc: "You think in colours, stories, sounds and designs, and you need freedom to express yourself.",
      short: "a strong creative side" },
    S: { name: "Social", noun: "Helper", adj: "Caring", emoji: "🤝",
      desc: "You're energised by people: teaching, helping, healing and supporting others.",
      short: "a big heart for people" },
    E: { name: "Enterprising", noun: "Leader", adj: "Bold", emoji: "🚀",
      desc: "You like to lead, persuade, compete and make things happen.",
      short: "bold, go-getter energy" },
    C: { name: "Conventional", noun: "Organiser", adj: "Precise", emoji: "📋",
      desc: "You like order, accuracy and clear systems: numbers, data and well-made plans.",
      short: "a precise, organised approach" }
  },

  traits: {
    O: { name: "Imagination", emoji: "🌈",
      tags: ["Down-to-earth", "Balanced", "Big imagination"],
      text: ["You like practical, proven ways of doing things.",
        "You enjoy new ideas but stay practical.",
        "You love new ideas, art and 'what if?' questions."] },
    C: { name: "Discipline", emoji: "🎯",
      tags: ["Go-with-the-flow", "Balanced", "Super organised"],
      text: ["You're flexible and spontaneous. Routines may take a little extra effort.",
        "You can be organised when it matters.",
        "You plan ahead, finish what you start and like things in order."] },
    E: { name: "Social energy", emoji: "⚡",
      tags: ["Quiet recharger", "Ambivert", "People-powered"],
      text: ["You recharge with quiet time and can focus deeply.",
        "You enjoy people and also value your own space.",
        "You get energy from people, action and conversation."] },
    A: { name: "Kindness", emoji: "💛",
      tags: ["Straight-talker", "Balanced", "Big-hearted"],
      text: ["You're direct and competitive, and you speak your mind.",
        "You're kind but can stand your ground.",
        "You're warm, caring and a natural team player."] },
    S: { name: "Calmness", emoji: "🧘",
      tags: ["Deep feeler", "Balanced", "Cool under pressure"],
      text: ["You feel things deeply. Building stress-busting habits will be your superpower.",
        "You handle most stress well.",
        "You stay steady and calm when things get tough."] }
  },

  chapters: [
    {
      id: "tt", kind: "tt", title: "This or That", emoji: "⚡", badge: "Quick Draw",
      intro: "Go with your gut. Which would you rather do?",
      blurb: "12 quick picks between two activities",
      items: [
        [{ x: "Fix a broken bicycle", e: "🚲", t: "R" }, { x: "Find out why the sky is blue", e: "🔭", t: "I" }],
        [{ x: "Pitch an idea to your principal", e: "🎤", t: "E" }, { x: "Design a poster for a cause", e: "🖌️", t: "A" }],
        [{ x: "Calm down two friends who are fighting", e: "🕊️", t: "S" }, { x: "Keep the class fund accounts", e: "🧮", t: "C" }],
        [{ x: "Write a short story", e: "✍️", t: "A" }, { x: "Crack a tricky maths puzzle", e: "🧩", t: "I" }],
        [{ x: "Grow a vegetable garden", e: "🌱", t: "R" }, { x: "Teach a younger kid to read", e: "📖", t: "S" }],
        [{ x: "Keep track of the club's money", e: "💰", t: "C" }, { x: "Convince people to join your club", e: "📣", t: "E" }],
        [{ x: "Do a science experiment", e: "🧪", t: "I" }, { x: "Help a friend through a tough day", e: "🤗", t: "S" }],
        [{ x: "Paint a giant wall mural", e: "🎨", t: "A" }, { x: "Build a treehouse", e: "🪵", t: "R" }],
        [{ x: "Plan the perfect study timetable", e: "🗓️", t: "C" }, { x: "Compose a song", e: "🎵", t: "A" }],
        [{ x: "Repair a gadget at home", e: "🔧", t: "R" }, { x: "Run a stall at the school fair", e: "🏪", t: "E" }],
        [{ x: "Solve a mystery like a detective", e: "🕵️", t: "I" }, { x: "Organise a messy library shelf", e: "📚", t: "C" }],
        [{ x: "Captain the school team", e: "🏏", t: "E" }, { x: "Volunteer at an animal shelter", e: "🐶", t: "S" }]
      ]
    },
    {
      id: "rate", kind: "rate", title: "Rate the Vibe", emoji: "🎚️", badge: "Vibe Checker",
      intro: "How would you feel doing this?",
      blurb: "Rate 18 activities from 😖 to 🤩",
      items: [
        { x: "Put together a model kit or a piece of furniture", e: "🧩", t: "R" },
        { x: "Read about how the human brain works", e: "🧠", t: "I" },
        { x: "Act in a play or make a short film", e: "🎭", t: "A" },
        { x: "Look after someone who is sick or hurt", e: "🩹", t: "S" },
        { x: "Lead a team to win a competition", e: "🏆", t: "E" },
        { x: "Keep neat records and lists", e: "🗂️", t: "C" },
        { x: "Work outdoors on a farm or in a forest", e: "🌲", t: "R" },
        { x: "Write code to solve a problem", e: "👩‍💻", t: "I" },
        { x: "Design clothes, logos or rooms", e: "✏️", t: "A" },
        { x: "Explain a tough topic to a classmate", e: "🧑‍🏫", t: "S" },
        { x: "Sell a product or an idea to people", e: "🛍️", t: "E" },
        { x: "Work with numbers in a spreadsheet", e: "📊", t: "C" },
        { x: "Fly a drone or operate a machine", e: "🚁", t: "R" },
        { x: "Analyse data to find hidden patterns", e: "📈", t: "I" },
        { x: "Play an instrument or sing", e: "🎸", t: "A" },
        { x: "Listen to someone's problems and give advice", e: "💬", t: "S" },
        { x: "Debate and argue for your side", e: "🎙️", t: "E" },
        { x: "Check a document carefully for mistakes", e: "🔎", t: "C" }
      ]
    },
    {
      id: "likert", kind: "likert", title: "Mirror, Mirror", emoji: "🪞", badge: "Self-Aware",
      intro: "How true is this about you? There are no right answers.",
      blurb: "20 statements about who you are",
      items: [
        { x: "I'm usually the one who gets the fun started in a group.", k: "E" },
        { x: "I care about how other people feel.", k: "A" },
        { x: "I finish my chores and homework right away.", k: "C" },
        { x: "My mood changes a lot during the day.", k: "S", r: 1 },
        { x: "I have a vivid imagination.", k: "O" },
        { x: "I don't talk a lot.", k: "E", r: 1 },
        { x: "Other people's problems don't really interest me.", k: "A", r: 1 },
        { x: "I often forget to put things back in their place.", k: "C", r: 1 },
        { x: "I'm relaxed most of the time.", k: "S" },
        { x: "Big questions like 'what is time?' don't interest me.", k: "O", r: 1 },
        { x: "I talk to lots of different people at events and functions.", k: "E" },
        { x: "I can sense what others are feeling.", k: "A" },
        { x: "I like things neat and in order.", k: "C" },
        { x: "I get upset easily.", k: "S", r: 1 },
        { x: "I find it hard to understand abstract ideas.", k: "O", r: 1 },
        { x: "I prefer to stay in the background.", k: "E", r: 1 },
        { x: "I'm not really interested in others.", k: "A", r: 1 },
        { x: "I tend to make a mess of things.", k: "C", r: 1 },
        { x: "I rarely feel low or sad.", k: "S" },
        { x: "I'm not very imaginative.", k: "O", r: 1 }
      ]
    },
    {
      id: "scen", kind: "scen", title: "What Would You Do?", emoji: "🎬", badge: "Decision Maker",
      intro: "Pick what you'd most likely do.",
      blurb: "6 real-life situations",
      items: [
        { x: "Your school fest needs volunteers. You sign up to…", e: "🎪", o: [
          { x: "Set up the stage, sound and lights", e: "🔌", t: "R" },
          { x: "Design the posters and decorations", e: "🖌️", t: "A" },
          { x: "Handle tickets and the budget", e: "🧾", t: "C" },
          { x: "Find sponsors and hype it up", e: "📣", t: "E" }] },
        { x: "A new student looks lost on their first day. You…", e: "🏫", o: [
          { x: "Show them around and introduce your friends", e: "🤗", t: "S" },
          { x: "Explain the timetable and school rules", e: "🗓️", t: "C" },
          { x: "Ask curious questions about their old city", e: "❓", t: "I" },
          { x: "Invite them to join your team or club", e: "🙌", t: "E" }] },
        { x: "You get ₹5,000 for any project you like. You…", e: "💰", o: [
          { x: "Buy parts and build a robot", e: "🤖", t: "R" },
          { x: "Get a microscope or a science kit", e: "🔬", t: "I" },
          { x: "Buy art supplies or a camera", e: "📷", t: "A" },
          { x: "Start a mini business and double it", e: "💸", t: "E" }] },
        { x: "It's a free Saturday! You'd most likely…", e: "🌤️", o: [
          { x: "Play a sport or go trekking", e: "🥾", t: "R" },
          { x: "Watch a documentary or solve puzzles", e: "🧠", t: "I" },
          { x: "Make music, draw or edit videos", e: "🎧", t: "A" },
          { x: "Volunteer or help someone at home", e: "🫶", t: "S" }] },
        { x: "In a group project, you naturally become…", e: "👥", o: [
          { x: "The leader who divides the work", e: "👑", t: "E" },
          { x: "The planner who tracks deadlines", e: "✅", t: "C" },
          { x: "The researcher who finds the facts", e: "📚", t: "I" },
          { x: "The peacemaker who keeps everyone happy", e: "☮️", t: "S" }] },
        { x: "Your phone suddenly stops working. You…", e: "📱", o: [
          { x: "Open it up and try to fix it", e: "🪛", t: "R" },
          { x: "Ask a friend who's good with phones to help", e: "🤝", t: "S" },
          { x: "Compare repair options and prices", e: "📊", t: "C" },
          { x: "Enjoy the break: sketch, write or jam", e: "✏️", t: "A" }] }
      ]
    },
    {
      id: "subj", kind: "subj", title: "Your Subjects", emoji: "📚", badge: "Subject Star",
      intro: "For each subject: how much do you enjoy it, and what marks do you usually get? Be honest, it's just for you.",
      blurb: "How much you enjoy your subjects and how you score"
    },
    {
      id: "fav", kind: "fav", title: "Your Favourites", emoji: "💖", badge: "Pathfinder",
      intro: "Last step! What do you love doing outside class, and what matters to you?",
      blurb: "What you love outside class and what matters to you"
    }
  ],

  /* School subjects for the "Your Subjects" chapter. `maps` links each one to
     the subject keys careers use (CAREER_META.subjects). */
  schoolSubjects: {
    maths: { label: "Maths", emoji: "➗", maps: ["maths"] },
    science: { label: "Science", emoji: "🔬", maps: ["physics", "chemistry", "biology"] },
    physics: { label: "Physics", emoji: "⚛️", maps: ["physics"] },
    chemistry: { label: "Chemistry", emoji: "⚗️", maps: ["chemistry"] },
    biology: { label: "Biology", emoji: "🧬", maps: ["biology"] },
    english: { label: "English", emoji: "📖", maps: ["languages"] },
    lang2: { label: "Hindi / second language", emoji: "🗣️", maps: ["languages"] },
    social: { label: "Social Science", emoji: "🌍", maps: ["history", "geography", "civics", "economics"] },
    history: { label: "History", emoji: "🏺", maps: ["history"] },
    civics: { label: "Political Science / Civics", emoji: "🏛️", maps: ["civics"] },
    geography: { label: "Geography", emoji: "🗺️", maps: ["geography"] },
    economics: { label: "Economics", emoji: "📈", maps: ["economics"] },
    computers: { label: "Computer Science / IT", emoji: "💻", maps: ["computers"] },
    accounts: { label: "Accountancy", emoji: "🧮", maps: ["accounts"] },
    business: { label: "Business Studies", emoji: "💼", maps: ["accounts", "economics"] },
    psychology: { label: "Psychology", emoji: "🧠", maps: ["psychology"] },
    sociology: { label: "Sociology", emoji: "👥", maps: ["psychology", "civics"] },
    pe: { label: "Physical Education", emoji: "⚽", maps: ["sports"] },
    fineart: { label: "Fine Arts / Painting", emoji: "🎨", maps: ["art"] },
    music: { label: "Music", emoji: "🎵", maps: ["music"] },
    homesci: { label: "Home Science", emoji: "🍳", maps: ["cooking", "biology"] }
  },

  /* Which subjects to ask about. Class 6–8 (m), 9–10 (s) and college (c) by
     stage; Class 11–12 by stream. Optional subjects are asked only if the
     student says they take them. */
  subjectSets: {
    m: { core: ["maths", "science", "english", "lang2", "social", "computers"], optional: [] },
    s: { core: ["maths", "physics", "chemistry", "biology", "english", "lang2", "history", "geography", "civics", "economics"], optional: ["computers"] },
    PCM: { core: ["physics", "chemistry", "maths", "english"], optional: ["computers", "economics", "pe", "fineart"] },
    PCB: { core: ["physics", "chemistry", "biology", "english"], optional: ["maths", "psychology", "pe", "homesci"] },
    PCMB: { core: ["physics", "chemistry", "maths", "biology", "english"], optional: ["computers", "pe"] },
    COM: { core: ["accounts", "business", "economics", "english"], optional: ["maths", "computers", "pe"] },
    HUM: { core: ["history", "civics", "geography", "economics", "english"], optional: ["psychology", "sociology", "maths", "fineart", "music", "lang2"] },
    c: { core: ["maths", "physics", "chemistry", "biology", "english", "history", "economics", "computers"], optional: ["accounts", "psychology", "civics", "geography"] }
  },

  marksScale: ["Below 50%", "50–70%", "70–85%", "85%+"],

  /* "Outside class" interests on the Favourites page (k = CAREER_META.subjects key). */
  hobbies: [
    { k: "art", label: "Drawing & art", emoji: "🎨" },
    { k: "music", label: "Music & dance", emoji: "🎵" },
    { k: "sports", label: "Sports & fitness", emoji: "⚽" },
    { k: "cooking", label: "Cooking & baking", emoji: "🍳" },
    { k: "computers", label: "Coding & gadgets", emoji: "💻" },
    { k: "languages", label: "Reading & writing", emoji: "📖" }
  ],

  rateScale: [
    { e: "😖", x: "Nope" },
    { e: "😐", x: "Meh" },
    { e: "🙂", x: "Okay" },
    { e: "😄", x: "Like it" },
    { e: "🤩", x: "Love it" }
  ],

  likertScale: ["Not me at all", "Not really", "Neutral", "Kind of me", "Totally me"],

  facts: [
    "Holland's RIASEC model, which this quiz uses, has been studied for over 60 years and is used by career services around the world.",
    "Research links a good fit between your interests and your work to higher job satisfaction and better performance.",
    "Jobs like data scientist, UX designer and drone pilot barely existed 20 years ago. Your future job might not exist yet either!",
    "Most people change roles several times in their working life. Your first choice is a starting point, not a life sentence.",
    "NID Ahmedabad, set up in 1961, was India's first national design school.",
    "With CLAT you can join a 5-year law degree straight after Class 12, with no graduation needed.",
    "Over 20 lakh students write NEET-UG every year. Knowing your own 'why' matters more than following the crowd.",
    "India has 1,000+ universities. IITs and AIIMS are famous, but great careers start in many places."
  ]
};
