#!/usr/bin/env python3
"""Convert raw_fuel.osm.json to FUEL_STATIONS_V2 with:
  - real OSM coordinates + brand + address
  - matched district (Ortsbezirk)
  - mock prices (brand-anchored ± random jitter, deterministic seed)
  - mock 'last updated' timestamps in minutes ago

Real prices will eventually come from the Tankerkönig MTS-K API.
"""
import json
import random
import re
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


# Brand → (e10_base, diesel_base) — anchored to typical 2026 Wiesbaden prices.
# All values are MOCK pending Tankerkönig API integration.
BRAND_BASE = {
    "JET":          (1.659, 1.559),  # discounter
    "bft":          (1.665, 1.565),
    "Freie":        (1.669, 1.569),
    "(no brand)":   (1.679, 1.575),
    "Classic":      (1.685, 1.585),
    "Express":      (1.685, 1.585),
    "star":         (1.689, 1.589),
    "Esso":         (1.699, 1.599),
    "Aral":         (1.719, 1.609),
    "Shell":        (1.719, 1.609),
    "Total":        (1.749, 1.639),
    "TotalEnergies":(1.749, 1.639),
}


OUR = [
    "Mitte","Rheingauviertel/Hollerborn","Westend/Bleichstraße","Nordost",
    "Südost","Biebrich","Schierstein","Frauenstein","Dotzheim",
    "Klarenthal","Sonnenberg","Rambach","Heßloch","Kloppenheim",
    "Igstadt","Bierstadt","Erbenheim","Nordenstadt","Delkenheim",
    "Medenbach","Breckenheim","Naurod","Auringen","Mainz-Kostheim",
    "Mainz-Kastel","Mainz-Amöneburg",
]


def main():
    osm = json.loads(Path("raw_fuel.osm.json").read_text())
    nodes = [e for e in osm["elements"] if e["type"] == "node"]

    # District polygons from earlier conversion
    dists = json.loads(Path("wiesbaden_ortsbezirke.geojson").read_text())
    polygons = {}
    for our in OUR:
        feat = next(
            (f for f in dists["features"]
             if fuzzy_match(f["properties"]["name"], our)),
            None,
        )
        if not feat:
            continue
        g = feat["geometry"]
        ring_lnglat = g["coordinates"][0] if g["type"] == "Polygon" else max(
            (poly[0] for poly in g["coordinates"]), key=len
        )
        polygons[our] = [[p[1], p[0]] for p in ring_lnglat]

    rng = random.Random(2026)  # deterministic for stable mock
    stations = []
    for n in nodes:
        lat, lng = n["lat"], n["lon"]
        tags = n.get("tags", {})
        brand_raw = tags.get("brand") or "(no brand)"
        # Normalize brand name for lookup
        brand_key = "TotalEnergies" if "totalenergies" in brand_raw.lower() else brand_raw
        brand_key = "Freie" if "freie" in brand_key.lower() else brand_key
        base = BRAND_BASE.get(brand_key, BRAND_BASE["(no brand)"])

        # Per-station deterministic jitter ±0.025 €
        jitter_e10 = rng.uniform(-0.025, 0.025)
        jitter_d = rng.uniform(-0.020, 0.020)
        e10 = round(base[0] + jitter_e10, 3)
        diesel = round(base[1] + jitter_d, 3)

        # District match
        district = ""
        for name, ring in polygons.items():
            if point_in_polygon(lat, lng, ring):
                district = name
                break

        # Address from OSM tags
        street = tags.get("addr:street", "")
        houseno = tags.get("addr:housenumber", "")
        addr = f"{street} {houseno}".strip() or tags.get("name", "")

        # Display name: brand + short address
        display_brand = brand_raw if brand_raw != "(no brand)" else "Freie Tankstelle"
        name_short = display_brand
        if street:
            short_street = street.replace("straße", "str.").replace("Straße", "Str.")
            name_short = f"{display_brand} {short_street}"
            if houseno:
                name_short += f" {houseno}"

        # Mock 'last updated' minutes ago (1-15)
        updated_min = rng.randint(1, 15)

        stations.append({
            "id": n["id"],
            "name": name_short[:50],
            "brand": display_brand,
            "addr": addr[:40] if addr else display_brand,
            "district": district,
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "e10": e10,
            "diesel": diesel,
            "updated_min": updated_min,
        })

    # Sort cheapest first for nicer JS rendering
    stations.sort(key=lambda s: s["e10"])

    # Compact JS — keys minified
    def js_obj(s):
        return (
            "{id:%d,name:%s,brand:%s,addr:%s,d:%s,lat:%g,lng:%g,e10:%g,diesel:%g,upd:%d}" % (
                s["id"],
                json.dumps(s["name"], ensure_ascii=False),
                json.dumps(s["brand"], ensure_ascii=False),
                json.dumps(s["addr"], ensure_ascii=False),
                json.dumps(s["district"], ensure_ascii=False),
                s["lat"], s["lng"], s["e10"], s["diesel"], s["updated_min"]
            )
        )

    arr = "[" + ",".join(js_obj(s) for s in stations) + "]"
    snippet = (
        "// Fuel stations — coordinates from OpenStreetMap (amenity=fuel),\n"
        "// brand + address from OSM tags. Prices are MOCK, anchored to typical\n"
        "// Wiesbaden 2026 prices ± ~0.025 € jitter for visual variety.\n"
        "// Production: replace `e10`/`diesel`/`upd` via Tankerkönig MTS-K API.\n"
        "// OSM data: ODbL · Tankerkönig: CC BY 4.0 (after key approval).\n"
        f"const FUEL_STATIONS_V2 = {arr};\n"
    )
    Path("_fuel_v2.js.snippet").write_text(snippet)

    matched = sum(1 for s in stations if s["district"])
    print(f"Stations: {len(stations)}")
    print(f"District-matched: {matched}/{len(stations)}")
    print(f"Snippet bytes: {Path('_fuel_v2.js.snippet').stat().st_size}")
    print()
    print("Cheapest 3:")
    for s in stations[:3]:
        print(f"  {s['e10']:.3f} €  {s['brand']:18s}  {s['addr'][:30]:30s}  ({s['district'] or '—'})")
    print("Most expensive 3:")
    for s in stations[-3:]:
        print(f"  {s['e10']:.3f} €  {s['brand']:18s}  {s['addr'][:30]:30s}  ({s['district'] or '—'})")


if __name__ == "__main__":
    main()
