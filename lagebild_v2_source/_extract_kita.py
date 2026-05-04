#!/usr/bin/env python3
"""Extract Kita-Versorgungssituation per Ortsbezirk from the official report.

Source: "Tagesbetreuung für Kinder in den ersten Lebensjahren 2024/25"
        Stadt Wiesbaden, Amt für Soziale Arbeit, Abt. Kindertagesstätten
        Published September 2025 · 116 pages
URL:    https://www.wiesbaden.de/medien/downloads/leben-in-wiesbaden/amt-51.1/
        Bericht-Tagesbetreuung-fuer-Kinder-2024_25_final.pdf

Tables parsed:
  Tabelle 7  — u3 (Krippe, 0–3 Jahre) by Ortsbezirk
  Tabelle 11 — Elementar (Kindergarten, 3–6 Jahre) by Ortsbezirk

For each Ortsbezirk and age band:
  basiszahl   — Basiszahl Kinder (population basis)
  bedarf      — calculated demand (places needed)
  angebot     — places offered
  bilanz      — angebot - bedarf (negative = undersupplied)
  quote       — Platzangebotsquote in % (= angebot / basiszahl × 100)
  delta_pp    — change vs previous year, percentage points

Ortsbezirk names in PDF use official numbering (01, 02, 03, 06, 07, 08, 11, …, 53)
and abbreviated names (e.g. "Westend/Bleichstr.", "Mz-Kastel"). We map them to
the canonical names used in data.js / wiesbaden_ortsbezirke.geojson by fuzzy
matching on a normalized form (lowercase, ASCII-folded, punctuation stripped).
"""
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.request import urlretrieve

PDF_URL = (
    "https://www.wiesbaden.de/medien/downloads/leben-in-wiesbaden/amt-51.1/"
    "Bericht-Tagesbetreuung-fuer-Kinder-2024_25_final.pdf"
)
PDF_LOCAL = Path("/tmp/wi_kita_2024.pdf")

# Canonical names matching data.js ORTSBEZIRKE[].name and the GeoJSON.
# Used as the lookup key in the emitted JSON.
CANONICAL_NAMES = [
    "Mitte", "Rheingauviertel/Hollerborn", "Westend/Bleichstraße",
    "Nordost", "Südost", "Biebrich", "Schierstein", "Frauenstein",
    "Dotzheim", "Klarenthal", "Sonnenberg", "Rambach", "Heßloch",
    "Kloppenheim", "Igstadt", "Bierstadt", "Erbenheim", "Nordenstadt",
    "Delkenheim", "Medenbach", "Breckenheim", "Naurod", "Auringen",
    "Mainz-Kostheim", "Mainz-Kastel", "Mainz-Amöneburg",
]


def norm(s: str) -> str:
    """Lowercase, ASCII-fold, strip non-letter chars. Used for fuzzy match."""
    s = s.lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    return re.sub(r"[^a-z0-9]+", "", s)


def match_canonical(pdf_name: str) -> str:
    """Map PDF Ortsbezirk name to canonical name. Raises if unmatched."""
    # PDF abbreviations: Mz-Kastel → Mainz-Kastel, Westend/Bleichstr. → Westend/Bleichstraße
    expanded = pdf_name.replace("Mz-", "Mainz-")
    n = norm(expanded)
    for canon in CANONICAL_NAMES:
        cn = norm(canon)
        # Either side starts-with the other (handles "Westend/Bleichstr" ⊂ "Westend/Bleichstrasse"
        # and "Rheingauviertel" ⊂ "Rheingauviertel/Hollerborn")
        if n == cn or cn.startswith(n) or n.startswith(cn):
            return canon
    raise ValueError(f"Unmatched Ortsbezirk: {pdf_name!r} (norm={n!r})")


# Regex for one row in Tabelle 7 / 11. Layout (pdftotext -layout):
#   ID - Name           Basiszahl  Bedarf  Angebot  Bilanz  Quote  Delta
# Numbers use German formatting: "1.087" (thousands sep) and "32,7" (decimal comma).
ROW_RE = re.compile(
    r"^\s*(\d{2})\s*-\s*([A-Za-zÄÖÜäöüß./\- ]+?)\s+"
    r"([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(-?[\d.]+)\s+"
    r"(-?[\d,]+)\s+(-?[\d,]+)\s*$"
)


def to_int(s: str) -> int:
    """German thousands sep: '1.087' → 1087."""
    return int(s.replace(".", ""))


def to_float(s: str) -> float:
    """German decimal: '32,7' → 32.7."""
    return float(s.replace(".", "").replace(",", "."))


def extract_table(text: str, table_marker: str, end_marker: str) -> dict:
    """Find a table block between markers and parse Ortsbezirk rows.

    Returns: { canonical_name: {basiszahl, bedarf, angebot, bilanz, quote, delta_pp} }
    """
    # Find the second occurrence of the marker (the first is in the ToC).
    idx_first = text.index(table_marker)
    idx_start = text.index(table_marker, idx_first + 1)
    idx_end = text.index(end_marker, idx_start)
    block = text[idx_start:idx_end]

    rows = {}
    for line in block.splitlines():
        m = ROW_RE.match(line)
        if not m:
            continue
        pdf_id, pdf_name = m.group(1), m.group(2).strip()
        # Skip summary rows (e.g. "Summe Alt-Wiesbaden", "Gesamtstadt") — they have no leading ID,
        # but ROW_RE requires "## - Name", so they won't match anyway. Defensive check below.
        if not pdf_id.isdigit():
            continue
        try:
            canon = match_canonical(pdf_name)
        except ValueError as e:
            print(f"  ⚠ {e}", file=sys.stderr)
            continue
        rows[canon] = {
            "pdf_id": pdf_id,
            "basiszahl": to_int(m.group(3)),
            "bedarf": to_int(m.group(4)),
            "angebot": to_int(m.group(5)),
            "bilanz": to_int(m.group(6)),
            "quote": to_float(m.group(7)),
            "delta_pp": to_float(m.group(8)),
        }
    return rows


def extract_stadtweit(text: str) -> dict:
    """Pull citywide totals from Tabelle 5 (u3) and Tabelle 9 (Elementar)."""
    # These tables have a "Gesamtstadt" or summary row. We use the per-Ortsbezirk
    # tables' implicit totals from "Gesamtstadt" line at the bottom of Tabelle 7/11.
    out = {}
    for marker, key in [("Tabelle 7:", "u3"), ("Tabelle 11:", "elem")]:
        idx_first = text.index(marker)
        idx_start = text.index(marker, idx_first + 1)
        idx_end = idx_start + 5000
        block = text[idx_start:idx_end]
        # Match "Gesamtstadt   7.838  3.705  2.876  -829  36,7  1,5"
        m = re.search(
            r"Gesamtstadt\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(-?[\d.]+)\s+"
            r"(-?[\d,]+)\s+(-?[\d,]+)",
            block,
        )
        if m:
            out[key] = {
                "basiszahl": to_int(m.group(1)),
                "bedarf": to_int(m.group(2)),
                "angebot": to_int(m.group(3)),
                "bilanz": to_int(m.group(4)),
                "quote": to_float(m.group(5)),
                "delta_pp": to_float(m.group(6)),
            }
    return out


def main():
    if not PDF_LOCAL.exists():
        print(f"Downloading {PDF_URL} → {PDF_LOCAL}")
        urlretrieve(PDF_URL, PDF_LOCAL)

    print(f"Extracting text from {PDF_LOCAL}")
    text = subprocess.check_output(
        ["pdftotext", "-layout", str(PDF_LOCAL), "-"], text=True
    )

    u3 = extract_table(text, "Tabelle 7:", "Tabelle 8:")
    elem = extract_table(text, "Tabelle 11:", "Tabelle 12:")
    stadtweit = extract_stadtweit(text)

    # Verify all 26 Ortsbezirke matched.
    missing_u3 = set(CANONICAL_NAMES) - set(u3)
    missing_el = set(CANONICAL_NAMES) - set(elem)
    if missing_u3 or missing_el:
        print(f"⚠ Missing in u3:   {missing_u3}", file=sys.stderr)
        print(f"⚠ Missing in elem: {missing_el}", file=sys.stderr)
        sys.exit(1)

    # Merge per Ortsbezirk.
    ortsbezirke = []
    for name in CANONICAL_NAMES:
        ortsbezirke.append({
            "name": name,
            "pdf_id": u3[name]["pdf_id"],
            "u3": {k: v for k, v in u3[name].items() if k != "pdf_id"},
            "elem": {k: v for k, v in elem[name].items() if k != "pdf_id"},
        })

    out = {
        "meta": {
            "source": "Bericht „Tagesbetreuung für Kinder in den ersten Lebensjahren 2024/25“",
            "publisher": "Stadt Wiesbaden, Amt für Soziale Arbeit, Abt. Kindertagesstätten und Kindertagespflege",
            "stand": "2024/25 (publ. 09/2025)",
            "url": PDF_URL,
            "tabellen": ["Tabelle 7 (u3)", "Tabelle 11 (Elementar)"],
            "license": "Cite source per Stadt Wiesbaden Open-Data-Praxis",
        },
        "stadtweit": stadtweit,
        "ortsbezirke": ortsbezirke,
    }

    out_path = Path(__file__).parent / "kita_versorgung_2024_25.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))

    # Sanity report.
    print(f"\n✓ Wrote {out_path.name}")
    print(f"  Ortsbezirke matched: {len(ortsbezirke)}/26")
    print(f"\n  Stadtweit:")
    for k, d in stadtweit.items():
        print(f"    {k:5s}  Quote={d['quote']:5.1f}%  Bilanz={d['bilanz']:+5d}  Δ={d['delta_pp']:+.1f}pp")
    # Top crisis (lowest u3 quote).
    crisis = sorted(ortsbezirke, key=lambda o: o["u3"]["quote"])[:5]
    print(f"\n  Top-5 u3 crisis (lowest Versorgungsquote):")
    for o in crisis:
        print(f"    {o['name']:30s}  u3 {o['u3']['quote']:5.1f}%  Bilanz {o['u3']['bilanz']:+4d}")


if __name__ == "__main__":
    main()
