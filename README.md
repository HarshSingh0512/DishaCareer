# Disha: Career Compass

A free, fun, science-backed career test for Indian students from Class 6 to
college. Students go through 6 short "chapters" and get a personality profile,
their top career matches and a clear roadmap for each career: stream, entrance
exams, top colleges and what to do at every stage.

The **website** is plain HTML, CSS and JavaScript with no build step. It works
offline, installs like an app and keeps every answer on the student's device.
An **optional backend** (one Cloudflare Worker + D1 database) adds a public visitor
counter and, once switched on with `ACCOUNTS_ENABLED=true`, accounts, saved results,
parent consent, payments, counselling requests and a contact form. The free test
never needs it.

## Project layout

```
public/                 the website (this folder is what gets published)
  index.html            page shell, security policy, PWA + font links
  _headers              security headers (Cloudflare Workers/Pages, Netlify)
  sw.js                 service worker (offline; never caches /api)
  css/styles.css        all styles: light + dark themes, print report
  js/boot.js            sets theme + language before first paint
  js/i18n.js            UI strings
  js/questions.js       question bank, subjects per class/stream, fun facts
  js/scoring.js         all match-score formulas (pure functions, unit-tested)
  js/careers.js         the 50-career library (16 flagged offbeat)
  js/extras.js          subject combinations + scholarships
  js/aptitude.js        aptitude puzzles + which aptitudes each career uses
  js/account.js         account, plans and "Talk to us" pages (uses /api)
  js/stats.js           public visitor counter (home page + footer)
  js/analytics.js       optional cookieless Cloudflare Web Analytics
  js/app.js             routing, quiz flow, scoring, rendering
server/worker.js        the Worker: serves public/, routes /api/*, runs the daily job
server/                 API code (auth, account, consent, payments, report, Plus, stats)
migrations/             D1 database schema
tests/                  end-to-end API tests + calendar unit tests
wrangler.toml           Cloudflare config (assets, D1 binding, cron, vars)
.dev.vars.example       local settings template (copy to .dev.vars)
SECURITY.md             how the site and API are hardened
```

## Run it locally

Static site only (no backend): serve `public/` with any static server, e.g.
`npx serve public`. The visitor counter and account links stay hidden and
everything else works.

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

Everything deploys as one Worker named `disha` (website + API + daily job), so it
keeps the same address as a drag-and-drop upload of `public/`.

**Stage 1: website + visitor counter** (no email or payments needed)

1. `npx wrangler login`
2. `npx wrangler d1 create disha` and paste the printed `database_id` into
   `wrangler.toml`. Set `SITE_URL` there to your live address.
3. `npm run db:migrate:remote`
4. `npx wrangler secret put APP_SECRET` (64+ random characters). Optionally also
   `npx wrangler secret put ADMIN_SECRET`, the password for the private accuracy
   page `/#/insights` (16+ characters).
5. `npm run deploy`

Accounts stay off: the site shows the counter and hides account, report, Plus
and contact links. The daily job already runs (cleanup only).

**Stage 2: accounts, report, Plus and payments** (once email and Razorpay are ready)

1. Set the remaining secrets (each command prompts for the value):
   ```bash
   npx wrangler secret put RESEND_API_KEY        # https://resend.com, after verifying your domain
   npx wrangler secret put EMAIL_FROM            # e.g. Disha <hello@yourdomain.in>
   npx wrangler secret put ADMIN_EMAIL           # where enquiries and booking requests go
   npx wrangler secret put RAZORPAY_KEY_ID
   npx wrangler secret put RAZORPAY_KEY_SECRET
   npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
   npx wrangler secret put CRON_SECRET           # only for running the daily job by hand
   ```
2. Switch accounts on: `npx wrangler secret put ACCOUNTS_ENABLED` and enter `true`.
   Leave `PLANS_ON_SALE` unset until you want to sell; then set it to `true` the
   same way. Never set `DEV_MODE` in production.
3. In the Razorpay dashboard, add a webhook to
   `https://<your-domain>/api/payments/webhook` for the `payment_link.paid` event,
   using the same webhook secret. Test with Razorpay test keys first.

Add a custom domain under the Worker's **Settings → Domains & Routes**.
Free tiers cover early growth (Workers: 100,000 API requests a day, website
files unlimited; D1: 5 GB).

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
| `POST /api/cron/daily` | Run the daily job by hand (needs `X-Cron-Secret`; it also runs on the cron trigger) |
| `GET /api/stats` · `POST /api/stats/visit` · `POST /api/stats/quiz` | Public visitor counter: anonymous totals of visitors, visits and quizzes taken (always on) |
| `POST /api/feedback` | "Do your top 3 careers feel right?" rating: day, method, class band, 1–5 and the 3 career ids, nothing personal (always on, 20 per device a day) |
| `GET /api/feedback/summary` | Totals for the private `/#/insights` page; needs the `X-Admin-Secret` header to match `ADMIN_SECRET` (404 while it's unset) |

Plans and prices live in `server/products.js` (server-side only).

## Features

- **6-chapter quiz** measuring interests (Holland RIASEC), personality (Big Five) and, per subject, how much the student enjoys it and their usual marks (subjects follow their class and stream).
- **Optional Aptitude Challenge** (`#/aptitude`), counted as 10% of match scores.
- **O\*NET career profiles**: 47 of the 50 careers use measured interest profiles
  from the O\*NET 31.0 database (`public/js/onet.js`); IAS, Entrepreneur and Defence
  keep hand-picked codes. While `CONFIG.abTest` is on (`public/js/app.js`), each
  device is randomly given O\*NET or the older hand-picked codes, to compare them.
- **"Do your top 3 careers feel right?"** rating under the results (anonymous,
  `POST /api/feedback`), which measures real accuracy.
- **Compare careers** (`#/compare/a,b,c`), up to 3 side by side.
- **Offbeat careers** on the home compass, an Explore filter and a results "Wildcard".
- **Match scores with reasons**, stage-aware guidance and a "You are here" roadmap.
- **How it works** page explaining the method, plus scholarships.
- **Printable report**, parent summary, 5-step action plan, shareable result card.
- **Accounts (optional)**: save results across devices, parent consent for under-18s,
  data download and account deletion.
- **Plans & payments** via Razorpay (hidden until `PLANS_ON_SALE=true`).
- **Full Report** (`#/report`, ₹499): a 10-section personal report, saved as PDF.
  Section 6, "Inside your top 3 careers", uses O\*NET data (`server/onet-deep.js`,
  paid content served only to owners). It shows daily tasks, the skills used most,
  what the work is like, job titles, and a "your gap" check of each knowledge area
  against the student's own subject ratings.
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

## Measuring accuracy (O\*NET vs hand-picked codes)

**Easiest way: the private page `/#/insights`.** It isn't linked anywhere. Set a
password once as the `ADMIN_SECRET` secret (16+ characters; Cloudflare → Worker →
Settings → Variables and secrets → Secret), then open the page and enter it. It
shows:
- how many students say their top 3 feel right;
- O\*NET vs hand-picked codes, with a check of whether the gap is real or chance;
- results by class, the lowest-rated careers, the star spread and the last 30 days.

It shows totals only, and allows 20 password tries per hour per device.

Or run SQL yourself. Ratings are stored in the `match_feedback` table. To compare
the two methods, run this in the Cloudflare dashboard (**D1 → disha → Console**):

```sql
SELECT method, COUNT(*) AS ratings, ROUND(AVG(rating), 2) AS avg_rating,
       ROUND(100.0 * SUM(rating >= 4) / COUNT(*), 1) AS pct_feels_right
FROM match_feedback GROUP BY method;
```

Wait for a few hundred ratings per method before drawing a conclusion. If O\*NET
wins, set `abTest: false` in `CONFIG` (`public/js/app.js`) so everyone gets it.

## Roadmap (next)

1. ✅ **Feedback rating** and ✅ **O\*NET matching (free)** are built (see above).
2. ✅ **O\*NET Deep Career Report**: built as section 6 of the ₹499 Full Report
   (tasks, skills, work environment, job titles, your gap). Still possible: more of
   the free [O\*NET database](https://www.onetcenter.org/database.html) (CC BY 4.0,
   credit the U.S. Department of Labor, ETA):
   - **Paid depth:** day-to-day work activities, skills and knowledge needed,
     work environment, specialisations (about 900 occupations) and a "your gap"
     breakdown per career.
   - **Optional extra paid section (3–4 minutes):** work values and a skills
     self-rating, asked only to students who buy the deep report. The free quiz
     stays at 6 chapters.
   - O\*NET is US data, so keep local judgement for India-specific careers
     (CA, IAS, defence).
3. **Monthly aptitude practice packs** (the last "coming soon" item in Disha Plus).
4. **Full Hindi** for every question and career; a **counsellor/school view**.

**Pricing principles.**
- **Free:** the matching and its accuracy, the top careers, the stream advice and
  the basic roadmap. Trust drives upgrades, and students who can't pay still get
  honest guidance.
- **Paid:** depth (the Deep Report), year-round help (Plus) and people
  (counsellors).
- **Selling:**
  - Show one deep section free, then "unlock the rest".
  - Make the report easy to share with parents, who are the buyers.
  - Show all three plans side by side so the price comparison is clear.
  - Promote during stream-choice and admission season.
  - Sell bulk access to schools.

Add a feature to a plan in `server/products.js` only once it is built
(`soon: true` while it is not), so nobody pays for a promise.

## License

Disha is **source-available** under the [PolyForm Noncommercial License 1.0.0](LICENSE.md).

- ✅ Free for students, parents, schools, colleges, NGOs, researchers and hobby
  projects: read it, run it, change it and share it for noncommercial purposes.
- ❌ Commercial use (selling it, running it as a paid service, or using it inside
  a business) needs a separate commercial license. Open an issue on this repo to ask.

The Big Five personality items are adapted from the public-domain International
Personality Item Pool (Mini-IPIP).

