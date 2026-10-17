/* Runs in <head> before paint so the theme and language are correct immediately.
   Kept in its own file so the page needs no inline script and the Content
   Security Policy can forbid inline scripts entirely. */
(function () {
  "use strict";
  try {
    var theme = localStorage.getItem("disha.theme");
    if (theme === "dark" || theme === "light") document.documentElement.dataset.theme = theme;
  } catch (e) { /* storage blocked: fall back to the OS theme */ }
  try {
    var lang = localStorage.getItem("disha.lang");
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  } catch (e) { /* ignore */ }
})();
