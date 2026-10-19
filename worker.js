/* Disha's Cloudflare Worker: one deploy serves the website, the API and the
   daily job.
   - Website files in public/ are served by Cloudflare directly (static assets,
     including public/_headers). This code only runs for requests that don't
     match a file, i.e. /api/*.
   - The cron trigger in wrangler.toml calls scheduled() once a day. */
import { handle } from "./router.js";
import { runDaily } from "./plus.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handle(request, env);
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    if (!env.DB || !env.APP_SECRET) return; // not configured yet
    ctx.waitUntil(runDaily(env).then(r => console.log("daily job", JSON.stringify(r))));
  }
};
