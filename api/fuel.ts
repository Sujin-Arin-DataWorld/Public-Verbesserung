// Wiesbaden-Lagebild v2.7 — Tankerkönig live fuel-price proxy.
//
// Tankerkönig (Bundeskartellamt MTS-K) sends no CORS header, so the browser
// can't fetch it directly. This Edge Function makes the call server-side
// with our API key and returns CORS-friendly JSON. Cache: 5 min (Tankerkönig
// AGB max-rate). License: CC BY 4.0 — Bundeskartellamt.
//
// Env: TANKERKOENIG_API_KEY  (set in Vercel project settings; .env.local for dev)
// Route: /api/fuel  (no path params — fixed Wiesbaden 10 km radius)
//
// Mock-Badge-Disziplin §9.2: if the upstream call fails the client must fall
// back to the build-time FUEL_STATIONS_V2 snapshot and show a "Stand" stamp.
// This function never fabricates prices — it returns a non-200 on failure.

export const config = { runtime: 'edge' };

const TK_BASE = 'https://creativecommons.tankerkoenig.de/json/list.php';
const WI_LAT = 50.0782;
const WI_LNG = 8.2398;
const RADIUS_KM = 10;

interface TKStation {
  id: string;
  name: string;
  brand: string;
  street: string;
  place: string;
  lat: number;
  lng: number;
  dist: number;
  diesel: number | false;
  e5: number | false;
  e10: number | false;
  isOpen: boolean;
  houseNumber?: string;
  postCode?: number;
}

interface TKResponse {
  ok: boolean;
  license?: string;
  data?: string;
  status?: string;
  stations?: TKStation[];
  message?: string;
}

export default async function handler(req: Request): Promise<Response> {
  const apiKey = (globalThis as any).process?.env?.TANKERKOENIG_API_KEY
    || (Deno as any)?.env?.get?.('TANKERKOENIG_API_KEY');
  if (!apiKey) {
    return json({ ok: false, error: 'missing_api_key' }, 500);
  }

  const url = `${TK_BASE}?lat=${WI_LAT}&lng=${WI_LNG}&rad=${RADIUS_KM}&type=all&sort=dist&apikey=${apiKey}`;

  let upstream: TKResponse;
  try {
    const resp = await fetch(url, {
      // Tankerkönig responds within ~1 s; keep tight to avoid Vercel 25 s budget waste.
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      return json({ ok: false, error: 'upstream_http', status: resp.status }, 502);
    }
    upstream = await resp.json() as TKResponse;
  } catch (e: any) {
    return json({ ok: false, error: 'upstream_fetch', detail: e?.message || String(e) }, 502);
  }

  if (!upstream.ok || !Array.isArray(upstream.stations)) {
    return json({ ok: false, error: 'upstream_payload', detail: upstream.message }, 502);
  }

  // Trim to fields the dashboard actually uses; keep payload small for cache.
  const stations = upstream.stations.slice(0, 60).map((s) => ({
    id: s.id,
    name: s.name,
    brand: s.brand,
    street: s.street,
    place: s.place,
    lat: s.lat,
    lng: s.lng,
    dist: s.dist,
    e10: typeof s.e10 === 'number' ? s.e10 : null,
    e5:  typeof s.e5  === 'number' ? s.e5  : null,
    diesel: typeof s.diesel === 'number' ? s.diesel : null,
    isOpen: !!s.isOpen,
    postCode: s.postCode ?? null,
  }));

  const payload = {
    ok: true,
    fetched_at: new Date().toISOString(),
    license: upstream.license || 'CC BY 4.0 · Bundeskartellamt MTS-K',
    source: 'Tankerkönig Spritpreis-API',
    center: { lat: WI_LAT, lng: WI_LNG, radius_km: RADIUS_KM },
    count: stations.length,
    stations,
  };

  return json(payload, 200, {
    // 5 min Tankerkönig AGB; allow stale-while-revalidate so cold misses are rare.
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  });
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      ...extraHeaders,
    },
  });
}

// dummy reference so TS doesn't yell about Deno typing in non-Deno builds
declare const Deno: { env: { get(k: string): string | undefined } } | undefined;
