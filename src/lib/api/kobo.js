import { parseKoboRecord } from "../utils/parseKobo.js";

// The worker in /worker keeps the Kobo API token server-side and exposes:
//   GET {PROXY_BASE}/            -> { count, results: [...raw Kobo submissions] }
//   GET {PROXY_BASE}/api/media?url=<attachment url> -> proxied, authenticated image
const PROXY_BASE = import.meta.env.VITE_KOBO_PROXY_URL || "";
console.log("KOBO PROXY:", PROXY_BASE);
const MEDIA_PROXY = PROXY_BASE ? `${PROXY_BASE}/api/media` : "";

/**
 * Fetch and normalize all submissions from the live Kobo form via the
 * worker proxy. Throws if no proxy is configured or the request fails,
 * so callers can fall back to the bundled snapshot dataset.
 */
export async function fetchLiveData() {
  if (!PROXY_BASE) {
    throw new Error("VITE_KOBO_PROXY_URL não configurada");
  }
  const res = await fetch(PROXY_BASE, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Kobo proxy respondeu ${res.status}`);
  }
  const data = await res.json();
  const rawResults = data.results || [];
  const records = [];
  for (const raw of rawResults) {
    const parsed = parseKoboRecord(raw, { mediaProxyBase: MEDIA_PROXY });
    if (parsed) records.push(parsed);
  }
  return records;
}

export function isLiveModeConfigured() {
  return Boolean(PROXY_BASE);
}
