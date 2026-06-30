# Datensätze direkt erkunden — ein Inline-Explorer für das Open-Data-Portal Wiesbaden

*Verbesserungsvorschlag · lauffähiger Prototyp beiliegend*

## Ausgangslage (selbst am Portal geprüft, 26.06.2026)

`opendata.cloud.wiesbaden.de` veröffentlicht den Katalog sauber — **254 Datensätze, davon genau 239 mit CSV-Distribution** (selbst per Skript ausgezählt). Für die **anonyme Öffentlichkeit** zeigt eine Datensatz-Seite heute jedoch nur:

- Titel, Beschreibung, Metadaten und einen **Download-Link** — mehr nicht.
- Die **Datenvorschau** liegt hinter dem Login und zeigt auch nach Anmeldung keine Tabelle. Grund vermutlich: diese Instanz betreibt keinen DataStore-Dienst (im ausgelieferten Frontend-Bundle nicht referenziert) — die Vorschau-Komponente hat keine Datenquelle.
- Das **Diagramm-Modul** (Superset) ist in dieser Instanz nicht aktiviert.

**Für die anonyme Öffentlichkeit gibt es damit zu faktisch 0 Datensätzen eine Vorschau im Browser.** Wer wissen will, was in einem Datensatz steckt, muss ihn herunterladen und in Excel öffnen.

## Idee

Pro Datensatz ein **„Erkunden"-Knopf**, direkt in der Katalog-Seite:

1. **Spalten** mit heuristisch erkanntem Typ (Zahl / Text),
2. eine **Tabellen-Vorschau**, und
3. ein **automatisches Diagramm** (Achse × Wert, Mittel/Summe), ggf. mit Jahr-Filter.

Kein Download, kein Login. Vorbild ist vor allem **Singapur (data.gov.sg)** — eine offene, typisierte Datastore-API, im Prototyp live nachgebaut. Helsinki (CKAN) zeigt dasselbe Prinzip serverseitig, ist aber **nicht CORS-offen** und bräuchte einen Proxy.

## Warum es kein Backend braucht

- **Beide benötigten Endpunkte sind CORS-offen und ohne Login erreichbar** (im Browser geprüft): die Such-API (`Access-Control-Allow-Origin: *`, liefert den Katalog) und der CSV-Store (`api/hub/store/.../data/`, spiegelt den Origin). Der Browser lädt also **Katalog und Daten direkt live** — kein Build-Schritt, kein Proxy, kein Hintergrund-Job.
- piveau liefert öffentlich nur DCAT-Metadaten, **keine Spaltentypen** — die App leitet den Typ heuristisch ab (numerisch, wenn ≥ 90 % der Werte parsebar sind), inkl. deutscher Zahlen (1.234,56). **Das ist eine Regel, keine KI.**
- Damit braucht der Explorer **keine Datenbank und keine Pflege je Datensatz.** Ein zwischengespeicherter Katalog-Index ist *optional* — nur zur Beschleunigung, nicht erforderlich.

Unterschied zu Superset-Dashboards: die müssten je Datensatz **von Hand kuratiert** werden — bei 239 Datensätzen als Standard unrealistisch. Der Inline-Explorer ist **automatisch und universell**; beides ergänzt sich.

## Grenzen & wie ich sie behandle

- **Falsch geratene Typen:** ID-, PLZ-, Gebietsschlüssel- und Jahres-Spalten sind numerisch, aber kategorial. Die Heuristik ist nur ein Startpunkt — Nutzer:innen können Achse/Wert umstellen (im Prototyp möglich), ID-artige Spalten werden niedriger priorisiert, und für die Pilot-Datensätze lassen sich Typen per kleiner Overrides-Datei fixieren. Bei untypischem Encoding zeigt der Explorer die **Rohtabelle, nie eine falsche Zahl.**
- **Datenschutz:** ausschließlich bereits veröffentlichte Open-Data-CSV (CC BY 4.0), **keine personenbezogenen Daten**; **keine serverseitige Protokollierung, keine Drittanbieter-Einbettung** (No-Backend ist hier ein Datenschutz-Vorteil). Die Auto-Aggregation muss bestehende **statistische Geheimhaltung (kleine Fallzahlen)** respektieren. Die CORS-Konfiguration des Store-Endpunkts (reflektierter Origin) ist mit der IT zu prüfen.
- **Barrierefreiheit:** Darstellung nach **BITV 2.0** (Tabelle als barrierearme Alternative zum Diagramm, Tastaturbedienung), CC-BY-Quellenangabe je Vorschau, sicheres Escaping der Zellinhalte, Zeilen-/Größenlimit.
- **Einbau ins Portal:** Integration als piveau-UI-Komponente erfordert Abstimmung mit dem **Portal-Betreiber.** Risikofreie Alternative: eine eigenständige Begleit-Seite (wie der Prototyp) ohne Eingriff in die Instanz.

## Prototyp (liegt bei, lauffähig)

- **Katalog mit Inline-Explorer** — der echte Katalog (239 CSV-Datensätze), jede Karte mit „Erkunden".
- **Karten-Explorer (MapLibre)** — Werte je Ortsbezirk als Choropleth + 3D.
- **Referenz Singapur** — data.gov.sg live.

## Nutzen

| | |
|---|---|
| **Niedrigere Hürde** | Inhalt sofort sichtbar — ohne Download, ohne Excel, ohne Login. |
| **Datenkompetenz** | Werte je Ortsbezirk / Jahr direkt vergleichbar. |
| **Geringer, benennbarer Aufwand** | dünne Schicht auf piveau, keine Pflege je Datensatz. |

## Umsetzung

1. **Pilot** (10–15 Datensätze des Amts für Statistik: Wohnen, Bevölkerung, Bodenrichtwerte) — grobe Schätzung **wenige Personentage**; laufender Betrieb praktisch nur gelegentliche Typ-Overrides. **Fachliche Verantwortung Amt 12, technischer Betrieb in Abstimmung mit dem Portal-Team.**
2. **Auswerten** mit Bürger:innen / Fachämtern; Barrierefreiheit prüfen.
3. **Empfehlung zum Rollout** auf den ganzen Katalog. Ob die Vorschau auch in der anonymen Ansicht Standard wird, ist mit dem Portal-Team abzuwägen.

---

*Belastbarkeit: Die Aussagen oben beziehen sich auf die öffentliche, anonyme Ansicht dieser Portal-Instanz (geprüft 26.06.2026). Andere piveau-Instanzen (z. B. data.europa.eu) können mehr bieten.*
