/* GET /api/report: the paid report content, only for owners of the Full Report
   (bought directly or included in Plus / Guided). */
import { HttpError, json } from "./http.js";
import { requireUser } from "./auth.js";
import { activeEntitlements } from "./account.js";
import { REPORT_CONTENT } from "./report-content.js";

export async function reportContent({ request, env }) {
  const user = await requireUser(request, env);
  const owned = (await activeEntitlements(env, user.id)).map(e => e.product);
  if (!owned.includes("report")) throw new HttpError(403, "plan_required", "The Full Report is a paid feature.");
  return json({ content: REPORT_CONTENT });
}
