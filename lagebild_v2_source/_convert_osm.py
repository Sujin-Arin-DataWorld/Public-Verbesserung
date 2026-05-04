#!/usr/bin/env python3
"""Convert Overpass `out geom;` JSON → GeoJSON polygons.
Stitches outer ways of a relation into closed ring(s) by matching endpoints.
"""
import json
import sys
from pathlib import Path

EPS = 1e-9


def coords_eq(a, b):
    return abs(a[0] - b[0]) < EPS and abs(a[1] - b[1]) < EPS


def stitch_outer_rings(members):
    """Merge way geometries (role=outer) into closed rings by endpoint match."""
    ways = []
    for m in members:
        if m.get("type") != "way":
            continue
        if m.get("role", "outer") not in ("outer", ""):
            continue
        geom = m.get("geometry") or []
        if len(geom) < 2:
            continue
        ways.append([(p["lon"], p["lat"]) for p in geom])

    rings = []
    while ways:
        ring = list(ways.pop(0))
        changed = True
        while changed and ways:
            changed = False
            for i, w in enumerate(ways):
                if coords_eq(ring[-1], w[0]):
                    ring.extend(w[1:])
                    ways.pop(i)
                    changed = True
                    break
                if coords_eq(ring[-1], w[-1]):
                    ring.extend(reversed(w[:-1]))
                    ways.pop(i)
                    changed = True
                    break
                if coords_eq(ring[0], w[-1]):
                    ring = list(w[:-1]) + ring
                    ways.pop(i)
                    changed = True
                    break
                if coords_eq(ring[0], w[0]):
                    ring = list(reversed(w))[:-1] + ring
                    ways.pop(i)
                    changed = True
                    break
        if len(ring) >= 4 and coords_eq(ring[0], ring[-1]):
            rings.append(ring)
        elif len(ring) >= 4:
            ring.append(ring[0])
            rings.append(ring)
    return rings


def relation_to_feature(rel):
    rings = stitch_outer_rings(rel.get("members", []))
    if not rings:
        return None
    rings.sort(key=len, reverse=True)
    if len(rings) == 1:
        geom = {"type": "Polygon", "coordinates": [rings[0]]}
    else:
        geom = {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}
    tags = rel.get("tags", {})
    return {
        "type": "Feature",
        "properties": {
            "name": tags.get("name", ""),
            "admin_level": tags.get("admin_level", ""),
            "osm_id": rel.get("id"),
        },
        "geometry": geom,
    }


def convert(in_path, out_path):
    data = json.loads(Path(in_path).read_text())
    feats = []
    for el in data["elements"]:
        if el["type"] != "relation":
            continue
        f = relation_to_feature(el)
        if f:
            feats.append(f)
    fc = {"type": "FeatureCollection", "features": feats}
    Path(out_path).write_text(json.dumps(fc, ensure_ascii=False))
    return len(feats)


if __name__ == "__main__":
    in_path, out_path = sys.argv[1], sys.argv[2]
    n = convert(in_path, out_path)
    print(f"OK {n} features written to {out_path}")
