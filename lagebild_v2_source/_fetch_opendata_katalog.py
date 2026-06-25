#!/usr/bin/env python3
"""Zieht den KOMPLETTEN Datenkatalog von opendata.cloud.wiesbaden.de
(alle 254 veroeffentlichten Datensaetze, alle Aemter/Kataloge) ueber die
Piveau hub-search API und schreibt zwei durchsuchbare Uebersichten:

  wiesbaden_opendata_katalog.csv  -> sortier-/filterbar in Excel/Numbers
  wiesbaden_opendata_katalog.md   -> nach DCAT-Kategorie gruppierte Liste

Aufruf:
    python3 _fetch_opendata_katalog.py
    python3 _fetch_opendata_katalog.py --json /tmp/wb_summary.json   # zus. Cache

Kein API-Key noetig. Quelle ist die offene DCAT-AP.de Schnittstelle.
"""
from __future__ import annotations
import argparse
import csv
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

SEARCH = "https://opendata.cloud.wiesbaden.de/api/hub/search/search"
LANDING = "https://opendata.cloud.wiesbaden.de/app/data-catalog/"
UA = "Mozilla/5.0 (Wiesbaden-Lagebild Katalog-Export)"
HERE = Path(__file__).resolve().parent
PAGE = 1000  # max. Treffer pro Seite laut API-Doku (limit: 0..1000)


def _get(params: dict) -> dict:
    qs = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        f"{SEARCH}?{qs}", headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def _de(field) -> str:
    """Holt den deutschen Wert aus einem {de:..,en:..}-Sprachobjekt."""
    if isinstance(field, dict):
        return (field.get("de") or field.get("en") or next(iter(field.values()), "") or "").strip()
    return (field or "").strip()


def _extract(r: dict) -> dict:
    """Macht aus EINEM API-Treffer eine flache Zeile fuer CSV/Markdown."""
    cats = r.get("categories") or []
    themes = [c.get("id") for c in cats if c.get("id")]
    theme_labels = [_de(c.get("label")) for c in cats if c.get("label")]
    fmts = sorted({((d.get("format") or {}).get("id") or "").upper()
                   for d in (r.get("distributions") or []) if d.get("format")})
    slug = r.get("id", "")
    return {
        "amt": _de((r.get("catalog") or {}).get("title")),
        "amt_id": (r.get("catalog") or {}).get("id", ""),
        "themen_codes": ", ".join(themes),
        "themen": " / ".join(t for t in theme_labels if t),
        "titel": _de(r.get("title")),
        "beschreibung": re.sub(r"\s+", " ", _de(r.get("description"))).strip(),
        "formate": ", ".join(f for f in fmts if f),
        "aktualisiert": (r.get("modified") or "")[:10],
        "slug": slug,
        "url": LANDING + slug if slug else "",
    }


def fetch_all() -> list[dict]:
    """Holt alle veroeffentlichten Datensaetze des Portals.

    Laut API-Doku ist `limit` max. 1000 — die 254 Datensaetze passen also in
    EINE Anfrage. Die while-Schleife laeuft hier nur einmal; sie ist nur ein
    Sicherheitsnetz, falls der Katalog spaeter ueber 1000 Datensaetze waechst.

    Parameter-Wahl folgt der offiziellen hub-search-Doku:
      filters=dataset   (Pflichtfilter; `filter` ist laut Doku deprecated)
      countOnly=true    (nur die Gesamtzahl, ohne Treffer zu laden)
      limit=1000        (groesstmoegliche Seite)
    """
    count = _get({"filters": "dataset", "countOnly": "true"})["result"]["count"]
    print(f"Portal meldet {count} veroeffentlichte Datensaetze. Lade …", file=sys.stderr)

    rows, page = [], 0
    while len(rows) < count:
        results = _get({"filters": "dataset", "limit": PAGE, "page": page})["result"]["results"]
        if not results:
            break
        rows.extend(_extract(r) for r in results)
        page += 1
    print(f"  … {len(rows)} geladen", file=sys.stderr)
    return rows


def write_csv(rows: list[dict], path: Path) -> None:
    cols = ["amt", "themen_codes", "themen", "titel", "beschreibung",
            "formate", "aktualisiert", "url", "slug", "amt_id"]
    with path.open("w", newline="", encoding="utf-8-sig") as f:  # BOM -> Excel-freundlich
        w = csv.DictWriter(f, fieldnames=cols, delimiter=";")
        w.writeheader()
        for r in sorted(rows, key=lambda x: (x["themen_codes"], x["titel"])):
            w.writerow(r)
    print(f"  geschrieben: {path.name}  ({len(rows)} Zeilen)", file=sys.stderr)


def write_markdown(rows: list[dict], path: Path) -> None:
    by_theme: dict[str, list[dict]] = defaultdict(list)
    label_for: dict[str, str] = {}
    for r in rows:
        codes = [c.strip() for c in r["themen_codes"].split(",") if c.strip()] or ["(ohne)"]
        labels = [l.strip() for l in r["themen"].split("/")]
        for i, code in enumerate(codes):
            by_theme[code].append(r)
            if code not in label_for and i < len(labels) and labels[i]:
                label_for[code] = labels[i]

    amt_counts = Counter(r["amt"] for r in rows)
    fmt_counts = Counter(f.strip() for r in rows for f in r["formate"].split(",") if f.strip())

    lines = [
        "# Wiesbaden Open-Data-Katalog — vollständige Übersicht",
        "",
        f"**{len(rows)} veröffentlichte Datensätze** · Quelle: "
        "[opendata.cloud.wiesbaden.de](https://opendata.cloud.wiesbaden.de/app/data-catalog) "
        "· erzeugt mit `_fetch_opendata_katalog.py`",
        "",
        "## Nach Amt / Katalog",
        "",
        "| Datensätze | Amt |",
        "|---:|---|",
    ]
    for amt, n in amt_counts.most_common():
        lines.append(f"| {n} | {amt} |")

    lines += ["", "## Nach Format", "",
              "| Datensätze | Format |", "|---:|---|"]
    for fmt, n in fmt_counts.most_common():
        lines.append(f"| {n} | {fmt} |")

    lines += ["", "## Nach Kategorie (DCAT-Thema)", ""]
    for code in sorted(by_theme, key=lambda c: -len(by_theme[c])):
        label = label_for.get(code, "")
        head = f"{code} — {label}" if label and code != "(ohne)" else (label or code)
        lines.append(f"### {head}  ·  {len(by_theme[code])} Datensätze")
        lines.append("")
        for r in sorted(by_theme[code], key=lambda x: x["titel"]):
            fmts = f" `{r['formate']}`" if r["formate"] else ""
            date = f" — _{r['aktualisiert']}_" if r["aktualisiert"] else ""
            lines.append(f"- [{r['titel']}]({r['url']}){fmts}{date}")
        lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  geschrieben: {path.name}", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", metavar="PATH",
                    help="zusätzlich Roh-Cache (z.B. /tmp/wb_summary.json) schreiben")
    ap.add_argument("--outdir", default=str(HERE), help="Zielordner (default: Skriptordner)")
    args = ap.parse_args()
    outdir = Path(args.outdir)

    rows = fetch_all()
    write_csv(rows, outdir / "wiesbaden_opendata_katalog.csv")
    write_markdown(rows, outdir / "wiesbaden_opendata_katalog.md")
    if args.json:
        # Format passend zu _emit_catalog.py (slug/title/desc/themes/formats/modified/landing)
        cache = [{
            "slug": r["slug"], "title": r["titel"], "desc": r["beschreibung"],
            "themes": [c.strip() for c in r["themen_codes"].split(",") if c.strip()],
            "formats": [f.strip() for f in r["formate"].split(",") if f.strip()],
            "modified": r["aktualisiert"], "landing": r["url"],
        } for r in rows]
        Path(args.json).write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
        print(f"  geschrieben: {args.json}  ({len(cache)} Einträge, für _emit_catalog.py)",
              file=sys.stderr)
    print(f"\nFertig: {len(rows)} Datensätze.", file=sys.stderr)


if __name__ == "__main__":
    main()
