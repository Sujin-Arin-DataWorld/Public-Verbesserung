# Pilotvorschlag „Hitzeinsel Wiesbaden"

**Vorgelegt von** Sujin Park · **Stand** 2026-05-05 · **Status** Bewerbungs-Vorlage
**Bezug** Wiesbaden-Lagebild v2.8 — Audit 2026-05-04, §6.7 (Citizen-Sensor-Pilot)
**Vorbild** [CurieuzeNeuzen Vlaanderen 2018](https://2018.curieuzeneuzen.be/en/) — EU Citizen Science Prize 2023

---

## 1. Worum geht es

Wiesbaden hat **keinen offenen Mikroklima-Datensatz auf Bezirksebene**. Die Hitzewellen 2018, 2022 und 2024 haben gezeigt: Hitzeinseln (Temperatur-Differenz >5 °C zwischen kühlster und wärmster Stelle einer Stadt an einem Sommertag) sind in deutschen Großstädten gut belegt — aber nur dort, wo gemessen wird.

Der Pilot **„Hitzeinsel Wiesbaden"** schließt diese Lücke mit dem CurieuzeNeuzen-Modell: **50 Bürger:innen** stellen jeweils ein einfaches Thermometer auf, **3 Stationen pro Person** (Balkon / Hinterhof / Straße), **wöchentliche Ablesung** im Sommerhalbjahr (April–September). Daten werden per CSV-Upload ins Wiesbaden-Lagebild zurückgespiegelt — als neue **EBENEN-Schicht „Hitzeinsel"**.

## 2. Kennzahlen

| Position | Wert |
|---|---|
| Teilnehmer:innen | **50** Bürger:innen |
| Mess-Stationen | **150** (3 × 50) |
| Mess-Zeitraum | 26 Wochen (Apr–Sep) |
| Datenpunkte pro Saison | ~3.900 (150 × 26) |
| Hardware-Kosten pro Person | **~ 8 €** (USB-Thermo-Logger, z. B. Elitech RC-5) |
| Hardware-Gesamt | **~ 400 €** |
| Plakat im Bürgerbüro (A0) | ~ 80 € |
| **Gesamt-Pilot-Budget** | **< 500 €** |

## 3. Warum das funktioniert

1. **Vorbild bewiesen.** CurieuzeNeuzen Vlaanderen 2018 mobilisierte 20.000 Belgier:innen mit einer Mess-Bauanleitung und einem Postleitzahl-Crowdsource-Tool — und gewann den EU Citizen Science Prize 2023. Das Wiesbaden-Lagebild verweist bereits in der Mitmachen-Sektion auf dieses Vorbild.
2. **Kein Backend nötig.** Daten kommen als CSV per E-Mail oder Upload-Form (DSGVO-konform, anonym). Eine Excel-Tabelle reicht für die Aggregation; das Lagebild zeigt sie als neue Choropleth-Schicht.
3. **Strukturelle Lücke füllen.** Der DWD misst nur an **einer** Wiesbadener Station (Schiersteiner Straße). Mit 150 Bürger-Stationen wird die Stadt mikroklimatisch sichtbar — exakt die Granularität, die Stadtplanung für Begrünungs-Investitionen braucht.
4. **Politische Anschlussfähigkeit.** Die Stadt Wiesbaden hat 2024 das **Hitzeaktionsplan-Konzept** beschlossen. Der Pilot liefert die Datengrundlage, die der Plan einfordert, aber heute fehlt.

## 4. Was die Stadt einbringt

Der Pilot ist explizit **niedrigschwellig** angelegt — er soll _kein_ neues Stadt-Programm werden, sondern ein **Daten-Beitrag**, der das bestehende Hitzeaktionsplan-Konzept ergänzt.

| Stadt-Beitrag | Aufwand |
|---|---|
| Bekanntmachung im Bürgerbüro + auf wiesbaden.de | gering |
| Klimaschutzbüro als Datenempfänger (E-Mail-Postfach) | gering |
| Optional: KI-Prüfung der Bürger-Datenqualität durch Klimaschutzbüro | mittel |
| Optional: Pilot-Erweiterung 2027 auf 200 Stationen | abhängig vom Erfolg |

## 5. Was die Bürger:innen davon haben

- **Sichtbar machen, was sie spüren.** Der Hinterhof ist subjektiv "kühler" — der Pilot zeigt es objektiv.
- **Konkrete Stadtplanungs-Konsequenz.** Ein Bezirk mit dokumentierter Hitzeinsel hat mehr Argumente für Baumpflanzung, Entsiegelung, Trinkbrunnen.
- **Klimaschutz-Praxis.** Citizen Science als gelebter Klimaschutz, nicht als Bekenntnis.

## 6. Risiken und Mitigation

| Risiko | Mitigation |
|---|---|
| Mess-Qualität der Bürger:innen schwankt | Eine Eichungs-Veranstaltung im April mit allen Loggern parallel an einer DWD-Station — Korrektur-Faktor pro Logger |
| Datenschutz / Privatsphäre | Standorte werden nur zu **Bezirken** aggregiert; keine Adressen in den öffentlichen Daten |
| Saisonale Verzerrung | Nur Wochenmittel, keine Einzeltage; bei <3 Werten pro Woche → Bezirk nicht angezeigt |
| Pilot-Müdigkeit | 50 Stationen sind genug für ein "Proof"; bei mehr Bedarf — Förderprogramm der Klima-Allianz Hessen |

## 7. Nächster Schritt — wenn die Stadt den Pilot startet

1. **Q1 2026** — Klimaschutzbüro-Treffen, AGB-Entwurf, Logger-Bestellung
2. **April 2026** — Eichungs-Tag bei der DWD-Station, Pilot-Start
3. **Sep 2026** — Datenabschluss
4. **Q4 2026** — Auswertungs-Bericht + Veröffentlichung als Daten-Story 11 im Lagebild + Aktualisierung des Hitzeaktionsplans
5. **2027 (optional)** — Skalierung auf 200 Stationen + Ausweitung auf Mainz-Kostheim/Kastel/Amöneburg (jenseits der Stadt-Grenze)

## 8. Anhang

- **Vorbild-Studie**: De Craemer, S. et al. (2020). _Air-quality measurements with citizen science: a one-year case study from Antwerp_. Atmospheric Measurement Techniques, 13(4), 1843-1858.
- **Hitzeaktionsplan Wiesbaden**: [www.wiesbaden.de/leben-in-wiesbaden/umwelt/klimaschutz](https://www.wiesbaden.de/leben-in-wiesbaden/umwelt/klimaschutz/)
- **DWD-Daten Schiersteiner Straße** (DEHE112) — Hauptbezugsquelle für Eichung
- **Wiesbaden-Lagebild** zeigt die Hitzeinsel-Daten als Choropleth-Layer in der EBENEN-Auswahl (audit Phase 1.6 — bereits vorhandene Infrastruktur)

---

*Dieser Vorschlag liegt der Bewerbungsmappe bei. Er ist als Programm-Idee zur Diskussion vorgelegt und noch nicht beauftragt.*

*Sujin Park · sujin.park@example.com · 2026-05-05*
