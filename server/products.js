/* What Disha sells. Prices live ONLY here (server side): the browser sends a
   product key and never an amount. Change prices here and redeploy.
   days      how long the purchase lasts; null = forever
   includes  other products granted with this one
   features  what the buyer gets; `soon: true` marks things not built yet, which
             the plan card shows as "coming soon" so nobody pays for a promise */
export const PRODUCTS = {
  report: {
    name: "Full Report",
    pricePaise: 49900,
    days: null,
    includes: [],
    blurb: "Your detailed personal report, with a section for your parents.",
    features: [
      { text: "A detailed report you can save as PDF and print" },
      { text: "Deep dive into your interests, personality and aptitude" },
      { text: "Your top 10 careers: why they fit, pay, exams and colleges" },
      { text: "Stream and subject advice with the reasons behind it" },
      { text: "Your personal entrance-exam timeline" },
      { text: "A month-by-month 6-month action plan" },
      { text: "A full guide for your parents, with conversation starters" }
    ]
  },
  plus: {
    name: "Disha Plus (1 year)",
    pricePaise: 199900,
    days: 365,
    includes: ["report"],
    blurb: "Year-round guidance that keeps you on track.",
    features: [
      { text: "Everything in the Full Report" },
      { text: "\"This month for you\": exams, Olympiads and scholarships for your class and careers" },
      { text: "A monthly email on the 1st with what's coming up" },
      { text: "Save your results every term and see how you've changed" },
      { text: "Monthly aptitude practice packs", soon: true }
    ]
  },
  guided: {
    name: "Guided Counselling",
    pricePaise: 599900,
    days: 180,
    includes: ["report", "plus"],
    blurb: "Plus, with 1:1 sessions with a career counsellor.",
    features: [
      { text: "Everything in Disha Plus" },
      { text: "2 one-to-one video sessions with a career counsellor" },
      { text: "1 session together with your parents" },
      { text: "A written action plan after your sessions" },
      { text: "3 months of WhatsApp follow-up for questions" }
    ]
  }
};

export const publicCatalog = () =>
  Object.entries(PRODUCTS).map(([key, p]) => ({
    key, name: p.name, price: p.pricePaise / 100, days: p.days, blurb: p.blurb,
    includes: p.includes, features: p.features.map(f => ({ text: f.text, soon: Boolean(f.soon) }))
  }));
