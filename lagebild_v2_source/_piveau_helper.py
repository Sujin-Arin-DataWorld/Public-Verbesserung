"""Shared helper for fetching CSV distributions from
opendata.cloud.wiesbaden.de via the Piveau hub-search/hub-store APIs.

Usage:
    from _piveau_helper import fetch_dataset_csv, fuzzy_district_match
    rows = fetch_dataset_csv(slug, expected_format="CSV")
"""
from __future__ import annotations
import csv
import io
import json
import re
import sys
import urllib.parse
import urllib.request

PIVEAU_SEARCH = "https://opendata.cloud.wiesbaden.de/api/hub/search/search"
UA = "Mozilla/5.0 (Wiesbaden-Lagebild build script)"

# Canonical 26 Ortsbezirke names as used everywhere else in the dashboard.
# Order matches data.js ORTSBEZIRKE.
ORTSBEZIRKE_CANON = [
    "Mitte", "Rheingauviertel/Hollerborn", "Westend/Bleichstraße", "Nordost",
    "Südost", "Biebrich", "Schierstein", "Frauenstein", "Dotzheim",
    "Klarenthal", "Sonnenberg", "Rambach", "Heßloch", "Kloppenheim",
    "Igstadt", "Bierstadt", "Erbenheim", "Nordenstadt", "Delkenheim",
    "Medenbach", "Breckenheim", "Naurod", "Auringen",
    "Mainz-Kostheim", "Mainz-Kastel", "Mainz-Amöneburg",
]


def _norm(s: str) -> str:
    s = (s or "").lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    s = re.sub(r"[\/\-\s,.]+", "", s)
    return s


def fuzzy_district_match(raw: str) -> str | None:
    """Map a Piveau-CSV `ortsbezirk_name` ('Westend, Bleichstraße') to the
    canonical name used in ORTSBEZIRKE ('Westend/Bleichstraße').
    Returns None if nothing matches well enough.
    """
    if not raw:
        return None
    n = _norm(raw)
    for canon in ORTSBEZIRKE_CANON:
        nc = _norm(canon)
        if n == nc or nc in n or n in nc:
            return canon
        # Half-prefix match for compound names: "westendbleichstraße" startswith "westend"
        first_token = nc.split("/")[0] if "/" in canon else nc
        if first_token and (n.startswith(first_token) or first_token.startswith(n[:6])):
            return canon
    return None


def _http_get(url: str, accept: str = "application/json") -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def fetch_dataset_meta(slug: str) -> dict:
    """Look up a dataset by slug via Piveau search; return the result dict."""
    qs = urllib.parse.urlencode({"q": slug, "limit": 5})
    payload = json.loads(_http_get(f"{PIVEAU_SEARCH}?{qs}"))
    results = (payload.get("result") or {}).get("results") or []
    for r in results:
        if r.get("id") == slug:
            return r
    # Fallback: first result whose id contains the slug suffix.
    for r in results:
        if slug in (r.get("id") or ""):
            return r
    raise SystemExit(f"ERROR: dataset {slug!r} not found in Piveau search")


def csv_url_for(meta: dict) -> str:
    for d in (meta.get("distributions") or []):
        fmt = ((d.get("format") or {}).get("id") or "").upper()
        if fmt != "CSV":
            continue
        for u in (d.get("access_url") or []):
            if u:
                return u
        if d.get("download_url"):
            return d["download_url"]
    raise SystemExit(f"ERROR: dataset {meta.get('id')!r} has no CSV distribution")


def fetch_dataset_csv(slug: str) -> tuple[list[dict], dict]:
    """Convenience: returns (rows, meta) where rows is list[dict] from CSV."""
    meta = fetch_dataset_meta(slug)
    url = csv_url_for(meta)
    raw = _http_get(url, accept="text/csv,application/octet-stream").decode("utf-8-sig")
    sniff = csv.Sniffer().sniff(raw[:1024], delimiters=";,")
    reader = csv.DictReader(io.StringIO(raw), dialect=sniff)
    rows = list(reader)
    return rows, meta


def parse_de_number(s: str) -> float | None:
    """Convert a German-format number ('33.373', '12,3', '4.256.789') to float."""
    if s is None:
        return None
    s = str(s).strip()
    if not s or s == "-":
        return None
    # If has both . and ,: . is thousands separator, , is decimal.
    # If only ,: it's the decimal separator.
    # If only .: ambiguous — assume thousands separator if integer-looking else decimal.
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    elif "." in s and re.match(r"^\d{1,3}(\.\d{3})+$", s):
        s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def emit_js_const(name: str, payload: dict | list, header_lines: list[str], out_path: str) -> None:
    """Write a single .js.snippet with banner comments + const declaration."""
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    text = "\n".join(f"// {ln}" for ln in header_lines) + f"\nconst {name} = {body};\n"
    from pathlib import Path
    Path(out_path).write_text(text)
    print(f"  wrote {out_path}  ({len(text):,} bytes)")
