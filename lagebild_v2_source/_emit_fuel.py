#!/usr/bin/env python3
"""Build FUEL_STATIONS_V2 with REAL prices from Tankerkönig MTS-K API
(Bundeskartellamt). Coordinates + brand + address from OpenStreetMap;
district matched via point-in-polygon over Ortsbezirke.

v2.7: replaces the v2.6 brand-anchored mock prices with live snapshot.
At runtime, app.js calls /api/fuel (Vercel Edge Function proxy) for
≤5 min refresh; this file is the build-time fallback (Mock-Badge §9.2).

License: OSM ODbL · Tankerkönig CC BY 4.0
Auth: TANKERKOENIG_API_KEY env var (or .env.local at repo root).
Usage:
    python3 _emit_fuel.py
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def norm(s):
    s = s.lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    return re.sub(r"[\/\-\s]+", "", s)


def fuzzy_match(osm_name, our_name):
    a, b = norm(osm_name), norm(our_name)
    return a == b or a.startswith(b.split("/")[0]) or b.startswith(a.split("/")[0])


def point_in_polygon(lat, lng, ring):
    n = len(ring)
    inside = False
    j = n - 1
    for i in range(n):
        yi, xi = ring[i]
        yj, xj = ring[j]
        if ((yi > lat) != (yj > lat)) and (
            lng < (xj - xi) * (lat - yi) / (yj - yi) + xi
        ):
            inside = not inside
        j = i
    return inside


TANKERKOENIG_BASE = "https://creativecommons.tankerkoenig.de/json/list.php"
WI_LAT, WI_LNG, RAD_KM = 50.0782, 8.2398, 10


def load_token() -> str:
    t = os.environ.get("TANKERKOENIG_API_KEY", "").strip()
    if t:
        return t
    here = Path(__file__).resolve().parent
    for path in [here.parent / ".env.local", here / ".env.local"]:
        if path.exists():
            for line in path.read_text().splitlines():
                if line.startswith("TANKERKOENIG_API_KEY="):
                    return line.split("=", 1)[1].strip()
    sys.exit("ERROR: TANKERKOENIG_API_KEY not set and no .env.local found.")


def fetch_tankerkoenig(api_key: str) -> list:
    qs = urllib.parse.urlencode({
        "lat": WI_LAT, "lng": WI_LNG, "rad": RAD_KM,
        "type": "all", "sort": "dist", "apikey": api_key,
    })
    url = f"{TANKERKOENIG_BASE}?{qs}"
    with urllib.request.urlopen(url, timeout=30) as r:
        data = json.load(r)
    if not data.get("ok"):
        sys.exit(f"ERROR: Tankerkönig responded ok=false: {data.get('message')}")
    return data.get("stations", [])


OUR = [
    "Mitte","Rheingauviertel/Hollerborn","Westend/Bleichstraße","Nordost",
    "Südost","Biebrich","Schierstein","Frauenstein","Dotzheim",
    "Klarenthal","Sonnenberg","Rambach","Heßloch","Kloppenheim",
    "Igstadt","Bierstadt","Erbenheim","Nordenstadt","Delkenheim",
    "Medenbach","Breckenheim","Naurod","Auringen","Mainz-Kostheim",
    "Mainz-Kastel","Mainz-Amöneburg",
]


def short_brand(brand: str) -> str:
    if not brand:
        return "Freie Tankstelle"
    if "totalenergies" in brand.lower():
        return "TotalEnergies"
    return brand.strip()


def short_street(street: str) -> str:
    if not street:
        return ""
    return street.replace("straße", "str.").replace("Straße", "Str.")


def main():
    api_key = load_token()
    here = Path(__file__).resolve().parent

    # 1) District polygons (for point-in-polygon Ortsbezirk match)
    geojson_path = here / "wiesbaden_ortsbezirke.geojson"
    dists = json.loads(geojson_path.read_text())
    polygons = {}
    for our in OUR:
        feat = next(
            (f for f in dists["features"] if fuzzy_match(f["properties"]["name"], our)),
            None,
        )
        if not feat:
            continue
        g = feat["geometry"]
        ring_lnglat = g["coordinates"][0] if g["type"] == "Polygon" else max(
            (poly[0] for poly in g["coordinates"]), key=len
        )
        polygons[our] = [[p[1], p[0]] for p in ring_lnglat]

    # 2) Live fetch from Tankerkönig
    print(f"Fetching Tankerkönig MTS-K (lat={WI_LAT}, lng={WI_LNG}, rad={RAD_KM} km)…")
    raw = fetch_tankerkoenig(api_key)
    print(f"  {len(raw)} stations returned")

    stations = []
    for s in raw:
        lat, lng = s.get("lat"), s.get("lng")
        if lat is None or lng is None:
            continue
        e10 = s.get("e10")
        diesel = s.get("diesel")
        # Skip stations with no fuel prices at all (closed permanently or out of stock)
        if e10 in (None, False) and diesel in (None, False):
            continue

        district = ""
        for name, ring in polygons.items():
            if point_in_polygon(lat, lng, ring):
                district = name
                break

        brand = short_brand(s.get("brand") or "")
        street = s.get("street") or ""
        houseno = s.get("houseNumber") or ""
        addr_short = (short_street(street) + (f" {houseno}" if houseno else "")).strip() or (s.get("name") or "")
        name_disp = brand
        if addr_short:
            name_disp = f"{brand} {addr_short}"

        stations.append({
            "id": s.get("id"),                 # TK uuid
            "name": name_disp[:60],
            "brand": brand,
            "addr": addr_short[:50],
            "district": district,
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "e10": round(e10, 3) if isinstance(e10, (int, float)) else None,
            "e5":  round(s.get("e5"), 3) if isinstance(s.get("e5"), (int, float)) else None,
            "diesel": round(diesel, 3) if isinstance(diesel, (int, float)) else None,
            "isOpen": bool(s.get("isOpen")),
            "place": s.get("place") or "",
            "postCode": s.get("postCode"),
        })

    # Sort cheapest E10 first (None goes last)
    stations.sort(key=lambda s: (s["e10"] is None, s["e10"] or 9.999))

    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = {
        "meta": {
            "fetched_at": fetched_at,
            "source": "Tankerkönig MTS-K (Bundeskartellamt)",
            "license": "CC BY 4.0",
            "license_url": "https://creativecommons.tankerkoenig.de",
            "center": {"lat": WI_LAT, "lng": WI_LNG, "radius_km": RAD_KM},
            "count": len(stations),
        },
        "stations": stations,
    }
    snippet = (
        "// Fuel stations — REAL prices from Tankerkönig MTS-K API (Bundeskartellamt).\n"
        "// Build-time snapshot; runtime overrides via /api/fuel Edge Function (5 min cache).\n"
        f"// Stand: {fetched_at} · License: CC BY 4.0\n"
        f"const FUEL_STATIONS_V2_META = {json.dumps(payload['meta'], ensure_ascii=False)};\n"
        f"const FUEL_STATIONS_V2 = {json.dumps(stations, ensure_ascii=False, separators=(',', ':'))};\n"
    )
    out_path = here / "_fuel_v2.js.snippet"
    out_path.write_text(snippet)

    matched = sum(1 for s in stations if s["district"])
    open_count = sum(1 for s in stations if s["isOpen"])
    print(f"Stations: {len(stations)} (open: {open_count}, district-matched: {matched})")
    print(f"Snippet bytes: {out_path.stat().st_size}")
    valid = [s for s in stations if s["e10"] is not None]
    if valid:
        print()
        print("Cheapest 3 E10:")
        for s in valid[:3]:
            print(f"  {s['e10']:.3f} €  {s['brand']:18s}  {s['addr'][:30]:30s}  ({s['district'] or '—'})")
        print("Most expensive 3 E10:")
        for s in valid[-3:]:
            print(f"  {s['e10']:.3f} €  {s['brand']:18s}  {s['addr'][:30]:30s}  ({s['district'] or '—'})")


if __name__ == "__main__":
    main()
