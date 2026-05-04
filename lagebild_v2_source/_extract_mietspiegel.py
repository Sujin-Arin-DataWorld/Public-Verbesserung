#!/usr/bin/env python3
"""Encode Mietspiegel 2025 (14. Fortschreibung, gültig ab 01.01.2025) Anlage 1
into JSON.

Source: Mietspiegel-01012025-neu.pdf, page 5 (Anlage 1).
Joint publication of Mieterbund Wiesbaden, Haus & Grund Wiesbaden, and
Stadtverwaltung Wiesbaden Tiefbau- u. Vermessungsamt — qualified §558d.

Schema:
  baualter:    'I' (≤1949) / 'II' (1950-1974) / 'III' (1975-1999) / 'IV' (2000+)
  groesse:     'A' (<60m²) / 'B' (60-100m²) / 'C' (≥100m²)
  ausstattung: 'a' (ohne Heizung, mit Bad / mit Heizung, ohne Bad)
               'b' (mit Heizung, mit Bad)
               'c' (mit besonderer Ausstattung)
  wohnlage:    'einfach' / 'mittel' / 'gut' / 'sehr_gut'
  mittel:      Mittelwert €/m²
  spanne:      [min, max] €/m² (or null where '-')
"""
import json
from pathlib import Path

# Page 5 transcribed verbatim (Anlage 1). '-' means cell is intentionally
# left blank in the official table (not surveyed for this combination).
DATA = [
    # ─────────── A) Wohnungen bis unter 60 m² ───────────
    # Row a: ohne Heizung, mit Bad / mit Heizung, ohne Bad — all dashes
    # Row b: mit Heizung, mit Bad
    {"baualter":"I","groesse":"A","ausstattung":"b","wohnlage":"einfach","mittel":9.71,"spanne":[8.31,11.11]},
    {"baualter":"I","groesse":"A","ausstattung":"b","wohnlage":"mittel","mittel":10.48,"spanne":[9.08,11.88]},
    {"baualter":"I","groesse":"A","ausstattung":"b","wohnlage":"gut","mittel":11.20,"spanne":[9.80,12.60]},
    {"baualter":"I","groesse":"A","ausstattung":"b","wohnlage":"sehr_gut","mittel":11.77,"spanne":[10.37,13.17]},
    {"baualter":"II","groesse":"A","ausstattung":"b","wohnlage":"mittel","mittel":10.11,"spanne":[9.31,10.91]},
    {"baualter":"II","groesse":"A","ausstattung":"b","wohnlage":"gut","mittel":10.56,"spanne":[9.76,11.36]},
    {"baualter":"II","groesse":"A","ausstattung":"b","wohnlage":"sehr_gut","mittel":11.74,"spanne":[10.94,12.54]},
    {"baualter":"III","groesse":"A","ausstattung":"b","wohnlage":"mittel","mittel":10.79,"spanne":[9.79,11.79]},
    {"baualter":"III","groesse":"A","ausstattung":"b","wohnlage":"gut","mittel":12.14,"spanne":[11.14,13.14]},
    {"baualter":"III","groesse":"A","ausstattung":"b","wohnlage":"sehr_gut","mittel":13.14,"spanne":[12.14,14.14]},
    {"baualter":"IV","groesse":"A","ausstattung":"b","wohnlage":"mittel","mittel":11.27,"spanne":[9.87,12.67]},
    {"baualter":"IV","groesse":"A","ausstattung":"b","wohnlage":"gut","mittel":11.97,"spanne":[10.57,13.37]},
    {"baualter":"IV","groesse":"A","ausstattung":"b","wohnlage":"sehr_gut","mittel":13.69,"spanne":[12.29,15.09]},
    # Row c: mit besonderer Ausstattung
    {"baualter":"I","groesse":"A","ausstattung":"c","wohnlage":"mittel","mittel":12.00,"spanne":[10.60,13.40]},
    {"baualter":"I","groesse":"A","ausstattung":"c","wohnlage":"gut","mittel":12.76,"spanne":[11.36,14.16]},
    {"baualter":"I","groesse":"A","ausstattung":"c","wohnlage":"sehr_gut","mittel":13.70,"spanne":[12.30,15.10]},
    {"baualter":"II","groesse":"A","ausstattung":"c","wohnlage":"mittel","mittel":12.08,"spanne":[11.28,12.88]},
    {"baualter":"II","groesse":"A","ausstattung":"c","wohnlage":"gut","mittel":12.81,"spanne":[12.01,13.61]},
    {"baualter":"II","groesse":"A","ausstattung":"c","wohnlage":"sehr_gut","mittel":14.09,"spanne":[13.29,14.89]},
    {"baualter":"III","groesse":"A","ausstattung":"c","wohnlage":"mittel","mittel":11.58,"spanne":[10.58,12.58]},
    {"baualter":"III","groesse":"A","ausstattung":"c","wohnlage":"gut","mittel":13.63,"spanne":[12.63,14.63]},
    {"baualter":"III","groesse":"A","ausstattung":"c","wohnlage":"sehr_gut","mittel":14.57,"spanne":[13.57,15.57]},
    {"baualter":"IV","groesse":"A","ausstattung":"c","wohnlage":"mittel","mittel":12.63,"spanne":[11.23,14.03]},
    {"baualter":"IV","groesse":"A","ausstattung":"c","wohnlage":"gut","mittel":14.01,"spanne":[12.61,15.41]},
    {"baualter":"IV","groesse":"A","ausstattung":"c","wohnlage":"sehr_gut","mittel":15.68,"spanne":[14.28,17.08]},

    # ─────────── B) Wohnungen um 80 m² (60–100 m²) ───────────
    {"baualter":"I","groesse":"B","ausstattung":"b","wohnlage":"einfach","mittel":8.78,"spanne":[7.38,10.18]},
    {"baualter":"I","groesse":"B","ausstattung":"b","wohnlage":"mittel","mittel":9.57,"spanne":[8.17,10.97]},
    {"baualter":"I","groesse":"B","ausstattung":"b","wohnlage":"gut","mittel":10.66,"spanne":[9.26,12.06]},
    {"baualter":"I","groesse":"B","ausstattung":"b","wohnlage":"sehr_gut","mittel":11.45,"spanne":[10.05,12.85]},
    {"baualter":"II","groesse":"B","ausstattung":"b","wohnlage":"mittel","mittel":9.51,"spanne":[8.71,10.31]},
    {"baualter":"II","groesse":"B","ausstattung":"b","wohnlage":"gut","mittel":10.42,"spanne":[9.62,11.22]},
    {"baualter":"II","groesse":"B","ausstattung":"b","wohnlage":"sehr_gut","mittel":10.87,"spanne":[10.07,11.67]},
    {"baualter":"III","groesse":"B","ausstattung":"b","wohnlage":"mittel","mittel":9.92,"spanne":[8.92,10.92]},
    {"baualter":"III","groesse":"B","ausstattung":"b","wohnlage":"gut","mittel":11.14,"spanne":[10.14,12.14]},
    {"baualter":"III","groesse":"B","ausstattung":"b","wohnlage":"sehr_gut","mittel":12.41,"spanne":[11.41,13.41]},
    {"baualter":"IV","groesse":"B","ausstattung":"b","wohnlage":"mittel","mittel":10.82,"spanne":[9.42,12.22]},
    {"baualter":"IV","groesse":"B","ausstattung":"b","wohnlage":"gut","mittel":11.63,"spanne":[10.23,13.03]},
    {"baualter":"IV","groesse":"B","ausstattung":"b","wohnlage":"sehr_gut","mittel":14.00,"spanne":[12.60,15.40]},
    {"baualter":"I","groesse":"B","ausstattung":"c","wohnlage":"mittel","mittel":11.02,"spanne":[9.62,12.42]},
    {"baualter":"I","groesse":"B","ausstattung":"c","wohnlage":"gut","mittel":11.56,"spanne":[10.16,12.96]},
    {"baualter":"I","groesse":"B","ausstattung":"c","wohnlage":"sehr_gut","mittel":12.70,"spanne":[11.30,14.10]},
    {"baualter":"II","groesse":"B","ausstattung":"c","wohnlage":"mittel","mittel":11.00,"spanne":[10.20,11.80]},
    {"baualter":"II","groesse":"B","ausstattung":"c","wohnlage":"gut","mittel":11.49,"spanne":[10.69,12.29]},
    {"baualter":"II","groesse":"B","ausstattung":"c","wohnlage":"sehr_gut","mittel":12.81,"spanne":[12.01,13.61]},
    {"baualter":"III","groesse":"B","ausstattung":"c","wohnlage":"mittel","mittel":11.15,"spanne":[10.15,12.15]},
    {"baualter":"III","groesse":"B","ausstattung":"c","wohnlage":"gut","mittel":11.93,"spanne":[10.93,12.93]},
    {"baualter":"III","groesse":"B","ausstattung":"c","wohnlage":"sehr_gut","mittel":13.67,"spanne":[12.67,14.67]},
    {"baualter":"IV","groesse":"B","ausstattung":"c","wohnlage":"mittel","mittel":12.58,"spanne":[11.18,13.98]},
    {"baualter":"IV","groesse":"B","ausstattung":"c","wohnlage":"gut","mittel":13.41,"spanne":[12.01,14.81]},
    {"baualter":"IV","groesse":"B","ausstattung":"c","wohnlage":"sehr_gut","mittel":14.85,"spanne":[13.45,16.25]},

    # ─────────── C) Wohnungen ab 100 m² ───────────
    {"baualter":"I","groesse":"C","ausstattung":"b","wohnlage":"mittel","mittel":9.58,"spanne":[8.18,10.98]},
    {"baualter":"I","groesse":"C","ausstattung":"b","wohnlage":"gut","mittel":10.78,"spanne":[9.38,12.18]},
    {"baualter":"I","groesse":"C","ausstattung":"b","wohnlage":"sehr_gut","mittel":11.72,"spanne":[10.32,13.12]},
    {"baualter":"II","groesse":"C","ausstattung":"b","wohnlage":"mittel","mittel":10.15,"spanne":[9.35,10.95]},
    {"baualter":"II","groesse":"C","ausstattung":"b","wohnlage":"gut","mittel":11.39,"spanne":[10.59,12.19]},
    {"baualter":"II","groesse":"C","ausstattung":"b","wohnlage":"sehr_gut","mittel":12.20,"spanne":[11.40,13.00]},
    {"baualter":"III","groesse":"C","ausstattung":"b","wohnlage":"mittel","mittel":10.74,"spanne":[9.74,11.74]},
    {"baualter":"III","groesse":"C","ausstattung":"b","wohnlage":"gut","mittel":11.61,"spanne":[10.61,12.61]},
    {"baualter":"III","groesse":"C","ausstattung":"b","wohnlage":"sehr_gut","mittel":12.83,"spanne":[11.83,13.83]},
    {"baualter":"IV","groesse":"C","ausstattung":"b","wohnlage":"mittel","mittel":12.13,"spanne":[10.73,13.53]},
    {"baualter":"IV","groesse":"C","ausstattung":"b","wohnlage":"gut","mittel":12.76,"spanne":[11.36,14.16]},
    {"baualter":"IV","groesse":"C","ausstattung":"b","wohnlage":"sehr_gut","mittel":14.16,"spanne":[12.76,15.56]},
    {"baualter":"I","groesse":"C","ausstattung":"c","wohnlage":"mittel","mittel":10.62,"spanne":[9.22,12.02]},
    {"baualter":"I","groesse":"C","ausstattung":"c","wohnlage":"gut","mittel":11.64,"spanne":[10.24,13.04]},
    {"baualter":"I","groesse":"C","ausstattung":"c","wohnlage":"sehr_gut","mittel":13.67,"spanne":[12.27,15.07]},
    {"baualter":"II","groesse":"C","ausstattung":"c","wohnlage":"mittel","mittel":11.55,"spanne":[10.75,12.35]},
    {"baualter":"II","groesse":"C","ausstattung":"c","wohnlage":"gut","mittel":12.60,"spanne":[11.80,13.40]},
    {"baualter":"II","groesse":"C","ausstattung":"c","wohnlage":"sehr_gut","mittel":13.19,"spanne":[12.39,13.99]},
    {"baualter":"III","groesse":"C","ausstattung":"c","wohnlage":"mittel","mittel":12.84,"spanne":[11.84,13.84]},
    {"baualter":"III","groesse":"C","ausstattung":"c","wohnlage":"gut","mittel":12.97,"spanne":[11.97,13.97]},
    {"baualter":"III","groesse":"C","ausstattung":"c","wohnlage":"sehr_gut","mittel":13.79,"spanne":[12.79,14.79]},
    {"baualter":"IV","groesse":"C","ausstattung":"c","wohnlage":"mittel","mittel":13.89,"spanne":[12.49,15.29]},
    {"baualter":"IV","groesse":"C","ausstattung":"c","wohnlage":"gut","mittel":13.99,"spanne":[12.59,15.39]},
    {"baualter":"IV","groesse":"C","ausstattung":"c","wohnlage":"sehr_gut","mittel":15.31,"spanne":[13.91,16.71]},
]


META = {
    "version": "14. Fortschreibung",
    "stand": "2025-01-01",
    "publisher": "Mieterbund Wiesbaden u.U. e.V. + Haus & Grund Wiesbaden e.V. + Stadtverwaltung Wiesbaden",
    "type": "qualifizierter Mietspiegel §558d BGB",
    "scope": "Nettokaltmiete €/m²/Monat (Wohnfläche)",
    "labels": {
        "baualter": {
            "I":   "bis 31.12.1949",
            "II":  "01.01.1950 – 31.12.1974",
            "III": "01.01.1975 – 31.12.1999",
            "IV":  "ab 01.01.2000",
        },
        "groesse": {
            "A": "<60 m²",
            "B": "60–100 m²",
            "C": "≥100 m²",
        },
        "ausstattung": {
            "a": "ohne Heizung, mit Bad / mit Heizung, ohne Bad",
            "b": "mit Heizung, mit Bad",
            "c": "mit besonderer Ausstattung",
        },
        "wohnlage": {
            "einfach": "einfache Wohnlage",
            "mittel": "mittlere Wohnlage",
            "gut": "gute Wohnlage",
            "sehr_gut": "sehr gute Wohnlage",
        },
    },
}


if __name__ == "__main__":
    out = {"meta": META, "cells": DATA}
    Path("mietspiegel_2025.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2)
    )
    # Sanity stats
    vals = [c["mittel"] for c in DATA]
    print(f"Cells: {len(DATA)}")
    print(f"Mittelwert range: €{min(vals):.2f} – €{max(vals):.2f}/m²")
    print(f"Overall median: €{sorted(vals)[len(vals)//2]:.2f}/m²")
    print(f"Overall mean: €{sum(vals)/len(vals):.2f}/m²")
    # Group: most expensive segments
    top5 = sorted(DATA, key=lambda c: -c["mittel"])[:5]
    print("\nTop-5 most expensive cells:")
    for c in top5:
        print(f"  {c['baualter']}-{c['groesse']}-{c['ausstattung']}-{c['wohnlage']:9s} €{c['mittel']:.2f}/m²")
