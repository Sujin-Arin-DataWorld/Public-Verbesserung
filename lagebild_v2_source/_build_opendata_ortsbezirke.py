"""Baut das Open-Data-Veroeffentlichungspaket fuer die Ortsbezirke-Referenz.

Liest die Stammtabelle und die Quell-Geometrie, verbindet sie ueber die osm_id
und schreibt eine standardisierte GeoJSON-Datei sowie Kopien der CSV-Tabellen
in den Paketordner opendata_ortsbezirke/.
"""
import csv
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE / "opendata_ortsbezirke"
PKG.mkdir(exist_ok=True)

# Stammtabelle laden (Reihenfolge erhalten)
ref, order = {}, []
with (HERE / "ortsbezirke_referenz.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f, delimiter=";"):
        ref[str(r["osm_id"])] = r
        order.append(str(r["osm_id"]))

# Quell-Geometrie nach osm_id indizieren
src = json.load((HERE / "wiesbaden_ortsbezirke.geojson").open(encoding="utf-8"))
geom_by_osm = {str(ft["properties"].get("osm_id")): ft["geometry"] for ft in src["features"]}

# Standardisierte Features bauen (Geometrie EPSG:4326, lon/lat nach RFC 7946)
feats, missing = [], []
for osm in order:
    r = ref[osm]
    g = geom_by_osm.get(osm)
    if g is None:
        missing.append(osm)
        continue
    feats.append({
        "type": "Feature",
        "properties": {
            "ortsbezirk_id": r["ortsbezirk_id"],
            "name_offiziell": r["name_offiziell"],
            "osm_id": int(osm),
            "akk": r["akk"] == "true",
        },
        "geometry": g,
    })

out = {"type": "FeatureCollection", "name": "ortsbezirke_referenz", "features": feats}
(PKG / "ortsbezirke_referenz.geojson").write_text(
    json.dumps(out, ensure_ascii=False), encoding="utf-8")

# CSV-Tabellen ins Paket kopieren
for fn in ["ortsbezirke_referenz.csv", "ortsbezirke_alias.csv"]:
    shutil.copy(HERE / fn, PKG / fn)

print(f"GeoJSON: {len(feats)} Features, fehlende Geometrie: {missing or 'keine'}")
print("Paketordner:", PKG)
