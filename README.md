# Wiesbaden-Lagebild v2.1

Bürger-Dashboard für die Landeshauptstadt Wiesbaden. Mock-up im Rahmen des
Bewerbungsverfahrens als Datenanalystin beim **Amt für Statistik und
Stadtforschung**.

## Was es zeigt

Eine einzige selbstständige HTML-Datei mit **6 Views** (Home / Alltag / Wohnen /
Demokratie / Mitmachen / Daten), 5 Sprachen (DE / EN / TR / UA / KR) und
**vier Bürger-Beteiligungsformaten**:

1. **Mängelmelder** — Hessen-weites System + mailto-Fallback, mit Geolocation
2. **Demokratie-Karte** — 26 Ortsbezirke, Wahlbeteiligung 2026 vs 2021
3. **Datenwunsch** — Bürger:innen votieren für fehlende Datensätze, Top 3 per
   E-Mail an `opendata@wiesbaden.de`
4. **Spritpreis-Crowdsourcing** — anonym, browser-lokal

## Datenquellen (alle in der Daten-Tab dokumentiert)

| Quelle | Datensätze | Lizenz |
|---|---|---|
| `opendata.cloud.wiesbaden.de` | Mietspiegel 2025, Angebotsmieten 2007–2024, Bodenrichtwert 2000–2024, Wahlbeteiligung 2026/2021, Ladeeinrichtungen 01/2026, Kita-Versorgung 24/25 | CC BY 4.0 |
| OpenStreetMap | 26 Ortsbezirke + Stadtgrenze (admin_level=9, 6) + 33 Tankstellen (amenity=fuel) + 84 Ladepunkte | ODbL |
| Bundeskartellamt MTS-K (geplant) | Tankstellen-Preise live (über Tankerkönig API) | CC BY 4.0 |

## Bauen

```bash
cd lagebild_v2_source
bash build_v2.sh   # → Wiesbaden_Lagebild_v2.html (single self-contained)
open Wiesbaden_Lagebild_v2.html
```

Während der Entwicklung statt der gebauten Datei direkt `index.html` öffnen
(lädt `data.js` + `app.js` + `style.css`).

## Hauptdateien

```
lagebild_v2_source/
├── index.html          # 6-View SPA-Markup
├── data.js             # Alle eingebetteten Datensätze + I18N
├── app.js              # View-Router + Renderer + Citizen-CTAs
├── style.css           # Editorial Statistical Aesthetic
├── build_v2.sh         # Single-file build (CDN libs inline)
└── _emit_*.py          # Python helpers — fetch & embed real data
```

## Lizenz

Code: MIT. Daten: jeweils wie oben (CC BY 4.0 / ODbL).
