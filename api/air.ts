// Wiesbaden-Lagebild — Umweltbundesamt (UBA) air-quality proxy.
//
// The UBA air_data v3 API sends no CORS header, so the browser can't fetch it
// directly (it throws "No 'Access-Control-Allow-Origin' header"). This Edge
// Function calls UBA server-side and returns the same JSON with CORS headers.
// No API key required — UBA air_data is a public endpoint. License: © UBA.
//
// Route: /api/air?date_from=&date_to=&time_from=&time_to=&station=&component=
// The frontend calls this once per component (pm10/no2/pm2_5) and aggregates
// to daily averages itself, so the proxy passes UBA's payload through verbatim.
//
// Mock-Badge-Disziplin §9.2: on any upstream failure return a non-200 so the
// client falls back to the build-time snapshot — never fabricate readings.

export const config = { runtime: 'edge' };

const UBA_BASE = 'https://www.umweltbundesamt.de/api/air_data/v3/measures/json';

export default async function handler(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams;

  // Validate every param instead of forwarding arbitrary input — this proxy
  // only ever talks to the UBA measures endpoint, never an attacker-chosen URL.
  const station = intParam(q.get('station'));
  const component = intParam(q.get('component'));
  const timeFrom = intParam(q.get('time_from'));
  const timeTo = intParam(q.get('time_to'));
  const dateFrom = dateParam(q.get('date_from'));
  const dateTo = dateParam(q.get('date_to'));

  if (station == null || component == null || timeFrom == null || timeTo == null
      || dateFrom == null || dateTo == null) {
    return json({ ok: false, error: 'bad_params' }, 400);
  }

  const url = `${UBA_BASE}?date_from=${dateFrom}&date_to=${dateTo}`
    + `&time_from=${timeFrom}&time_to=${timeTo}&station=${station}&component=${component}`;

  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) {
      return json({ ok: false, error: 'upstream_http', status: resp.status }, 502);
    }
    const data = await resp.json();
    // Pass UBA's payload through unchanged; the client knows its shape.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        // UBA refreshes hourly; 15 min edge cache + SWR keeps cold misses rare.
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (e: any) {
    return json({ ok: false, error: 'upstream_fetch', detail: e?.message || String(e) }, 502);
  }
}

function intParam(v: string | null): number | null {
  if (v == null || !/^\d+$/.test(v)) return null;
  return parseInt(v, 10);
}

function dateParam(v: string | null): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
