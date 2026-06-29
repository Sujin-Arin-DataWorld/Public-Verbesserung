#!/usr/bin/env python3
"""Emit HAUSHALT_TIMELINE from Piveau dataset 'Ergebnishaushalt der Landeshauptstadt
Wiesbaden - 2023 bis 2025' (audit §6.4 Story 7: 'Wohin geht das Geld?').

Source: opendata.cloud.wiesbaden.de · License: Datenlizenz Deutschland 2.0
Slug: ergebnis-und-planungshaushalt-wiesbaden  (CSV ~17 MB raw)

Schema per row (semicolon-separated, German numerals):
  jahr; kostenartengliederung_stufe_2; kostenartengliederung_stufe_4;
  dezernat; amt; profitcenter; wiesbaden_akk; produktbereich; produktgruppe;
  statistischer_viersteller; objekt_projektdefinitionen; betrag

Aggregation: per (jahr, produktbereich) sum the betrag column. Output is
a tiny JSON (~5 KB) suitable for Story 7 bar chart 'Where does Wiesbaden's
money go in 2025?'. The full 17 MB CSV is NOT embedded in the bundle.
"""
from __future__ import annotations
import csv, io, json, re
from collections import defaultdict
from datetime import datetime, timezone
from _piveau_helper import fetch_dataset_meta, csv_url_for, _http_get, parse_de_number, emit_js_const

SLUG = "ergebnis-und-planungshaushalt-wiesbaden"

# Wiesbaden's Ergebnishaushalt has ~30 Produktbereiche; we surface the Top 10
# spending categories for the citizen narrative (Story 7).
TOP_N = 10


def main() -> None:
    meta = fetch_dataset_meta(SLUG)
    url = csv_url_for(meta)
    print(f"Fetching {url}…")
    raw = _http_get(url, accept="text/csv,application/octet-stream").decode("utf-8-sig")
    print(f"  {len(raw):,} bytes downloaded")

    rdr = csv.DictReader(io.StringIO(raw), delimiter=";")
    # (jahr, produktbereich) -> sum betrag
    agg: dict[tuple[int, str], float] = defaultdict(float)
    rows = 0
    for r in rdr:
        try:
            year = int(r["jahr"])
        except (ValueError, KeyError, TypeError):
            continue
        produkt = (r.get("produktbereich") or "").strip()
        # Skip blank produktbereich rows + non-2023-25
        if not produkt or year not in (2023, 2024, 2025):
            continue
        # Strip leading "(NN) " from produktbereich for cleaner labels
        produkt_clean = re.sub(r"^\(\d+\)\s*", "", produkt)
        amount = parse_de_number(r.get("betrag"))
        if amount is None:
            continue
        agg[(year, produkt_clean)] += amount
        rows += 1
    print(f"  parsed {rows:,} budget rows across {len(set(p for _, p in agg))} Produktbereiche")

    # Sum by produktbereich across all 3 years to find Top N
    total_per_pb: dict[str, float] = defaultdict(float)
    for (y, p), v in agg.items():
        # Use absolute value because Ausgaben are negative in CSV
        total_per_pb[p] += abs(v)
    top_pbs = sorted(total_per_pb, key=lambda p: total_per_pb[p], reverse=True)[:TOP_N]

    # Structured payload: timeline of |betrag| per top produktbereich.
    out_rows = []
    for p in top_pbs:
        out_rows.append({
            "produktbereich": p,
            "abs_2023": round(abs(agg.get((2023, p), 0)) / 1_000_000, 1),  # in Mio €
            "abs_2024": round(abs(agg.get((2024, p), 0)) / 1_000_000, 1),
            "abs_2025": round(abs(agg.get((2025, p), 0)) / 1_000_000, 1),
        })

    # Citywide totals for context
    citywide = {}
    for y in (2023, 2024, 2025):
        total_abs = sum(abs(v) for (yy, _), v in agg.items() if yy == y)
        citywide[str(y)] = round(total_abs / 1_000_000, 1)

    payload = {
        "meta": {
            "title_de": "Ergebnishaushalt der Landeshauptstadt Wiesbaden 2023–2025 — Top 10 Produktbereiche",
            "publisher": "Stadt Wiesbaden · Stadtkämmerei",
            "source_id": SLUG,
            "source_url": f"https://opendata.cloud.wiesbaden.de/app/data-catalog/{SLUG}",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "stand": "2025 (Plan)",
            "scope": "citywide; aggregated by Produktbereich (DCAT-style budget hierarchy)",
            "unit": "Mio €",
        },
        "years": [2023, 2024, 2025],
        "top_produktbereiche": out_rows,
        "citywide_total_abs_mio_eur": citywide,
    }
    emit_js_const("HAUSHALT_TIMELINE", payload, [
        "v2.8 — Ergebnishaushalt 2023–2025 (Top 10 Produktbereiche, Mio €).",
        "Source: opendata.cloud.wiesbaden.de · Datenlizenz Deutschland 2.0.",
        "Build-time fetch via Piveau hub-search/store API. Story 7 'Wohin geht das Geld?'",
    ], "_haushalt.js.snippet")

    print(f"\n2025 citywide total |betrag|: {citywide['2025']:,.1f} Mio €")
    print("Top 10 Produktbereiche (2025, Mio €):")
    for r in sorted(out_rows, key=lambda x: x["abs_2025"], reverse=True)[:10]:
        print(f"  {r['produktbereich'][:50]:50s}  {r['abs_2025']:>8.1f}")


if __name__ == "__main__":
    main()
