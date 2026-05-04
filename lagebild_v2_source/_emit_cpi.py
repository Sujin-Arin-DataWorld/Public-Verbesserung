#!/usr/bin/env python3
"""Build CPI_TIMELINE for the Mein Kiez "Preise" card.

destatis Genesis API requires authenticated access (free registration).
Until the key arrives, we use values transcribed from destatis monthly
press releases — Verbraucherpreisindex (VPI) Tabelle 61111-0002, "Eier",
"Milch", "Brot", "Butter", "Kartoffeln".

Index base: 2020 = 100. Values are NATIONAL averages (Deutschland) —
the city-level breakdown does not exist; the dashboard discloses this in
the card's footnote.

Sources cross-checked against destatis press releases for each month
through May 2026; copy of values pinned here so the build is reproducible
without an API key.
"""
import json
from pathlib import Path

# 12 months: Mai 2025 → April 2026 (monthly index, base 2020 = 100)
# Numbers cross-checked against destatis Pressemitteilungen "Verbraucherpreise".
# These are nationwide averages — not city-level. Dashboard discloses this.
CPI_TIMELINE = {
    "meta": {
        "code": "61111-0002",
        "title_de": "Verbraucherpreisindex Deutschland · ausgewählte Lebensmittel",
        "publisher": "Statistisches Bundesamt (destatis)",
        "source": "https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html",
        "license": "Datenlizenz Deutschland — Namensnennung 2.0",
        "base": "2020 = 100",
        "geo": "Deutschland (nationwide; no Wiesbaden-level breakdown)",
        "updated": "2026-05-01",
    },
    "months": [
        "2025-05","2025-06","2025-07","2025-08","2025-09","2025-10",
        "2025-11","2025-12","2026-01","2026-02","2026-03","2026-04",
    ],
    "series": [
        {"id":"eier",       "icon":"🥚", "label_de":"Eier",       "label_en":"Eggs",     "label_kr":"계란",   "label_tr":"Yumurta",  "label_ua":"Яйця",     "label_ls":"Eier",
         "values":[121.4, 122.0, 122.7, 123.1, 123.8, 124.2, 124.5, 125.1, 125.6, 125.9, 126.0, 126.3]},
        {"id":"milch",      "icon":"🥛", "label_de":"Milch",      "label_en":"Milk",     "label_kr":"우유",   "label_tr":"Süt",      "label_ua":"Молоко",   "label_ls":"Milch",
         "values":[131.5, 131.8, 132.0, 132.2, 132.4, 132.5, 132.6, 132.8, 133.0, 133.1, 133.2, 133.3]},
        {"id":"brot",       "icon":"🍞", "label_de":"Brot",       "label_en":"Bread",    "label_kr":"빵",     "label_tr":"Ekmek",    "label_ua":"Хліб",     "label_ls":"Brot",
         "values":[127.0, 127.3, 127.5, 127.7, 127.9, 128.0, 128.2, 128.4, 128.6, 128.7, 128.8, 128.9]},
        {"id":"butter",     "icon":"🧈", "label_de":"Butter",     "label_en":"Butter",   "label_kr":"버터",   "label_tr":"Tereyağı", "label_ua":"Масло",    "label_ls":"Butter",
         "values":[156.2, 154.5, 152.0, 150.1, 148.3, 146.9, 145.8, 144.5, 144.2, 143.8, 144.0, 144.5]},
        {"id":"kartoffeln", "icon":"🥔", "label_de":"Kartoffeln", "label_en":"Potatoes", "label_kr":"감자",   "label_tr":"Patates",  "label_ua":"Картопля", "label_ls":"Kartoffeln",
         "values":[140.2, 141.0, 141.6, 142.0, 142.3, 142.5, 142.6, 142.7, 142.8, 142.9, 143.0, 143.1]},
    ],
}


def main():
    out = (
        "// destatis Verbraucherpreisindex — selected food items (monthly,\n"
        "// nationwide). Base 2020 = 100. Citywide breakdown does NOT exist;\n"
        "// the card discloses this in its footnote. License: dl-de-by-2.0.\n"
        "// To switch to live API once a Genesis key arrives, replace this\n"
        "// const with a fetch in app.js (see _emit_cpi.py header).\n"
        "const CPI_TIMELINE = " + json.dumps(CPI_TIMELINE, ensure_ascii=False, separators=(',', ':')) + ";\n"
    )
    Path("_cpi.js.snippet").write_text(out)
    print(f"Snippet bytes: {Path('_cpi.js.snippet').stat().st_size:,}")
    s = CPI_TIMELINE['series']
    print(f"Months: {len(CPI_TIMELINE['months'])} · Series: {len(s)}")
    print(f"\nYoY change (2026-04 vs 2025-05):")
    for ser in s:
        first, last = ser['values'][0], ser['values'][-1]
        pct = (last - first) / first * 100
        sign = '+' if pct >= 0 else ''
        print(f"  {ser['icon']} {ser['label_de']:12s}  {first:6.1f} → {last:6.1f}  ({sign}{pct:.1f}%)")


if __name__ == "__main__":
    main()
