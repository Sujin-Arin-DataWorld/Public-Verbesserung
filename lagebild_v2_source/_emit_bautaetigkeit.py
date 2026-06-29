#!/usr/bin/env python3
"""Emit BAUTAETIGKEIT_OB from Piveau dataset 'Bautätigkeit in Wiesbaden
nach Ortsbezirken – 2012 bis 2024'.

Source: opendata.cloud.wiesbaden.de · License: Datenlizenz Deutschland 2.0
Slug: 12a473a9-c89c-4811-ab6a-6f497cc0de4b

Schema per row:
  wohnungen_insgesamt          (existing housing stock)
  fertiggestellte_wohnungen    (newly completed units that year)
  fertiggestellte_wohngebaeude (newly completed buildings)
  zu_abgang_von_wohnungen      (net additions, can be negative)
  jahr, ortsbezirk_id, ortsbezirk_name

Output: per-district latest snapshot + 13-year completion timeline
        (powers the EBENEN 'baustellen' layer + Story 5).
"""
from collections import defaultdict
from datetime import datetime, timezone
from _piveau_helper import (
    fetch_dataset_csv, fuzzy_district_match, parse_de_number, emit_js_const,
)

SLUG = "12a473a9-c89c-4811-ab6a-6f497cc0de4b"


def _i(s):
    n = parse_de_number(s)
    return int(n) if n is not None else None


def main() -> None:
    rows, meta = fetch_dataset_csv(SLUG)
    print(f"Fetched {len(rows)} rows from Piveau ({meta.get('id')})")

    by_district: dict[str, dict[int, dict]] = defaultdict(dict)
    citywide_completions: dict[int, int] = defaultdict(int)
    citywide_stock: dict[int, int] = defaultdict(int)
    skipped = 0
    for r in rows:
        canon = fuzzy_district_match(r.get("ortsbezirk_name", ""))
        if not canon:
            skipped += 1
            continue
        try:
            year = int(r["jahr"])
        except (ValueError, KeyError):
            continue
        by_district[canon][year] = {
            "stock": _i(r.get("wohnungen_insgesamt")),
            "completed_units": _i(r.get("fertiggestellte_wohnungen")),
            "completed_buildings": _i(r.get("fertiggestellte_wohngebaeude")),
            "net_change": _i(r.get("zu_abgang_von_wohnungen")),
        }
        citywide_completions[year] += by_district[canon][year]["completed_units"] or 0
        citywide_stock[year] += by_district[canon][year]["stock"] or 0
    print(f"  matched {len(by_district)}/26 districts; skipped {skipped}")

    years = sorted({y for d in by_district.values() for y in d.keys()})
    if not years:
        print("  no usable data — nothing emitted")
        return
    latest = years[-1]

    districts = []
    for canon, years_map in sorted(by_district.items()):
        latest_year = years_map.get(latest, {}) if latest else {}
        districts.append({
            "bezirk": canon,
            "stock_latest": latest_year.get("stock"),
            "completed_latest": latest_year.get("completed_units"),
            "completed_timeline": [years_map.get(y, {}).get("completed_units") or 0 for y in years],
        })

    payload = {
        "meta": {
            "title_de": "Bautätigkeit nach Ortsbezirken in Wiesbaden – 2012 bis 2024",
            "publisher": "Stadt Wiesbaden · Amt für Statistik und Stadtforschung",
            "source_id": SLUG,
            "source_url": f"https://opendata.cloud.wiesbaden.de/app/data-catalog/{SLUG}",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "stand": str(latest) if latest else "unknown",
        },
        "years": years,
        "districts": districts,
        "citywide_completions_timeline": [citywide_completions.get(y, 0) for y in years],
        "citywide_stock_timeline":       [citywide_stock.get(y, 0) for y in years],
    }
    emit_js_const("BAUTAETIGKEIT_OB", payload, [
        "v2.7 — Bautätigkeit pro Ortsbezirk (2012–2024).",
        "Source: opendata.cloud.wiesbaden.de · Datenlizenz Deutschland 2.0.",
        "Build-time fetch via Piveau hub-search/store API.",
    ], "_bautaetigkeit.js.snippet")

    print(f"\nLatest year ({latest}): citywide stock {citywide_stock.get(latest, 0):,}, completions {citywide_completions.get(latest, 0):,}")
    top = sorted(districts, key=lambda x: x["completed_latest"] or 0, reverse=True)[:5]
    print("Top 5 by completions in latest year:")
    for d in top:
        print(f"  {d['bezirk']:30s}  completed={d['completed_latest']}")


if __name__ == "__main__":
    main()
