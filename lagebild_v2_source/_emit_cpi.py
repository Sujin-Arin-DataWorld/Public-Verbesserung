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

TABLE = "61111-0006"
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


def fetch_table(token: str) -> bytes:
    url = f"{BASE}/data/tablefile"
    params = {
        "name": TABLE,
        "area": "all",
        "classifyingvariable1": "CC13A5",
        "format": "ffcsv",
        "compress": "false",
        "language": "de",
    }
    body = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "username": token,
        "password": "",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def extract(blob: bytes) -> dict:
    # Response is a ZIP containing one CSV.
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        name = next(n for n in z.namelist() if n.endswith(".csv"))
        raw = z.read(name).decode("utf-8-sig")
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
    # Pick the last 12 months where ALL series have a value.
    all_months = sorted(set().union(*[set(s.keys()) for s in data.values()]))
    complete = [m for m in all_months if all(m in data[k] for k in data)]
    if len(complete) < 12:
        sys.exit(f"ERROR: only {len(complete)} complete months available — need 12.")
    months = complete[-12:]
    series = []
    for item, info in TRACKED.items():
        s = dict(info)
        s["values"] = [data[info["id"]][m] for m in months]
        series.append(s)
    return {"months": months, "series": series}


def main():
    token = load_token()
    print(f"Fetching destatis table {TABLE} (5-Steller COICOP)…")
    blob = fetch_table(token)
    print(f"  {len(blob):,} bytes received")
    parsed = extract(blob)

    payload = {
        "meta": {
            "code": TABLE,
            "title_de": "Verbraucherpreisindex Deutschland · ausgewählte Lebensmittel (5-Steller)",
            "publisher": "Statistisches Bundesamt (destatis)",
            "source": "https://www-genesis.destatis.de/genesis/online?operation=table&code=" + TABLE,
            "license": "Datenlizenz Deutschland — Namensnennung 2.0",
            "base": "2020 = 100",
            "geo": "Deutschland (national; no Wiesbaden-level breakdown — destatis publishes city-level CPI only for major Bundesländer-aggregates, not individual cities).",
            "fetched_via": "Genesis-Online REST API (token-auth, build-time)",
        },
        "months": parsed["months"],
        "series": parsed["series"],
    }
    out = (
        "// destatis Verbraucherpreisindex 5-Steller — fetched live via\n"
        "// Genesis REST API (table 61111-0006). Build-time only; the\n"
        "// browser never calls destatis directly. License: dl-de-by-2.0.\n"
        "const CPI_TIMELINE = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    Path(__file__).parent.joinpath("_cpi.js.snippet").write_text(out)

    print(f"\nSnippet written: _cpi.js.snippet ({len(out):,} bytes)")
    print(f"Months: {parsed['months'][0]} → {parsed['months'][-1]} (n={len(parsed['months'])})")
    print(f"\nYoY change (last vs first month):")
    for s in parsed["series"]:
        first, last = s["values"][0], s["values"][-1]
        pct = (last - first) / first * 100
        sign = "+" if pct >= 0 else ""
        print(f"  {s['icon']} {s['label_de']:12s}  {first:6.1f} → {last:6.1f}  ({sign}{pct:.1f}%)")


if __name__ == "__main__":
    main()
