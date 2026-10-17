// Disha daily job trigger. Cloudflare Pages Functions cannot run on a schedule,
// so this tiny Worker calls the site's /api/cron/daily once a day.
// Deploy: cd workers/cron && npx wrangler deploy
// Secrets: npx wrangler secret put CRON_SECRET   (same value as the Pages project)
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  }
};

async function run(env) {
  const res = await fetch(`${env.SITE_URL}/api/cron/daily`, {
    method: "POST",
    headers: { "X-Cron-Secret": env.CRON_SECRET }
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`daily job failed: ${res.status} ${body}`);
  console.log("daily job", body);
}
