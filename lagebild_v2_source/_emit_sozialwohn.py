#!/usr/bin/env python3
"""Emit SOZIALWOHN_OB from Piveau dataset 'Sozialwohnungen in Wiesbaden
nach Ortsbezirken – 2014 bis 2024'.

Source: opendata.cloud.wiesbaden.de · License: Datenlizenz Deutschland 2.0
Slug: 5b6f0fdf-e4a2-4b60-a9a7-fb69696193a3

Schema per row: sozialwohnungen, jahr, ortsbezirk_id, ortsbezirk_name
Output: per-district latest count + 11-year timeline for Story.
"""
from collections import defaultdict
from datetime import datetime, timezone
from _piveau_helper import (
    fetch_dataset_csv, fuzzy_district_match, parse_de_number, emit_js_const,
)

SLUG = "5b6f0fdf-e4a2-4b60-a9a7-fb69696193a3"

def main() -> None:
    rows, meta = fetch_dataset_csv(SLUG)
    print(f"Fetched {len(rows)} rows from Piveau ({meta.get('id')})")

    by_district: dict[str, dict[int, int]] = defaultdict(dict)
    citywide: dict[int, int] = defaultdict(int)
    skipped = 0
    for r in rows:
        canon = fuzzy_district_match(r.get("ortsbezirk_name", ""))
        if not canon:
            skipped += 1
            continue
        try:
            year = int(r["jahr"])
            count = int(parse_de_number(r["sozialwohnungen"]) or 0)
        except (ValueError, TypeError, KeyError):
            continue
        by_district[canon][year] = count
        citywide[year] += count
    print(f"  matched {len(by_district)}/26 districts; skipped {skipped}")

    years = sorted({y for d in by_district.values() for y in d.keys()})
    latest = years[-1] if years else None

    districts = []
    for canon, years_map in sorted(by_district.items()):
        districts.append({
            "bezirk": canon,
            "latest": years_map.get(latest),
            "timeline": [years_map.get(y, 0) for y in years],
        })

    payload = {
        "meta": {
            "title_de": "Sozialwohnungen nach Ortsbezirken in Wiesbaden – 2014 bis 2024",
            "publisher": "Stadt Wiesbaden · Amt für Statistik und Stadtforschung",
            "source_id": SLUG,
            "source_url": f"https://opendata.cloud.wiesbaden.de/app/data-catalog/{SLUG}",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "stand": str(latest) if latest else "unknown",
        },
        "years": years,
        "districts": districts,
        "citywide_timeline": [citywide.get(y, 0) for y in years],
    }
    emit_js_const("SOZIALWOHN_OB", payload, [
        "v2.7 — Sozialwohnungen pro Ortsbezirk (2014–2024).",
        "Source: opendata.cloud.wiesbaden.de · Datenlizenz Deutschland 2.0.",
        "Build-time fetch via Piveau hub-search/store API.",
    ], "_sozialwohn.js.snippet")

    print(f"\nLatest year ({latest}): citywide {citywide.get(latest, 0):,} Sozialwohnungen")
    top = sorted(districts, key=lambda x: x["latest"] or 0, reverse=True)[:5]
    for d in top:
        print(f"  {d['bezirk']:30s}  latest={d['latest']}")
    print(f"  Citywide trend (10 yrs): {citywide.get(years[0], 0):,} → {citywide.get(years[-1], 0):,}")


if __name__ == "__main__":
    main()
