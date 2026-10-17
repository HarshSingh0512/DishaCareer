# Disha: Career Compass

A free, fun, science-backed career test for Indian students from Class 6 to
college. Students go through 5 short "chapters" and get a personality profile,
their top career matches and a clear roadmap for each career: stream, entrance
exams, top colleges and what to do at every stage.

The **website** is plain HTML, CSS and JavaScript with no build step. It works
offline, installs like an app and keeps every answer on the student's device.
An **optional backend** (Cloudflare Pages Functions + D1) adds accounts, saved
results, parent consent, payments, counselling requests and a contact form. The
free test never needs it.

## Project layout

```
public/                 the website (this folder is what gets published)
  index.html            page shell, security policy, PWA + font links
  _headers              security headers for Cloudflare Pages / Netlify
  sw.js                 service worker (offline; never caches /api)
  css/styles.css        all styles: light + dark themes, print report
  js/boot.js            sets theme + language before first paint
  js/i18n.js            UI strings
  js/questions.js       question bank, type/trait descriptions, fun facts
  js/careers.js         the 50-career library (16 flagged offbeat)
  js/extras.js          subject combinations + scholarships
  js/aptitude.js        aptitude puzzles + which aptitudes each career uses
  js/account.js         account, plans and "Talk to us" pages (uses /api)
  js/app.js             routing, quiz flow, scoring, rendering
functions/api/[[path]].js   Pages Function: sends /api/* to server/router.js
server/                 API code (auth, account, consent, payments, leads, bookings)
migrations/             D1 database schema
workers/cron/           tiny scheduled Worker that triggers the daily job
tests/api.test.mjs      end-to-end API tests
wrangler.toml           Cloudflare config (D1 binding, output dir)
.dev.vars.example       local settings template (copy to .dev.vars)
SECURITY.md             how the site and API are hardened
```

## Run it locally

Static site only (no accounts): serve `public/` with any static server, e.g.
`npx serve public`. The account page then shows "not switched on" and everything
else works.

Full stack (site + API + local database):

```bash
npm install
cp .dev.vars.example .dev.vars        # then set APP_SECRET to a long random string
npm run db:migrate:local
npm run dev                           # http://127.0.0.1:8788
npm test                              # in a second terminal, while dev is running
```

With `DEV_MODE=true` and no email or Razorpay keys, the dev server shows sign-in
codes and parent-approval links on screen instead of emailing them, and simulates
Razorpay payments, so every flow can be tried without real accounts. After
changing `.dev.vars`, stop and restart `npm run dev` fully (a hot reload does not
pick up new values).

## Deploy to Cloudflare (production)

1. `npx wrangler login`
2. `npx wrangler d1 create disha` and paste the printed `database_id` into
   `wrangler.toml`.
3. `npm run db:migrate:remote`
4. Set secrets (each command prompts for the value):
   ```bash
   npx wrangler pages secret put APP_SECRET            # 64+ random characters
   npx wrangler pages secret put RESEND_API_KEY        # https://resend.com, after verifying your domain
   npx wrangler pages secret put EMAIL_FROM            # e.g. Disha <hello@yourdomain.in>
   npx wrangler pages secret put ADMIN_EMAIL           # where enquiries and booking requests go
   npx wrangler pages secret put RAZORPAY_KEY_ID
   npx wrangler pages secret put RAZORPAY_KEY_SECRET
   npx wrangler pages secret put RAZORPAY_WEBHOOK_SECRET
   ```
   Never set `DEV_MODE` in production. Leave `PLANS_ON_SALE` unset until the paid
   features exist; then set it to `true` to show prices and allow checkout.
   Also set `CRON_SECRET` (any long random string) for the daily job below.
5. `npm run deploy`, then add your custom domain in the Cloudflare dashboard.
6. Daily job (cleans expired data; sends Disha Plus reminder emails on the 1st–3rd
   of each month). Pages can't run on a schedule, so a tiny Worker calls it:
   ```bash
   cd workers/cron
   # set SITE_URL in workers/cron/wrangler.toml to your domain first
   npx wrangler secret put CRON_SECRET     # same value as the Pages project
   npx wrangler deploy
   ```
7. In the Razorpay dashboard, add a webhook to
   `https://<your-domain>/api/payments/webhook` for the `payment_link.paid` event,
   using the same webhook secret. Test with Razorpay test keys first.

Free tiers cover early growth (Pages Functions: 100,000 requests a day; D1: 5 GB).

## The API

| Method & path | What it does |
|---|---|
| `POST /api/auth/start` · `POST /api/auth/verify` · `POST /api/auth/logout` | Email one-time-code sign-in; HttpOnly session cookie |
| `GET /api/me` · `DELETE /api/me` · `GET /api/me/export` | Profile, purchases and plans; delete account; download all data |
| `POST /api/me/profile` · `POST /api/me/consent/resend` | 18+ declaration, or parent email for consent |
| `GET /api/consent` · `POST /api/consent` | Parent's approval page (from the email link) |
| `GET /api/me/state` · `PUT /api/me/state` | Save / load the student's results (needs consent if under 18) |
| `POST /api/payments/checkout` · `GET /api/payments/callback` · `POST /api/payments/webhook` | Razorpay Payment Links: start, signed return, signed webhook |
| `GET /api/bookings` · `POST /api/bookings` | Counselling requests (Guided plan) |
| `POST /api/leads` | "Talk to us" enquiries from parents, schools and counsellors |
| `GET /api/report` | Full Report content (owners only) |
| `GET /api/plus/feed` · `POST /api/plus/profile` | Disha Plus calendar and reminder setting |
| `GET /api/plus/snapshots` · `POST /api/plus/snapshots` | Term-by-term result snapshots |
| `POST /api/cron/daily` | Daily cleanup + monthly reminders (needs `X-Cron-Secret`) |

Plans and prices live in `server/products.js` (server-side only).

## Features

- **5-chapter quiz** measuring interests (Holland RIASEC) and personality (Big Five).
- **Optional Aptitude Challenge** (`#/aptitude`), counted as 10% of match scores.
- **Compare careers** (`#/compare/a,b,c`), up to 3 side by side.
- **Offbeat careers** on the home compass, an Explore filter and a results "Wildcard".
- **Match scores with reasons**, stage-aware guidance and a "You are here" roadmap.
- **How it works** page explaining the method, plus scholarships.
- **Printable report**, parent summary, 5-step action plan, shareable result card.
- **Accounts (optional)**: save results across devices, parent consent for under-18s,
  data download and account deletion.
- **Plans & payments** via Razorpay (hidden until `PLANS_ON_SALE=true`).
- **Full Report** (`#/report`, ₹499): a 9-section personal report, saved as PDF.
- **Disha Plus** (`#/plus`, ₹1,999/year): "This month for you" calendar of exams,
  Olympiads, scholarships and school milestones matched to the student's class and
  careers (edit `server/plus-calendar.js` each year), a monthly reminder email, and
  term-by-term snapshots showing how the student is changing.
- **Offline & installable** PWA. **No ads, no tracking.**

## Configure

- **Counsellor button.** In `public/js/app.js`, set `CONFIG.counsellorUrl`.
- **Plans and prices.** Edit `server/products.js`.

## Adding or editing careers

Add an object to `window.CAREERS` in `public/js/careers.js`. `code` is the 3-letter
Holland code (strongest first); `b5` are helpful personality traits weighted
−1..1; `subjects`, `values` and `streams` use the keys from `CAREER_META`; `path`
holds the roadmap text; set `offbeat: true` for lesser-known careers. Every career
also needs an entry in `window.CAREER_APTITUDES` (`public/js/aptitude.js`) and in
`window.SUBJECT_COMBOS` (`public/js/extras.js`).

## Keep the data fresh

Exam dates, patterns, fees, pay ranges, rankings and scholarship terms change
every year. Review the career and extras data once a year against official
sources (nta.ac.in, NMC/MCC, the CLAT Consortium, JoSAA, NIRF, ICAI, UPSC,
scholarships.gov.in).

## Roadmap (next)

- Monthly aptitude practice packs (the last "coming soon" item in Disha Plus).
- Full Hindi for every question and career; a counsellor/school view.

## License

Disha is **source-available** under the [PolyForm Noncommercial License 1.0.0](LICENSE.md).

- ✅ Free for students, parents, schools, colleges, NGOs, researchers and hobby
  projects: read it, run it, change it and share it for noncommercial purposes.
- ❌ Commercial use (selling it, running it as a paid service, or using it inside
  a business) needs a separate commercial license. Open an issue on this repo to ask.

The Big Five personality items are adapted from the public-domain International
Personality Item Pool (Mini-IPIP).
