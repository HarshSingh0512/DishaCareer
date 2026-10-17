/* UI strings, kept in one place so the interface can be translated later without
   touching the app logic. English only for now; to add a language, copy the `en`
   block under a new key (e.g. `hi`), translate the values, and add it to `langs`
   plus a language switcher in the header. Values are inserted as text, never HTML. */
window.I18N = {
  langs: [
    { k: "en", label: "English" }
  ],
  en: {
    "skip": "Skip to content",
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.results": "My results",
    "nav.method": "How it works",
    "nav.compare": "Compare",

    "home.pill": "🇮🇳 For Indian students · Class 6 to College",
    "home.title": "Find the career that fits",
    "home.titleYou": "you",
    "home.lead": "A fun, science-backed journey through your interests, personality and passions. At the end you get a clear roadmap: which stream, which exams and where to study.",
    "home.start": "Start my journey →",
    "home.explore": "Explore careers",
    "home.continue": "Continue",
    "home.resume": "See my results →",
    "home.retake": "Retake the quiz",
    "home.startOver": "Start over",
    "home.meta": "⏱ About 8 minutes · Free · No sign-up · Your answers stay on this device",
    "home.f1t": "Science-backed",
    "home.f1d": "Built on Holland's RIASEC interest model and the Big Five personality traits, two of the most researched frameworks in career psychology.",
    "home.f2t": "Made for India",
    "home.f2d": "Streams, entrance exams (JEE, NEET, CLAT, UCEED, NDA, CA…) and top institutes for {n} careers.",
    "home.f3t": "A clear roadmap",
    "home.f3d": "See exactly what to do from Class 6 to your first job, with a 'You are here' marker.",
    "home.chaptersTitle": "Your journey has 5 chapters",

    "common.free": "Free",
    "common.back": "← Back",

    "method.title": "How Disha works",
    "method.intro": "Disha is open about its method. No career test can predict your future, but a good one points you toward options worth exploring. Here is exactly what we measure and how we match you.",

    "results.print": "🖨️ Save / print report",
    "results.share": "📤 Share my result",
    "results.compareTop": "⚖️ Compare my top 3",
    "results.exploreAll": "Explore all careers",
    "results.change": "Change class / stream",
    "results.retake": "Retake quiz",
    "results.parentTitle": "For your parents",
    "results.actionTitle": "Your 5-step action plan",
    "results.counsellor": "💬 Talk to a counsellor",
    "results.shareTitle": "Share your result",
    "results.download": "⬇️ Download card",
    "results.copy": "📋 Copy summary",
    "results.copied": "Copied!"
  }
};
