/**
 * Cloudflare Worker proxy for the "Tranças no Mapa" Kobo form.
 *
 * Keeps the Kobo API token server-side (never shipped to the browser) and
 * exposes two GET endpoints to the Vite app:
 *
 *   /                 -> { count, results: [...raw Kobo submissions] }
 *   /api/media?url=.. -> streams a Kobo attachment (image), authenticated
 *
 * Deploy with Wrangler and set the token as a secret (never commit it):
 *   wrangler secret put KOBO_TOKEN
 *
 * Configure the asset UID either as a var in wrangler.toml or inline below.
 */

const KOBO_BASE = "https://eu.kobotoolbox.org";

function getCorsOrigin(request, env) {
  const requestOrigin = request.headers.get("Origin");

  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((x) => x.trim());

  if (allowed.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowed[0] || "*";
}

export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url);
    const token = env.KOBO_TOKEN;
    const assetUid = env.KOBO_ASSET_UID || "ac95zLVxtHiKLZvE4y3Sv8";

    const corsHeaders = {
      "Access-Control-Allow-Origin": getCorsOrigin(request, env) || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!token) {
      return new Response("KOBO_TOKEN not configured", { status: 500, headers: corsHeaders });
    }

    // -- Proxy an authenticated media attachment ------------------------
    if (pathname === "/api/media") {
      const mediaUrl = searchParams.get("url");
      if (!mediaUrl) {
        return new Response("Missing url", { status: 400, headers: corsHeaders });
      }
      if (!mediaUrl.startsWith(KOBO_BASE)) {
        return new Response("Invalid media host", { status: 400, headers: corsHeaders });
      }

      const res = await fetch(mediaUrl, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) {
        return new Response("Media fetch failed", { status: res.status, headers: corsHeaders });
      }
      const contentType = res.headers.get("content-type") || "application/octet-stream";
      return new Response(res.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // -- Paginate through every submission on the form -------------------
    let next = `${KOBO_BASE}/api/v2/assets/${assetUid}/data/?format=json&attachments=true`;
    const results = [];

    while (next) {
      const res = await fetch(next, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) {
        return new Response(`Kobo error: ${res.status}`, { status: res.status, headers: corsHeaders });
      }
      const data = await res.json();
      results.push(...(data.results || []));
      next = data.next;
    }

    return new Response(JSON.stringify({ count: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    });
  },
};
