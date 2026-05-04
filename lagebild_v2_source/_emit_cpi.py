#!/usr/bin/env python3
"""Build CPI_TIMELINE for the Mein Kiez "Preise" card.

Fetches Verbraucherpreisindex (table 61111-0006, COICOP 5-Steller)
from destatis Genesis API. Token-based auth via DESTATIS_API_TOKEN
env var (or .env.local in repo root). Token is NEVER committed.

Tracked items (5-Steller COICOP):
  CC13-01147  Eier
  CC13-01141  Vollmilch
  CC13-01113  Brot und Brötchen
  CC13-01151  Butter
  CC13-01173  Kartoffeln, frisch, gekühlt und verarbeitet

Index base 2020 = 100. Values are NATIONAL averages — no Wiesbaden
breakdown (destatis only publishes city-level CPI for ~10 large
Bundesländer-aggregates, not individual cities). Card discloses this.

Usage:
  export DESTATIS_API_TOKEN=$(grep DESTATIS .env.local | cut -d= -f2)
  python3 _emit_cpi.py
"""
import csv, io, json, os, sys, urllib.parse, urllib.request, zipfile
from pathlib import Path

TABLE_5STELLER = "61111-0006"        # Deutschland, COICOP 5-Steller (food items)
TABLE_HESSEN  = "61111-0011"         # Bundesländer, Monate (overall index — no COICOP)
TABLE_DE_OVERALL = "61111-0002"      # Deutschland, Monate (overall index)
BASE = "https://www-genesis.destatis.de/genesisWS/rest/2020"

# 5-Steller COICOP labels exactly as destatis publishes them.
TRACKED = {
    "Eier":                                          {"id":"eier",       "icon":"🥚", "label_de":"Eier",       "label_en":"Eggs",     "label_kr":"계란",   "label_tr":"Yumurta",  "label_ua":"Яйця",     "label_ls":"Eier"},
    "Vollmilch":                                     {"id":"milch",      "icon":"🥛", "label_de":"Vollmilch",  "label_en":"Whole milk","label_kr":"우유",  "label_tr":"Tam yağlı süt","label_ua":"Молоко","label_ls":"Vollmilch"},
    "Brot und Brötchen":                             {"id":"brot",       "icon":"🍞", "label_de":"Brot",       "label_en":"Bread",    "label_kr":"빵",     "label_tr":"Ekmek",    "label_ua":"Хліб",     "label_ls":"Brot"},
    "Butter":                                        {"id":"butter",     "icon":"🧈", "label_de":"Butter",     "label_en":"Butter",   "label_kr":"버터",   "label_tr":"Tereyağı", "label_ua":"Масло",    "label_ls":"Butter"},
    "Kartoffeln, frisch, gekühlt und verarbeitet":   {"id":"kartoffeln", "icon":"🥔", "label_de":"Kartoffeln", "label_en":"Potatoes", "label_kr":"감자",   "label_tr":"Patates",  "label_ua":"Картопля", "label_ls":"Kartoffeln"},
}

MONTH_DE = {"Januar":"01","Februar":"02","März":"03","April":"04","Mai":"05","Juni":"06","Juli":"07","August":"08","September":"09","Oktober":"10","November":"11","Dezember":"12"}


def load_token() -> str:
    t = os.environ.get("DESTATIS_API_TOKEN", "").strip()
    if t: return t
    # Fallback: parse .env.local at repo root
    here = Path(__file__).resolve().parent
    for path in [here.parent / ".env.local", here / ".env.local"]:
        if path.exists():
            for line in path.read_text().splitlines():
                if line.startswith("DESTATIS_API_TOKEN="):
                    return line.split("=", 1)[1].strip()
    sys.exit("ERROR: DESTATIS_API_TOKEN not set and no .env.local found.")


def post(token: str, endpoint: str, params: dict) -> bytes:
    body = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"{BASE}/{endpoint}", data=body, method="POST", headers={
        "username": token, "password": "",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def unzip_csv(blob: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        name = next(n for n in z.namelist() if n.endswith(".csv"))
        return z.read(name).decode("utf-8-sig")


def extract_5steller(raw: str) -> dict:
    data = {info["id"]: {} for info in TRACKED.values()}
    rdr = csv.DictReader(io.StringIO(raw), delimiter=";")
    for row in rdr:
        item = row["3_variable_attribute_label"]
        if item not in TRACKED: continue
        month_label = row["1_variable_attribute_label"]
        if month_label not in MONTH_DE: continue
        ym = f'{row["time"]}-{MONTH_DE[month_label]}'
        v = row["value"].replace(",", ".")
        if v in ("...", "-", ""): continue
        data[TRACKED[item]["id"]][ym] = float(v)
    all_months = sorted(set().union(*[set(s.keys()) for s in data.values()]))
    complete = [m for m in all_months if all(m in data[k] for k in data)]
    if len(complete) < 12:
        sys.exit(f"ERROR: only {len(complete)} complete 5-Steller months available — need 12.")
    months = complete[-12:]
    series = []
    for item, info in TRACKED.items():
        s = dict(info)
        s["values"] = [data[info["id"]][m] for m in months]
        series.append(s)
    return {"months": months, "series": series}


def extract_overall_index(raw: str, region_filter=None) -> dict:
    """Extract monthly overall CPI index. region_filter='Hessen' or None for Germany."""
    out = {}
    rdr = csv.DictReader(io.StringIO(raw), delimiter=";")
    for row in rdr:
        # 61111-0002 has DG=Deutschland; 61111-0011 has DLAND with Bundesland names.
        if region_filter is not None:
            if row.get("2_variable_attribute_label") != region_filter:
                continue
        # Only keep the index series (Verbraucherpreisindex), not the % change rows.
        if row.get("value_variable_label") != "Verbraucherpreisindex":
            continue
        month_label = row["1_variable_attribute_label"]
        if month_label not in MONTH_DE: continue
        ym = f'{row["time"]}-{MONTH_DE[month_label]}'
        v = row["value"].replace(",", ".")
        if v in ("...", "-", ""): continue
        out[ym] = float(v)
    return out


def main():
    token = load_token()

    # 1) Federal-level food items (5-Steller COICOP)
    print(f"Fetching destatis {TABLE_5STELLER} (5-Steller COICOP, Deutschland)…")
    blob = post(token, "data/tablefile", {
        "name": TABLE_5STELLER, "area": "all", "classifyingvariable1": "CC13A5",
        "format": "ffcsv", "compress": "false", "language": "de",
    })
    print(f"  {len(blob):,} bytes")
    items = extract_5steller(unzip_csv(blob))
    months_5s = items["months"]
    startyear = int(months_5s[0].split("-")[0])

    # 2) Hessen overall CPI (all months covered by 5-Steller window)
    print(f"Fetching destatis {TABLE_HESSEN} (Bundesländer overall index)…")
    blob = post(token, "data/tablefile", {
        "name": TABLE_HESSEN, "startyear": startyear,
        "format": "ffcsv", "compress": "true", "language": "de",
    })
    print(f"  {len(blob):,} bytes")
    hessen = extract_overall_index(unzip_csv(blob), region_filter="Hessen")

    # 3) Germany overall CPI for direct comparison
    print(f"Fetching destatis {TABLE_DE_OVERALL} (Deutschland overall index)…")
    blob = post(token, "data/tablefile", {
        "name": TABLE_DE_OVERALL, "startyear": startyear,
        "format": "ffcsv", "compress": "true", "language": "de",
    })
    print(f"  {len(blob):,} bytes")
    germany = extract_overall_index(unzip_csv(blob), region_filter=None)

    # Align all three on the 5-Steller month window
    overall = {
        "id": "overall",
        "icon": "📊",
        "label_de": "Gesamtindex",
        "label_en": "Overall index",
        "label_kr": "전체 지수",
        "label_tr": "Genel endeks",
        "label_ua": "Загальний індекс",
        "label_ls": "Gesamt-Preise",
        "hessen":  [hessen.get(m)  for m in months_5s],
        "germany": [germany.get(m) for m in months_5s],
    }
    missing = [m for m, v in zip(months_5s, overall["hessen"]) if v is None]
    if missing:
        print(f"  WARN: Hessen overall missing for {missing}", file=sys.stderr)

    payload = {
        "meta": {
            "title_de": "Verbraucherpreisindex · ausgewählte Lebensmittel + Gesamtindex Hessen vs. Deutschland",
            "publisher": "Statistisches Bundesamt (destatis)",
            "tables": {
                "items_5steller": TABLE_5STELLER,   # Deutschland · 5-Steller (food)
                "hessen_overall": TABLE_HESSEN,     # Bundesländer · overall
                "de_overall":     TABLE_DE_OVERALL, # Deutschland · overall
            },
            "source": f"https://www-genesis.destatis.de/genesis/online?operation=table&code={TABLE_5STELLER}",
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "base": "2020 = 100",
            "geo": "Lebensmittel-Einzelindizes sind nur bundesweit verfügbar (zu kleine Stichprobe je Bundesland). Der Gesamtindex liegt für Hessen separat vor — als Kontext für Wiesbaden.",
            "fetched_via": "Genesis-Online REST API (token-auth, build-time)",
        },
        "months": months_5s,
        "series": items["series"],
        "overall": overall,
    }
    out = (
        "// destatis Verbraucherpreisindex — Lebensmittel (5-Steller, DE)\n"
        "// + Gesamtindex Hessen vs. Deutschland. Live via Genesis REST API,\n"
        "// build-time only. License: dl-de-by-2.0.\n"
        "const CPI_TIMELINE = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    Path(__file__).parent.joinpath("_cpi.js.snippet").write_text(out)

    print(f"\nSnippet written: _cpi.js.snippet ({len(out):,} bytes)")
    print(f"Months: {months_5s[0]} → {months_5s[-1]} (n={len(months_5s)})")
    print(f"\nLebensmittel YoY (last vs first):")
    for s in items["series"]:
        first, last = s["values"][0], s["values"][-1]
        pct = (last - first) / first * 100
        sign = "+" if pct >= 0 else ""
        print(f"  {s['icon']} {s['label_de']:12s}  {first:6.1f} → {last:6.1f}  ({sign}{pct:.1f}%)")
    if overall["hessen"][0] and overall["hessen"][-1]:
        h0, h1 = overall["hessen"][0], overall["hessen"][-1]
        d0, d1 = overall["germany"][0], overall["germany"][-1]
        print(f"\nGesamtindex YoY:")
        print(f"  🇩🇪 Deutschland   {d0:6.1f} → {d1:6.1f}  ({(d1-d0)/d0*100:+.1f}%)")
        print(f"  🏴 Hessen        {h0:6.1f} → {h1:6.1f}  ({(h1-h0)/h0*100:+.1f}%)")


if __name__ == "__main__":
    main()
