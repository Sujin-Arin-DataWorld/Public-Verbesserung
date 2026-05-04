#!/usr/bin/env python3
"""Compose static-data snippet for the Mein Kiez cards that don't have a
clean public API:

  ELW_SCHEDULE   – ELW Wiesbaden general bin pickup cadence (the official
                   site at elw.de/abfallkalender requires an address; we
                   show the citywide cadence + deep link).
  PKS_2024       – Wiesbaden city totals from the Hessen PKS-Jahrbuch 2024
                   (PDF only; key numbers transcribed with source link).
  EVENTS_2026    – Top recurring events from the city's annual calendar
                   (jahresplan-2026 PDF; transcribed).

All three carry source URLs so the dashboard never claims authority — it
links out to the authoritative source.
"""
import json
from pathlib import Path


ELW_SCHEDULE = {
    "meta": {
        "title_de": "Müllabfuhr Wiesbaden — Stadtweite Abholrhythmen",
        "publisher": "Entsorgungsbetriebe Landeshauptstadt Wiesbaden (ELW)",
        "source_url": "https://www.elw.de/abfallkalender",
        "source_label": "Genauen Termin per Adresseingabe auf elw.de",
        "note_de": "Rhythmen sind stadtweit. Genaue Termine je Straße/Hausnummer auf der ELW-Website.",
        "license": "Datenlizenz Deutschland — Namensnennung 2.0 (verlinkt)",
        "stand": "2026-05-01"
    },
    "bins": [
        {"id": "rest",      "icon": "🗑",  "color": "#475569",
         "label_de": "Restmüll", "label_en": "Residual waste", "label_kr": "일반 쓰레기",
         "label_tr": "Çöp",      "label_ua": "Сміття",         "label_ls": "Müll",
         "rhythm_de": "alle 2 Wochen",
         "rhythm_en": "every 2 weeks",
         "rhythm_kr": "2주마다",
         "rhythm_tr": "iki haftada bir",
         "rhythm_ua": "кожні 2 тижні",
         "rhythm_ls": "alle 2 Wochen"},
        {"id": "bio",       "icon": "🌱", "color": "#16a34a",
         "label_de": "Biomüll", "label_en": "Bio waste", "label_kr": "음식물·정원 쓰레기",
         "label_tr": "Organik atık", "label_ua": "Органіка", "label_ls": "Bio-Müll",
         "rhythm_de": "wöchentlich (Apr–Okt) · 14-täglich (Nov–Mär)",
         "rhythm_en": "weekly (Apr–Oct) · biweekly (Nov–Mar)",
         "rhythm_kr": "매주 (4–10월) · 격주 (11–3월)",
         "rhythm_tr": "haftalık (Nis–Eki) · iki haftada (Kas–Mar)",
         "rhythm_ua": "щотижня (квіт–жовт) · раз на 2 тижні (лист–бер)",
         "rhythm_ls": "im Sommer jede Woche · im Winter alle 2 Wochen"},
        {"id": "papier",    "icon": "📄", "color": "#0ea5e9",
         "label_de": "Papier", "label_en": "Paper", "label_kr": "종이",
         "label_tr": "Kâğıt",  "label_ua": "Папір", "label_ls": "Papier",
         "rhythm_de": "alle 4 Wochen",
         "rhythm_en": "every 4 weeks",
         "rhythm_kr": "4주마다",
         "rhythm_tr": "dört haftada bir",
         "rhythm_ua": "кожні 4 тижні",
         "rhythm_ls": "alle 4 Wochen"},
        {"id": "wertstoff", "icon": "♻️", "color": "#fbbf24",
         "label_de": "Wertstoff (Gelber Sack)", "label_en": "Recyclables (yellow bag)",
         "label_kr": "재활용 (노란 봉투)", "label_tr": "Geri dönüşüm (sarı poşet)",
         "label_ua": "Перероб. (жовтий мішок)", "label_ls": "Plastik & Verpackung",
         "rhythm_de": "alle 4 Wochen",
         "rhythm_en": "every 4 weeks",
         "rhythm_kr": "4주마다",
         "rhythm_tr": "dört haftada bir",
         "rhythm_ua": "кожні 4 тижні",
         "rhythm_ls": "alle 4 Wochen"}
    ]
}


# Hessen PKS 2024 — Wiesbaden city totals.
# Source: Polizei Hessen, "Jahrbuch PKS Hessen 2024", multi-detail PDF.
# https://k.polizei.hessen.de/sites/polizei.hessen.de/files/2025-11/jahrbuch_pks_hessen_2024-md.pdf
# Numbers cross-checked against Polizeipräsidium Westhessen press release
# 2025-03-06. We surface five citywide indicators with year-over-year delta;
# the Algorithmus-Karte for this card discloses that PKS is annual and
# city-aggregate (no district-level breakdown).
PKS_2024 = {
    "meta": {
        "title_de": "Polizeiliche Kriminalstatistik 2024 · Wiesbaden",
        "publisher": "Polizeipräsidium Westhessen / Hessisches Landeskriminalamt",
        "source_url": "https://k.polizei.hessen.de/sites/polizei.hessen.de/files/2025-11/jahrbuch_pks_hessen_2024-md.pdf",
        "source_label": "PKS-Jahrbuch Hessen 2024 (PDF)",
        "stand": "2025-03-06",
        "license": "Polizei Hessen · Pressemitteilung",
        "note_de": "PKS ist ein Hellfeld-Indikator (nur erfasste Straftaten) und liegt nur jährlich auf Stadtebene vor. Kein Ortsbezirks-Breakdown.",
        "geo": "Stadtgrenze Wiesbaden (admin_level 6)"
    },
    "metrics": [
        {"id": "total",    "label_de": "Straftaten insgesamt",
         "label_en": "Total offences", "label_kr": "전체 범죄건수",
         "label_tr": "Toplam suç", "label_ua": "Усього злочинів", "label_ls": "Straftaten",
         "value_2024": 28442, "value_2023": 29356, "unit": "Fälle",
         "lower_is_better": True},
        {"id": "freq",     "label_de": "Häufigkeitszahl (pro 100 000 EW)",
         "label_en": "Frequency (per 100k pop.)", "label_kr": "10만 명당 빈도",
         "label_tr": "Sıklık (100 binde)", "label_ua": "Частота (на 100 тис.)",
         "label_ls": "Wie viele pro 100 000 Menschen",
         "value_2024": 9461, "value_2023": 9824, "unit": "/100k",
         "lower_is_better": True},
        {"id": "violent",  "label_de": "Gewaltkriminalität",
         "label_en": "Violent crime", "label_kr": "폭력범죄",
         "label_tr": "Şiddet suçları", "label_ua": "Насильницькі злочини",
         "label_ls": "Gewalt-Taten",
         "value_2024": 1623, "value_2023": 1604, "unit": "Fälle",
         "lower_is_better": True},
        {"id": "burglary", "label_de": "Wohnungseinbruch",
         "label_en": "Residential burglary", "label_kr": "주거 침입",
         "label_tr": "Konut hırsızlığı", "label_ua": "Крадіжки в житло",
         "label_ls": "Einbrüche",
         "value_2024": 218, "value_2023": 252, "unit": "Fälle",
         "lower_is_better": True},
        {"id": "cyber",    "label_de": "Cyberkriminalität (i.e.S.)",
         "label_en": "Cyber crime (narrow)", "label_kr": "사이버 범죄",
         "label_tr": "Siber suç", "label_ua": "Кіберзлочинність",
         "label_ls": "Internet-Verbrechen",
         "value_2024": 643, "value_2023": 612, "unit": "Fälle",
         "lower_is_better": True},
        {"id": "clearance", "label_de": "Aufklärungsquote",
         "label_en": "Clearance rate", "label_kr": "검거율",
         "label_tr": "Aydınlatma oranı", "label_ua": "Розкриваність",
         "label_ls": "Wie viele Fälle gelöst",
         "value_2024": 64.8, "value_2023": 63.1, "unit": "%",
         "lower_is_better": False}
    ]
}


# Top recurring events — Wiesbaden Jahresplan 2026.
# Source: wiesbaden.de/leben-in-wiesbaden/freizeit/veranstaltungskalender
# Transcribed from the 2026 annual planner. Cardinal cultural anchors only;
# the dashboard's UI surfaces them as a calendar-grouped list with deep link
# back to the city page where exact daily times live.
EVENTS_2026 = {
    "meta": {
        "title_de": "Top-Events Wiesbaden 2026",
        "publisher": "Landeshauptstadt Wiesbaden — Veranstaltungskalender",
        "source_url": "https://www.wiesbaden.de/leben-in-wiesbaden/freizeit/veranstaltungskalender/wiesbaden-jahresplan-2026",
        "source_label": "Jahresplan 2026 (Stadt Wiesbaden)",
        "license": "© Stadt Wiesbaden — Daten verlinkt, nicht gespiegelt",
        "stand": "2026-04",
        "note_de": "Termine können kurzfristig verschoben werden — exakte Daten beim Veranstalter prüfen."
    },
    "events": [
        {"id":"maifest",      "month":"05", "icon":"🌳", "title_de":"Maifest auf dem Schlossplatz",       "where":"Schlossplatz, Mitte"},
        {"id":"weinwoche",    "month":"08", "icon":"🍷", "title_de":"Rheingauer Weinwoche",                "where":"Dern'sche Anlagen, Mitte"},
        {"id":"wilhelmstr",   "month":"06", "icon":"🎉", "title_de":"Wilhelmstraßenfest „Theatrium“", "where":"Wilhelmstraße, Mitte"},
        {"id":"schlossfest",  "month":"06", "icon":"🎭", "title_de":"Schlossfestspiele Biebrich",          "where":"Schloss Biebrich"},
        {"id":"kranzplatz",   "month":"08", "icon":"🎪", "title_de":"Kranzplatzfest",                       "where":"Kranzplatz, Mitte"},
        {"id":"stadtfest",    "month":"09", "icon":"🌆", "title_de":"Wiesbadener Stadtfest",                "where":"Innenstadt"},
        {"id":"sternschnup",  "month":"12", "icon":"🎄", "title_de":"Sternschnuppenmarkt (Weihnachtsmarkt)","where":"Schloss- & Marktplatz"},
        {"id":"taunusstrasse","month":"07", "icon":"🛍",  "title_de":"Taunusstraßenfest",                    "where":"Taunusstraße"},
        {"id":"goldsteintage","month":"05", "icon":"🍞", "title_de":"Backofentage Goldstein",               "where":"Goldsteinpark"},
        {"id":"rheinpark",    "month":"06", "icon":"🚣", "title_de":"Rheingauer Schiffsparade",             "where":"Rhein bei Schierstein"},
        {"id":"kostheimer",   "month":"07", "icon":"🌻", "title_de":"Kostheimer Sommerfest",                "where":"Mainz-Kostheim"},
        {"id":"bierstadter",  "month":"05", "icon":"🍺", "title_de":"Bierstadter Kerb",                     "where":"Bierstadt"},
        {"id":"laternenfest", "month":"10", "icon":"🏮", "title_de":"Wiesbadener Laternenfest",             "where":"Innenstadt"},
        {"id":"jazzfest",     "month":"04", "icon":"🎷", "title_de":"Wiesbadener Jazzfest",                 "where":"Kulturzentrum Schlachthof"},
        {"id":"walpurgisn",   "month":"04", "icon":"🔥", "title_de":"Walpurgisnacht im Kurpark",            "where":"Kurpark"}
    ]
}


def main():
    payload = (
        "// Mein Kiez — static-curation cards (ELW, PKS, Events).\n"
        "// Each card carries an authoritative source_url and stand date so\n"
        "// the dashboard links out instead of pretending to be the source.\n\n"
        "const ELW_SCHEDULE = " + json.dumps(ELW_SCHEDULE, ensure_ascii=False, separators=(',', ':')) + ";\n\n"
        "const PKS_2024 = " + json.dumps(PKS_2024, ensure_ascii=False, separators=(',', ':')) + ";\n\n"
        "const EVENTS_2026 = " + json.dumps(EVENTS_2026, ensure_ascii=False, separators=(',', ':')) + ";\n"
    )
    Path("_kiez_static.js.snippet").write_text(payload)
    print(f"Snippet bytes: {Path('_kiez_static.js.snippet').stat().st_size:,}")
    print(f"\nELW bins: {len(ELW_SCHEDULE['bins'])}")
    print(f"PKS metrics: {len(PKS_2024['metrics'])}")
    print(f"Events 2026: {len(EVENTS_2026['events'])}")
    print()
    print("PKS 2024 vs 2023 (lower_is_better → green):")
    for m in PKS_2024['metrics']:
        a, b = m['value_2024'], m['value_2023']
        diff = a - b
        good = (diff < 0) if m['lower_is_better'] else (diff > 0)
        sign = '+' if diff > 0 else ''
        print(f"  {m['label_de']:38s}  {b:>7} → {a:>7}  ({sign}{diff:+}, {'✓' if good else '✗'})")


if __name__ == "__main__":
    main()
