#!/usr/bin/env python3
"""Convert raw_gastro.osm.json (Wiesbaden 724 amenities) → JS:
  OSM_GASTRONOMIE: { meta: {...}, items: [...] }
  - items: { lat, lng, n, t, c, d, h, w, wc, os, s }
  - meta:  { fetched (date), source (Overpass), license (ODbL) }

Pattern matches _emit_charging.py / _emit_fuel.py — point-in-polygon over
the 26 Ortsbezirke rings in wiesbaden_ortsbezirke.geojson.

To refresh raw_gastro.osm.json from live OSM:
  curl -sS "https://overpass-api.de/api/interpreter" \\
    --data-urlencode 'data=[out:json][timeout:60];area(3600062496)->.wb;(node["amenity"~"^(cafe|restaurant|bar|pub|biergarten|fast_food)$"](area.wb););out tags geom;' \\
    -o raw_gastro.osm.json
"""
import datetime as _dt, json, re
from pathlib import Path


def norm(s):
    s = s.lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    return re.sub(r"[\/\-\s]+", "", s)


def fuzzy_match(a, b):
    na, nb = norm(a), norm(b)
    return na == nb or na.startswith(nb.split("/")[0]) or nb.startswith(na.split("/")[0])


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


OUR = [
    "Mitte","Rheingauviertel/Hollerborn","Westend/Bleichstraße","Nordost",
    "Südost","Biebrich","Schierstein","Frauenstein","Dotzheim",
    "Klarenthal","Sonnenberg","Rambach","Heßloch","Kloppenheim",
    "Igstadt","Bierstadt","Erbenheim","Nordenstadt","Delkenheim",
    "Medenbach","Breckenheim","Naurod","Auringen","Mainz-Kostheim",
    "Mainz-Kastel","Mainz-Amöneburg",
]


def shorten_cuisine(s):
    if not s:
        return ""
    # First cuisine only — semicolons split multi
    return s.split(";")[0].strip()[:24]


def main():
    osm = json.loads(Path("raw_gastro.osm.json").read_text())
    nodes = [e for e in osm["elements"] if e["type"] == "node"]

    dists = json.loads(Path("wiesbaden_ortsbezirke.geojson").read_text())
    polygons = {}
    for our in OUR:
        feat = next(
            (f for f in dists["features"] if fuzzy_match(f["properties"]["name"], our)),
            None,
        )
        if not feat:
            continue
        g = feat["geometry"]
        ring_lnglat = (
            g["coordinates"][0]
            if g["type"] == "Polygon"
            else max((p[0] for p in g["coordinates"]), key=len)
        )
        polygons[our] = [[p[1], p[0]] for p in ring_lnglat]

    out = []
    for n in nodes:
        lat, lng = n["lat"], n["lon"]
        if not (49.99 < lat < 50.16 and 8.10 < lng < 8.40):
            continue
        tags = n.get("tags", {})
        district = ""
        for name, ring in polygons.items():
            if point_in_polygon(lat, lng, ring):
                district = name
                break
        # v2.6.3: capture extra OSM tags as a "completeness" proxy for
        # well-maintained venues (no public review API exists for free —
        # tag richness correlates with well-curated, currently-operating
        # spots).
        website = (tags.get("website") or tags.get("contact:website") or "")[:120]
        opening = (tags.get("opening_hours") or "")[:80]
        # Score = tag-richness (max 5). Used to surface "best-known" venues.
        score = sum([
            1 if tags.get("name") else 0,
            1 if tags.get("cuisine") else 0,
            1 if opening else 0,
            1 if website else 0,
            1 if tags.get("wheelchair") in ("yes", "limited") else 0,
        ])
        out.append({
            "id": n["id"],
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "n": (tags.get("name") or "")[:48],
            "t": tags.get("amenity") or "",
            "c": shorten_cuisine(tags.get("cuisine") or ""),
            "d": district,
            "h": opening,                                # hours
            "w": website,                                # website (+ contact:website fallback)
            "wc": tags.get("wheelchair") or "",          # wheelchair
            "os": tags.get("outdoor_seating") or "",     # outdoor seating
            "s": score,                                  # 0..5 completeness score
        })

    # Compact JS
    def js_obj(o):
        return (
            "{id:%d,lat:%g,lng:%g,n:%s,t:%s,c:%s,d:%s,h:%s,w:%s,wc:%s,os:%s,s:%d}" % (
                o["id"], o["lat"], o["lng"],
                json.dumps(o["n"], ensure_ascii=False),
                json.dumps(o["t"]),
                json.dumps(o["c"], ensure_ascii=False),
                json.dumps(o["d"], ensure_ascii=False),
                json.dumps(o["h"], ensure_ascii=False),
                json.dumps(o["w"], ensure_ascii=False),
                json.dumps(o["wc"]),
                json.dumps(o["os"]),
                o["s"],
            )
        )
    arr = "[" + ",".join(js_obj(o) for o in out) + "]"
    # v2.6.4: emit { meta, items } so the drawer can show "Stand: <date>"
    # — OSM is community-curated; new venues lag a few days/weeks.
    fetched = _dt.datetime.utcfromtimestamp(
        Path("raw_gastro.osm.json").stat().st_mtime
    ).strftime("%Y-%m-%d")
    meta = {
        "fetched": fetched,
        "source": "Overpass API · OSM relation 62496 (Wiesbaden)",
        "source_url": "https://www.openstreetmap.org/relation/62496",
        "license": "Open Data Commons Open Database License (ODbL)",
        "note": (
            "OSM ist Community-gepflegt. Neue Lokale brauchen oft Tage bis "
            "Wochen, bis sie eingetragen werden. Diese Liste ist die letzte "
            "Build-Zeit-Aufnahme."
        ),
    }
    snippet = (
        "// OSM Gastronomie — Wiesbaden Cafés / Restaurants / Bars / Pubs /\n"
        "// Biergärten / Fast food. Source: Overpass API (relation 62496).\n"
        "// Build-time fetch + point-in-polygon. ODbL.\n"
        f"const OSM_GASTRONOMIE = {{meta:{json.dumps(meta, ensure_ascii=False)},items:{arr}}};\n"
    )
    Path("_gastro.js.snippet").write_text(snippet)

    matched = sum(1 for s in out if s["d"])
    from collections import Counter
    by_type = Counter(s["t"] for s in out)
    by_district = Counter(s["d"] for s in out if s["d"])
    print(f"Total: {len(out)}, Matched to district: {matched}/{len(out)}")
    print(f"Snippet bytes: {Path('_gastro.js.snippet').stat().st_size:,}")
    print(f"\nBy type:")
    for t, c in by_type.most_common():
        print(f"  {c:4d}  {t}")
    print(f"\nTop 8 districts:")
    for d, c in by_district.most_common(8):
        print(f"  {c:4d}  {d}")


if __name__ == "__main__":
    main()
