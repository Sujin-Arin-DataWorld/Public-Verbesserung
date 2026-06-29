#!/usr/bin/env python3
"""Emit SCHULEN_TIMELINE from two Piveau datasets:
 - Allgemeinbildende Schulen nach Schulformen 2016–2024
 - Schülerinnen und Schüler 2016–2024

Both are CITYWIDE only (no per-Ortsbezirk breakdown). Output is a 9-year
trend table that powers Story 8 ('Schule und Bezirk') headline narrative.

Source: opendata.cloud.wiesbaden.de · License: Datenlizenz Deutschland 2.0
"""
from datetime import datetime, timezone
from _piveau_helper import fetch_dataset_csv, parse_de_number, emit_js_const

SLUG_SCHOOLS = "753d8a0e-518d-44e8-ad9a-ad6322832c71"
SLUG_PUPILS  = "61bd11e9-2d59-4421-a521-716185fa60f5"


def _i(s):
    n = parse_de_number(s)
    return int(n) if n is not None else None


def main() -> None:
    school_rows, school_meta = fetch_dataset_csv(SLUG_SCHOOLS)
    print(f"Fetched {len(school_rows)} school rows from Piveau ({school_meta.get('id')})")
    pupil_rows, pupil_meta = fetch_dataset_csv(SLUG_PUPILS)
    print(f"Fetched {len(pupil_rows)} pupil rows from Piveau ({pupil_meta.get('id')})")

    schools_by_year = {}
    for r in school_rows:
        try:
            y = int(r.get("schuljahr") or r.get("jahr") or "")
        except (TypeError, ValueError):
            continue
        schools_by_year[y] = {
            "total":       _i(r.get("allgemeinbildende_schulen")),
            "grundschulen": _i(r.get("allgemeinbildende_grundschulen")),
            "gymnasien":    _i(r.get("allgemeinbildende_gymnasien")),
            "realschulen":  _i(r.get("allgemeinbildende_realschulen")),
            "gesamtschulen":_i(r.get("allgemeinbildende_gesamtschulen")),
            "private":      _i(r.get("allgemeinbildende_private_schulen")),
        }

    pupils_by_year = {}
    for r in pupil_rows:
        try:
            y = int(r["jahr"])
        except (TypeError, KeyError, ValueError):
            continue
        total = _i(r.get("schueler_innen_gesamt"))
        female = _i(r.get("schuelerinnen_gesamt"))
        foreign = _i(r.get("auslaendische_schueler_innen"))
        migration = _i(r.get("schueler_innen_mit_migrationshintergrund"))
        private_total = _i(r.get("privatschueler_innen_gesamt"))
        pupils_by_year[y] = {
            "total":             total,
            "female":            female,
            "female_share_pct":  round(100.0 * female / total, 1) if (total and female is not None) else None,
            "foreign":           foreign,
            "foreign_share_pct": round(100.0 * foreign / total, 1) if (total and foreign is not None) else None,
            "migration":         migration,
            "migration_share_pct": round(100.0 * migration / total, 1) if (total and migration is not None) else None,
            "private":           private_total,
            "private_share_pct": round(100.0 * private_total / total, 1) if (total and private_total is not None) else None,
        }

    years = sorted(set(schools_by_year.keys()) | set(pupils_by_year.keys()))
    payload = {
        "meta": {
            "title_de": "Allgemeinbildende Schulen + Schülerinnen-Statistik Wiesbaden 2016–2024",
            "publisher": "Stadt Wiesbaden · Amt für Statistik und Stadtforschung",
            "sources": [
                {"slug": SLUG_SCHOOLS, "title": "Allgemeinbildende Schulen nach Schulformen 2016–2024"},
                {"slug": SLUG_PUPILS,  "title": "Schülerinnen und Schüler 2016–2024"},
            ],
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "stand": str(years[-1]) if years else "unknown",
            "scope": "citywide (no per-Ortsbezirk breakdown available in source)",
        },
        "years": years,
        "schools_timeline": [schools_by_year.get(y, {}) for y in years],
        "pupils_timeline":  [pupils_by_year.get(y, {})  for y in years],
    }
    emit_js_const("SCHULEN_TIMELINE", payload, [
        "v2.7 — Schulen + SchülerInnen-Statistik Wiesbaden (2016–2024).",
        "Source: opendata.cloud.wiesbaden.de · Datenlizenz Deutschland 2.0.",
        "Build-time fetch via Piveau hub-search/store API.",
        "NOTE: scope is citywide; no per-Ortsbezirk data available.",
    ], "_schulen.js.snippet")

    if years:
        first, last = years[0], years[-1]
        sf = schools_by_year.get(first, {})
        sl = schools_by_year.get(last, {})
        pf = pupils_by_year.get(first, {})
        pl = pupils_by_year.get(last, {})
        print(f"\nSchools  {first}→{last}: {sf.get('total')} → {sl.get('total')}")
        print(f"Pupils   {first}→{last}: {pf.get('total'):,} → {pl.get('total'):,}")
        print(f"Foreign% {first}→{last}: {pf.get('foreign_share_pct')} → {pl.get('foreign_share_pct')}")
        print(f"Migration% {first}→{last}: {pf.get('migration_share_pct')} → {pl.get('migration_share_pct')}")


if __name__ == "__main__":
    main()
