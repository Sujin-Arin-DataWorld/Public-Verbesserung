#!/usr/bin/env python3
"""Validierungs-Pipeline (Prototyp) — Stadt Wiesbaden, offene Daten.

Prüft jeden Datensatz mit CSV-Distribution gegen eine *Teilmenge* des
Open-Data-Leitfadens (Datenstandards) sowie gegen Ortsbezirks-Domänenregeln
(zentrale Referenz + Alias-Crosswalk). Ausgabe: Konformitätsbericht je Datensatz
(JSON) plus aggregierte Kennzahl "X von Y mit >=1 Befund".

Lauf:  python3 validierung_pipeline.py
Quelle der Referenz: ortsbezirke_referenz.csv / ortsbezirke_alias.csv (gleicher Ordner).
Bewusst Prototyp: liest/prueft veroeffentlichte Daten, noch nicht in den Publish-Fluss eingebunden.
"""
import json, subprocess, re, csv, io, os
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
SEARCH = "https://opendata.cloud.wiesbaden.de/api/hub/search/search?filters=dataset&limit=300"
PLACEHOLDERS = {"na", "n.v.", "nv", "k.a.", "ka", "keine angabe", "null", "n/a", "#nv", "-"}

# ---- Referenz + Alias laden -------------------------------------------------
def norm(s):
    s = (s or "").lower()
    for k, v in {"ä": "a", "ö": "o", "ü": "u", "ß": "ss"}.items():
        s = s.replace(k, v)
    return re.sub(r"[\/\-\s,.()]+", "", s)

OFF_IDS, ALIAS = set(), {}
for line in open(os.path.join(HERE, "ortsbezirke_referenz.csv")).read().splitlines()[1:]:
    p = line.split(";")
    if len(p) >= 2:
        OFF_IDS.add(p[0]); ALIAS[norm(p[1])] = p[0]
for line in open(os.path.join(HERE, "ortsbezirke_alias.csv")).read().splitlines()[1:]:
    p = line.split(";")
    if len(p) >= 2 and p[0]:
        ALIAS[norm(p[0])] = p[1].strip()

# ---- Regeln -----------------------------------------------------------------
def col_bad(c):                       # Header: snake_case-Regel (nur unstrittige Verstoesse)
    return bool(re.search(r"[\s äöüßÄÖÜ\[\](){}:;/%]", c))

def thousand_sep(vals):               # R-NUM: Tausenderpunkt (1.234) ist im Leitfaden verboten
    return sum(1 for v in vals if re.match(r"^-?\d{1,3}(\.\d{3})+$", v or "")) >= 3

def validate(name, url):
    f = []  # findings: (regel, schwere, detail)
    try:
        raw = subprocess.run(["curl", "-s", "--max-time", "15", "-r", "0-300000", url],
                             capture_output=True, timeout=20).stdout
    except Exception:
        return name, url, [("R-FETCH", "HINWEIS", "nicht abrufbar")]
    if raw[:3] == b"\xef\xbb\xbf":
        f.append(("R-ENC", "WARNUNG", "UTF-8 mit BOM (Leitfaden: ohne BOM)"))
    else:
        # R-ENC Teil 2 (Leitfaden 5): Standard UTF-8 ohne BOM; Abweichungen (z. B. CP1252)
        # nur ausnahmsweise und im Dateinamen auszuweisen (..._cp1252.csv).
        try:
            raw.decode("utf-8")
        except UnicodeDecodeError as e:
            if e.start < len(raw) - 3:   # echter Fehler, nicht nur abgeschnittenes letztes Zeichen (Teil-Download)
                declared = bool(re.search(r"cp_?1252|windows[-_ ]?1252|latin[-_ ]?1|iso[-_ ]?8859", (url or "").lower()))
                if declared:
                    f.append(("R-ENC", "HINWEIS", "Nicht-UTF-8, aber im Dateinamen ausgewiesen"))
                else:
                    f.append(("R-ENC", "WARNUNG", "Nicht-UTF-8 (z. B. CP1252) ohne Kennzeichnung im Dateinamen"))
    text = raw.decode("utf-8-sig", errors="replace")
    first = text.split("\n", 1)[0]
    d = ";" if first.count(";") >= first.count(",") else ","
    if d != ";":
        f.append(("R-SEP", "WARNUNG", "Trennzeichen ',' statt ';'"))
    rows = list(csv.reader(io.StringIO(text), delimiter=d))
    if not rows:
        return name, url, f
    hdr = [h.strip() for h in rows[0]]
    body = [r for r in rows[1:] if any(c.strip() for c in r)][:1500]

    bad_cols = [c for c in hdr if col_bad(c)]
    if bad_cols:
        f.append(("R-COL", "WARNUNG", f"{len(bad_cols)} Spaltennamen nicht snake_case: {bad_cols[:3]}"))

    # R-NA + R-NUM (spaltenweise)
    na_hit = False
    for ci, c in enumerate(hdr):
        vals = [(r[ci].strip() if ci < len(r) else "") for r in body]
        if not na_hit and any(v.lower() in PLACEHOLDERS and v != "-" for v in vals):
            f.append(("R-NA", "WARNUNG", f"Platzhalter statt leerem Feld in '{c}'")); na_hit = True
        if thousand_sep([v for v in vals if v]):
            f.append(("R-NUM", "WARNUNG", f"Tausenderpunkt in Zahlen ('{c}')")); break

    # ---- Ortsbezirks-Domaenenregeln ----
    def find(target):
        for i, c in enumerate(hdr):
            if c.lower().replace(" ", "_") == target:
                return i
        return None
    ii, ni = find("ortsbezirk_id"), find("ortsbezirk_name")
    if ii is not None:
        ges = False; broke = []; bad_id = set()
        for r in body:
            idv = (r[ii].strip() if ii < len(r) else "")
            nmv = (r[ni].strip() if (ni is not None and ni < len(r)) else "")
            if idv in ("00", "0") or norm(nmv) in ("wiesbaden", "insgesamt", "gesamt"):
                ges = True; continue
            if idv and idv.zfill(2) not in OFF_IDS:
                bad_id.add(idv)
            if ni is not None and nmv:
                resolved = ALIAS.get(norm(nmv))
                if not resolved or (idv and resolved != idv.zfill(2)):
                    broke.append(f"{idv}:{nmv}")
        if broke:
            f.append(("R-OB-NAME", "FEHLER", f"Name passt nicht zur ID: {sorted(set(broke))[:3]}"))
        if bad_id:
            f.append(("R-OB-ID", "FEHLER", f"ungueltige ortsbezirk_id: {sorted(bad_id)[:4]}"))
        if ges:
            f.append(("R-OB-GES", "HINWEIS", "unbeschriftete Gesamtzeile (00) zwischen den Bezirken"))
    return name, url, f

# ---- Lauf -------------------------------------------------------------------
def main():
    cat = json.loads(subprocess.run(["curl", "-s", "--max-time", "30", SEARCH],
                                    capture_output=True, timeout=35).stdout)
    items = []
    for r in cat.get("result", {}).get("results", []):
        csvurl = None
        for dd in (r.get("distributions") or []):
            fmt = ((dd.get("format") or {}).get("id") or "").upper()
            if fmt == "CSV":
                csvurl = (dd.get("access_url") or [None])[0] or dd.get("download_url"); break
        if csvurl:
            t = r.get("title"); t = (t.get("de") or t.get("en")) if isinstance(t, dict) else t
            items.append((t or "?", csvurl))

    results = list(ThreadPoolExecutor(max_workers=14).map(lambda x: validate(*x), items))

    rule = Counter(); sev = Counter(); any_find = 0; with_fehler = 0
    report = []
    for name, url, f in results:
        if f:
            any_find += 1
        if any(s == "FEHLER" for _, s, _ in f):
            with_fehler += 1
        for rg, s, _ in f:
            rule[rg] += 1; sev[s] += 1
        report.append({"dataset": name, "url": url,
                       "findings": [{"regel": rg, "schwere": s, "detail": d} for rg, s, d in f]})
    N = len(results)
    enc = {"utf8_bom": 0, "nicht_utf8_undeklariert": 0, "nicht_utf8_deklariert": 0}
    for _n, _u, fs in results:
        for rg, s, det in fs:
            if rg != "R-ENC":
                continue
            if "BOM" in det:
                enc["utf8_bom"] += 1
            elif "ohne Kennzeichnung" in det:
                enc["nicht_utf8_undeklariert"] += 1
            elif "ausgewiesen" in det:
                enc["nicht_utf8_deklariert"] += 1
    out = {"geprueft": N, "mit_befund": any_find, "mit_fehler": with_fehler,
           "nach_regel": dict(rule), "nach_schwere": dict(sev),
           "encoding_breakdown": enc, "berichte": report}
    json.dump(out, open(os.path.join(HERE, "validierung_bericht.json"), "w"),
              ensure_ascii=False, indent=2)

    R = {"R-ENC": "Kodierung (UTF-8 o.BOM)", "R-SEP": "Trennzeichen != ;", "R-COL": "Spalten nicht snake_case",
         "R-NA": "Platzhalter statt leer", "R-NUM": "Tausenderpunkt", "R-OB-NAME": "Name<>ID (kaputt)",
         "R-OB-ID": "ungueltige ID", "R-OB-GES": "Gesamtzeile gemischt", "R-FETCH": "nicht abrufbar"}
    print(f"\n=== Validierungs-Pipeline · Lauf ueber {N} Datensaetze ===\n")
    print(f"  Datensaetze mit >=1 Befund : {any_find}/{N}  ({100*any_find/N:.0f}%)")
    print(f"  davon mit FEHLER           : {with_fehler}/{N}  ({100*with_fehler/N:.0f}%)")
    print(f"  Befunde nach Schwere       : {dict(sev)}\n")
    print("  Nach Regel:")
    for rg, n in rule.most_common():
        print(f"    {rg:11s} {R.get(rg, ''):26s} {n:4d} Datensaetze")
    print(f"\n  R-ENC (Kodierung) Aufschluesselung:")
    print(f"    UTF-8 mit BOM                     : {enc['utf8_bom']}")
    print(f"    Nicht-UTF-8 OHNE Kennzeichnung    : {enc['nicht_utf8_undeklariert']}")
    print(f"    Nicht-UTF-8 im Dateinamen ausgew. : {enc['nicht_utf8_deklariert']}")
    print(f"\n  Bericht: {os.path.join(HERE, 'validierung_bericht.json')}")

if __name__ == "__main__":
    main()
