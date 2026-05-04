#!/usr/bin/env python3
"""Convert raw_parking.osm.json (188 nodes) → JS OSM_PARKING.
Same pattern as _emit_gastro.py.
"""
import json, re
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
    n = len(ring); inside = False; j = n - 1
    for i in range(n):
        yi, xi = ring[i]; yj, xj = ring[j]
        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


OUR = ["Mitte","Rheingauviertel/Hollerborn","Westend/Bleichstraße","Nordost","Südost",
       "Biebrich","Schierstein","Frauenstein","Dotzheim","Klarenthal","Sonnenberg",
       "Rambach","Heßloch","Kloppenheim","Igstadt","Bierstadt","Erbenheim","Nordenstadt",
       "Delkenheim","Medenbach","Breckenheim","Naurod","Auringen","Mainz-Kostheim",
       "Mainz-Kastel","Mainz-Amöneburg"]


def main():
    osm = json.loads(Path("raw_parking.osm.json").read_text())
    nodes = [e for e in osm["elements"] if e["type"] == "node"]
    dists = json.loads(Path("wiesbaden_ortsbezirke.geojson").read_text())
    polygons = {}
    for our in OUR:
        feat = next((f for f in dists["features"] if fuzzy_match(f["properties"]["name"], our)), None)
        if not feat: continue
        g = feat["geometry"]
        ring_lnglat = g["coordinates"][0] if g["type"] == "Polygon" else max((p[0] for p in g["coordinates"]), key=len)
        polygons[our] = [[p[1], p[0]] for p in ring_lnglat]

    out = []
    for n in nodes:
        lat, lng = n["lat"], n["lon"]
        if not (49.99 < lat < 50.16 and 8.10 < lng < 8.40): continue
        tags = n.get("tags", {})
        district = ""
        for name, ring in polygons.items():
            if point_in_polygon(lat, lng, ring):
                district = name; break
        cap = tags.get("capacity")
        try: cap = int(cap) if cap else None
        except (ValueError, TypeError): cap = None
        out.append({
            "id": n["id"], "lat": round(lat, 5), "lng": round(lng, 5),
            "n": (tags.get("name") or "")[:36],
            "t": tags.get("parking") or "",        # surface / underground / multi-storey / etc.
            "f": tags.get("fee") or "unknown",     # yes / no / unknown
            "c": cap,
            "d": district,
        })

    def js(o):
        return ('{id:%d,lat:%g,lng:%g,n:%s,t:%s,f:%s,c:%s,d:%s}' % (
            o["id"], o["lat"], o["lng"],
            json.dumps(o["n"], ensure_ascii=False),
            json.dumps(o["t"]),
            json.dumps(o["f"]),
            "null" if o["c"] is None else o["c"],
            json.dumps(o["d"], ensure_ascii=False),
        ))
    arr = "[" + ",".join(js(o) for o in out) + "]"
    snippet = (
        "// OSM Parking — Wiesbaden amenity=parking nodes.\n"
        "// Source: Overpass API. ODbL. Build-time fetch + point-in-polygon.\n"
        "// Field f = fee (yes/no/unknown), t = type (surface/underground/etc), c = capacity.\n"
        f"const OSM_PARKING = {arr};\n"
    )
    Path("_parking.js.snippet").write_text(snippet)

    matched = sum(1 for s in out if s["d"])
    from collections import Counter
    fee_cnt = Counter(s["f"] for s in out)
    print(f"Total: {len(out)}, Matched: {matched}/{len(out)}")
    print(f"Fee: {dict(fee_cnt)}")
    print(f"Snippet bytes: {Path('_parking.js.snippet').stat().st_size:,}")
    by_d = Counter(s["d"] for s in out if s["d"])
    print(f"\nTop 8 districts:")
    for d, c in by_d.most_common(8):
        print(f"  {c:4d}  {d}")


if __name__ == "__main__":
    main()
