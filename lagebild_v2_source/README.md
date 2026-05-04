# Wiesbaden-Lagebild v2.1 — 로컬 작업 시작 가이드

## 📦 이 안에 있는 것

```
lagebild_v2_source/
├── index.html          # 메인 HTML (CDN으로 Leaflet/Chart.js 로드)
├── data.js             # 26개 Ortsbezirke 데이터 + 5개 언어 i18n
├── app.js              # Leaflet 지도 + 인터랙션
├── style.css           # Editorial Statistical 스타일
├── build_v2.sh         # 단일 HTML 번들 빌드 스크립트
├── README.md           # ← 지금 보고 있는 파일
└── CLAUDE_CODE_PROMPT.md   # Claude Code에 넣을 작업 지시문
```

---

## 🚀 1. 빠른 시작 (5분)

### 1.1 — 폴더 옮기기
이 ZIP을 적절한 위치에 풀어둬. 예:
```bash
~/Documents/wiesbaden-lagebild/
```

### 1.2 — 현재 상태 확인 (브라우저)

Mac:
```bash
cd ~/Documents/wiesbaden-lagebild/lagebild_v2_source
open index.html
```

Windows:
```bash
cd C:\Users\[이름]\Documents\wiesbaden-lagebild\lagebild_v2_source
start index.html
```

브라우저가 열리면 **OpenStreetMap 타일이 정상으로 로드**될 거야 (인터넷 있어야 함). 지도에 비스바덴 거리가 다 보임. KPI, Alltag, Citizen Science, 5개 언어 토글 다 작동해야 함.

---

## 🛠 2. Claude Code 설치 (이미 설치됐으면 건너뛰기)

### 2.1 — Node.js 설치 확인
```bash
node --version
```
v18 이상 필요. 없으면 https://nodejs.org/ 에서 설치.

### 2.2 — Claude Code 설치
```bash
npm install -g @anthropic-ai/claude-code
```

### 2.3 — 인증
```bash
claude
```
첫 실행 시 브라우저로 Anthropic 계정 로그인 안내가 나와.

---

## 🎯 3. v2.1 작업 시작 (Claude Code)

### 3.1 — 작업 디렉토리에서 Claude Code 시작
```bash
cd ~/Documents/wiesbaden-lagebild/lagebild_v2_source
claude
```

### 3.2 — 프롬프트 입력
`CLAUDE_CODE_PROMPT.md` 파일을 열어 **전체 내용**을 복사해서 Claude Code 첫 메시지로 붙여넣어.

Claude Code가:
1. OSM Overpass API에서 비스바덴 26개 Ortsbezirke 진짜 폴리곤 다운로드
2. 헥사곤 코드 → 진짜 폴리곤으로 교체
3. 시 외부 회색 마스크 추가
4. 레이어별 다른 색 팔레트 구현
5. 5개 언어 + 모든 v2 기능 보존 검증

진행하면서 단계별로 보여줄 거야. 중간에 *"이대로 갈까?"* 물어보면 확인하면 됨.

### 3.3 — 작업 후 검증
```bash
open index.html  # Mac
start index.html  # Windows
```

5개 언어 모두 토글해보고, 6개 레이어 토글해보고, Ortsbezirke 클릭해서 디테일 패널 작동 확인.

### 3.4 — 단일 HTML 빌드 (면접 제출용)
```bash
bash build_v2.sh
```
`Wiesbaden_Lagebild_v2.html` 파일 하나로 묶임. USB나 이메일로 면접에 가져가기 편함.

---

## 🔧 4. 트러블슈팅

### 지도 타일이 안 떠
인터넷 연결 확인. CartoDB Dark 타일 (basemaps.cartocdn.com)과 OpenStreetMap 둘 다 시도.

### Claude Code가 Overpass API 호출에 실패
`CLAUDE_CODE_PROMPT.md`의 **Fallback 섹션** 따라가면 됨. GitHub의 isellsoap/deutschlandGeoJSON에서 비스바덴 시 외곽만 받고, 26개 동네는 인구비례 원으로 표시.

### 5개 언어 중 일부가 깨짐
data.js의 `I18N` 객체는 *수정하지 마*. v2 작업은 ORTSBEZIRKE 배열의 polygon 필드와 app.js의 지도 부분만.

---

## ⚠️ 절대 손대면 안 되는 것

이미 완벽하게 작동하는 부분:
- **5개 언어 i18n** (data.js의 I18N 객체, app.js의 setLanguage/applyTranslations 함수)
- **KPI 큐레이터** (12개 옵션, localStorage)
- **Alltag 탭** (Tankstellen / Lebensmittel / Wirtschaft)
- **Citizen Science 섹션** (3 프로젝트)
- **AI Register / Meta Usage 모달**
- **디테일 패널의 Was kann ich tun? 액션 박스**

이것들이 깨지면 면접 데모가 망가져. Claude Code에게 *"이 기능들을 보존하면서 지도만 업그레이드"*라고 명시.

---

## 📌 면접 시연 준비

작업 끝나면:
1. **로컬 빌드** — `build_v2.sh`로 단일 HTML 만들기
2. **USB 백업** — 인터넷 없는 면접실 대비 (단, 타일 베이스맵은 안 보일 수 있음. 시연 직전에 인터넷 확인 권장)
3. **언어 데모 시퀀스 연습** — DE → EN → KR → 다시 DE → 레이어 6개 차례로 토글

면접 화이팅!
