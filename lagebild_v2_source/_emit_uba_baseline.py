#!/usr/bin/env python3
"""Build UBA_AIRQUALITY snapshot for the Übersicht KPI 'air' card.

Fetches 7-day daily averages of PM10, NO2, PM2.5 from
Umweltbundesamt OpenData API for Wiesbaden Schiersteiner Straße
(station ID 740, code DEHE112). Optionally falls back to
Ringkirche (665, DEHE037) and Süd (650, DEHE022) if a station
returns no data.

API: https://www.umweltbundesamt.de/api/air_data/v3/measures/json
License: Datenlizenz Deutschland — Namensnennung 2.0
Auth: none. Verified open + CORS-free as of 2026-05-04.

This snapshot is the BUILD-TIME baseline + last-cached-fallback.
At runtime app.js will optionally re-fetch the latest hour for the
KPI card via fetch() — if that fails it falls back to this snapshot
with a "Stand: <date>" stamp (Mock-Badge discipline §9.2).

Usage:
    python3 _emit_uba_baseline.py
"""
from __future__ import annotations
import datetime, json, sys, urllib.request
from collections import defaultdict
from pathlib import Path

API = "https://www.umweltbundesamt.de/api/air_data/v3/measures/json"

# Wiesbaden Schiersteiner is the primary urban-roadside station;
# Ringkirche is a secondary urban background; Süd is suburban.
STATIONS = [
    {"id": 740, "code": "DEHE112", "name": "Wiesbaden Schiersteiner Straße", "type": "urban-roadside"},
    {"id": 665, "code": "DEHE037", "name": "Wiesbaden Ringkirche",          "type": "urban-background"},
    {"id": 650, "code": "DEHE022", "name": "Wiesbaden Süd",                  "type": "suburban"},
]

COMPONENTS = {
    1: {"key": "pm10",  "label_de": "PM₁₀",   "label_en": "PM10",  "unit": "µg/m³", "who_limit": 15.0},  # WHO 2021 daily
    5: {"key": "no2",   "label_de": "NO₂",    "label_en": "NO2",   "unit": "µg/m³", "who_limit": 25.0},  # WHO 2021 daily
    9: {"key": "pm2_5", "label_de": "PM₂,₅",  "label_en": "PM2.5", "unit": "µg/m³", "who_limit": 5.0},   # WHO 2021 daily
}


def fetch_component(station_id: int, comp_id: int, date_from: str, date_to: str) -> dict:
    url = (f"{API}?date_from={date_from}&date_to={date_to}"
           f"&time_from=1&time_to=24&station={station_id}&component={comp_id}")
    with urllib.request.urlopen(url, timeout=60) as r:
        d = json.load(r)
    return d.get("data", {}).get(str(station_id), {}) or {}


def daily_average(rows: dict) -> dict[str, float]:
    """rows: {ts -> [comp_id, scope, value, date_end, index]} -> {YYYY-MM-DD -> avg}"""
    by_day: dict[str, list[float]] = defaultdict(list)
    for ts, vals in rows.items():
        if not isinstance(vals, list) or len(vals) < 3:
            continue
        v = vals[2]
        if v in ("-", "", None):
            continue
        try:
            by_day[ts.split(" ")[0]].append(float(v))
        except (TypeError, ValueError):
            continue
    return {d: sum(vs) / len(vs) for d, vs in sorted(by_day.items()) if vs}


def main() -> None:
    # UBA hourly data lags ~1 day. Use yesterday as last full day.
    today = datetime.date.today()
    end = today - datetime.timedelta(days=1)
    start = end - datetime.timedelta(days=6)  # 7 days inclusive

    days = [(start + datetime.timedelta(days=i)).isoformat() for i in range(7)]

    payload = {
        "meta": {
            "title_de": "Luftqualität · 7-Tage-Mittelwerte Wiesbaden",
            "title_en": "Air quality · 7-day daily averages Wiesbaden",
            "publisher": "Umweltbundesamt (UBA)",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "source_api": "https://www.umweltbundesamt.de/api/air_data/v3",
            "source_doc": "https://luftqualitaet.api.bund.dev",
            "fetched_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "period": {"from": days[0], "to": days[-1]},
            "stations": STATIONS,
        },
        "days": days,
        "stations": {},
    }

    for st in STATIONS:
        sid = st["id"]
        station_block = {"id": sid, "code": st["code"], "name": st["name"], "type": st["type"], "components": {}}
        any_data = False
        for cid, info in COMPONENTS.items():
            try:
                rows = fetch_component(sid, cid, days[0], days[-1])
            except Exception as e:
                print(f"  WARN {st['code']}/{info['key']}: fetch failed ({e})", file=sys.stderr)
                continue
            avg_by_day = daily_average(rows)
            series = [round(avg_by_day.get(d), 1) if d in avg_by_day else None for d in days]
            if any(v is not None for v in series):
                any_data = True
            station_block["components"][info["key"]] = {
                "label_de": info["label_de"],
                "label_en": info["label_en"],
                "unit": info["unit"],
                "who_limit": info["who_limit"],
                "series": series,
                "average": round(sum(v for v in series if v is not None) / max(1, sum(1 for v in series if v is not None)), 1) if any_data else None,
            }
        payload["stations"][st["code"]] = station_block
        if any_data:
            print(f"  ✓ {st['code']} {st['name']}: {len(station_block['components'])} components")
        else:
            print(f"  ✗ {st['code']} {st['name']}: NO DATA", file=sys.stderr)

    # Pick primary station (Schiersteiner) for the KPI card headline.
    primary = payload["stations"].get("DEHE112") or next(iter(payload["stations"].values()))
    pm10_avg = primary["components"].get("pm10", {}).get("average")
    no2_avg  = primary["components"].get("no2", {}).get("average")
    pm25_avg = primary["components"].get("pm2_5", {}).get("average")

    # Build a simple "AQI-like" status (DE-LRE not the EU-AQI but readable)
    # Threshold table per UBA classification (PM10 daily):
    def cls_pm10(v: float | None) -> str:
        if v is None: return "n/a"
        if v < 20: return "sehr_gut"
        if v < 35: return "gut"
        if v < 50: return "maessig"
        if v < 100: return "schlecht"
        return "sehr_schlecht"

    payload["headline"] = {
        "station_code": primary["code"],
        "pm10_avg": pm10_avg,
        "no2_avg":  no2_avg,
        "pm25_avg": pm25_avg,
        "class_pm10": cls_pm10(pm10_avg),
    }

    out_text = (
        "// UBA Luftqualität — 7-Tage-Mittelwerte Wiesbaden (PM10, NO2, PM2.5).\n"
        "// Build-time snapshot via Umweltbundesamt OpenData API. License: dl-de-by-2.0.\n"
        "// Runtime fetch (when online) will UPDATE these values; otherwise this acts\n"
        "// as last-known fallback with a 'Stand: <date>' stamp (Mock-Badge discipline).\n"
        "const UBA_AIRQUALITY = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    out_path = Path(__file__).parent / "_uba.js.snippet"
    out_path.write_text(out_text)
    print(f"\nSnippet written: {out_path.name} ({len(out_text):,} bytes)")
    print(f"Period: {days[0]} → {days[-1]}")
    print(f"Primary station: {primary['code']} ({primary['name']})")
    print(f"  PM10 Ø {pm10_avg} µg/m³  ·  NO₂ Ø {no2_avg} µg/m³  ·  PM2.5 Ø {pm25_avg} µg/m³")


if __name__ == "__main__":
    main()
