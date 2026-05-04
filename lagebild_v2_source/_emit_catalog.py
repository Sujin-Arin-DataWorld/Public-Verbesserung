#!/usr/bin/env python3
"""Convert /tmp/wb_summary.json (232 Wiesbaden datasets, Piveau-API cache)
into a compact JS const for embedding into data.js.

Output:
  _catalog.js.snippet  →  const OPEN_DATA_CATALOG = [...];

Each entry has 7 fields, optimised for size + BM25 / browse rendering:
  i  slug (anchor URL)
  t  title (DE)
  d  desc (200 chars max)
  th themes[] (DCAT-AP codes)
  f  formats[]
  m  modified (YYYY-MM-DD)
  l  landingPage URL or "" if null
"""
import json
import re
from collections import Counter
from pathlib import Path

CACHE = Path("/tmp/wb_summary.json")
OUT = Path(__file__).resolve().parent / "_catalog.js.snippet"


def short_desc(s: str, n: int = 220) -> str:
    if not s:
        return ""
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def short_modified(s):
    if not s:
        return ""
    return s[:10]  # YYYY-MM-DD


def landing_url(slug, original):
    if original:
        return original
    if not slug:
        return ""
    return f"https://opendata.cloud.wiesbaden.de/app/data-catalog/{slug}"


def main():
    raw = json.loads(CACHE.read_text())
    print(f"Source: {CACHE} ({CACHE.stat().st_size:,} bytes)")
    print(f"Datasets in cache: {len(raw)}")

    out = []
    for d in raw:
        out.append(
            {
                "i": d.get("slug", ""),
                "t": (d.get("title") or "").strip(),
                "d": short_desc(d.get("desc") or ""),
                "th": d.get("themes") or [],
                "f": d.get("formats") or [],
                "m": short_modified(d.get("modified")),
                "l": landing_url(d.get("slug"), d.get("landing")),
            }
        )

    # Drop entries that don't even have a title (the catalog browser
    # would render an empty card otherwise).
    out = [r for r in out if r["t"]]

    # Sort: most recent first (so the home of the browser shows freshness)
    out.sort(key=lambda r: (r["m"] or ""), reverse=True)

    js = "const OPEN_DATA_CATALOG = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";"
    OUT.write_text(js)

    # Stats
    theme_counter = Counter(t for r in out for t in r["th"])
    fmt_counter = Counter(f for r in out for f in r["f"])
    print(f"\nWritten: {OUT.name} ({OUT.stat().st_size:,} bytes, {len(out)} entries)")
    print(f"\nTop 10 themes (DCAT-AP):")
    for t, n in theme_counter.most_common(10):
        print(f"  {n:4d}  {t}")
    print(f"\nTop formats:")
    for f, n in fmt_counter.most_common(10):
        print(f"  {n:4d}  {f}")
    print(f"\nFreshness:")
    by_year = Counter((r["m"] or "")[:4] for r in out)
    for y, n in sorted(by_year.items(), reverse=True)[:6]:
        print(f"  {n:4d}  {y or '(unknown)'}")
    print(f"\nSlug coverage: {sum(1 for r in out if r['i'])}/{len(out)}")
    print(f"Landing URL coverage: {sum(1 for r in out if r['l'])}/{len(out)}")


if __name__ == "__main__":
    main()
