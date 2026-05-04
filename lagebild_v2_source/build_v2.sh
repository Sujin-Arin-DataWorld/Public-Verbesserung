#!/bin/bash
# Build single self-contained HTML for v2.1
set -e
cd "$(dirname "$0")"

# Get inline libs (CDN with optional local cache for offline builds)
LEAFLET_CSS=$(cat /tmp/libs/node_modules/leaflet/dist/leaflet.css 2>/dev/null || curl -fsSL https://unpkg.com/leaflet@1.9.4/dist/leaflet.css)
LEAFLET_JS=$(cat /tmp/libs/node_modules/leaflet/dist/leaflet.js 2>/dev/null || curl -fsSL https://unpkg.com/leaflet@1.9.4/dist/leaflet.js)
CHART_JS=$(cat /tmp/libs/node_modules/chart.js/dist/chart.umd.js 2>/dev/null || curl -fsSL https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js)

# Read pieces
INDEX=$(cat index.html)
STYLE=$(cat style.css)
DATA=$(cat data.js)
APP=$(cat app.js)

# Build single file
{
  # Take everything before the leaflet <link> (BSD head has no `-n -1`, so use `sed '$d'`)
  echo "$INDEX" | sed -n '1,/<link rel="stylesheet" href="https:\/\/unpkg.com\/leaflet/p' | sed '$d'
  # Inline leaflet CSS
  echo "<style>"
  echo "$LEAFLET_CSS"
  echo "</style>"
  # Inline leaflet JS
  echo "<script>"
  echo "$LEAFLET_JS"
  echo "</script>"
  # Inline chart.js
  echo "<script>"
  echo "$CHART_JS"
  echo "</script>"
  # Inline our style
  echo "<style>"
  echo "$STYLE"
  echo "</style>"
  echo "</head>"
  # Body section (after </head> through </footer>)
  echo "$INDEX" | sed -n '/<body>/,/<\/footer>/p'
  # Inline our scripts
  echo "<script>"
  echo "$DATA"
  echo "</script>"
  echo "<script>"
  echo "$APP"
  echo "</script>"
  echo "</body>"
  echo "</html>"
} > Wiesbaden_Lagebild_v2.html

if command -v numfmt >/dev/null 2>&1; then
  SIZE=$(wc -c < Wiesbaden_Lagebild_v2.html | numfmt --to=iec)
else
  # macOS fallback: numfmt is not in BSD coreutils by default
  SIZE="$(wc -c < Wiesbaden_Lagebild_v2.html | awk '{ printf "%.1fK", $1/1024 }')"
fi
echo "Built: Wiesbaden_Lagebild_v2.html  (${SIZE} bytes, $(wc -l < Wiesbaden_Lagebild_v2.html) lines)"
