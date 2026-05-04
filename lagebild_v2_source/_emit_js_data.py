#!/usr/bin/env python3
"""Read converted GeoJSON, simplify rings (Douglas-Peucker), emit JS embedded data.

Outputs two snippets to be inserted into data.js:
  - OSM_POLYGONS: { ourName: [[lat,lng], ...] }   (Leaflet order)
  - WIESBADEN_CITY_GEOJSON: original GeoJSON (for L.polygon mask)

Tolerance ~0.0002 deg ≈ 22m: keeps city shape recognizable while reducing
total points by 60-80% — important for build_v2.sh single-file output size.
"""
import json
import re
import sys
from pathlib import Path

TOLERANCE = 0.0002  # ~22 m

OUR = [
    "Mitte", "Rheingauviertel/Hollerborn", "Westend/Bleichstraße", "Nordost",
    "Südost", "Biebrich", "Schierstein", "Frauenstein", "Dotzheim",
    "Klarenthal", "Sonnenberg", "Rambach", "Heßloch", "Kloppenheim",
    "Igstadt", "Bierstadt", "Erbenheim", "Nordenstadt", "Delkenheim",
    "Medenbach", "Breckenheim", "Naurod", "Auringen", "Mainz-Kostheim",
    "Mainz-Kastel", "Mainz-Amöneburg",
]


def norm(s):
    s = s.lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    return re.sub(r"[\/\-\s]+", "", s)


def fuzzy_match(osm_name, our_name):
    a, b = norm(osm_name), norm(our_name)
    return a == b or a.startswith(b.split("/")[0]) or b.startswith(a.split("/")[0])


def perp_dist(p, a, b):
    if a == b:
        return ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** 0.5
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
    t = max(0, min(1, t))
    px, py = a[0] + t * dx, a[1] + t * dy
    return ((p[0] - px) ** 2 + (p[1] - py) ** 2) ** 0.5


def douglas_peucker(points, tol):
    if len(points) < 3:
        return list(points)
    dmax = 0.0
    idx = 0
    for i in range(1, len(points) - 1):
        d = perp_dist(points[i], points[0], points[-1])
        if d > dmax:
            idx, dmax = i, d
    if dmax > tol:
        left = douglas_peucker(points[: idx + 1], tol)
        right = douglas_peucker(points[idx:], tol)
        return left[:-1] + right
    return [points[0], points[-1]]


def simplify_ring(ring, tol=TOLERANCE):
    # Ring is closed (first == last). Simplify but keep closure.
    closed = ring[0] == ring[-1]
    pts = ring[:-1] if closed else list(ring)
    simplified = douglas_peucker(pts, tol)
    if closed:
        simplified.append(simplified[0])
    return simplified


def to_leaflet(ring):
    # GeoJSON [lng,lat] -> Leaflet [lat,lng], rounded to 5 decimals (~1.1m)
    return [[round(p[1], 5), round(p[0], 5)] for p in ring]


def js_array(arr, indent=0):
    pad = " " * indent
    inner = ",".join(f"[{p[0]},{p[1]}]" for p in arr)
    return f"[{inner}]"


def emit_polygons(geojson_path):
    fc = json.loads(Path(geojson_path).read_text())
    mapping = {}  # our_name -> simplified leaflet ring
    for our in OUR:
        feat = next(
            (f for f in fc["features"] if fuzzy_match(f["properties"]["name"], our)),
            None,
        )
        if not feat:
            print(f"WARN: no match for {our}", file=sys.stderr)
            continue
        g = feat["geometry"]
        if g["type"] == "Polygon":
            ring = g["coordinates"][0]
        else:  # MultiPolygon — pick largest outer ring
            outers = [poly[0] for poly in g["coordinates"]]
            ring = max(outers, key=len)
        simplified = simplify_ring(ring)
        leaflet_ring = to_leaflet(simplified)
        mapping[our] = leaflet_ring

    lines = ["const OSM_POLYGONS = {"]
    for name, ring in mapping.items():
        lines.append(f'  "{name}": {js_array(ring)},')
    lines.append("};")
    return "\n".join(lines), mapping


def emit_city(geojson_path):
    fc = json.loads(Path(geojson_path).read_text())
    feat = fc["features"][0]
    g = feat["geometry"]
    if g["type"] == "Polygon":
        rings = g["coordinates"]
    else:
        rings = [poly[0] for poly in g["coordinates"]]
    simplified = [simplify_ring(r) for r in rings]
    # Output as GeoJSON Polygon in Leaflet's expected raw GeoJSON form (we still
    # convert lng/lat -> lat/lng inside app.js when rendering the mask).
    coords_js = "[" + ",".join(
        "[" + ",".join(f"[{p[0]:.5f},{p[1]:.5f}]" for p in r) + "]"
        for r in simplified
    ) + "]"
    pts_total = sum(len(r) for r in simplified)
    obj = (
        "const WIESBADEN_CITY_GEOJSON = {"
        '"type":"Feature","properties":{"name":"Wiesbaden","admin_level":"6"},'
        '"geometry":{"type":"Polygon","coordinates":' + coords_js + "}};"
    )
    return obj, pts_total


if __name__ == "__main__":
    poly_js, mapping = emit_polygons("wiesbaden_ortsbezirke.geojson")
    city_js, city_pts = emit_city("wiesbaden_city.geojson")

    Path("_polygons.js.snippet").write_text(poly_js + "\n\n" + city_js + "\n")

    pts_total = sum(len(r) for r in mapping.values())
    sizes = sorted(((len(r), n) for n, r in mapping.items()), reverse=True)
    print(f"Districts mapped: {len(mapping)}/26")
    print(f"District points total (after simplify, tol={TOLERANCE}): {pts_total}")
    print(f"  largest: {sizes[0]}, smallest: {sizes[-1]}")
    print(f"City outline points after simplify: {city_pts} (was 1787)")
    print(f"Snippet size: {Path('_polygons.js.snippet').stat().st_size:,} bytes")
