# Ortsbezirke Wiesbaden – Referenz (Stammdaten und Alias)

Zentrale Referenz der **26 Ortsbezirke** als **raeumlicher Schluessel** fuer alle
ortsbezirksbezogenen Statistiken. Wer Daten auf Bezirksebene veroeffentlicht oder
verknuepft, nutzt diese Referenz: die **ID ist der verbindliche Schluessel**, der
**Name dient nur der Anzeige**.

## Inhalt des Pakets

| Datei | Inhalt |
|---|---|
| `ortsbezirke_referenz.csv` | Stammtabelle – die Wahrheit (26 Zeilen) |
| `ortsbezirke_alias.csv` | Alias-Crosswalk – jede Schreibweise zur ID |
| `ortsbezirke_referenz.geojson` | Stammdaten mit Geometrie (EPSG:4326) |
| `dcat-ap_metadata.jsonld` | Metadaten nach DCAT-AP.de |
| `README.md` | diese Dokumentation und Spalten-Legende |

## Spalten-Legende

### `ortsbezirke_referenz.csv` (Trennzeichen `;`, UTF-8)

| Spalte | Typ | Bedeutung |
|---|---|---|
| `ortsbezirk_nummer` | Text | Offizielle ID des Ortsbezirks, **Primaerschluessel**. Fuehrende Null erhalten (z. B. `01`). Nicht fortlaufend von 1 bis 26. |
| `ortsbezirk_name` | Text | Offizielle Schreibweise des Namens (z. B. `Westend/Bleichstraße`, `Mainz-Kastel`). |
| `osm_id` | Zahl | ID der zugehoerigen Grenz-Relation in OpenStreetMap. Verweis auf die Geometrie-Quelle. |
| `akk` | Bool | `true` fuer die drei AKK-Ortsbezirke rechts des Rheins (51 Mainz-Amoeneburg, 52 Mainz-Kastel, 53 Mainz-Kostheim), sonst `false`. |

### `ortsbezirke_alias.csv` (Trennzeichen `;`, UTF-8)

| Spalte | Typ | Bedeutung |
|---|---|---|
| `alias` | Text | Eine in Quelldaten vorkommende Schreibweise (z. B. `Westend, Bleichstraße`, `Kastel`). |
| `ortsbezirk_nummer` | Text | Die ID, auf die der Alias abgebildet wird. Verweis auf `ortsbezirke_referenz.csv`. |

Mehrere Aliase koennen auf dieselbe ID zeigen (n:1). Beispiel ID `08`:
`Westend/Bleichstraße`, `Westend / Bleichstraße`, `Westend, Bleichstraße`.

### `ortsbezirke_referenz.geojson`

FeatureCollection mit 26 Polygonen. Koordinaten **lon/lat, EPSG:4326** nach RFC 7946.
Eigenschaften je Feature: `ortsbezirk_nummer`, `ortsbezirk_name`, `osm_id`, `akk`.
Fuer Flaechen- oder Distanzberechnungen in Metern nach **EPSG:25832** transformieren.

## Nutzungsregel (Datenstandard)

1. Jeder ortsbezirksbezogene Datensatz fuehrt `ortsbezirk_nummer` als **Pflichtfeld**.
2. Eingehende Namen werden ueber `ortsbezirke_alias.csv` zur ID normalisiert.
3. Nicht zuordenbare Namen blockieren nicht, sondern kommen in einen **Pruefbericht**
   und werden nach Pruefung als neuer Alias ergaenzt (Pflege).
4. Der Name ist Anzeige, nie Verknuepfungsschluessel.

## Beispiel (Python)

```python
from _ortsbezirke_lookup import to_id, to_name
to_id("Westend, Bleichstraße")   # -> "08"
to_name("Kastel")                # -> "Mainz-Kastel"
```

## Lizenz, Quellen, Stand

- **Lizenz:** Datenlizenz Deutschland – Namensnennung 2.0 (dl-by-de/2.0)
- **Quellen:** offizielle Ortsbezirks-IDs und -Namen aus den **amtlichen Wahldaten
  der Stadt** (Kommunalwahl 2026 – die Ergebnisse weisen jeden Ortsbezirk mit der
  amtlichen Nummerierung aus, z. B. `01` Mitte; die Gesamt-Zeile `00` ist bewusst
  ausgelassen). Geometrie aus OpenStreetMap (ODbL), Grenz-Relationen `admin_level=9`.
- **Stand / Versionierung:** Geometrie und Namen folgen dem aktuellen Gebietsstand.
  Bei Aenderungen werden die Spalten `gueltig_ab` / `gueltig_bis` ergaenzt und eine
  neue Version veroeffentlicht; alte Versionen bleiben erhalten.

## Hinweis

Felder mit `PLATZHALTER` in den Metadaten (Kontakt-E-Mail, Download-URLs, Datums-
und Standangaben) werden beim Veroeffentlichen auf dem Portal gesetzt.
