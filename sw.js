/* Service worker: makes Disha load instantly and work offline on weak networks.
   Strategy: pre-cache the app shell on install; serve same-origin GETs from the
   cache and refresh them in the background (stale-while-revalidate). Cross-origin
   requests and /api calls are passed straight to the network and never cached here.
   Bump CACHE whenever the shell changes so old caches are cleaned up. */
const CACHE = "disha-v25-2026-10-19";
const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./fonts/bricolage-grotesque-latin.woff2",
  "./js/boot.js",
  "./js/scoring.js",
  "./js/analytics.js",
  "./js/i18n.js",
  "./js/questions.js",
  "./js/careers.js",
  "./js/extras.js",
  "./js/aptitude.js",
  "./js/stats.js",
  "./js/account.js",
  "./js/report.js",
  "./js/plus.js",
  "./js/app.js",
  "./icon.svg",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let fonts etc. go to the network
  // Never cache the API: responses are private to the signed-in user and must be fresh.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
