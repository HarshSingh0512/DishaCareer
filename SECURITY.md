# Security

Disha is a static website (`public/`) plus an **optional** API (`server/`, run as a
Cloudflare Worker with a D1 database). The quiz itself never sends answers to the
API: the only automatic call is the anonymous visitor counter, and only students
who choose to sign in send anything personal. No website can be made impossible to
attack, but the measures below remove the common risks.

## What protects the site

**Almost no third-party code.** The site ships its own JavaScript with no ad
scripts and no npm runtime dependency. The only external requests are Google Fonts
for the typeface (see "Going stricter" below to remove it) and, once a token is set
in `public/js/analytics.js`, the Cloudflare Web Analytics beacon, which is
cookieless, collects no personal data and is allowed in the CSP only from
`static.cloudflareinsights.com` / `cloudflareinsights.com`. Leave the token empty to
switch it off.

**Content Security Policy (CSP).** `script-src 'self'` means the browser will run
JavaScript only from this site and will refuse inline scripts and `eval`. Even if
someone found a way to inject markup, it could not execute as script. The full
policy is set two ways:
- a `<meta http-equiv="Content-Security-Policy">` tag in `index.html` (works
  everywhere, including GitHub Pages and when opening the file directly), and
- the `_headers` file, for hosts that send real HTTP headers (Netlify, Cloudflare
  Pages), which also sets `frame-ancestors`, HSTS and the headers below.

**Other security headers** (via `_headers`): `X-Frame-Options: DENY` and
`frame-ancestors 'none'` stop click-jacking; `X-Content-Type-Options: nosniff`
stops MIME confusion; `Strict-Transport-Security` forces HTTPS; `Referrer-Policy:
no-referrer` and a restrictive `Permissions-Policy` limit what the page leaks and
what device APIs it may use.

**Output is escaped.** The only thing a user types is an optional first name. It
is sanitized on entry (control characters, bidi overrides and angle brackets are
removed, length is capped) and every value shown on screen is HTML-escaped. This
closes the main cross-site-scripting (XSS) path.

**Saved progress is validated.** Progress is kept in the browser's `localStorage`
on the user's own device. Because a user can edit that storage, the app treats it
as untrusted: on load it checks the size and the shape of every field and silently
discards anything malformed or out of range, falling back to a clean start.

**External links are safe.** Links to other sites open with
`rel="noopener noreferrer"`, and any URL the data supplies is allowed only if it is
a plain `https://` link.

**Data is frozen at runtime.** The question bank and career library are deeply
frozen (`Object.freeze`) when the app starts, so nothing can mutate them while the
page runs.

## Setting the headers on other hosts

`public/_headers` is read by Netlify and Cloudflare Pages. For other servers, set the
same headers yourself.

**Apache (`.htaccess`):**
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "no-referrer"
Header set Strict-Transport-Security "max-age=63072000; includeSubDomains"
```

**Nginx:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
```

## The API (accounts, consent, payments)

- **Sign-in** uses a 6-digit email code, valid 10 minutes, stored only as an HMAC.
  Five wrong tries burn the code, and requests are rate-limited per email and per IP.
- **Sessions** are random 256-bit tokens in an `HttpOnly; Secure; SameSite=Lax`
  `__Host-` cookie; only their SHA-256 hash is stored. Sessions last 30 days and
  are deleted on sign-out.
- **CSRF**: every state-changing request must send JSON and come from the site's
  own origin. The two exceptions are authenticated differently: the Razorpay
  webhook by its HMAC signature, and the parent-consent form by its single-use token.
- **Children's data (DPDP Act 2023)**: nothing is stored server-side for an
  under-18 user until a parent approves from an emailed link. Opening the link only
  shows a page; approval needs a deliberate button press, so email link scanners
  cannot approve. Users can download all their data or delete their account
  (orders are kept without the user link, for tax records). The 18+ answer is
  self-declared; review this with a lawyer before launch.
- **Payments**: prices exist only on the server (`server/products.js`). Buyers pay
  on Razorpay's hosted page, so the site loads no payment script and keeps its
  strict CSP. A payment counts only after a valid HMAC signature (redirect or
  webhook); fulfilment is idempotent and the webhook re-checks the amount.
- **Privacy by default**: IP addresses are stored only as salted hashes, API
  responses are `no-store`, the service worker never caches `/api`, there are no
  ad scripts, and visitor counting (Cloudflare Web Analytics) uses no cookies.
- **Daily job**: runs from the Worker's cron trigger; the HTTP route
  `/api/cron/daily` only runs with the `X-Cron-Secret` header (compared in constant
  time). It deletes expired sign-in codes, sessions, consent links and rate-limit
  rows, and sends each Plus member at most one reminder a month.
- **Visitor counter**: stores three anonymous totals (visitors, visits, quizzes)
  and nothing per person. The browser only sends "first visit on this device?",
  remembered in its own storage. Counting endpoints require our own Origin and are
  rate-limited per hashed IP (generously, so a school lab sharing one connection
  still counts). Over the limit, a visit is simply not counted.
- **Accounts switch**: with `ACCOUNTS_ENABLED` unset, every account, consent,
  payment, report and Plus endpoint answers `503`, so the counter can be live before
  email and payments are configured.
- **Secrets** (`APP_SECRET`, `CRON_SECRET`, email and Razorpay keys) live in Cloudflare secrets,
  never in the repo; `.dev.vars` is git-ignored. `DEV_MODE` (which shows codes on
  screen and simulates payments) must never be set in production.

## Going stricter (optional)

- **Self-host the font** to remove the last third-party request. Download the
  Plus Jakarta Sans web-font files, serve them from the site, drop the two Google
  links from `index.html`, and remove `https://fonts.*` from the CSP. The site
  already falls back to a system font if the web font is blocked.
- **Add Subresource Integrity** if you ever load a script from a CDN (the site
  currently loads none).

## If you find a problem

If you spot a security issue in Disha, please report it privately to the project
owner rather than opening a public issue. Do not test against anyone else's
website — only test software you own or have written permission to test.
