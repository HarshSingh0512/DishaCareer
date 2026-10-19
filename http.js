/* HTTP helpers shared by every API handler. */

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Headers on every API response. JSON responses are never cached and can never
// be rendered as a page or framed.
const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY"
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      ...extra
    }
  });
}

export function redirect(location, extra = {}) {
  return new Response(null, { status: 302, headers: { ...BASE_HEADERS, Location: location, ...extra } });
}

// A tiny standalone HTML page (used for the parent-consent link opened from email).
export function page(title, bodyHtml, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #f6f7fb; color: #191b2b; }
  main { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
  .card { background: #fff; border: 1px solid #e2e5ef; border-radius: 16px; padding: 20px; }
  h1 { font-size: 1.5rem; margin: 0 0 12px; }
  button { font: inherit; font-weight: 700; border: 0; border-radius: 999px; padding: 12px 20px; background: #4f46e5; color: #fff; cursor: pointer; }
  ul { padding-left: 20px; } a { color: #4f46e5; }
  @media (prefers-color-scheme: dark) { body { background: #0e0f1a; color: #eceef8; } .card { background: #171927; border-color: #2a2e45; } a { color: #8b85ff; } }
</style></head><body><main><div class="card">${bodyHtml}</div></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
    }
  });
}

export function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

const MAX_BODY = 64 * 1024;

// Read a JSON object body. Requiring application/json also blocks plain HTML-form CSRF.
export async function readJson(request) {
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().startsWith("application/json")) throw new HttpError(415, "bad_content_type", "Send JSON.");
  const text = await readText(request);
  let body;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, "bad_json", "Invalid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "bad_json", "Expected a JSON object.");
  return body;
}

export async function readText(request) {
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > MAX_BODY) throw new HttpError(413, "too_large", "Request is too large.");
  const text = await request.text();
  if (text.length > MAX_BODY) throw new HttpError(413, "too_large", "Request is too large.");
  return text;
}

export function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

// Plain string field validation: trims, enforces length, rejects control characters.
export function str(value, field, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string") throw new HttpError(400, "invalid_" + field, `Please fill in ${field}.`);
  const v = value.replace(/\s+/g, " ").trim();
  if (v.length < min || v.length > max || /[\u0000-\u001F\u007F]/.test(v)) {
    throw new HttpError(400, "invalid_" + field, `Please check ${field}.`);
  }
  return v;
}

const EMAIL_RE = /^[^\s@<>()[\],;:"]{1,64}@[a-z0-9.-]{1,190}\.[a-z]{2,24}$/;
export function email(value, field = "email") {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v.length > 254 || !EMAIL_RE.test(v)) throw new HttpError(400, "invalid_" + field, "Please enter a valid email address.");
  return v;
}

export const isDev = env => env.DEV_MODE === "true";
export const now = () => Date.now();
