#!/usr/bin/env python3
"""Emit KAUFKRAFT_OB from Piveau dataset 'Kaufkraft und Arbeitsmarkt nach
Ortsbezirken in Wiesbaden - Dezember 2025'.

Source: opendata.cloud.wiesbaden.de · License: Datenlizenz Deutschland — 2.0
Slug: 1d2776bc-c7c6-48c9-a75a-6d7043bda27e

Fields per district:
  - kaufkraft_pro_einwohner  (EUR/year)
  - arbeitslosenquote        (%)
  - anteil_haushalte_mit_kindern  (%)
  - anteil_haushalte_mit_sgb_ii_bezug_buergergeld  (%)
  - bevoelkerung_insgesamt   (count)
"""
from datetime import datetime, timezone
from _piveau_helper import (
    fetch_dataset_csv, fuzzy_district_match, parse_de_number, emit_js_const,
)

SLUG = "1d2776bc-c7c6-48c9-a75a-6d7043bda27e"

def main() -> None:
    rows, meta = fetch_dataset_csv(SLUG)
    print(f"Fetched {len(rows)} rows from Piveau ({meta.get('id')})")

    out = []
    for r in rows:
        name_raw = r.get("ortsbezirk_name", "")
        canon = fuzzy_district_match(name_raw)
        if not canon:
            print(f"  WARN: unmatched district {name_raw!r}")
            continue
        out.append({
            "bezirk": canon,
            "ob_id": r.get("ortsbezirk_id"),
            "kaufkraft_eur_per_capita": parse_de_number(r.get("kaufkraft_pro_einwohner")),
            "unemployment_rate":         parse_de_number(r.get("arbeitslosenquote")),
            "households_with_kids_pct":  parse_de_number(r.get("anteil_haushalte_mit_kindern")),
            "buergergeld_pct":           parse_de_number(r.get("anteil_haushalte_mit_sgb_ii_bezug_buergergeld")),
            "population":                parse_de_number(r.get("bevoelkerung_insgesamt")),
        })

    print(f"Matched {len(out)} districts:")
    for o in sorted(out, key=lambda x: x["kaufkraft_eur_per_capita"] or 0, reverse=True)[:5]:
        print(f"  {o['bezirk']:30s}  kaufkraft={o['kaufkraft_eur_per_capita']}  arbeitslos={o['unemployment_rate']}")

    payload = {
        "meta": {
            "title_de": "Kaufkraft und Arbeitsmarkt nach Ortsbezirken in Wiesbaden - Dezember 2025",
            "publisher": "Stadt Wiesbaden · Amt für Statistik und Stadtforschung",
            "source_id": SLUG,
            "source_url": f"https://opendata.cloud.wiesbaden.de/app/data-catalog/{SLUG}",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "stand": "Dezember 2025",
        },
        "districts": out,
    }
    emit_js_const("KAUFKRAFT_OB", payload, [
        "v2.7 — Kaufkraft & Arbeitsmarkt pro Ortsbezirk (Stand Dez 2025).",
        "Source: opendata.cloud.wiesbaden.de · Datenlizenz Deutschland 2.0.",
        "Build-time fetch via Piveau hub-search/store API.",
    ], "_kaufkraft.js.snippet")


if __name__ == "__main__":
    main()
