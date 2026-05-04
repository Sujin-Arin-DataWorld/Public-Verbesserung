#!/usr/bin/env python3
"""Convert raw_charging.geojson to compact JS:
  - CHARGING_STATIONS: {lat,lng,op,addr,art,kw,n,district} per station
  - per-district counts → injected into ORTSBEZIRKE[*].charging at load time
"""
import json
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
    """ring = list of [lat,lng]. Returns True if (lat,lng) inside polygon."""
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


def shorten_op(s):
    """Shorten operator names for compact tooltips."""
    if not s:
        return ""
    s = s.replace(" GmbH & Co. KG", "")
    s = s.replace(" GmbH", "").replace(" AG", "").replace(" e.V.", "")
    s = s.replace(" Versorgungs", "")
    return s.strip()


def shorten_addr(s):
    if not s:
        return ""
    return s.replace("straße", "str.").replace("Straße", "Str.")


def main():
    fc = json.loads(
        Path("raw_charging.geojson").read_text()
    )
    # Get district polygons directly from the converted GeoJSON we made earlier
    # in Phase 1. Each feature has properties.name + Polygon ring (in [lng,lat]
    # GeoJSON order — convert to Leaflet [lat,lng] for our point-in-polygon).
    dists = json.loads(Path("wiesbaden_ortsbezirke.geojson").read_text())
    OUR = [
        "Mitte","Rheingauviertel/Hollerborn","Westend/Bleichstraße","Nordost",
        "Südost","Biebrich","Schierstein","Frauenstein","Dotzheim",
        "Klarenthal","Sonnenberg","Rambach","Heßloch","Kloppenheim",
        "Igstadt","Bierstadt","Erbenheim","Nordenstadt","Delkenheim",
        "Medenbach","Breckenheim","Naurod","Auringen","Mainz-Kostheim",
        "Mainz-Kastel","Mainz-Amöneburg",
    ]
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
        polygons[our] = [[p[1], p[0]] for p in ring_lnglat]  # [lat,lng]

    stations = []
    counts = {name: 0 for name in polygons}

    skipped = 0
    for f in fc["features"]:
        g = f["geometry"]
        if g["type"] != "Point":
            skipped += 1
            continue
        lng, lat = g["coordinates"][0], g["coordinates"][1]
        p = f["properties"]
        # Skip stations clearly outside Wiesbaden bounding box
        if not (49.99 < lat < 50.16 and 8.10 < lng < 8.40):
            skipped += 1
            continue

        district = None
        for name, ring in polygons.items():
            if point_in_polygon(lat, lng, ring):
                district = name
                counts[name] += 1
                break

        # Total connectors: sum Anzahl_Lad, fall back to 1
        n_plugs = p.get("Anzahl_Lad") or 1
        try:
            n_plugs = int(n_plugs)
        except Exception:
            n_plugs = 1

        # Max kW: max over P1..P4
        kws = []
        for k in ("P1__kW_", "P2_in_kW", "P3__kW_", "P4__kW_"):
            v = p.get(k)
            try:
                if v is not None and float(v) > 0:
                    kws.append(float(v))
            except Exception:
                pass
        max_kw = max(kws) if kws else None

        art = p.get("Art_der_La") or ""  # "Normalladeeinrichtung" / "Schnellladeeinrichtung"
        art_short = "fast" if "schnell" in art.lower() else "normal"

        stations.append({
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "op": shorten_op(p.get("Betreiber") or ""),
            "addr": shorten_addr(p.get("Adresse") or ""),
            "art": art_short,
            "kw": max_kw,
            "n": n_plugs,
            "d": district or "",
        })

    # Compact JS output
    js_arr = "[" + ",".join(
        "{lat:%g,lng:%g,op:%s,addr:%s,art:%s,kw:%s,n:%d,d:%s}" % (
            s["lat"], s["lng"],
            json.dumps(s["op"], ensure_ascii=False),
            json.dumps(s["addr"], ensure_ascii=False),
            json.dumps(s["art"]),
            ("null" if s["kw"] is None else "%g" % s["kw"]),
            s["n"],
            json.dumps(s["d"], ensure_ascii=False),
        ) for s in stations
    ) + "]"

    js_counts = "{" + ",".join(
        '%s:%d' % (json.dumps(name, ensure_ascii=False), n)
        for name, n in counts.items()
    ) + "}"

    snippet = (
        "// Charging stations — Stadt Wiesbaden Open Data\n"
        "// Source: opendata.cloud.wiesbaden.de/app/data-catalog/fddf927f-...\n"
        "// 'Öffentliche Ladeeinrichtungen in Wiesbaden – Januar 2026'\n"
        "// CC BY 4.0 · Amt für Statistik und Stadtforschung\n"
        f"const CHARGING_STATIONS = {js_arr};\n"
        f"const CHARGING_COUNTS = {js_counts};\n"
    )
    Path("_charging.js.snippet").write_text(snippet)

    print(f"Stations parsed: {len(stations)}")
    print(f"Skipped (out of Wiesbaden bbox or non-Point): {skipped}")
    matched = sum(1 for s in stations if s["d"])
    print(f"Matched to a district: {matched}/{len(stations)}")
    print(f"Snippet bytes: {Path('_charging.js.snippet').stat().st_size}")
    print()
    print("Counts per district (top 10):")
    for name, n in sorted(counts.items(), key=lambda kv: -kv[1])[:10]:
        print(f"  {n:3d}  {name}")
    unmatched = [s for s in stations if not s["d"]]
    if unmatched:
        print(f"\nUnmatched ({len(unmatched)} stations near boundary):")
        for s in unmatched[:5]:
            print(f"  {s['lat']:.4f},{s['lng']:.4f}  {s['addr'][:40]}")


if __name__ == "__main__":
    main()
