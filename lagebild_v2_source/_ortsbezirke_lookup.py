"""Ortsbezirke-Referenz: zentrale Stammdaten + Alias-Crosswalk.

Zwei Tabellen, eine Aufgabe: jede beliebige Schreibweise eines Ortsbezirks
auf die eine offizielle ID und den offiziellen Namen abbilden.

  ortsbezirke_referenz.csv  (Stamm)  -> die Wahrheit: id, name_offiziell, osm_id, akk
  ortsbezirke_alias.csv     (Alias)  -> der Uebersetzer: Schreibvariante -> id

Das formalisiert die fruehere fuzzy_district_match()-Logik als Daten.
Neue Datensaetze laufen nur noch durch to_id(); nicht zuordenbare Namen
landen im Bericht (find_unmatched), werden geprueft und als Alias ergaenzt.

Stand: Gebietsstand der 26 Wiesbadener Ortsbezirke (AKK = 51/52/53).
Erweiterung: Spalten gueltig_ab / gueltig_bis fuer Versionierung bei
Grenz- oder Namensaenderungen.
"""
from __future__ import annotations
import csv
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REFERENZ = HERE / "ortsbezirke_referenz.csv"
ALIAS = HERE / "ortsbezirke_alias.csv"


def _norm(s: str) -> str:
    """Schreibweise vereinheitlichen: klein, Umlaute aufloesen, Satzzeichen weg."""
    s = (s or "").lower()
    for a, b in {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}.items():
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "", s)


def _load():
    stamm = {}  # id -> name_offiziell
    with REFERENZ.open(encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            stamm[r["ortsbezirk_id"]] = r["name_offiziell"]
    alias = {}  # normalisierter Alias -> id
    with ALIAS.open(encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            alias[_norm(r["alias"])] = r["ortsbezirk_id"]
    # die offiziellen Namen sind selbst auch gueltige Aliase
    for oid, name in stamm.items():
        alias.setdefault(_norm(name), oid)
    return stamm, alias


_STAMM, _ALIAS = _load()


def to_id(name: str) -> str | None:
    """Beliebige Schreibweise -> offizielle ortsbezirk_id, sonst None."""
    return _ALIAS.get(_norm(name))


def to_name(name: str) -> str | None:
    """Beliebige Schreibweise -> offizieller Name, sonst None."""
    oid = to_id(name)
    return _STAMM.get(oid) if oid else None


def find_unmatched(names) -> list[str]:
    """Liste der Namen, die KEINER ID zugeordnet werden konnten (Pruefbericht)."""
    return [n for n in names if to_id(n) is None]


if __name__ == "__main__":
    print(f"Stamm: {len(_STAMM)} Ortsbezirke, Alias: {len(_ALIAS)} Schreibweisen\n")

    # Demo: dieselben drei Quell-Schreibweisen landen auf derselben ID
    proben = [
        "Westend, Bleichstraße",     # Piveau-CSV (Komma)
        "Westend / Bleichstraße",    # OSM/GeoJSON (Schraegstrich mit Leerzeichen)
        "westend/bleichstrasse",     # klein, ss, ohne Leerzeichen (NICHT woertlich im Alias)
        "Kastel",                    # AKK-Kurzform
        "Mainz-Kastel",              # AKK-Vollform
        "Rheingauviertel, Hollerborn",
        "Unbekannter Ortsteil",      # geht in den Bericht
    ]
    for p in proben:
        oid = to_id(p)
        print(f"  {p:30s} -> id={oid or '---':>4}  name={to_name(p) or '(nicht zuordenbar)'}")

    rep = find_unmatched(proben)
    print(f"\nPruefbericht nicht zuordenbar: {rep}")
