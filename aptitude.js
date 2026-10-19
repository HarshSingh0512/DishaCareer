/* Disha aptitude challenge: an optional sixth dimension.
   16 short puzzles across four aptitudes (4 each), shown interleaved.
   a      index of the correct option
   why    one-line explanation shown after answering
   CAREER_APTITUDES lists the two aptitudes each career leans on most
   (strongest first); it feeds 10% of the match score once the challenge is done.
   This is a quick signal, not a standardised aptitude test. */
window.APTITUDE = {
  areas: {
    num: { name: "Numbers", emoji: "🔢", desc: "Working with numbers, percentages and patterns quickly." },
    verb: { name: "Words", emoji: "📝", desc: "Understanding meaning, analogies and how language works." },
    log: { name: "Logic", emoji: "🧩", desc: "Spotting rules, cracking codes and working out what must be true." },
    spat: { name: "Shapes & space", emoji: "🧊", desc: "Picturing shapes, turns and directions in your head." }
  },

  items: [
    { k: "num", x: "What comes next? 3, 6, 12, 24, …", o: ["30", "36", "48", "42"], a: 2,
      why: "Each number doubles: 24 × 2 = 48." },
    { k: "verb", x: "Which word is closest in meaning to ABUNDANT?", o: ["Scarce", "Plentiful", "Tiny", "Hidden"], a: 1,
      why: "Abundant means there is a lot of something: plentiful." },
    { k: "log", x: "If the day after tomorrow is Friday, what day was yesterday?", o: ["Monday", "Tuesday", "Wednesday", "Thursday"], a: 1,
      why: "The day after tomorrow is Friday, so today is Wednesday and yesterday was Tuesday." },
    { k: "spat", x: "The arrow turns a quarter turn clockwise each step: ⬆️ ➡️ ⬇️ … What comes next?", o: ["⬆️", "⬅️", "↗️", "⬇️"], a: 1,
      why: "After pointing down, one more quarter turn clockwise points it left." },

    { k: "num", x: "A ₹800 shirt has 25% off. How much do you pay?", o: ["₹575", "₹600", "₹625", "₹650"], a: 1,
      why: "25% of ₹800 is ₹200, and ₹800 − ₹200 = ₹600." },
    { k: "verb", x: "BOOK is to READING as FORK is to…", o: ["Kitchen", "Eating", "Spoon", "Metal"], a: 1,
      why: "You use a book for reading and a fork for eating." },
    { k: "log", x: "What comes next? 2, 3, 5, 8, 12, …", o: ["15", "16", "17", "18"], a: 2,
      why: "The gaps grow by one each time (+1, +2, +3, +4), so the next gap is +5: 17." },
    { k: "spat", x: "Turn the letter b upside down with a half-turn (like spinning a card on a table). Which letter do you see?", o: ["d", "p", "q", "b"], a: 2,
      why: "A half-turn moves the stem to the bottom-right and the round part to the top-left: q." },

    { k: "num", x: "Which of these is the largest?", o: ["0.6", "5/8", "3/5", "62%"], a: 1,
      why: "5/8 = 0.625, which beats 62% (0.62) and 0.6 (3/5 is also 0.6)." },
    { k: "verb", x: "Which word does NOT belong with the others?", o: ["Apple", "Mango", "Carrot", "Banana"], a: 2,
      why: "A carrot is a vegetable; the others are fruits." },
    { k: "log", x: "All roses are flowers. Some flowers fade quickly. Which of these must be true?", o: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "None of these has to be true"], a: 3,
      why: "The flowers that fade quickly might not be roses at all, so we can't conclude anything about roses." },
    { k: "spat", x: "You face North. You turn right, turn right again, then turn left. Which way are you facing now?", o: ["North", "East", "South", "West"], a: 1,
      why: "Right turns you to East, right again to South, then left brings you back to East." },

    { k: "num", x: "4 friends paint a wall in 6 hours. Working at the same speed, how long would 8 friends take?", o: ["12 hours", "4 hours", "3 hours", "2 hours"], a: 2,
      why: "Twice the people means half the time: 6 ÷ 2 = 3 hours." },
    { k: "verb", x: "Pick the word that fits best: “She was so ___ that she finished the project a week early.”", o: ["lazy", "diligent", "careless", "sleepy"], a: 1,
      why: "Diligent means hard-working and careful, which explains finishing early." },
    { k: "log", x: "In a code, CAT is written as DBU. How is DOG written?", o: ["EPH", "CNF", "EOH", "DPH"], a: 0,
      why: "Each letter moves one step forward in the alphabet: D→E, O→P, G→H." },
    { k: "spat", x: "A cube painted red on every side is cut into 27 equal small cubes. How many small cubes have red on exactly 3 sides?", o: ["4", "6", "8", "12"], a: 2,
      why: "Only the corner cubes show three painted faces, and a cube has 8 corners." }
  ]
};

/* The two aptitudes each career uses most, by career id. */
window.CAREER_APTITUDES = {
  software: ["log", "num"], ai: ["num", "log"], cyber: ["log", "num"], gamedev: ["log", "spat"],
  aerospace: ["num", "spat"], engineer: ["spat", "num"], technician: ["spat", "log"],
  doctor: ["verb", "log"], dentist: ["spat", "log"], nurse: ["verb", "log"], vet: ["log", "verb"], psychologist: ["verb", "log"],
  scientist: ["log", "num"], environment: ["log", "verb"], agri: ["log", "num"],
  ca: ["num", "log"], finance: ["num", "log"], manager: ["verb", "num"], entrepreneur: ["verb", "num"],
  marketing: ["verb", "log"], economist: ["num", "log"], banking: ["num", "verb"],
  lawyer: ["verb", "log"], ias: ["verb", "log"], defence: ["spat", "log"],
  architect: ["spat", "num"], ux: ["spat", "verb"], fashion: ["spat", "verb"], animator: ["spat", "log"],
  journalist: ["verb", "log"], performer: ["verb", "spat"], film: ["verb", "spat"],
  teacher: ["verb", "log"], social: ["verb", "log"],
  sports: ["spat", "log"], pilot: ["spat", "num"], chef: ["spat", "num"],
  marine: ["log", "verb"], forensic: ["log", "spat"], drone: ["spat", "log"], robotics: ["spat", "log"],
  climate: ["num", "log"], astro: ["num", "spat"], biotech: ["log", "num"], foodsci: ["log", "num"],
  wildlife: ["spat", "log"], sound: ["log", "spat"], industrial: ["spat", "log"],
  archaeologist: ["verb", "spat"], linguist: ["verb", "log"]
};
