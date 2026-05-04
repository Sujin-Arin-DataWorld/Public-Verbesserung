# 비스바덴-Lagebild 지도 정확화 작업 (v2.0 → v2.1)

## ⚠️ 이 프롬프트를 Claude Code 첫 메시지로 그대로 복사해서 입력하세요.

---

## 1. 컨텍스트

나는 **비스바덴 시청 통계 및 도시연구청 (Amt für Statistik und Stadtforschung)** 의 데이터 분석가 면접용 mock-up dashboard를 만들고 있어. 인터뷰는 이미 진행됐고, 현재 면접관 평가 결과 기다리는 중이야. mock-up은 면접에서 핵심 자료였고, 지금은 **v2.1로 더 다듬는** 단계야.

현재 작업 디렉토리에 다음 파일들이 있어:
- `index.html` — 메인 HTML (CDN으로 Leaflet/Chart.js 로드)
- `data.js` — 26개 Ortsbezirke 시뮬레이션 데이터 + 5개 언어 i18n (DE/EN/TR/UA/KR)
- `app.js` — Leaflet 지도 + 인터랙션 + v2 모듈 (KPI 큐레이터, Alltag, Citizen Science 등)
- `style.css` — Editorial Statistical 톤 + Dark mode 기본
- `build_v2.sh` — 단일 self-contained HTML 번들 빌드 스크립트
- `README.md` — 작업 가이드

먼저 이 파일들을 읽고 전체 구조 파악해줘. 특히:
- `data.js`의 `ORTSBEZIRKE` 배열 (26개 동네, 좌표/인구/외국인비율 등)
- `data.js`의 `generateSeededPolygon` 함수 (현재 헥사곤 만드는 코드 — 이걸 교체 대상)
- `app.js`의 `initMap()` 함수 (라인 ~232)
- `app.js`의 `drawLayer()` 함수 (라인 ~251) — 색칠 로직
- `app.js`의 `getLayerColor()` 함수 — 현재 색깔 결정 로직

---

## 2. 핵심 문제 (왜 v2.1이 필요한가)

현재 v2.0 mock-up의 지도 문제:

1. **헥사곤 추상화의 메타포 오류** — 행정구역은 폴리곤이지 헥사곤이 아니야. 헥사곤이 서로 겹쳐서 어색함.
2. **시 외부 처리 부재** — 비스바덴 시 영역 밖이 강조되지 않아 시각적 hierarchy 부족.
3. **레이어별 색깔 변화 약함** — 인구/외국인비율/공사/대기질 등 레이어를 토글해도 색깔 패턴이 *명확히* 다르게 보이지 않음. 모든 레이어가 같은 주황 계열로 보임.
4. **베이스맵 부재 (오프라인 시)** — OSM 타일이 안 뜨면 헥사곤만 어둠 속에 떠 있어 어색함.

리서치 결과 *모든* 진짜 city dashboards (Helsinki kartta.hel.fi, Wien stadtplan, Berlin FIS-Broker, Hamburg Geoportal, NYC OpenData)가 **GeoJSON polygon + ColorBrewer choropleth + 베이스맵** 패턴을 씀. 헥사곤 grid는 다른 용도 (균일 공간 분석).

---

## 3. 목표 — 옵션 C (정확한 폴리곤)

다음 5가지를 구현:

### 3.1 — 비스바덴 시 외곽 진짜 폴리곤
OSM admin_level=6 (Kreisfreie Stadt Wiesbaden) 폴리곤. 시 외부는 어두운 회색 마스크 (Leaflet에서 negative polygon 또는 mask layer).

### 3.2 — 26개 Ortsbezirke 진짜 폴리곤
OSM admin_level=10 (또는 9) 폴리곤. 26개 모두 매핑 — 동네 이름과 좌표가 우리 `ORTSBEZIRKE` 배열의 26개와 일치해야 함.

### 3.3 — 시 외부 회색 마스크
사용자가 명시 요청한 효과: 비스바덴 시 안만 강조, 외부 (Mainz, Wiesbaden 외 헤센 지역)는 어두운 회색 반투명 layer로 덮어 시 영역에 시선이 집중되도록.

### 3.4 — 레이어별 다른 ColorBrewer 팔레트
각 데이터 레이어마다 의미 있는 다른 색 사용:
- **pop (인구)**: `YlOrRd` (노랑→주황→빨강)
- **foreign (외국인 비율)**: `Purples`
- **baustellen (공사)**: `Reds`
- **aqi (대기질)**: `RdYlGn` 역방향 (좋을수록 녹, 나쁠수록 빨)
- **bikePaths (자전거 도로 km)**: `YlGnBu` (노랑→녹색→파랑)
- **charging (전기차 충전소)**: `BuPu` (파랑→보라)

각 팔레트는 7-step quantile scale로. d3-scale-chromatic 또는 직접 hardcoded 그라디언트.

### 3.5 — 그라디언트 명확화
min-max 범위가 동네별 데이터에 정확히 매핑되어 가장 큰 동네/높은 외국인 비율 등이 명확히 진하게 표시되도록.

---

## 4. 데이터 받기

### 4.1 — Wiesbaden OSM relation 정보 확인

먼저 비스바덴이 OSM에서 어떻게 표현되는지 확인. curl로 다음 실행:

```bash
curl -s "https://nominatim.openstreetmap.org/search?q=Wiesbaden&format=json&addressdetails=1&extratags=1&limit=3" | python3 -m json.tool
```

비스바덴 시는 `osm_id` 가 약 62554 정도일 거야 (정확한 값은 nominatim 응답으로 확인). `admin_level=6` (Kreisfreie Stadt Hessen) 이어야 함.

### 4.2 — Overpass API에서 GeoJSON 다운로드

다음 쿼리를 Overpass API에 POST해서 비스바덴 시 + 26개 Ortsbezirke 받기:

```bash
QUERY='[out:json][timeout:120];
relation(62554);
out tags;
.;>;out skel;'

# 그 다음 비스바덴 admin 관계의 ID를 확인하고 admin_level 파악

# 본격 데이터 다운로드:
QUERY='[out:json][timeout:180];
area(3600062554)->.wb;
(
  rel(area.wb)["admin_level"="9"]["boundary"="administrative"];
  rel(area.wb)["admin_level"="10"]["boundary"="administrative"];
);
out geom;'

curl -s -X POST -d "$QUERY" "https://overpass-api.de/api/interpreter" -o wiesbaden_ortsbezirke.osm.json
```

(area ID = OSM relation ID + 3600000000. 비스바덴 relation ID가 62554라면 area ID는 3600062554. 정확한 ID는 Nominatim 응답으로 확인.)

### 4.3 — OSM JSON → GeoJSON 변환

Overpass의 raw JSON은 GeoJSON이 아니야. 변환 필요:

```bash
npm install -g osmtogeojson
osmtogeojson wiesbaden_ortsbezirke.osm.json > wiesbaden_ortsbezirke.geojson
```

또는 Python으로:
```bash
pip install osm2geojson
python3 -c "
import json, osm2geojson
with open('wiesbaden_ortsbezirke.osm.json') as f:
    data = json.load(f)
geojson = osm2geojson.json2geojson(data)
with open('wiesbaden_ortsbezirke.geojson', 'w') as f:
    json.dump(geojson, f, ensure_ascii=False)
"
```

### 4.4 — 시 외곽 폴리곤도 별도 다운로드

```bash
QUERY='[out:json][timeout:60];
relation(62554);
out geom;'

curl -s -X POST -d "$QUERY" "https://overpass-api.de/api/interpreter" -o wiesbaden_city.osm.json
osmtogeojson wiesbaden_city.osm.json > wiesbaden_city.geojson
```

### 4.5 — 검증

받은 GeoJSON에 다음이 있어야 함:

**시 외곽 (wiesbaden_city.geojson):**
- 1개 큰 폴리곤 (또는 multipolygon)
- 좌표 범위: 위도 약 50.00~50.14, 경도 약 8.15~8.41
- properties.name = "Wiesbaden"

**26개 Ortsbezirke (wiesbaden_ortsbezirke.geojson):**
다음 26개 이름 모두 있어야 함 (OSM 표기는 약간 다를 수 있음 — fuzzy match 필요):

1. Mitte
2. Rheingauviertel/Hollerborn
3. Westend/Bleichstraße (또는 Westend)
4. Nordost
5. Südost
6. Biebrich
7. Schierstein
8. Frauenstein
9. Dotzheim
10. Klarenthal
11. Sonnenberg
12. Rambach
13. Heßloch
14. Kloppenheim
15. Igstadt
16. Bierstadt
17. Erbenheim
18. Nordenstadt
19. Delkenheim
20. Medenbach
21. Breckenheim
22. Naurod
23. Auringen
24. Mainz-Kostheim (또는 Kostheim)
25. Mainz-Kastel (또는 Kastel)
26. Mainz-Amöneburg (또는 Amöneburg)

26개가 안 나오면 **admin_level=9도 시도**, 그래도 부족하면 admin_level=10과 9를 union. 26 미만이면 어느 게 빠졌는지 보고해줘.

---

## 5. 코드 통합

### 5.1 — data.js 수정

`ORTSBEZIRKE` 배열 각 항목의 `polygon` 필드를 진짜 GeoJSON 좌표로 교체.

**중요**: GeoJSON properties.name과 우리 `ORTSBEZIRKE.name` 매칭이 fuzzy해야 함:
```js
function matchOSMName(osmName, ourName) {
  const norm = s => s.toLowerCase().replace(/[äöüß]/g, m => ({ä:'a',ö:'o',ü:'u',ß:'ss'}[m]))
                                    .replace(/[\/\-\s]+/g, '');
  return norm(osmName).includes(norm(ourName.split('/')[0])) ||
         norm(ourName).includes(norm(osmName));
}
```

**Leaflet 좌표 순서 주의**: GeoJSON은 `[lng, lat]`이지만 Leaflet은 `[lat, lng]`. 변환 필수.

`generateSeededPolygon` 함수와 `seededRandom` 함수는 **삭제**. 이제 필요 없음.

### 5.2 — app.js 수정

#### `initMap()` 함수

```js
function initMap() {
  map = L.map('map', {
    center: [50.0782, 8.2398],
    zoom: 12,
    zoomControl: true,
    attributionControl: true
  });

  // 베이스맵 — CartoDB Dark
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // 시 외부 회색 마스크
  // 전 세계 큰 사각형 - 비스바덴 시 외곽 (negative polygon = mask)
  const worldPoly = [[-90,-180],[-90,180],[90,180],[90,-180]];
  const wiesbadenOutline = WIESBADEN_CITY_GEOJSON.geometry.coordinates[0]
    .map(c => [c[1], c[0]]); // GeoJSON [lng,lat] → Leaflet [lat,lng]
  
  L.polygon([worldPoly, wiesbadenOutline], {
    color: 'transparent',
    fillColor: '#1a1a2e',  // 다크모드와 어울리는 회색
    fillOpacity: 0.6,
    interactive: false
  }).addTo(map);

  // 시 외곽 강조 라인
  L.polyline(wiesbadenOutline, {
    color: '#4A6FA5',
    weight: 2,
    opacity: 0.7,
    interactive: false
  }).addTo(map);

  layerGroup = L.layerGroup().addTo(map);
  drawLayer(currentLayer);

  // Auto-fit
  map.fitBounds(wiesbadenOutline, { padding: [30, 30] });
}
```

#### `drawLayer()` 함수
폴리곤 그리는 부분을 GeoJSON 좌표 사용하도록 변경. 현재 `L.polygon(o.polygon, ...)` 그대로 작동할 것 (data.js에서 polygon 필드만 진짜 좌표로 교체했으니까).

#### `getLayerColor()` 함수
레이어별 다른 팔레트:

```js
const COLOR_PALETTES = {
  pop:        ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'], // YlOrRd
  foreign:    ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'], // Purples
  baustellen: ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'], // Reds
  aqi:        ['#1a9850','#66bd63','#a6d96a','#d9ef8b','#ffffbf','#fee08b','#fdae61','#f46d43','#d73027'], // RdYlGn 역
  bikePaths:  ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'], // YlGnBu
  charging:   ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b'], // BuPu
};

function getLayerColor(value, layerKey) {
  const palette = COLOR_PALETTES[layerKey] || COLOR_PALETTES.pop;
  const minMax = getLayerMinMax(layerKey);  // 동네 데이터 전체에서 min/max 계산
  const ratio = (value - minMax.min) / (minMax.max - minMax.min);
  const idx = Math.min(palette.length - 1, Math.floor(ratio * palette.length));
  return palette[idx];
}

function getLayerMinMax(layerKey) {
  const values = ORTSBEZIRKE.map(o => getLayerValue(o, layerKey));
  return { min: Math.min(...values), max: Math.max(...values) };
}
```

#### Min-Max 범례
지도 우상단에 있는 `min ━━━ max` 그라디언트 막대도 현재 레이어 팔레트로 동적 업데이트.

### 5.3 — 시 외곽 GeoJSON 데이터 임베드
`data.js` 끝에 다음 추가:
```js
const WIESBADEN_CITY_GEOJSON = { ... };  // 다운로드한 wiesbaden_city.geojson 내용
```
그리고 `window.LAGEBILD_DATA`에 `WIESBADEN_CITY_GEOJSON` 추가.

---

## 6. 검증 체크포인트

### 6.1 — 시각 검증 (브라우저로)
다음을 차례로 확인:

1. **베이스맵 정상**: 비스바덴 거리, 라인강, 주요 건물이 다 보임
2. **시 외곽 명확**: 비스바덴 영역 밖이 어두운 회색으로 덮임
3. **26개 폴리곤 정상**: 진짜 비스바덴 모양 — Mainz-Kostheim/Kastel/Amöneburg가 마인츠 쪽에, Naurod가 동북쪽 외곽에
4. **레이어 토글**: 6개 레이어 (인구/외국인/공사/대기질/자전거/충전소) 누를 때마다 *명확히 다른 색깔 패턴*. 인구는 노랑→빨강, 외국인은 보라, 공사는 빨강 계열 등.
5. **Hover/Click**: 폴리곤 hover하면 강조, click하면 디테일 패널 열림
6. **5개 언어**: DE/EN/TR/UA/KR 모두 작동
7. **나머지 v2 기능**: KPI 큐레이터, Alltag 3 탭, Citizen Science, AI Register 모달, 메타 사용 모달, 모두 작동

### 6.2 — 데이터 검증
- 26개 Ortsbezirke 모두 매핑됨 (콘솔에서 `LAGEBILD_DATA.ORTSBEZIRKE.filter(o => !o.polygon).length` === 0)
- 인구 합 ≈ 300,089 명
- 외국인 비율 평균 ≈ 25%

---

## 7. 절대 깨지면 안 되는 것 (회귀 방지)

다음 v2 기능은 이미 완벽 — 손대지 마:

- ✅ **5개 언어 i18n** — `I18N` 객체, `setLanguage`, `applyTranslations`, `pickLang`, `t()` 함수
- ✅ **KPI 큐레이터** — 12 옵션, localStorage, 모달
- ✅ **Alltag 탭** — Tankstellen / Lebensmittel (슈퍼마켓 가격 + World Bank 검증) / Wirtschaft
- ✅ **Citizen Science 섹션** — CurieuzeNeuzen 영감 박스 + 3 프로젝트 카드
- ✅ **AI Register / Meta Usage 모달** — Helsinki + Berlin 모델
- ✅ **디테일 패널** — 인구/외국인/평균연령/임대료/Kita/처리시간 + "Was kann ich tun?" 액션 박스

작업 끝나고 콘솔 에러 없는지 확인.

---

## 8. Fallback (Overpass 실패 시)

만약 Overpass API에서 데이터 못 받으면 (rate limit, 타임아웃 등):

### 8.1 — GitHub에서 시 외곽만
```bash
curl -L -o wiesbaden_city.geojson \
  "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/4_kreise/4_niedrig.geo.json"
# 그 다음 Wiesbaden 항목만 필터링 (AGS=06414000)
```

### 8.2 — 26개 Ortsbezirke는 인구비례 원으로
헥사곤 코드는 폐기하고, 좌표를 중심으로 인구비례 원(`L.circleMarker`) 표시. 색깔은 5.2 섹션의 ColorBrewer 팔레트.

### 8.3 — 시 외부 회색 마스크는 그대로
시 외곽 폴리곤만 있어도 외부 마스크 효과는 가능.

이 fallback도 지금의 헥사곤보다 훨씬 좋음.

---

## 9. 빌드 + 배포

작업 끝나면:

```bash
# 단일 self-contained HTML 빌드
bash build_v2.sh

# 결과 확인
open Wiesbaden_Lagebild_v2.html  # Mac
start Wiesbaden_Lagebild_v2.html  # Windows
```

`build_v2.sh`가 leaflet/chart.js 인라인하는데, 사용자 환경에 `/tmp/libs/node_modules/leaflet`이 없으면 CDN curl로 fallback해. 그 부분도 확인.

---

## 10. 작업 순서 (권장)

1. 먼저 모든 파일 읽기 (`Read` 도구)
2. Nominatim으로 비스바덴 OSM relation ID 확인
3. Overpass API로 26개 Ortsbezirke + 시 외곽 다운로드
4. 검증 (26개 다 있나, 좌표 범위 OK인가)
5. data.js의 ORTSBEZIRKE에 polygon 통합 + WIESBADEN_CITY_GEOJSON 추가
6. app.js의 initMap() 수정 (마스크 추가, fitBounds)
7. app.js의 getLayerColor() 수정 (팔레트 분리)
8. 브라우저로 검증 (단계 6.1)
9. build_v2.sh 실행
10. 최종 HTML 검증

각 단계 끝나고 *"이대로 갈까?"* 짧게 보고하면서 진행해줘. 큰 변경은 사전 확인.

---

## 11. 면접 임팩트

이 작업의 의미를 면접 멘트로 정리해두면 (이미 v2 컨셉페이퍼에 들어간 출처 + 새 임팩트):

> "지도는 두 레이어 구조입니다. 시 외곽은 OpenStreetMap 공식 admin_level=6 폴리곤이고, 26개 Ortsbezirke는 admin_level=10 폴리곤입니다. 시 외부는 의도적으로 회색 처리해서 시민이 자기 도시에 시선을 집중하게 했습니다 — Helsinki kartta.hel.fi와 같은 패턴입니다."
>
> "운영 환경에서는 Wiesbaden Geoportal의 공식 GeoJSON으로 1줄 코드 변경만 하면 됩니다. 색깔 팔레트는 ColorBrewer를 따라 레이어별로 다르게 적용해서 — 인구는 YlOrRd, 외국인 비율은 Purples — 시민이 어느 레이어를 보는지 색깔만으로도 구분할 수 있게 했습니다."

---

## 12. 시작

자, 파일 다 읽고 단계별로 시작해줘. 첫 단계는 **비스바덴 OSM relation ID 확인**.

---

**참고 — 만약 막히면**:
- "이 부분 어떻게 할까?" 물어보면 됨 — 사용자가 답할게
- Overpass API 응답이 이상하면 raw 데이터 일부 보여줘
- 5개 언어 또는 v2 기능에 영향이 갈 수 있는 변경은 사전 확인
