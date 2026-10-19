/* Visitor counting with Cloudflare Web Analytics: cookieless and free, with no
   personal data and no cross-site tracking. Paste the site token from Cloudflare
   dashboard → Analytics & Logs → Web Analytics → your site → "JS snippet"
   (the value of "token"). Leave it empty to switch counting off.
   The beacon only counts full page loads; Disha's in-app navigation (#/…) is
   reported as a page view of the same page. */
(function () {
  "use strict";
  const TOKEN = "";
  if (!/^[a-f0-9]{32}$/.test(TOKEN)) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
  document.head.appendChild(s);
})();
