// Cloudflare Pages Function: sends every /api/* request to the Disha API router.
import { handle } from "../../server/router.js";

export const onRequest = ({ request, env }) => handle(request, env);
