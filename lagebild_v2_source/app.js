// =================================================================
// WIESBADEN-LAGEBILD — Main Application
// =================================================================

const { ORTSBEZIRKE, POPULATION_TIMELINE, LIVE_KPI, ORIGIN_COUNTRIES, CITIZEN_REPORTS, I18N, WIESBADEN_CITY_GEOJSON, CHARGING_STATIONS, STORIES, KPI_DETAILS, UBA_AIRQUALITY } = window.LAGEBILD_DATA;

// =================================================================
// WB ICON SYSTEM — custom inline SVG, replacing emoji.
// Editorial dashboard tone (Lucide/Phosphor inspired). 24px viewBox,
// stroke 1.75, currentColor, round caps. Use:
//   • Static markup: <span data-icon="home"></span> → hydrateIcons()
//   • Inline string: wbIcon('home', 18) → returns SVG markup
// =================================================================
const WB_ICON_PATHS = {
  // — Top nav
  'home':         '<path d="M3.5 11.4 12 4l8.5 7.4V20a1 1 0 0 1-1 1h-4.5v-6.5h-6V21H4.5a1 1 0 0 1-1-1z"/>',
  'cart':         '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 4h2.5l2.4 11.5a1.5 1.5 0 0 0 1.47 1.2H18a1.5 1.5 0 0 0 1.47-1.18L21 7H6"/>',
  'building':     '<rect x="4.5" y="3" width="15" height="18" rx="1"/><path d="M9.5 21v-4.5h5V21M8.5 7h2m3 0h2M8.5 11h2m3 0h2M8.5 15h2m3 0h2"/>',
  'ballot':       '<rect x="3.5" y="6" width="17" height="14" rx="1.5"/><path d="M3.5 12h17M9 4v3M15 4v3M8.5 16l3 2 5-5"/>',
  'users':        '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M21 18a4.5 4.5 0 0 0-4.5-4.5"/>',
  'search':       '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/>',
  // — Kiez 6
  'coffee':       '<path d="M4.5 8h11v6.5a4 4 0 0 1-4 4H8.5a4 4 0 0 1-4-4z"/><path d="M15.5 10h2a3 3 0 0 1 0 6h-2"/><path d="M7.5 4.5c.6 1 .4 2-.4 3s-1 2-.6 3M11 4.5c.6 1 .4 2-.4 3s-1 2-.6 3"/>',
  'parking':      '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.5 17.5V7h3.8a3.2 3.2 0 0 1 0 6.4H9.5"/>',
  'euro':         '<path d="M19 5.5a8 8 0 1 0 0 13"/><path d="M3.5 10h11M3.5 14h11"/>',
  'recycle':      '<path d="M7 11 4 16h6"/><path d="M10 16 8 12.5"/><path d="m17 12 3 5h-6"/><path d="M14 17l3-5"/><path d="M9 5h6l-3-3"/><path d="M9 5l-3 5"/><path d="M15 5l3 5"/>',
  'shield-alert': '<path d="M12 3.5 4.5 6V12c0 4.5 3 7.5 7.5 8.5 4.5-1 7.5-4 7.5-8.5V6z"/><path d="M12 8v4.5M12 16h.01"/>',
  'sparkles':     '<path d="m11 4 1.7 4.5L17 10l-4.3 1.5L11 16l-1.7-4.5L5 10l4.3-1.5z"/><path d="m18 16 .8 1.7 1.7.8-1.7.8L18 21l-.8-1.7-1.7-.8 1.7-.8z"/>',
  // — Mitmachen 4
  'clipboard-edit':'<rect x="6" y="4" width="12" height="17" rx="1.5"/><path d="M9.5 4v-.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4"/><path d="m13 13 2.5-2.5 1.7 1.7L14.7 14.7 13 15z"/>',
  'chart-bar':    '<path d="M3.5 21h17"/><rect x="5.5" y="12" width="3" height="7" rx=".4"/><rect x="11" y="6" width="3" height="13" rx=".4"/><rect x="16.5" y="9" width="3" height="10" rx=".4"/>',
  'fuel':         '<rect x="4" y="4" width="9" height="16" rx="1.5"/><path d="M4 11h9"/><path d="M13 9h2.5l1.5 2v6.5a1.5 1.5 0 0 0 3 0V9.5L18 7"/>',
  'microscope':   '<path d="M5 21h14"/><path d="M8 21a5.5 5.5 0 0 0 8-5"/><rect x="9" y="3" width="6" height="9" rx=".7"/><path d="M11 12v3a2 2 0 0 0 2 2"/>',
  // — Section / misc
  'map-pin':      '<path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  'book':         '<path d="M5 4h11a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H5z"/><path d="M5 4v15h12"/>',
  'ruler':        '<path d="M3 17 17 3l4 4L7 21z"/><path d="m6.5 13.5 2 2M10.5 9.5l2 2M14.5 5.5l2 2"/>',
  'book-open':    '<path d="M3 5h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v13h-7a2 2 0 0 0-2 2 2 2 0 0 0-2-2H3z"/><path d="M12 6v14"/>',
  'file-text':    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16h4"/>',
  'mail':         '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  'unlock':       '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0"/>',
  'edit':         '<path d="M16 4l4 4-11 11H5v-4z"/><path d="m13 7 4 4"/>',
  // — Action box severity
  'graduation':   '<path d="m3 9 9-4 9 4-9 4z"/><path d="M7 11v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4"/><path d="M21 9v5"/>',
  'briefcase':    '<rect x="3.5" y="7" width="17" height="13" rx="1.5"/><path d="M9 7V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V7"/><path d="M3.5 13h17"/>',
  'handshake':    '<path d="m11 16 1.5 1.5L14 16"/><path d="M3 10.5 8 6l3 1 4-1 4.5 4.5L15 15l-4-4-3 3z"/><path d="M11 11l-3 3 2 2 3-3"/>',
  'wallet':       '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h13a2 2 0 0 1 0 4H3"/><circle cx="16" cy="12" r="1" fill="currentColor"/>',
  'cone':         '<path d="m6 21 6-16 6 16z"/><path d="M8 13h8M9 16h6"/>',
  'globe':        '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
  'scale':        '<path d="M12 4v16"/><path d="M5 20h14"/><path d="M5 7h14"/><path d="M5 7 2.5 13a3 3 0 0 0 5 0z"/><path d="M19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
  'clipboard':    '<rect x="6" y="4" width="12" height="17" rx="1.5"/><path d="M9 4v-.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4"/><path d="M9 11h6M9 14h4"/>',
  // — Status / arrows / atmosphere
  'trend-up':     '<path d="m4 16 5-5 4 4 7-7"/><path d="M14 8h6v6"/>',
  'trend-down':   '<path d="m4 8 5 5 4-4 7 7"/><path d="M14 16h6v-6"/>',
  'arrow-right':  '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right':'<path d="M7 17 17 7M9 7h8v8"/>',
  'x':            '<path d="m6 6 12 12M18 6 6 18"/>',
  'check':        '<path d="m5 12 5 5 9-11"/>',
  'target':       '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  'eye':          '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'lightbulb':    '<path d="M9 18h6M10 21h4"/><path d="M9 15c-2-2-3-4-3-6a6 6 0 1 1 12 0c0 2-1 4-3 6"/>',
  'sun':          '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  'clock':        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'wind':         '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',
  'crosshair':    '<circle cx="12" cy="12" r="9"/><path d="M22 12h-3M5 12H2M12 22v-3M12 5V2"/>',
  'leaf':         '<path d="M21 3c-9 0-15 6-15 12 0 3 1 5 3 6 6 0 12-6 12-15z"/><path d="M5 21c2-7 5-11 11-14"/>',
  'megaphone':    '<path d="M3 9v6h3l9 5V4l-9 5z"/><path d="M19 8a4 4 0 0 1 0 8"/>',
  'database':     '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
};

function wbIcon(name, size) {
  size = size || 18;
  const path = WB_ICON_PATHS[name];
  if (!path) return '<span style="display:inline-block;width:'+size+'px;height:'+size+'px"></span>';
  return '<svg class="wb-icon" data-icon-name="'+name+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true">'+path+'</svg>';
}

function hydrateIcons(root) {
  root = root || document;
  const els = root.querySelectorAll('[data-icon]:not([data-icon-hydrated])');
  els.forEach(el => {
    const name = el.dataset.icon;
    let size;
    if (el.dataset.iconSize) size = parseInt(el.dataset.iconSize, 10);
    else if (el.classList.contains('wb-icon-xl')) size = 28;
    else if (el.classList.contains('wb-icon-lg')) size = 22;
    else if (el.classList.contains('wb-icon-sm')) size = 14;
    else size = 18;
    el.innerHTML = wbIcon(name, size);
    el.setAttribute('data-icon-hydrated', '1');
  });
}

// =================================================================
// CHART.JS GLOBAL THEME — editorial dashboard defaults.
// Inter body font, slate-grey labels, hairline grid lines, generous
// padding. Set BEFORE any chart instantiation.
// =================================================================
if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.font.weight = '500';
  Chart.defaults.color = '#5C6580';
  Chart.defaults.borderColor = 'rgba(226, 229, 235, 0.7)';
  Chart.defaults.elements.line.borderWidth = 1.75;
  Chart.defaults.elements.line.tension = 0.32;
  Chart.defaults.elements.point.radius = 2.5;
  Chart.defaults.elements.point.hoverRadius = 5;
  Chart.defaults.elements.point.hitRadius = 8;
  Chart.defaults.elements.point.borderWidth = 1.5;
  Chart.defaults.elements.bar.borderRadius = 3;
  Chart.defaults.layout.padding = 8;
  if (Chart.defaults.plugins && Chart.defaults.plugins.legend) {
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.align = 'start';
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 14;
    Chart.defaults.plugins.legend.labels.font = { size: 11, weight: '500' };
  }
  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = '#1A1F2E';
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 11, weight: '500', family: "'JetBrains Mono', monospace" };
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 4;
    Chart.defaults.plugins.tooltip.displayColors = false;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
  }
  // Scale defaults: hairline grid, slate ticks, no Y axis title overhead
  if (Chart.defaults.scale) {
    Chart.defaults.scale.grid = Chart.defaults.scale.grid || {};
    Chart.defaults.scale.grid.color = 'rgba(226, 229, 235, 0.55)';
    Chart.defaults.scale.grid.lineWidth = 1;
    Chart.defaults.scale.grid.drawTicks = false;
    Chart.defaults.scale.border = Chart.defaults.scale.border || {};
    Chart.defaults.scale.border.display = false;
    Chart.defaults.scale.ticks = Chart.defaults.scale.ticks || {};
    Chart.defaults.scale.ticks.color = '#8892A8';
    Chart.defaults.scale.ticks.padding = 6;
    Chart.defaults.scale.ticks.font = { size: 10.5, family: "'JetBrains Mono', monospace" };
  }
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.responsive = true;
}

let currentLang = 'de';
let currentLayer = 'pop';
let currentYear = 2026;
let map;
let layerGroup;
let polygonLayers = {};
let detailChart;

// ============ I18N ============
function t(key) {
  // LS only translates ~30 core keys; everything else falls back to DE.
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.de[key] || key;
}

// v2.9 — pick a source-citation label by active language (sourceLabelEn/Tr/Ua/Kr),
// falling back to the German sourceLabelDe. Used for STORIES + KPI_DETAILS modals.
function _slPick(obj) {
  if (!obj) return '';
  const suf = ({ de: 'De', en: 'En', tr: 'Tr', ua: 'Ua', kr: 'Kr', ls: 'De' })[currentLang] || 'De';
  return obj['sourceLabel' + suf] || obj.sourceLabelDe || '';
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // v2.7 — title attributes (tooltips) need translation too (e.g. KPI curator button)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  // v2.7 — re-populate cite-url after data-i18n-html overwrites the cite block
  // (footer-gsm citation is per-language; the URL itself is constant).
  const citeEl = document.getElementById('cite-url');
  if (citeEl) citeEl.textContent = window.location.href;
  // Update language attribute (LS = German simplified register)
  document.documentElement.lang = currentLang === 'kr' ? 'ko' : (currentLang === 'ls' ? 'de' : currentLang);
  // v2.9 — localize the browser tab title too
  try { document.title = t('title') + ' · ' + t('subtitle'); } catch (e) {}
  // Hydrate any pending data-icon placeholders (idempotent)
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // LS (Leichte Sprache) is a German register — keep document lang="de"
  // for screen readers, mark the special mode via data-lang for CSS.
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === 'kr' ? 'ko' : (lang === 'ls' ? 'de' : lang);
  applyTranslations();
  renderKPIs(); // re-render with new labels
  renderTicker();
  renderCitizenReports();
  renderStories();
  // Trigger slider label update
  const slider = document.getElementById('timeline-slider');
  if (slider) slider.dispatchEvent(new Event('input'));
}

// ============ THEME TOGGLE ============
function setupThemeToggle() {
  // v2.2 GSM dialect: light-only.
  // Government Statistical Modernism dialect ships light-only (BMWK,
  // Destatis, Eurostat). Toggle button removed from header. Function kept
  // as a safe no-op so any legacy caller still resolves without throwing.
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
}

// ============ TICKER ============
function renderTicker() {
  const ticker = document.getElementById('ticker-content');
  const up = wbIcon('trend-up', 11);
  const dn = wbIcon('trend-down', 11);
  const items = [
    `<span><strong>${t('kpi_population')}</strong> 300.089 <span class="ticker-up">${up} +1.156</span></span>`,
    `<span><strong>AQI Mitte</strong> 42 <span class="ticker-down">${dn} -3</span></span>`,
    `<span><strong>${t('kpi_transit')}</strong> 91% <span class="ticker-up">${up} +2pp</span></span>`,
    `<span><strong>${t('kpi_construction')}</strong> 28</span>`,
    `<span><strong>${t('kpi_energy')}</strong> 61% <span class="ticker-up">${up} +3pp</span></span>`,
    `<span><strong>${t('citizen_title')}</strong> 18 ${t('citizen_open')} / 132 ${t('citizen_resolved')}</span>`,
    `<span><strong>${t('ticker_datasets')}</strong> opendata.cloud.wiesbaden.de · Beta</span>`,
    `<span><strong>${t('ticker_migration')}</strong> 43,7%</span>`,
    `<span><strong>Smart City Index</strong> ${t('ticker_rank')} 25/82 (Bitkom 2024)</span>`
  ];
  // duplicate for seamless scroll
  ticker.innerHTML = items.join('') + items.join('');
}

// ============ KPI CARDS ============
function formatNum(n) {
  return n.toLocaleString('de-DE');
}

function renderKPIs() {
  const grid = document.getElementById('kpi-grid');
  const kpis = [
    {
      key: 'population', featured: true,
      label: t('kpi_population'),
      value: 300089, unit: '',
      status: t('kpi_population_status'),
      trend: '+1.156', trendClass: 'trend-up',
      sparkData: POPULATION_TIMELINE.map(p => p.total)
    },
    {
      key: 'air',
      label: t('kpi_air'),
      value: 42, unit: '',
      status: t('kpi_air_unit'),
      trend: '-3', trendClass: 'trend-down',
      sparkData: [48, 47, 45, 44, 46, 43, 42]
    },
    {
      key: 'transit',
      label: t('kpi_transit'),
      value: 91, unit: '%',
      status: t('kpi_transit_status'),
      trend: '+2pp', trendClass: 'trend-up',
      sparkData: [85, 87, 86, 88, 89, 90, 91]
    },
    {
      key: 'construction',
      label: t('kpi_construction'),
      value: 28, unit: '',
      status: t('kpi_construction_status'),
      trend: '+4', trendClass: 'trend-up',
      sparkData: [20, 22, 24, 26, 24, 27, 28]
    },
    {
      key: 'energy',
      label: t('kpi_energy'),
      value: 61, unit: '%',
      status: t('kpi_energy_status'),
      trend: '+3pp', trendClass: 'trend-up',
      sparkData: [52, 54, 55, 57, 58, 59, 61]
    }
  ];

  grid.innerHTML = kpis.map(kpi => {
    const trendIcon = kpi.trendClass === 'trend-up' ? wbIcon('trend-up', 11) : (kpi.trendClass === 'trend-down' ? wbIcon('trend-down', 11) : '');
    return `
    <div class="kpi-card ${kpi.featured ? 'featured' : ''}" data-kpi="${kpi.key}">
      <span class="demo-badge">${t('demo')}</span>
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value" data-target="${kpi.value}">
        0<span class="kpi-unit">${kpi.unit}</span>
      </div>
      <div class="kpi-status">
        <span>${kpi.status}</span>
        <span class="kpi-trend ${kpi.trendClass}">${trendIcon}${kpi.trend}</span>
      </div>
      ${makeSparkSVG(kpi.sparkData)}
    </div>
  `;}).join('');

  // Animate count-up
  setTimeout(() => animateCounters(), 100);
}

// Polyline points only (kept for back-compat callers)
function makeSparkPoints(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 32 - ((v - min) / range) * 28 - 2;
    return `${x},${y}`;
  }).join(' ');
}

// Editorial sparkline with min/max/end dots + dotted axis
function makeSparkSVG(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 32 - ((v - min) / range) * 26 - 3;
    return { x: x, y: y, v: v };
  });
  const polyPts = pts.map(p => p.x + ',' + p.y).join(' ');
  const minPt = pts.reduce((acc, p) => p.v < acc.v ? p : acc, pts[0]);
  const maxPt = pts.reduce((acc, p) => p.v > acc.v ? p : acc, pts[0]);
  const endPt = pts[pts.length - 1];
  const midY = 32 - 0.5 * 26 - 3;
  return '<svg class="kpi-spark" viewBox="0 0 100 32" preserveAspectRatio="none">'
    + '<line class="spark-axis" x1="0" y1="' + midY.toFixed(2) + '" x2="100" y2="' + midY.toFixed(2) + '"/>'
    + '<polyline points="' + polyPts + '" fill="none" stroke="currentColor" stroke-width="1.6" style="color: var(--accent)"/>'
    + '<circle class="spark-min-dot" cx="' + minPt.x.toFixed(2) + '" cy="' + minPt.y.toFixed(2) + '" r="1.6"/>'
    + '<circle class="spark-max-dot" cx="' + maxPt.x.toFixed(2) + '" cy="' + maxPt.y.toFixed(2) + '" r="1.6"/>'
    + '<circle class="spark-end-dot" cx="' + endPt.x.toFixed(2) + '" cy="' + endPt.y.toFixed(2) + '" r="2.2"/>'
    + '</svg>';
}

function animateCounters() {
  document.querySelectorAll('.kpi-value').forEach(el => {
    const target = parseInt(el.dataset.target);
    const unitSpan = el.querySelector('.kpi-unit');
    const unit = unitSpan ? unitSpan.outerHTML : '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      el.innerHTML = formatNum(value) + unit;
      if (progress < 1) requestAnimationFrame(tick);
      else el.innerHTML = formatNum(target) + unit;
    }
    requestAnimationFrame(tick);
  });
}

// ============ MAP ============
// v2.7 — 11 EBENEN choropleth layers (was 6). bikePaths dropped (no real source).
// Each layer has a distinct ColorBrewer 9-step palette so toggling produces a
// visibly different pattern; LAYER_GROUPS groups them in the UI dropdown.
const COLOR_PALETTES = {
  pop:        ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'], // YlOrRd
  foreign:    ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'], // Purples
  baustellen: ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'], // Reds
  aqi:        ['#1a9850','#66bd63','#a6d96a','#d9ef8b','#ffffbf','#fee08b','#fdae61','#f46d43','#d73027'], // RdYlGn (low=green=good)
  charging:   ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b'], // BuPu
  // v2.7 additions:
  rent:       ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000'], // OrRd
  kita:       ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'], // Greens
  turnout:    ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'], // Blues
  sozialwohn: ['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704'], // Oranges
  kaufkraft:  ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']  // YlGnBu
};

// Inversion: when the palette dark end should mean "low value" instead of "high".
// aqi has the gradient baked in (green→red); others would need inversion if "lower = better".
// kita-coverage and turnout: higher = better (no invert needed). Same for kaufkraft.
const LAYER_INVERT = { aqi: false };

// Group definition for the new dropdown UI (Phase 1.6)
const LAYER_GROUPS = [
  { id: 'demografie', label_de: 'Bevölkerung',  layers: ['pop', 'foreign'] },
  { id: 'wohnen',     label_de: 'Wohnen',       layers: ['rent', 'baustellen', 'sozialwohn'] },
  { id: 'soziales',   label_de: 'Soziales',     layers: ['kita', 'kaufkraft', 'turnout'] },
  { id: 'umwelt',     label_de: 'Umwelt',       layers: ['aqi'] },
  { id: 'mobilitaet', label_de: 'Mobilität',    layers: ['charging'] },
];

// Lookup tables built once from the new Piveau datasets so getLayerValue stays O(1).
let _layerLookup = null;
function _buildLayerLookups() {
  if (_layerLookup) return _layerLookup;
  const D2 = window.LAGEBILD_DATA || {};
  const lookup = {
    rent: {}, kita: {}, turnout: {}, sozialwohn: {}, kaufkraft: {}
  };
  // KAUFKRAFT_OB → kaufkraft (€ per capita), bonus: latest unemployment is exposed elsewhere
  if (D2.KAUFKRAFT_OB && Array.isArray(D2.KAUFKRAFT_OB.districts)) {
    D2.KAUFKRAFT_OB.districts.forEach(d => {
      if (d.bezirk && typeof d.kaufkraft_eur_per_capita === 'number') {
        lookup.kaufkraft[d.bezirk] = d.kaufkraft_eur_per_capita;
      }
    });
  }
  // SOZIALWOHN_OB → latest absolute count (per Audit Story 2)
  if (D2.SOZIALWOHN_OB && Array.isArray(D2.SOZIALWOHN_OB.districts)) {
    D2.SOZIALWOHN_OB.districts.forEach(d => {
      if (d.bezirk && typeof d.latest === 'number') {
        lookup.sozialwohn[d.bezirk] = d.latest;
      }
    });
  }
  // KITA_VERSORGUNG → u3 coverage quote (%) from the real official PDF.
  // Shape is { ortsbezirke: [{ name, u3: { quote }, elem: {...} }] } — an object
  // with a nested array, keyed by district name (matches ORTSBEZIRKE.name).
  if (D2.KITA_VERSORGUNG && Array.isArray(D2.KITA_VERSORGUNG.ortsbezirke)) {
    D2.KITA_VERSORGUNG.ortsbezirke.forEach(k => {
      if (k && k.name && k.u3 && typeof k.u3.quote === 'number') {
        lookup.kita[k.name] = k.u3.quote;
      }
    });
  }
  // ELECTION_TURNOUT → 2026 % (real CSV; names are short, fuzzy-match to ORTSBEZIRKE)
  if (Array.isArray(D2.ELECTION_TURNOUT)) {
    const ortNames = ORTSBEZIRKE.map(o => o.name);
    const _norm = s => (s || '').toLowerCase()
      .replace(/[äöüß]/g, m => ({ä:'a',ö:'o',ü:'u',ß:'ss'}[m]))
      .replace(/[\/\-\s]+/g, '');
    D2.ELECTION_TURNOUT.forEach(e => {
      const raw = e && (e.name_opendata || e.name);
      const val = e && e.wahlbeteiligung_2026;
      if (!raw || typeof val !== 'number') return;
      const n = _norm(raw);
      const canon = ortNames.find(o => _norm(o).includes(n) || n.includes(_norm(o.split('/')[0])));
      if (canon) lookup.turnout[canon] = val;
    });
  }
  // MIETSPIEGEL_2025 / ANGEBOTSMIETEN_TIMELINE → median per district if available;
  // otherwise fall back to ORTSBEZIRKE.rent (already populated in v2.6).
  ORTSBEZIRKE.forEach(o => {
    const r = parseFloat(o.rent);
    if (o.name && !isNaN(r)) lookup.rent[o.name] = r;
  });
  _layerLookup = lookup;
  return _layerLookup;
}

const _layerMinMaxCache = {};
function getLayerMinMax(layerKey) {
  if (_layerMinMaxCache[layerKey]) return _layerMinMaxCache[layerKey];
  const values = ORTSBEZIRKE
    .map(o => getLayerValue(o, layerKey))
    .filter(v => typeof v === 'number' && !isNaN(v));
  const result = values.length
    ? { min: Math.min(...values), max: Math.max(...values) }
    : { min: 0, max: 1 };
  _layerMinMaxCache[layerKey] = result;
  return result;
}

function getLayerColor(value, layerKey) {
  const palette = COLOR_PALETTES[layerKey] || COLOR_PALETTES.pop;
  if (typeof value !== 'number' || isNaN(value)) return '#1a1a1a';
  const { min, max } = getLayerMinMax(layerKey);
  let ratio = max === min ? 0.5 : (value - min) / (max - min);
  if (LAYER_INVERT[layerKey]) ratio = 1 - ratio;
  ratio = Math.max(0, Math.min(1, ratio));
  const idx = Math.min(palette.length - 1, Math.floor(ratio * palette.length));
  return palette[idx];
}

// Polygon fill opacity is constant — color encodes intensity now, not opacity.
function getLayerOpacity(_value, _layerKey) {
  return 0.72;
}

function getLayerValue(o, layerKey) {
  if (layerKey === 'pop') return o.pop;
  if (layerKey === 'foreign') return o.foreign;
  if (layerKey === 'baustellen') return o.baustellen;
  if (layerKey === 'aqi') return o.aqi;
  if (layerKey === 'charging') return o.charging;
  // v2.7 layers: lookup by district name
  const lookup = _buildLayerLookups();
  if (lookup[layerKey] && o.name in lookup[layerKey]) {
    return lookup[layerKey][o.name];
  }
  return NaN;  // unknown / no data → grey polygon
}

function getLayerUnit(layerKey) {
  const map = {
    pop: 'Einwohner',
    foreign: '%',
    baustellen: 'Stellen',
    aqi: 'AQI',
    charging: 'Säulen',
    // v2.7 additions
    rent: '€/m²',
    kita: '%',
    turnout: '%',
    sozialwohn: 'WE',
    kaufkraft: '€/Jahr'
  };
  return map[layerKey] || '';
}

function initMap() {
  map = L.map('map', {
    center: [50.0782, 8.2398],
    zoom: 12,
    zoomControl: true,
    attributionControl: true
  });

  // Use a dark CartoDB tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // v2.1 — city outline + outside-mask. GeoJSON stores [lng,lat]; Leaflet wants [lat,lng].
  let cityOutline = null;
  if (WIESBADEN_CITY_GEOJSON && WIESBADEN_CITY_GEOJSON.geometry) {
    cityOutline = WIESBADEN_CITY_GEOJSON.geometry.coordinates[0]
      .map(c => [c[1], c[0]]);

    // Negative-polygon mask: world rectangle minus Wiesbaden ring → grey halo outside city
    const worldRect = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
    L.polygon([worldRect, cityOutline], {
      color: 'transparent',
      fillColor: '#0d1020',
      fillOpacity: 0.55,
      interactive: false
    }).addTo(map);

    // Subtle outline so the city border reads as a deliberate boundary
    L.polyline(cityOutline, {
      color: '#5b7eb8',
      weight: 1.5,
      opacity: 0.65,
      interactive: false
    }).addTo(map);
  }

  layerGroup = L.layerGroup().addTo(map);
  drawLayer(currentLayer);
  updateLegend(currentLayer);

  // Auto-fit: prefer the city outline so off-city Mainz-Kostheim/Kastel/Amöneburg
  // and the eastern hamlets all fit naturally.
  if (cityOutline) {
    map.fitBounds(cityOutline, { padding: [30, 30] });
  } else {
    const allCoords = [];
    ORTSBEZIRKE.forEach(o => o.polygon.forEach(p => allCoords.push(p)));
    if (allCoords.length) map.fitBounds(allCoords, { padding: [30, 30] });
  }

  // Re-fit when window or container resizes
  window.addEventListener('resize', () => {
    map.invalidateSize();
  });
}

// v2.1 — legend bar reflects active layer's palette
function updateLegend(layerKey) {
  const palette = COLOR_PALETTES[layerKey] || COLOR_PALETTES.pop;
  const bar = document.querySelector('.legend-bar');
  if (!bar) return;
  // Show 5 evenly-spaced stops from the 9-step palette
  const stops = [palette[0], palette[2], palette[4], palette[6], palette[8]];
  bar.innerHTML = stops.map(c => `<div style="background:${c}"></div>`).join('');
}

function drawLayer(layerKey) {
  if (!layerGroup) return;
  layerGroup.clearLayers();
  polygonLayers = {};

  ORTSBEZIRKE.forEach(o => {
    const value = getLayerValue(o, layerKey);
    const color = getLayerColor(value, layerKey);
    const opacity = getLayerOpacity(value, layerKey);

    const polygon = L.polygon(o.polygon, {
      color: color,
      weight: 2,
      opacity: 0.9,
      fillColor: color,
      fillOpacity: opacity,
      smoothFactor: 1.5
    });

    const tooltip = `
      <div class="tooltip-name">${o.name}</div>
      <div class="tooltip-label">${getLayerLabelForLayer(layerKey)}</div>
      <div class="tooltip-value">${formatLayerValue(value, layerKey)}</div>
    `;

    polygon.bindTooltip(tooltip, { sticky: true, direction: 'top' });

    polygon.on('mouseover', function() {
      this.setStyle({ weight: 4, fillOpacity: Math.min(opacity + 0.2, 1) });
    });

    polygon.on('mouseout', function() {
      this.setStyle({ weight: 2, fillOpacity: opacity });
    });

    polygon.on('click', function() {
      showDetail(o);
    });

    polygon.addTo(layerGroup);
    polygonLayers[o.id] = polygon;
  });
}

function getLayerLabelForLayer(key) {
  const map = {
    pop:        t('layer_pop'),
    foreign:    t('layer_foreign'),
    baustellen: t('layer_construction'),
    aqi:        t('layer_air'),
    charging:   t('layer_charging'),
    // v2.7 layers
    rent:       t('layer_rent'),
    kita:       t('layer_kita'),
    turnout:    t('layer_turnout'),
    sozialwohn: t('layer_sozialwohn'),
    kaufkraft:  t('layer_kaufkraft')
  };
  return map[key] || '';
}

function formatLayerValue(value, layerKey) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  if (layerKey === 'pop') return formatNum(value);
  if (layerKey === 'foreign') return value.toFixed(1) + '%';
  if (layerKey === 'baustellen') return value;
  if (layerKey === 'aqi') return value;
  if (layerKey === 'charging') return value;
  // v2.7 layers
  if (layerKey === 'rent')       return value.toFixed(2).replace('.', ',') + ' €/m²';
  if (layerKey === 'kita')       return value.toFixed(1) + '%';
  if (layerKey === 'turnout')    return value.toFixed(1) + '%';
  if (layerKey === 'sozialwohn') return formatNum(value) + ' WE';
  if (layerKey === 'kaufkraft')  return formatNum(Math.round(value)) + ' €';
  return value;
}

// v2.1 — charging station point markers, shown only when charging layer active.
// Points whose coordinate doesn't fall inside any Ortsbezirk polygon (s.d == "")
// are operated by ESWE/MSW outside the Wiesbaden city limits (e.g. Hochheim am
// Main). We still show them — the city catalog publishes them — but dimmed and
// smaller, so the visualisation isn't visually misleading.
let chargingMarkerGroup = null;
function drawChargingMarkers(active) {
  if (!map) return;
  if (chargingMarkerGroup) {
    map.removeLayer(chargingMarkerGroup);
    chargingMarkerGroup = null;
  }
  if (!active || !CHARGING_STATIONS || !CHARGING_STATIONS.length) return;
  chargingMarkerGroup = L.layerGroup();
  CHARGING_STATIONS.forEach(s => {
    const isFast = s.art === 'fast';
    const inCity = !!s.d;  // matched to an Ortsbezirk polygon
    const m = L.circleMarker([s.lat, s.lng], {
      radius: inCity ? (isFast ? 6 : 4) : 2.5,
      color: '#fff',
      weight: inCity ? 1.5 : 0.8,
      opacity: inCity ? 1 : 0.55,
      fillColor: inCity ? (isFast ? '#fbbf24' : '#a78bfa') : '#64748b',  // grey for outside-city
      fillOpacity: inCity ? 0.95 : 0.5,
      interactive: true
    });
    const kw = s.kw != null ? `${s.kw} kW` : '—';
    const artLabel = isFast ? t('charging_fast', 'Schnellladen') : t('charging_normal', 'Normalladen');
    const districtLabel = inCity ? s.d : t('charging_outside', 'außerhalb Wiesbadens');
    m.bindTooltip(
      `<div class="tooltip-name">${s.op || '?'}</div>` +
      `<div class="tooltip-label">${s.addr} · ${districtLabel}</div>` +
      `<div class="tooltip-value">${artLabel} · ${kw} · ${s.n}× ${t('charging_plugs', 'Stecker')}</div>`,
      { sticky: true, direction: 'top' }
    );
    m.addTo(chargingMarkerGroup);
  });
  chargingMarkerGroup.addTo(map);
}

// v2.7 — short rationales surfaced under the layer dropdown
const LAYER_WHY = {
  pop:        { de: 'Wer wohnt wo?',                              en: 'Who lives where?',                       tr: 'Kim nerede yaşıyor?',           ua: 'Хто де живе?',           kr: '인구 분포' },
  foreign:    { de: 'Diversität als Stärke der Stadtgesellschaft', en: 'Diversity as a strength.',              tr: 'Çeşitlilik bir güç.',           ua: 'Різноманіття як сила.',  kr: '다양성 — 사회적 자산' },
  baustellen: { de: 'Wo wird gebaut? Fertigstellungen 2024.',     en: 'Where is the city building?',            tr: 'Nerede inşaat var?',            ua: 'Де будують?',            kr: '신축 분포 (2024)' },
  aqi:        { de: 'Atemluft: lebt es sich gesund?',             en: 'Is the air healthy here?',               tr: 'Hava sağlıklı mı?',             ua: 'Якість повітря для здоров’я.', kr: '대기 건강도' },
  charging:   { de: 'Reichen E-Ladesäulen für die Verkehrswende?', en: 'Enough chargers for the EV transition?', tr: 'Şarj noktası yeterli mi?',      ua: 'Чи вистачить станцій?',  kr: 'EV 전환 인프라' },
  rent:       { de: 'Wo ist Wohnen bezahlbar?',                   en: 'Where is housing affordable?',           tr: 'Konut nerede uygun fiyatlı?',   ua: 'Де житло доступне?',     kr: '주거비 가능 지역' },
  kita:       { de: 'Genug Kita-Plätze für unter 3-Jährige?',     en: 'Enough daycare for under-3s?',           tr: 'Kreş yeri yeterli mi?',         ua: 'Чи вистачить ясел?',     kr: '0–3세 어린이집 충분?' },
  turnout:    { de: 'Wer geht wählen — und wer nicht?',           en: 'Who votes — and who doesn’t?',           tr: 'Kim oy kullanıyor?',            ua: 'Хто голосує?',           kr: '투표 참여 격차' },
  sozialwohn: { de: 'Wo lebt es sich mit Sozialbindung?',         en: 'Where is social housing concentrated?',  tr: 'Sosyal konut nerede?',          ua: 'Де соц.житло?',          kr: '사회임대주택 분포' },
  kaufkraft:  { de: 'Wo ist die Kaufkraft hoch?',                 en: 'Where is purchasing power high?',        tr: 'Alım gücü nerede yüksek?',      ua: 'Де висока купівельна спроможність?', kr: '구매력 분포' },
};

function setLayer(layerKey) {
  currentLayer = layerKey;
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === layerKey);
  });
  // v2.7 dropdown sync
  const sel = document.getElementById('layer-select');
  if (sel && sel.value !== layerKey) sel.value = layerKey;
  // "Warum wichtig?" rationale, language-aware
  const why = document.getElementById('layer-why');
  if (why) {
    const dict = LAYER_WHY[layerKey];
    why.textContent = dict ? (dict[currentLang] || dict.de) : '';
  }
  drawLayer(layerKey);
  updateLegend(layerKey);
  drawChargingMarkers(layerKey === 'charging');
}

function updateMapColors() {
  // Re-draw on theme switch if needed
  drawLayer(currentLayer);
}

// ============ TIMELINE SLIDER ============
function setupTimeline() {
  const slider = document.getElementById('timeline-slider');
  const yearLabel = document.getElementById('timeline-year');
  const popLabel = document.getElementById('timeline-pop');

  function update() {
    const yearIndex = parseInt(slider.value);
    const data = POPULATION_TIMELINE[yearIndex];
    currentYear = data.year;
    yearLabel.textContent = data.year;
    const foreignLabel = currentLang === 'kr' ? '외국인 비율' :
                         currentLang === 'tr' ? 'yabancı oranı' :
                         currentLang === 'ua' ? 'іноземців' :
                         currentLang === 'en' ? 'foreign-born' : 'Ausländeranteil';
    popLabel.textContent = `${formatNum(data.total)} · ${data.foreign}% ${foreignLabel}`;
  }

  slider.addEventListener('input', update);
  update();
}

// ============ DETAIL PANEL ============
// v2.7 — Modell-4-Synthese: Action-Box als zustandsbedingte Regel-Engine.
// Kombiniert (Ortsbezirk × KPI-Snapshot) → 1–4 hyper-spezifische CTAs.
// 26 Bezirke × 12 KPIs = 312 mögliche Handlungspfade; statt generischer
// Buttons zeigt der Detail-Panel jetzt nur, was für DIESEN Bezirk relevant
// ist. 100% client-seitig, DSGVO-trivial.
function evaluateActionRules(o) {
  const D2 = window.LAGEBILD_DATA || {};
  const lookup = (typeof _buildLayerLookups === 'function') ? _buildLayerLookups() : { kaufkraft:{}, sozialwohn:{}, turnout:{}, kita:{} };

  // Citywide reference values for "above/below average" framing
  const cityUnemployment = 5.8;     // KPI default
  const cityKaufkraftAvg = 32500;   // KAUFKRAFT_OB range 27k–42k; midpoint

  const kk    = (D2.KAUFKRAFT_OB && D2.KAUFKRAFT_OB.districts || []).find(x => x.bezirk === o.name);
  const soz   = (D2.SOZIALWOHN_OB && D2.SOZIALWOHN_OB.districts || []).find(x => x.bezirk === o.name);
  const baut  = (D2.BAUTAETIGKEIT_OB && D2.BAUTAETIGKEIT_OB.districts || []).find(x => x.bezirk === o.name);
  const turnout = lookup.turnout[o.name];
  const kitaQ = o.kita_u3 ? o.kita_u3.quote : null;

  const actions = [];

  // 1) Kita u3 < 50 % — official WiKITA portal (real link)
  if (kitaQ != null && kitaQ < 50) {
    actions.push({
      icon: 'graduation',
      label: t('action_kita_vormerk', 'Kita-Vormerkung anlegen'),
      reason: t('action_kita_reason', `Hier weil: Kita-Versorgung u3 nur ${kitaQ.toFixed(1)} %`),
      href: 'https://wikita.wiesbaden.de',
      severity: 'urgent'
    });
  }

  // 2) Wahlbeteiligung < 40 % — Briefwahl Antrag (real link)
  if (typeof turnout === 'number' && turnout < 40) {
    actions.push({
      icon: 'ballot',
      label: t('action_briefwahl', 'Briefwahl beantragen'),
      reason: t('action_briefwahl_reason', `Hier weil: Wahlbeteiligung 2026 nur ${turnout.toFixed(1)} %`),
      href: 'https://www.wiesbaden.de/rathaus/stadtpolitik/wahlen',
      severity: 'civic'
    });
  }

  // 3) Sozialwohnungsanteil < 5 % der Wohnungsbestand → WBS-Antrag (real link)
  if (soz && baut && baut.stock_latest > 0) {
    const share = (soz.latest || 0) / baut.stock_latest * 100;
    if (share < 5) {
      actions.push({
        icon: 'home',
        label: t('action_wbs', 'Wohnberechtigungsschein beantragen'),
        reason: t('action_wbs_reason', `Hier weil: nur ${share.toFixed(1)} % Sozialwohnungs-Quote`),
        href: 'https://www.wiesbaden.de/vv/produkte/51/wohnen/Wohnungsvermittlung',
        severity: 'social'
      });
    }
  }

  // 4) Hohe Arbeitslosigkeit (>= +2pp gegenüber Stadtmittel) — Bundesagentur Wiesbaden
  if (kk && typeof kk.unemployment_rate === 'number' && kk.unemployment_rate >= cityUnemployment + 2) {
    actions.push({
      icon: 'briefcase',
      label: t('action_arbeit', 'Beratung Bundesagentur für Arbeit'),
      reason: t('action_arbeit_reason', `Hier weil: Arbeitslosenquote ${kk.unemployment_rate.toFixed(1)} % (Stadt-Ø ${cityUnemployment} %)`),
      href: 'https://www.arbeitsagentur.de/vor-ort/wiesbaden',
      severity: 'social'
    });
  }

  // 5) Hoher Bürgergeld-Bezug — Sozialberatung
  if (kk && typeof kk.buergergeld_pct === 'number' && kk.buergergeld_pct >= 12) {
    actions.push({
      icon: 'handshake',
      label: t('action_sozialberatung', 'Sozialberatung der Stadt'),
      reason: t('action_sozial_reason', `Hier weil: ${kk.buergergeld_pct.toFixed(1)} % Bürgergeld-Bezug`),
      href: 'https://www.wiesbaden.de/leben-in-wiesbaden/gesellschaft-soziales',
      severity: 'social'
    });
  }

  // 5b) Kaufkraft deutlich unter Stadtmittel → Schuldnerberatung
  if (kk && typeof kk.kaufkraft_eur_per_capita === 'number'
        && kk.kaufkraft_eur_per_capita < cityKaufkraftAvg * 0.85) {
    actions.push({
      icon: 'wallet',
      label: t('action_schuldnerberatung', 'Schuldner- & Verbraucherberatung'),
      reason: t('action_schulden_reason', `Hier weil: Kaufkraft ${formatNum(Math.round(kk.kaufkraft_eur_per_capita))} € / Jahr (Stadt-Ø ${formatNum(cityKaufkraftAvg)} €)`),
      href: 'https://www.diakonie-wirt.de/rat-und-angebote/bei-finanziellen-schwierigkeiten/schuldnerberatung',
      severity: 'social'
    });
  }

  // 6) Hohe Bautätigkeit — Bauleitplanung einsehen
  if (baut && typeof baut.completed_latest === 'number' && baut.completed_latest >= 50) {
    actions.push({
      icon: 'cone',
      label: t('action_bau', 'Bauleitplanung einsehen'),
      reason: t('action_bau_reason', `Hier weil: ${baut.completed_latest} Wohnungen 2024 fertiggestellt`),
      href: 'https://www.o-sp.de/wiesbaden/',
      severity: 'civic'
    });
  }

  // 7) Hoher Ausländeranteil — Ausländerbeirat
  if (typeof o.foreign === 'number' && o.foreign >= 35) {
    actions.push({
      icon: 'globe',
      label: t('action_auslaenderbeirat', 'Ausländerbeirat kontaktieren'),
      reason: t('action_ab_reason', `Hier weil: ${o.foreign.toFixed(1)} % nichtdeutsche Einwohner:innen`),
      href: 'https://www.wiesbaden.de/rathaus/stadtpolitik/auslaenderbeirat',
      severity: 'civic'
    });
  }

  // 8) Hohe Kaltmiete — Mieterbund (real)
  const rent = parseFloat(o.rent);
  if (!isNaN(rent) && rent >= 12) {
    actions.push({
      icon: 'scale',
      label: t('action_mieterbund', 'Mieterbund Wiesbaden'),
      reason: t('action_mieter_reason', `Hier weil: Kaltmiete ${rent.toFixed(2).replace('.', ',')} €/m²`),
      href: 'https://www.mieterbund-wiesbaden.de/',
      severity: 'social'
    });
  }

  // Limit specific actions to top 3 by severity priority (urgent > civic > social)
  const order = { urgent: 0, civic: 1, social: 2, generic: 3 };
  actions.sort((a, b) => order[a.severity] - order[b.severity]);
  const specific = actions.slice(0, 3);

  // Generic fallbacks always appended at the end (audit §6.1: keep proven CTAs).
  specific.push({
    icon: 'clipboard',
    label: t('detail_action_report', 'Mängel melden'),
    reason: '',
    onClick: 'openHinweis',
    severity: 'generic'
  });
  specific.push({
    icon: 'ballot',
    label: t('detail_action_participate', 'Beteiligungsverfahren'),
    reason: '',
    href: 'https://wiesbadenwirkt.de',
    severity: 'generic'
  });
  return specific;
}

function renderActionBox(o) {
  const wrap = document.querySelector('.detail-actions');
  if (!wrap) return;
  const title = wrap.querySelector('.detail-actions-title');
  const titleHTML = title ? title.outerHTML : '<div class="detail-actions-title">Was kann ich tun?</div>';
  const rules = evaluateActionRules(o);
  wrap.innerHTML = titleHTML +
    rules.map(r => {
      const handler = r.onClick === 'openHinweis'
        ? `onclick="document.getElementById('modal-backdrop').classList.add('active')"`
        : (r.href ? `onclick="window.open('${r.href.replace(/'/g, "\\'")}','_blank','noopener')"` : '');
      const reason = r.reason
        ? `<div class="detail-action-reason">${r.reason}</div>`
        : '';
      return `
        <button class="detail-action-btn detail-action-${r.severity}" ${handler}>
          <div class="detail-action-row">
            <span class="detail-action-icon">${wbIcon(r.icon, 18)}</span>
            <span class="detail-action-label">${r.label}</span>
          </div>
          ${reason}
        </button>`;
    }).join('');
}

function showDetail(ortsbezirk) {
  const panel = document.getElementById('detail-panel');
  document.getElementById('detail-name').textContent = ortsbezirk.name;
  document.getElementById('detail-id').textContent = `Ortsbezirk ${ortsbezirk.id} · Wiesbaden`;

  document.getElementById('stat-pop').textContent = formatNum(ortsbezirk.pop);
  document.getElementById('stat-foreign').innerHTML = ortsbezirk.foreign.toFixed(1) + '<span class="unit">%</span>';
  document.getElementById('stat-age').innerHTML = ortsbezirk.age.toFixed(1) + '<span class="unit">Jahre</span>';
  // v2.0 — replaced construction/aqi/bike with rent/kita/complaints
  if (document.getElementById('stat-rent'))
    document.getElementById('stat-rent').innerHTML = ortsbezirk.rent + '<span class="unit">€/m²</span>';
  if (document.getElementById('stat-kita')) {
    const k = ortsbezirk.kita_u3;
    document.getElementById('stat-kita').innerHTML = k
      ? `${k.quote.toFixed(1).replace('.', ',')}<span class="unit">% · Bilanz ${k.bilanz >= 0 ? '+' : ''}${k.bilanz}</span>`
      : '–';
  }
  if (document.getElementById('stat-complaints'))
    document.getElementById('stat-complaints').innerHTML = ortsbezirk.complaint_days + '<span class="unit">Tg</span>';

  // v2.7 — state-conditional Action-Box (Modell 4 single highest differentiator)
  renderActionBox(ortsbezirk);

  panel.classList.add('active');

  // Render mini chart
  renderDetailChart(ortsbezirk);
}

function renderDetailChart(o) {
  const ctx = document.getElementById('detail-chart-canvas').getContext('2d');
  if (detailChart) detailChart.destroy();

  // Generate plausible 7-year trajectory based on current value
  const baseTrend = POPULATION_TIMELINE.map((p, i) => {
    const ratio = p.total / 300089;
    return Math.round(o.pop * ratio);
  });

  detailChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: POPULATION_TIMELINE.map(p => p.year),
      datasets: [{
        label: 'Bevölkerung',
        data: baseTrend,
        borderColor: '#1B2B4C',
        backgroundColor: 'rgba(27, 43, 76, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#1B2B4C'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 9 } },
          grid: { color: 'rgba(140, 149, 176, 0.1)' }
        },
        y: {
          ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 9 } },
          grid: { color: 'rgba(140, 149, 176, 0.1)' }
        }
      }
    }
  });
}

function setupDetailClose() {
  document.getElementById('detail-close').addEventListener('click', () => {
    document.getElementById('detail-panel').classList.remove('active');
  });
}

// ============ STORIES (v2.3 — real data from opendata.cloud.wiesbaden.de) ============
let storyChart = null;
let storyModalKeyHandler = null;

function renderStories() {
  const list = document.getElementById('story-list');
  if (!list || !STORIES) return;
  list.innerHTML = STORIES.map((s, i) => `
    <div class="story-item" data-story-index="${i}" role="button" tabindex="0" aria-label="${t(s.titleKey)}">
      <span class="story-num">0${i + 1}</span>
      <span class="story-text">${t(s.titleKey)}</span>
      <span class="story-arrow">→</span>
    </div>
  `).join('');
  list.querySelectorAll('.story-item').forEach(el => {
    const idx = parseInt(el.dataset.storyIndex, 10);
    el.addEventListener('click', () => openStoryModal(idx));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStoryModal(idx); }
    });
  });
}

function openStoryModal(index) {
  const s = STORIES[index];
  if (!s) return;
  const modal = document.getElementById('story-modal');
  if (!modal) return;

  document.getElementById('story-modal-num').textContent = '0' + (index + 1);
  document.getElementById('story-modal-title').textContent = t(s.titleKey);

  // v2.7 — "🎯 Was uns überrascht hat" Callout (audit §6.4) — pre-pended above the finding.
  const findingEl = document.getElementById('story-modal-finding');
  const surpriseHTML = s.surprise && (s.surprise[currentLang] || s.surprise.de)
    ? `<div class="story-surprise">${wbIcon('target', 14)} <strong>${t('story_surprise_label', 'Was uns überrascht hat')}</strong> — ${s.surprise[currentLang] || s.surprise.de}</div>`
    : '';
  findingEl.innerHTML = surpriseHTML + `<p class="story-finding-body">${t(s.findingKey)}</p>`;

  const factsEl = document.getElementById('story-modal-facts');
  factsEl.innerHTML = s.facts.map(f => `
    <div class="story-fact">
      <div class="story-fact-value">${f.value}</div>
      <div class="story-fact-label">${t(f.labelKey)}</div>
    </div>
  `).join('');

  document.getElementById('story-modal-source-text').textContent = _slPick(s);
  const link = document.getElementById('story-modal-source-link');
  link.href = s.sourceUrl;
  link.textContent = t('story_modal_view_source');

  // Build the chart (must wait for the modal to be visible so canvas has dimensions)
  modal.classList.add('active');
  setTimeout(() => {
    if (storyChart) { storyChart.destroy(); storyChart = null; }
    storyChart = buildDetailChart(s.chart, 'story-modal-chart');
  }, 50);

  // Close on backdrop click + Esc
  modal.onclick = (e) => { if (e.target === modal) closeStoryModal(); };
  storyModalKeyHandler = (e) => { if (e.key === 'Escape') closeStoryModal(); };
  document.addEventListener('keydown', storyModalKeyHandler);
}

function closeStoryModal() {
  const modal = document.getElementById('story-modal');
  if (modal) modal.classList.remove('active');
  if (storyChart) { storyChart.destroy(); storyChart = null; }
  if (storyModalKeyHandler) {
    document.removeEventListener('keydown', storyModalKeyHandler);
    storyModalKeyHandler = null;
  }
}

// Generic Chart.js builder shared by story-modal and kpi-detail-modal.
// Caller is responsible for destroying any previous chart on the same canvas.
function buildDetailChart(c, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined' || !c) return null;
  const isDark = document.body.classList.contains('dark') ||
                 !document.body.classList.contains('light');
  const tickColor = isDark ? 'rgba(168,178,209,0.7)' : 'rgba(70,80,110,0.7)';
  const gridColor = isDark ? 'rgba(140,149,176,0.12)' : 'rgba(70,80,110,0.10)';
  const dual = c.datasets.some(d => d.yAxis === 'y2');

  const datasets = c.datasets.map(d => {
    const base = {
      label: t(d.labelKey),
      data: d.data,
      borderColor: d.color,
      backgroundColor: d.area ? d.color + '33' : d.color,
      borderWidth: c.type === 'line' ? 2 : 0,
      tension: 0.25,
      fill: !!d.area,
      pointRadius: c.type === 'line' ? 3 : 0,
      pointHoverRadius: 5,
      pointBackgroundColor: d.color
    };
    if (d.yAxis) base.yAxisID = d.yAxis;
    return base;
  });

  const scales = {
    x: {
      ticks: { color: tickColor, font: { size: 10 }, maxRotation: c.type === 'bar' ? 60 : 0, minRotation: c.type === 'bar' ? 60 : 0, autoSkip: false },
      grid: { color: gridColor, display: c.type === 'line' }
    },
    y: {
      type: 'linear',
      position: 'left',
      ticks: { color: tickColor, font: { size: 10 } },
      grid: { color: gridColor },
      title: c.yLabelKey ? { display: true, text: t(c.yLabelKey), color: tickColor, font: { size: 11 } } : undefined
    }
  };
  if (dual) {
    scales.y2 = {
      type: 'linear',
      position: 'right',
      ticks: { color: tickColor, font: { size: 10 } },
      grid: { drawOnChartArea: false },
      title: c.y2LabelKey ? { display: true, text: t(c.y2LabelKey), color: tickColor, font: { size: 11 } } : undefined
    };
  }

  return new Chart(canvas.getContext('2d'), {
    type: c.type,
    data: { labels: c.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: c.datasets.length > 1,
          position: 'top',
          labels: { color: tickColor, font: { size: 11 }, boxWidth: 10, boxHeight: 10 }
        },
        tooltip: {
          backgroundColor: 'rgba(20,25,40,0.95)',
          titleColor: '#fff',
          bodyColor: '#cdd6f4',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      scales
    }
  });
}

// ============ KPI DETAIL MODAL (v2.4) ============
let kpiDetailChart = null;
let kpiDetailKeyHandler = null;

function openKpiDetail(id) {
  // Population deep-links to Story 3 (no duplicate content)
  if (id === 'population') { openStoryModal(2); return; }

  const detail = KPI_DETAILS && KPI_DETAILS[id];
  if (!detail) return;
  const modal = document.getElementById('kpi-detail-modal');
  if (!modal) return;

  document.getElementById('kpi-detail-icon').textContent = detail.icon || '';
  document.getElementById('kpi-detail-title').textContent = t(detail.titleKey);
  document.getElementById('kpi-detail-finding').textContent = t(detail.findingKey);

  const factsEl = document.getElementById('kpi-detail-facts');
  factsEl.innerHTML = (detail.facts || []).map(f => `
    <div class="story-fact">
      <div class="story-fact-value">${f.value}</div>
      <div class="story-fact-label">${t(f.labelKey)}</div>
    </div>
  `).join('');

  // Tier-B mini-modal: hide chart, show action button instead.
  const chartSection = document.getElementById('kpi-detail-chart-section');
  const actionWrap = document.getElementById('kpi-detail-action');
  const actionBtn = document.getElementById('kpi-detail-action-btn');
  const isMini = detail.tier === 'mini';
  if (chartSection) chartSection.style.display = isMini ? 'none' : '';
  if (actionWrap) actionWrap.style.display = isMini && detail.actionView ? 'flex' : 'none';
  if (isMini && detail.actionView && actionBtn) {
    actionBtn.textContent = t(detail.actionLabelKey || 'kpi_mini_open_view');
    actionBtn.onclick = () => {
      closeKpiDetail();
      if (typeof showView === 'function') {
        location.hash = detail.actionView === 'home' ? '' : detail.actionView;
      }
    };
  }

  document.getElementById('kpi-detail-source-text').textContent = _slPick(detail);
  const link = document.getElementById('kpi-detail-source-link');
  if (link) {
    link.href = detail.sourceUrl || '#';
    link.textContent = t('story_modal_view_source');
  }

  modal.classList.add('active');
  if (!isMini) {
    setTimeout(() => {
      if (kpiDetailChart) { kpiDetailChart.destroy(); kpiDetailChart = null; }
      kpiDetailChart = buildDetailChart(detail.chart, 'kpi-detail-chart');
    }, 50);
  }

  modal.onclick = (e) => { if (e.target === modal) closeKpiDetail(); };
  kpiDetailKeyHandler = (e) => { if (e.key === 'Escape') closeKpiDetail(); };
  document.addEventListener('keydown', kpiDetailKeyHandler);
}

function closeKpiDetail() {
  const modal = document.getElementById('kpi-detail-modal');
  if (modal) modal.classList.remove('active');
  if (kpiDetailChart) { kpiDetailChart.destroy(); kpiDetailChart = null; }
  if (kpiDetailKeyHandler) {
    document.removeEventListener('keydown', kpiDetailKeyHandler);
    kpiDetailKeyHandler = null;
  }
}

// Single delegated listener for all clickable KPI cards (Kita keeps its own handler).
function setupKpiDetailModal() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-kpi-clickable="1"]:not([data-kpi="kita"])');
    if (!card) return;
    openKpiDetail(card.dataset.kpi);
  });
}

// ============ CITIZEN REPORTS ============
// v2.7: Headline numbers come from CITIZEN_AGGREGATE (Sicherheitsportal Hessen
// Pressespiegel, quarterly). The list rows below remain demo data because the
// portal has no Read-API — they get a "Beispiel" tag to disclose this.
function renderCitizenReports() {
  const D = window.LAGEBILD_DATA || {};
  const agg = D.CITIZEN_AGGREGATE || null;

  // Aggregate KPIs (real Q2 2026 stand). Fallback to demo counts for offline.
  const total30 = agg ? agg.reports_last30d : CITIZEN_REPORTS.length;
  const resolvedCount = agg
    ? Math.round(agg.reports_last30d * agg.resolved_share)
    : 132;
  const inProgressCount = total30 - resolvedCount - CITIZEN_REPORTS.filter(r => r.status === 'open').length;
  const openCount = agg
    ? Math.max(total30 - resolvedCount - inProgressCount, 0)
    : CITIZEN_REPORTS.filter(r => r.status === 'open').length;

  const elOpen = document.getElementById('rep-open');
  const elProg = document.getElementById('rep-progress');
  const elRes  = document.getElementById('rep-resolved');
  if (elOpen) elOpen.textContent = openCount;
  if (elProg) elProg.textContent = inProgressCount;
  if (elRes)  elRes.textContent  = resolvedCount;

  const elOpenL = document.getElementById('rep-open-label');
  const elProgL = document.getElementById('rep-progress-label');
  const elResL  = document.getElementById('rep-resolved-label');
  if (elOpenL) elOpenL.textContent = t('citizen_open');
  if (elProgL) elProgL.textContent = t('citizen_progress');
  if (elResL)  elResL.textContent  = t('citizen_resolved');

  const list = document.getElementById('report-list');
  if (!list) return;
  // Header row shows the Stand of the aggregate (when available).
  const standHtml = agg
    ? `<div class="report-row report-row--stand" style="font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;color:var(--text-tertiary);text-transform:uppercase;border-bottom:1px solid var(--border-subtle);padding-bottom:6px;margin-bottom:4px;">
         ${agg.source_de} · Stand ${agg.stand_label} · ${agg.reports_last30d} Hinweise / 30 Tage · Median ${agg.median_days_to_resolve} Tage
       </div>`
    : '';
  // Demo rows below the aggregate, each tagged so users can tell them apart.
  const rows = CITIZEN_REPORTS.slice(0, 5).map(r => `
    <div class="report-row">
      <span><span class="report-status ${r.status === 'in-progress' ? 'progress' : r.status}"></span>${r.type} · ${r.location}${r.demo ? ' <em style="font-style:normal;font-size:9px;color:var(--text-tertiary);background:var(--bg-secondary);padding:1px 5px;border-radius:2px;letter-spacing:.05em;">BEISPIEL</em>' : ''}</span>
      <span>${r.date.slice(5)}</span>
    </div>
  `).join('');
  list.innerHTML = standHtml + rows;
}

// ============ MODAL — v2.1 Phase E: Mängelmelder Hessen + mailto fallback ============
const HINWEIS_KEY = 'wiesbaden_lagebild_hinweis_log';
const STADT_EMAIL = 'opendata@wiesbaden.de';
const MAENGELMELDER_URL = 'https://sicherheitsportal.hessen.de/meldeplattformen/maengel-und-angstraeume-melden';

function _i18nFromActiveLang(key, fallback) {
  const active = document.querySelector('.lang-btn.active');
  const code = active ? active.dataset.lang : 'de';
  const dict = (window.LAGEBILD_DATA && window.LAGEBILD_DATA.I18N[code]) || {};
  return dict[key] || (window.LAGEBILD_DATA && window.LAGEBILD_DATA.I18N.de[key]) || fallback || key;
}

function loadHinweisLog() {
  try {
    const raw = localStorage.getItem(HINWEIS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}
function saveHinweisLog(arr) {
  try { localStorage.setItem(HINWEIS_KEY, JSON.stringify(arr)); } catch (e) {}
}

function appendHinweis(entry) {
  const log = loadHinweisLog();
  log.push(entry);
  saveHinweisLog(log);
  return entry;
}

function buildHinweisPayload() {
  const cat = document.getElementById('hinweis-cat');
  const ort = document.getElementById('hinweis-ort');
  const desc = document.getElementById('hinweis-desc');
  const anon = document.getElementById('anon');
  return {
    id: 'WBN-' + Date.now().toString(36).toUpperCase(),
    cat: cat ? cat.value : 'sonstiges',
    catLabel: cat ? cat.options[cat.selectedIndex].text : '',
    ort: ort ? ort.value.trim() : '',
    desc: desc ? desc.value.trim() : '',
    anon: anon ? anon.checked : true,
    ts: Date.now()
  };
}

function setupModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) return;
  const btnSendOpen = document.getElementById('btn-send');
  const btnCancel = document.getElementById('btn-cancel');
  const btnMailto = document.getElementById('btn-mailto');
  const btnOfficial = document.getElementById('btn-modal-send');
  const geoBtn = document.getElementById('hinweis-geo');
  const geoInfo = document.getElementById('hinweis-geo-info');
  const ortInput = document.getElementById('hinweis-ort');

  function open() {
    backdrop.classList.add('active');
    setTimeout(() => { if (ortInput) ortInput.focus(); }, 50);
  }
  function close() { backdrop.classList.remove('active'); }

  if (btnSendOpen) btnSendOpen.addEventListener('click', open);
  // Also open from any element with data-open="hinweis"
  document.querySelectorAll('[data-open="hinweis"]').forEach(el => el.addEventListener('click', open));
  if (btnCancel) btnCancel.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) close();
  });

  // Geolocation (📍 GPS) — Reverse-geocode via Nominatim for human-readable address
  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        geoInfo.textContent = _i18nFromActiveLang('modal_gps_unsupported', 'GPS nicht verfügbar in diesem Browser.');
        geoInfo.style.color = '#B63D3D';
        return;
      }
      geoInfo.textContent = _i18nFromActiveLang('modal_gps_loading', 'Standort wird ermittelt…');
      geoInfo.style.color = 'var(--text-tertiary)';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, { headers: { 'Accept-Language': 'de' } });
          const j = await r.json();
          const a = j.address || {};
          const parts = [a.road && (a.road + (a.house_number ? ' ' + a.house_number : '')), a.postcode, a.city || a.town || a.village || a.suburb].filter(Boolean);
          ortInput.value = parts.join(', ');
          geoInfo.textContent = '📍 ' + ortInput.value + ` (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          geoInfo.style.color = 'var(--text-secondary)';
        } catch (e) {
          ortInput.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          geoInfo.textContent = '📍 ' + ortInput.value + ' ' + _i18nFromActiveLang('modal_gps_no_addr', '(Adresse nicht aufgelöst)');
          geoInfo.style.color = 'var(--text-secondary)';
        }
      }, (err) => {
        geoInfo.textContent = _i18nFromActiveLang('modal_gps_denied', 'Standort verweigert oder Fehler: ') + (err.message || '');
        geoInfo.style.color = '#B63D3D';
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  }

  // Path 1: Mängelmelder Hessen (deep link with prefilled context as URL params)
  // The official portal does not expose a query API for prefill, so we open the
  // landing page and copy the prefilled text to the clipboard so the user can
  // paste it. Honest about the constraint.
  if (btnOfficial) {
    btnOfficial.addEventListener('click', async (e) => {
      e.preventDefault();
      const p = buildHinweisPayload();
      if (!p.desc && !p.ort) {
        showToast(_i18nFromActiveLang('modal_validate', 'Bitte Ort oder Beschreibung angeben.'));
        return;
      }
      appendHinweis({ ...p, route: 'maengelmelder' });
      const text = `[${p.catLabel}] ${p.ort}\n\n${p.desc}\n\n— ${p.anon ? 'anonym' : 'eingereicht'} via Wiesbaden-Lagebild · Ref ${p.id}`;
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
      } catch (err) {}
      window.open(MAENGELMELDER_URL, '_blank', 'noopener');
      close();
      showToast(_i18nFromActiveLang('modal_official_ok', '✓ Mängelmelder Hessen geöffnet · Text in der Zwischenablage. Ref: ') + p.id);
      renderMitmachenHistory();
    });
  }

  // Path 2: mailto fallback
  if (btnMailto) {
    btnMailto.addEventListener('click', (e) => {
      e.preventDefault();
      const p = buildHinweisPayload();
      if (!p.desc && !p.ort) {
        showToast(_i18nFromActiveLang('modal_validate', 'Bitte Ort oder Beschreibung angeben.'));
        return;
      }
      appendHinweis({ ...p, route: 'mailto' });
      const subject = encodeURIComponent(`[Bürgerhinweis ${p.cat}] ${p.ort || 'kein Ort'} · Ref ${p.id}`);
      const body = encodeURIComponent(
`Sehr geehrte Damen und Herren,

ich möchte folgenden Hinweis melden:

Kategorie: ${p.catLabel}
Ort:       ${p.ort || '(nicht angegeben)'}
Datum:     ${new Date().toLocaleString('de-DE')}
Referenz:  ${p.id}

Beschreibung:
${p.desc || '(keine Beschreibung)'}

${p.anon ? 'Diese Meldung wurde anonym über das Wiesbaden-Lagebild Dashboard erstellt.' : 'Bitte rückmelden, wie der Hinweis bearbeitet wird.'}

— Wiesbaden-Lagebild Bürger-Dashboard`);
      window.location.href = `mailto:${STADT_EMAIL}?subject=${subject}&body=${body}`;
      close();
      showToast(_i18nFromActiveLang('modal_mail_ok', '✓ E-Mail vorbereitet · Ref: ') + p.id);
      renderMitmachenHistory();
    });
  }
}

// Render history of submitted Hinweise into the Mitmachen card
// v2.7: also shows a 7-day rolling "Diese Woche von Ihnen" counter
//       — closes the citizen feedback loop visibly without a backend.
function renderMitmachenHistory() {
  const box = document.getElementById('mm-melden-history');
  if (!box) return;
  const log = loadHinweisLog();
  if (!log.length) { box.innerHTML = ''; return; }
  const last = log.slice(-3).reverse();
  // 7-day rolling window
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const weekCount = log.filter(e => e.ts >= sevenDaysAgo).length;
  const weekLabel = _i18nFromActiveLang('mm_melden_week', 'DIESE WOCHE VON IHNEN');
  const weekStripe = `
    <div style="display:flex; align-items:baseline; gap:8px; padding:6px 8px; margin-bottom:8px; background: color-mix(in srgb, var(--accent) 6%, transparent); border-left:2px solid var(--accent); font-family: var(--font-mono);">
      <span style="font-size:10px; letter-spacing:.06em; color: var(--text-secondary); text-transform:uppercase;">${weekLabel}</span>
      <strong style="font-size:18px; color: var(--accent); font-weight:700;">${weekCount}</strong>
    </div>`;
  box.innerHTML = `
    ${weekStripe}
    <div style="font-family: var(--font-mono); font-size:10px; letter-spacing:.06em; color: var(--text-tertiary); margin-bottom:6px;">
      ${_i18nFromActiveLang('mm_melden_history', 'DEINE LETZTEN MELDUNGEN')} (${log.length})
    </div>
    ${last.map(e => `
      <div style="font-size:11px; margin-bottom:3px;">
        <code style="font-size:10px; color: var(--accent);">${e.id}</code>
        · ${e.catLabel || e.cat}
        ${e.ort ? '· ' + e.ort.substring(0, 30) : ''}
        <span style="color: var(--text-tertiary);">· ${new Date(e.ts).toLocaleDateString('de-DE')}</span>
      </div>
    `).join('')}
  `;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: var(--accent); color: white; padding: 14px 22px; border-radius: 6px;
    font-size: 13px; font-family: var(--font-body); z-index: 3000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============ v2.1 — VIEW ROUTER (hash-based SPA navigation) ============
const VALID_VIEWS = ['home', 'alltag', 'wohnen', 'demokratie', 'mitmachen', 'daten'];

function showView(viewId) {
  if (!VALID_VIEWS.includes(viewId)) viewId = 'home';
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.dataset.view === viewId);
  });
  document.querySelectorAll('.view-nav-btn').forEach(btn => {
    const isActive = btn.dataset.view === viewId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  // Tell the world (lazy-render hooks for charts/maps that need invalidate on visible)
  document.dispatchEvent(new CustomEvent('view-changed', { detail: { view: viewId } }));
  // Scroll to top so each view feels like its own page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupViewRouter() {
  // Leaflet maps that were created while their container was hidden need an
  // explicit invalidateSize() once the container becomes visible — otherwise
  // tiles render at 0×0.
  document.addEventListener('view-changed', (e) => {
    const v = e.detail.view;
    setTimeout(() => {
      if (v === 'home' && typeof map !== 'undefined' && map) map.invalidateSize();
      // Cross-IIFE map invalidations dispatched via window for the v2 module's maps
      window.dispatchEvent(new CustomEvent('view-changed-late', { detail: { view: v } }));
    }, 100);
  });

  // Initial view from URL hash. Strip query string so deep-anchor URLs
  // like #daten?id=foo route to the 'daten' view instead of falling back
  // to 'home' (정교화 1 prerequisite).
  // v2.9 — distinguish real view hashes from in-page scroll anchors.
  // Before: a non-view hash (e.g. #cs-projects-grid from the citizen-science
  // "Zu den Projekten" link) fell through to showView() and was forced to
  // 'home', so the jump link wrongly navigated to the home view.
  // After: an unknown hash that matches an element id is treated as a scroll
  // target — the current view stays put and we smooth-scroll to that element.
  function routeHash() {
    const raw = (location.hash || '').replace('#', '').split('?')[0].trim();
    if (raw && !VALID_VIEWS.includes(raw)) {
      const anchor = document.getElementById(raw);
      if (anchor) { anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    showView(raw || 'home');
  }
  routeHash();

  // Click handlers
  document.querySelectorAll('.view-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      location.hash = v === 'home' ? '' : v;
    });
  });

  // Internal links inside views (e.g. cards with data-mm-goto="alltag")
  document.querySelectorAll('[data-mm-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const v = el.dataset.mmGoto;
      location.hash = v === 'home' ? '' : v;
    });
  });

  // React to back/forward + manual hash edits. Same query-strip as above
  // so the user can paste a deep-anchor URL into the address bar.
  window.addEventListener('hashchange', routeHash);
}

// ============ LIVE CLOCK ============
function startClock() {
  const el = document.getElementById('live-time');
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('de-DE', { hour12: false });
  }
  update();
  setInterval(update, 1000);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Apply translations
  applyTranslations();

  // Render dynamic parts
  renderTicker();
  renderKPIs();
  renderStories();
  renderCitizenReports();

  // Init map
  initMap();

  // Setup interactions
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => setLayer(btn.dataset.layer));
  });
  // v2.7 — grouped layer dropdown
  const layerSelect = document.getElementById('layer-select');
  if (layerSelect) {
    layerSelect.addEventListener('change', e => setLayer(e.target.value));
    // Initialise the "Warum wichtig?" line for the default layer.
    setTimeout(() => setLayer(currentLayer), 0);
  }

  setupThemeToggle();
  setupTimeline();
  setupDetailClose();
  setupModal();
  startClock();
  setupViewRouter();

  // Inject toast keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
});

// =================================================================
// v2.0 EXTENSIONS — Citizen Science, Alltag, Curator, AI Register
// =================================================================
(function v2Extensions() {
  const D = window.LAGEBILD_DATA;
  if (!D || !D.KPI_OPTIONS) return;

  const STORAGE_KEY = 'wiesbaden_lagebild_kpis';

  // ----- Get current language -----
  function lang() {
    const active = document.querySelector('.lang-btn.active');
    return active ? active.dataset.lang : 'de';
  }

  // Pick a localized field from an object, e.g. obj.label_en > obj.label_de > obj.label
  function pickLang(obj, prefix) {
    if (!obj) return '';
    const l = lang();
    return obj[prefix + '_' + l] || obj[prefix + '_de'] || obj[prefix] || '';
  }

  // Get an i18n string with fallback chain
  function t(key, fallback) {
    const I = D.I18N[lang()] || D.I18N.de;
    return I[key] || (D.I18N.de && D.I18N.de[key]) || fallback || key;
  }

  // ----- KPI Curator -----
  function loadKpiSelection() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length >= 3) return arr;
      }
    } catch(e) {}
    return D.KPI_DEFAULT.slice();
  }

  function saveKpiSelection(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch(e) {}
  }

  // KPIs that open a citizen-facing details modal when clicked.
  // v2.4: kita keeps its bespoke tabbed modal; the others use #kpi-detail-modal;
  // population deep-links to Story 3.
  const KPI_CLICKABLE = new Set(['kita','air','construction','rent','unemployment','energy','fuel','groceries','population']);
  const KPI_DISABLED  = new Set(['transit','complaints','business']);

  // ============================================================
  // v2.7 — Stand badge metadata + UBA live air quality
  // ============================================================
  // Each KPI declares its data freshness for the Stand badge.
  // status: 'live'        → green dot, runtime fetched (UBA, Tankerkönig in Phase 1)
  //         'static_real' → grey dot, real but build-time / annual snapshot
  //         'unconfirmed' → gold dot, source declared but value not verifiable
  //         'cached'      → gold dot, runtime tried & failed → using last good fetch
  // standDate: ISO date string of the data point (not "today"); month-precision OK.
  const KPI_STAND = {
    population:   { status: 'static_real', standDate: '2025-01' },
    air:          { status: 'static_real', standDate: (UBA_AIRQUALITY && UBA_AIRQUALITY.meta && UBA_AIRQUALITY.meta.period && UBA_AIRQUALITY.meta.period.to) || '' },
    transit:      { status: 'unconfirmed', standDate: '' },
    construction: { status: 'static_real', standDate: '2024' },
    energy:       { status: 'static_real', standDate: '2024-Q4' },
    // v2.7: build-time snapshot is real Tankerkönig data; refreshFuelLive() upgrades to 'live'.
    fuel:         (function(){
      var meta = (window.LAGEBILD_DATA && window.LAGEBILD_DATA.FUEL_STATIONS_V2_META) || null;
      return { status: 'static_real', standDate: meta && meta.fetched_at ? meta.fetched_at.slice(0,10) : '' };
    })(),
    rent:         { status: 'static_real', standDate: '2024' },
    kita:         { status: 'static_real', standDate: '2024-25' },
    complaints:   { status: 'unconfirmed', standDate: 'Q2 2026' },
    business:     { status: 'unconfirmed', standDate: '' },
    unemployment: { status: 'unconfirmed', standDate: '' },
    groceries:    { status: 'static_real', standDate: '2024' }
  };

  function fmtStand(meta) {
    if (!meta) return '';
    const labels = {
      live:         { de:'live',          en:'live',        tr:'canlı',     ua:'наживо',    kr:'실시간',   ls:'live' },
      static_real:  { de:'Stand',         en:'as of',       tr:'durum',     ua:'станом',    kr:'기준일',  ls:'Stand' },
      unconfirmed:  { de:'unverifiziert', en:'unverified',  tr:'doğrulanmadı', ua:'не підтв.', kr:'미검증', ls:'unverifiziert' },
      cached:       { de:'zuletzt',       en:'last cached', tr:'son',       ua:'кешовано',  kr:'캐시',    ls:'zuletzt' }
    };
    const lang = currentLang || 'de';
    const lbl = (labels[meta.status] && labels[meta.status][lang]) || labels[meta.status]?.de || meta.status;
    return meta.standDate ? `${lbl}: ${meta.standDate}` : lbl;
  }

  // ----- UBA Luftqualität: build-time snapshot → KPI_DETAILS.air, optional runtime refresh -----
  function applyAirSnapshot() {
    if (!UBA_AIRQUALITY || !KPI_DETAILS || !KPI_DETAILS.air) return;
    const station = UBA_AIRQUALITY.stations && UBA_AIRQUALITY.stations.DEHE112;
    if (!station) return;
    const days = UBA_AIRQUALITY.days || [];
    const no2 = station.components && station.components.no2;
    const pm10 = station.components && station.components.pm10;
    const pm25 = station.components && station.components.pm2_5;
    if (!no2 || !pm10 || !pm25) return;
    // Hydrate chart with NO2 series (most variable + traffic-correlated indicator).
    KPI_DETAILS.air.chart.labels = days.map(d => d.slice(5)); // MM-DD
    KPI_DETAILS.air.chart.datasets[0].data = (no2.series || []).map(v => v == null ? null : v);
    // Hydrate facts with all three averages.
    KPI_DETAILS.air.facts = [
      { labelKey: 'kpi_air_fact1', value: pm10.average != null ? `PM₁₀ Ø ${pm10.average} µg/m³` : 'PM₁₀ —' },
      { labelKey: 'kpi_air_fact2', value: no2.average  != null ? `NO₂ Ø ${no2.average} µg/m³`   : 'NO₂ —'  },
      { labelKey: 'kpi_air_fact3', value: pm25.average != null ? `PM₂,₅ Ø ${pm25.average} µg/m³` : 'PM₂,₅ —' }
    ];
  }

  // Try a runtime fetch of the latest UBA hour. On success update KPI value and Stand to "live".
  // On failure leave the build-time snapshot in place. Mock-Badge discipline: never silent mock.
  // 30-min localStorage cache to respect rate limits (~15 min refresh on UBA side).
  const UBA_CACHE_KEY = 'wiesbaden_lagebild_uba_cache_v1';
  const UBA_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
  let _liveAir = null;   // v2.9 — runtime UBA averages, exposed for the PDF export
  async function refreshAirLive() {
    try {
      const cached = JSON.parse(localStorage.getItem(UBA_CACHE_KEY) || 'null');
      if (cached && cached.ts && (Date.now() - cached.ts) < UBA_CACHE_MAX_AGE_MS) {
        applyAirRuntime(cached.payload, 'live');
        return;
      }
    } catch(e) { /* ignore */ }

    try {
      const today = new Date();
      const end = new Date(today.getTime() - 24*3600*1000);
      const start = new Date(end.getTime() - 6*24*3600*1000);
      const fmt = d => d.toISOString().slice(0,10);
      const stationId = 740; // DEHE112 Wiesbaden Schiersteiner Straße
      const components = { pm10: 1, no2: 5, pm2_5: 9 };
      // Fetch one component at a time — UBA v3 endpoint takes a single component param.
      const responses = await Promise.all(Object.entries(components).map(async ([key, cid]) => {
        // Via our /api/air Edge proxy — UBA sends no CORS header, so a direct
        // browser fetch is blocked. The proxy returns UBA's JSON verbatim.
        const url = `/api/air?date_from=${fmt(start)}&date_to=${fmt(end)}&time_from=1&time_to=24&station=${stationId}&component=${cid}`;
        const r = await fetch(url, { mode: 'cors' });
        if (!r.ok) throw new Error('UBA HTTP ' + r.status);
        return [key, await r.json()];
      }));
      // Aggregate to daily averages.
      function aggregate(json) {
        const station = json.data && json.data[String(stationId)];
        if (!station) return {};
        const byDay = {};
        for (const [ts, vals] of Object.entries(station)) {
          if (!Array.isArray(vals) || vals.length < 3) continue;
          const v = vals[2];
          if (v === '-' || v === '' || v == null) continue;
          const day = ts.split(' ')[0];
          (byDay[day] = byDay[day] || []).push(parseFloat(v));
        }
        const out = {};
        for (const [d, arr] of Object.entries(byDay)) {
          out[d] = arr.length ? Math.round(arr.reduce((a,b)=>a+b,0) / arr.length * 10) / 10 : null;
        }
        return out;
      }
      const aggregated = {};
      for (const [key, json] of responses) aggregated[key] = aggregate(json);
      // Use no2 keys as the day grid (it's the most reliably reported component here).
      const days = Object.keys(aggregated.no2 || {}).sort();
      if (!days.length) throw new Error('UBA returned no rows');
      const payload = {
        days,
        pm10: days.map(d => aggregated.pm10[d] ?? null),
        no2:  days.map(d => aggregated.no2[d]  ?? null),
        pm25: days.map(d => aggregated.pm2_5[d] ?? null)
      };
      try { localStorage.setItem(UBA_CACHE_KEY, JSON.stringify({ ts: Date.now(), payload })); } catch(e) {}
      applyAirRuntime(payload, 'live');
    } catch (e) {
      // Stay on build-time snapshot. If snapshot itself missing, mark cached/stale.
      console.warn('UBA live fetch failed, using build-time snapshot:', e && e.message);
      // KPI_STAND.air already reflects the snapshot date.
    }
  }

  function applyAirRuntime(payload, status) {
    if (!payload || !payload.days || !payload.days.length) return;
    const avg = arr => {
      const v = arr.filter(x => x != null);
      if (!v.length) return null;
      return Math.round(v.reduce((a,b)=>a+b,0) / v.length * 10) / 10;
    };
    const pm10a = avg(payload.pm10), no2a = avg(payload.no2), pm25a = avg(payload.pm25);
    if (KPI_DETAILS.air) {
      KPI_DETAILS.air.chart.labels = payload.days.map(d => d.slice(5));
      KPI_DETAILS.air.chart.datasets[0].data = payload.no2.slice();
      KPI_DETAILS.air.facts = [
        { labelKey: 'kpi_air_fact1', value: pm10a != null ? `PM₁₀ Ø ${pm10a} µg/m³` : 'PM₁₀ —' },
        { labelKey: 'kpi_air_fact2', value: no2a  != null ? `NO₂ Ø ${no2a} µg/m³`   : 'NO₂ —'  },
        { labelKey: 'kpi_air_fact3', value: pm25a != null ? `PM₂,₅ Ø ${pm25a} µg/m³` : 'PM₂,₅ —' }
      ];
    }
    // Update KPI card live value (NO₂ as headline)
    const opt = D.KPI_OPTIONS && D.KPI_OPTIONS.find(k => k.id === 'air');
    if (opt && no2a != null) {
      opt.value = `${no2a} µg/m³ NO₂`;
    }
    _liveAir = { no2_avg: no2a, pm10_avg: pm10a, pm25_avg: pm25a };
    KPI_STAND.air = { status, standDate: payload.days[payload.days.length - 1] };
    renderKpiGrid();
  }


  function renderKpiGrid() {
    const grid = document.getElementById('kpi-grid');
    if (!grid) return;
    const selection = loadKpiSelection();
    grid.innerHTML = '';
    selection.forEach(id => {
      const opt = D.KPI_OPTIONS.find(k => k.id === id);
      if (!opt) return;
      const card = document.createElement('div');
      card.className = 'kpi-card';
      card.dataset.kpi = opt.id;
      if (KPI_CLICKABLE.has(opt.id)) card.dataset.kpiClickable = '1';
      if (KPI_DISABLED.has(opt.id)) {
        card.dataset.kpiDisabled = '1';
        card.dataset.disabledLabel = (D.I18N[document.querySelector('.lang-btn.active')?.dataset.lang || 'de'] || D.I18N.de).kpi_disabled_roadmap || 'v2 roadmap';
      }
      const isPop = opt.id === 'population';
      const popHint = isPop
        ? `<span class="kpi-population-hint">${(D.I18N[document.querySelector('.lang-btn.active')?.dataset.lang || 'de'] || D.I18N.de).kpi_population_hint || '↗ Story'}</span>`
        : '';
      // v2.6.3: change/source now have language variants (fall back to _de via pickLang)
      const change = pickLang(opt, 'change') || opt.change || '';
      const source = pickLang(opt, 'source') || opt.source || '';
      // v2.7: Stand badge — Mock-Badge-Disziplin §9.2
      const stand = KPI_STAND[opt.id];
      const standHtml = stand
        ? `<span class="kpi-stand kpi-stand--${stand.status}" title="${fmtStand(stand)}">${fmtStand(stand)}</span>`
        : '';
      card.innerHTML = `
        <div class="kpi-card-header">
          <span class="kpi-icon">${opt.icon}</span>
          <span class="kpi-label">${pickLang(opt, 'label')}</span>
          ${standHtml}
        </div>
        <div class="kpi-value-v2">${opt.value}</div>
        <div class="kpi-meta">
          <span class="kpi-change">${change}</span>
          <span class="kpi-source">${source}</span>
        </div>
        ${popHint}
      `;
      grid.appendChild(card);
    });
  }

  function renderCuratorModal() {
    const grid = document.getElementById('curator-grid');
    if (!grid) return;
    const selection = loadKpiSelection();
    grid.innerHTML = '';
    D.KPI_OPTIONS.forEach(opt => {
      const item = document.createElement('label');
      item.className = 'curator-item';
      item.innerHTML = `
        <input type="checkbox" data-kpi="${opt.id}" ${selection.includes(opt.id) ? 'checked' : ''}>
        <span class="curator-item-icon">${opt.icon}</span>
        <div style="flex:1;">
          <div class="curator-item-label">${pickLang(opt, 'label')}</div>
          <div class="curator-item-source">${pickLang(opt, 'source') || opt.source || ''}</div>
        </div>
      `;
      grid.appendChild(item);
    });
  }

  function setupCurator() {
    const btn = document.getElementById('curator-btn');
    const modal = document.getElementById('curator-modal');
    const cancel = document.getElementById('curator-cancel');
    const save = document.getElementById('curator-save');
    const reset = document.getElementById('curator-reset');
    const warning = document.getElementById('curator-warning');
    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
      renderCuratorModal();
      modal.classList.add('active');
    });
    cancel.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
    save.addEventListener('click', () => {
      const checked = Array.from(modal.querySelectorAll('input[data-kpi]:checked'))
        .map(i => i.dataset.kpi);
      if (checked.length < 3) {
        warning.style.display = 'block';
        return;
      }
      warning.style.display = 'none';
      saveKpiSelection(checked);
      renderKpiGrid();
      modal.classList.remove('active');
    });
    reset.addEventListener('click', () => {
      saveKpiSelection(D.KPI_DEFAULT.slice());
      renderCuratorModal();
      renderKpiGrid();
    });
  }

  // ----- Alltag Tabs -----
  function setupAlltagTabs() {
    // Only the Alltag tabs use data-tab; Wohnungsmarkt uses data-wm-tab,
    // Demokratie uses data-dem-tab. Filter so we don't bind handlers that
    // try to find #alltag-undefined when other tab classes are clicked.
    document.querySelectorAll('.alltag-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        if (!target) return;
        // Reset only sibling tabs/content (those that actually use data-tab)
        document.querySelectorAll('.alltag-tab[data-tab]').forEach(t => t.classList.remove('active'));
        ['alltag-fuel', 'alltag-grocery', 'alltag-economy'].forEach(id => {
          const c = document.getElementById(id);
          if (c) c.classList.remove('active');
        });
        tab.classList.add('active');
        const content = document.getElementById('alltag-' + target);
        if (content) content.classList.add('active');
        // Mini-map needs explicit invalidate when its container becomes visible
        if (target === 'fuel' && fuelMiniMap) {
          setTimeout(() => fuelMiniMap.invalidateSize(), 50);
        }
      });
    });
  }

  // ----- Fuel Table -----
  // v2.1: oil-now-inspired Tankstellen UX with PLZ search, mini-map, citizen CTA
  const FUEL_KEY = 'wiesbaden_lagebild_fuel_reports';
  let fuelUserLoc = null;            // {lat,lng,plz} once user sets a location
  let fuelMiniMap = null;            // Leaflet map for the mini view
  let fuelMarkerLayer = null;        // group of price-label markers

  function loadCitizenReports() {
    try {
      const raw = localStorage.getItem(FUEL_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }
  function saveCitizenReports(arr) {
    try { localStorage.setItem(FUEL_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  // Haversine — km between two lat/lng in degrees
  function distKm(a, b) {
    const R = 6371;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
    const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // v2.7: live Tankerkönig prices override the build-time snapshot when the
  // /api/fuel Edge Function is reachable. Mock-Badge-Disziplin §9.2: never
  // silently fall back without showing a "Stand" stamp.
  let _liveFuelStations = null;     // null = uninitialized; [] = tried & got nothing
  let _liveFuelFetchedAt = null;    // ISO string for Stand badge
  const FUEL_LIVE_CACHE_KEY = 'wiesbaden_lagebild_fuel_cache_v1';
  const FUEL_LIVE_MAX_AGE_MS = 5 * 60 * 1000;  // Tankerkönig AGB

  function fuelStations() {
    if (_liveFuelStations && _liveFuelStations.length) return _liveFuelStations;
    return (D.FUEL_STATIONS_V2 && D.FUEL_STATIONS_V2.length)
      ? D.FUEL_STATIONS_V2
      : D.FUEL_STATIONS || [];
  }

  // Map Tankerkönig payload → existing FUEL_STATIONS_V2 schema so the rest
  // of the rendering code (top3 / minimap / table / detail) stays untouched.
  function _mapTKStation(s, idx) {
    return {
      id: idx + 1,           // small numeric id for click handlers
      tk_id: s.id,           // upstream uuid (kept for cross-reference)
      name: s.name,
      brand: s.brand,
      district: '',          // Tankerkönig has no Ortsbezirk; renderer falls back to '—'
      address: [s.street, s.postCode, s.place].filter(Boolean).join(' '),
      lat: s.lat,
      lng: s.lng,
      e10: typeof s.e10 === 'number' ? s.e10 : null,
      e5:  typeof s.e5  === 'number' ? s.e5  : null,
      diesel: typeof s.diesel === 'number' ? s.diesel : null,
      isOpen: !!s.isOpen,
      updated_min: 0
    };
  }

  async function refreshFuelLive() {
    // Try recent cache first to avoid hammering the Edge Function.
    try {
      const cached = JSON.parse(localStorage.getItem(FUEL_LIVE_CACHE_KEY) || 'null');
      if (cached && cached.ts && (Date.now() - cached.ts) < FUEL_LIVE_MAX_AGE_MS) {
        applyFuelLive(cached.payload, cached.ts);
        return;
      }
    } catch(e) { /* ignore */ }

    try {
      const r = await fetch('/api/fuel', { mode: 'cors' });
      if (!r.ok) throw new Error('fuel api HTTP ' + r.status);
      const payload = await r.json();
      if (!payload.ok || !Array.isArray(payload.stations)) throw new Error('fuel api payload');
      const ts = Date.now();
      try { localStorage.setItem(FUEL_LIVE_CACHE_KEY, JSON.stringify({ ts, payload })); } catch(e) {}
      applyFuelLive(payload, ts);
    } catch (e) {
      // Stay on build-time snapshot. Mark KPI as 'cached' so the badge tells the truth.
      console.warn('Tankerkönig live fetch failed, using build-time snapshot:', e && e.message);
      const meta = D.FUEL_STATIONS_V2_META || {};
      KPI_STAND.fuel = { status: 'cached', standDate: (meta.fetched_at || '').slice(0, 10) || 'Snapshot' };
      try { renderKpiGrid(); } catch(e2) {}
      try { syncFuelStandUI('cache', (D.FUEL_STATIONS_V2 || []).length); } catch(e2) {}
    }
  }

  // v2.7 — sync the Tankstellen disclaimer block (#fuel-stand-badge / #fuel-stand-note)
  // and the table toggle count (#fuel-table-toggle-label) with whatever data we have:
  // 'live' (runtime fetch ok), 'cache' (runtime failed, last good kept), 'snapshot' (build-time only).
  // Mock-Badge-Disziplin §9.2: never show stale data without a label.
  function syncFuelStandUI(state, count) {
    const badge = document.getElementById('fuel-stand-badge');
    const note  = document.getElementById('fuel-stand-note');
    const label = document.getElementById('fuel-table-toggle-label');
    if (badge) {
      const span = badge.querySelector('span');
      const key = `fuel_${state}_badge`;
      const fallback = (state === 'live' ? 'LIVE · TANKERKÖNIG MTS-K'
                       : state === 'cache' ? 'CACHE · TANKERKÖNIG MTS-K'
                       : 'SNAPSHOT · TANKERKÖNIG MTS-K');
      if (span) {
        span.textContent = t(key, fallback);
        span.dataset.i18n = key;
      }
      badge.className = `fuel-stand-badge fuel-stand-badge--${state}`;
    }
    if (note) {
      const noteKey = `fuel_${state}_note`;
      const fallback = state === 'live'
        ? 'Coordinates, brands & prices: Bundeskartellamt MTS-K — CC BY 4.0. 5-min cache.'
        : state === 'cache'
        ? 'Last successful fetch — live API currently unreachable.'
        : 'Build-time snapshot. Runtime refresh in progress.';
      note.textContent = t(noteKey, fallback);
      note.dataset.i18n = noteKey;
    }
    if (label) {
      const tplKey = 'fuel_table_toggle';
      const tpl = t(tplKey);
      // Replace {n} placeholder with actual count, fallback to literal n if no token.
      const filled = tpl.includes('{n}') ? tpl.replace('{n}', count) : tpl + ` (${count})`;
      label.textContent = filled;
    }
  }

  // Hydrate fuel KPI from build-time snapshot at startup so the card is honest
  // even before refreshFuelLive() finishes. Mirrors applyAirSnapshot() pattern.
  function applyFuelSnapshot() {
    const list = D.FUEL_STATIONS_V2 || [];
    const valid = list.filter(s => s.e10 != null);
    if (!valid.length) return;
    const cheapest = valid.reduce((a, b) => a.e10 <= b.e10 ? a : b);
    const opt = D.KPI_OPTIONS && D.KPI_OPTIONS.find(k => k.id === 'fuel');
    if (opt) {
      opt.value = `${cheapest.e10.toFixed(3).replace('.', ',')} €`;
    }
    syncFuelStandUI('snapshot', list.length);
  }

  function applyFuelLive(payload, ts) {
    if (!payload || !Array.isArray(payload.stations) || !payload.stations.length) return;
    _liveFuelStations = payload.stations.map(_mapTKStation).filter(s => s.e10 != null && s.isOpen);
    _liveFuelFetchedAt = (payload.fetched_at || new Date(ts).toISOString());
    // Update fuel KPI headline = cheapest open E10
    const sorted = _liveFuelStations.slice().sort((a, b) => a.e10 - b.e10);
    const cheapest = sorted[0];
    if (cheapest) {
      const opt = D.KPI_OPTIONS && D.KPI_OPTIONS.find(k => k.id === 'fuel');
      if (opt) {
        opt.value = `${cheapest.e10.toFixed(3).replace('.', ',')} €`;
      }
    }
    KPI_STAND.fuel = { status: 'live', standDate: _liveFuelFetchedAt.slice(0, 10) };
    // Rerender any fuel surface that's already on screen.
    try { syncFuelStandUI('live', _liveFuelStations.length); } catch(e) {}
    try { renderKpiGrid(); } catch(e) {}
    try { renderFuelTop3(); } catch(e) {}
    try { renderFuelTable(); } catch(e) {}
    try { renderFuelMiniMap(); } catch(e) {}
    try { renderFuelDetailDefault(); } catch(e) {}
  }

  function rankedStations() {
    // With a user location: nearest first (straight-line / Haversine distance). Otherwise: cheapest first.
    const list = fuelStations().filter(s => s.e10 != null);
    if (fuelUserLoc) {
      list.forEach(s => { s._dist = distKm(fuelUserLoc, s); });
      list.sort((a, b) => a._dist - b._dist);
    } else {
      list.sort((a, b) => a.e10 - b.e10);
    }
    return list;
  }

  function renderFuelTop3() {
    const box = document.getElementById('fuel-top3');
    if (!box) return;
    const list = rankedStations();
    const top3 = list.slice(0, 3);
    const medals = ['<span class="rank-pill rank-1">1</span>', '<span class="rank-pill rank-2">2</span>', '<span class="rank-pill rank-3">3</span>'];
    box.innerHTML = `
      <div class="grocery-stat-item" style="grid-column: 1 / -1; text-align:left; padding:0 0 8px 0; border:none;">
        <span style="font-family: var(--font-mono); font-size:10px; letter-spacing:.08em; color: var(--text-tertiary);">
          ${fuelUserLoc ? t('fuel_top3_near', 'GÜNSTIGSTE 3 IN DEINER NÄHE · SUPER E10') : t('fuel_top3_label', 'GÜNSTIGSTE 3 HEUTE · SUPER E10')}
        </span>
      </div>
      ${top3.map((s, i) => `
        <div class="grocery-stat-item" style="cursor:pointer; border-left: 3px solid ${i===0?'#2F855A':'var(--border)'};" data-fuel-id="${s.id}">
          <span class="grocery-stat-value" style="color: ${i===0?'#2F855A':'var(--text-primary)'};">${medals[i]} ${s.e10.toFixed(3)} €</span>
          <span class="grocery-stat-label">
            ${s.brand} · ${s.district || '—'}
            ${s._dist != null ? ` · <span style="color: var(--accent-cool, #2F855A); font-family: var(--font-mono);">${s._dist.toFixed(1)} km</span>` : ''}
          </span>
        </div>
      `).join('')}
    `;
    // Click → focus that station on the mini-map + populate detail
    box.querySelectorAll('[data-fuel-id]').forEach(el => {
      el.addEventListener('click', () => {
        const sid = parseInt(el.dataset.fuelId, 10);
        const station = fuelStations().find(s => s.id === sid);
        if (station) focusFuelStation(station);
      });
    });
  }

  function fuelMarkerHtml(s, rank) {
    // Color by rank: 1 = green, 2/3 = amber, rest = neutral grey
    let bg, border;
    if (rank === 0)      { bg = '#2F855A'; border = '#1F5C3F'; }
    else if (rank < 3)   { bg = '#fbbf24'; border = '#d97706'; }
    else                 { bg = 'rgba(30,41,59,0.92)'; border = '#475569'; }
    const fg = (rank < 3) ? '#0f172a' : '#fff';
    return (
      `<div style="background:${bg}; color:${fg}; border:1.5px solid ${border}; ` +
      `padding:3px 7px; border-radius:14px; font-family: var(--font-mono); ` +
      `font-size:11px; font-weight:600; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">` +
      `${s.e10.toFixed(3)}€</div>`
    );
  }

  function renderFuelMiniMap() {
    const el = document.getElementById('fuel-minimap');
    if (!el || typeof L === 'undefined') return;
    const list = rankedStations();
    if (!fuelMiniMap) {
      fuelMiniMap = L.map(el, {
        center: [50.0782, 8.2398],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OSM, © CartoDB', subdomains: 'abcd', maxZoom: 19
      }).addTo(fuelMiniMap);
    }
    if (fuelMarkerLayer) {
      fuelMiniMap.removeLayer(fuelMarkerLayer);
    }
    fuelMarkerLayer = L.layerGroup();
    list.forEach((s, idx) => {
      const icon = L.divIcon({
        className: 'fuel-price-pin',
        html: fuelMarkerHtml(s, idx),
        iconSize: null,
        iconAnchor: [28, 12]
      });
      const m = L.marker([s.lat, s.lng], { icon });
      m.on('click', () => focusFuelStation(s));
      m.addTo(fuelMarkerLayer);
    });
    fuelMarkerLayer.addTo(fuelMiniMap);

    // User location pin if set
    if (fuelUserLoc) {
      const userIcon = L.divIcon({
        className: 'fuel-user-pin',
        html: '<div style="width:14px; height:14px; background:#1B2B4C; border:2px solid #fff; border-radius:50%; box-shadow:0 0 0 3px rgba(27, 43, 76, 0.3);"></div>',
        iconSize: null,
        iconAnchor: [9, 9]
      });
      L.marker([fuelUserLoc.lat, fuelUserLoc.lng], { icon: userIcon }).addTo(fuelMarkerLayer);
    }

    // Refresh viewport each render so resize works
    setTimeout(() => fuelMiniMap.invalidateSize(), 50);
  }

  function focusFuelStation(s) {
    if (fuelMiniMap) fuelMiniMap.setView([s.lat, s.lng], 14, { animate: true });
    const detail = document.getElementById('fuel-detail');
    if (!detail) return;
    const reports = loadCitizenReports().filter(r => r.id === s.id);
    detail.innerHTML = `
      <div style="font-family: var(--font-mono); font-size:10px; letter-spacing:.08em; color: var(--text-tertiary);">${t('fuel_detail_label', 'TANKSTELLE')}</div>
      <div style="font-size:14px; font-weight:600; margin:4px 0 8px 0;">${s.brand}</div>
      <div style="font-size:11px; color: var(--text-secondary); margin-bottom:10px;">${s.addr}<br>${s.district || '—'}</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:10px;">
        <div>
          <div style="font-size:10px; color: var(--text-tertiary);">SUPER E10</div>
          <div style="font-size:18px; font-weight:600;">${s.e10 != null ? s.e10.toFixed(3) + ' €' : '—'}</div>
        </div>
        <div>
          <div style="font-size:10px; color: var(--text-tertiary);">DIESEL</div>
          <div style="font-size:18px; font-weight:600;">${s.diesel != null ? s.diesel.toFixed(3) + ' €' : '—'}</div>
        </div>
      </div>
      <div style="font-size:10px; color: var(--text-tertiary);">${
        s.upd != null
          ? `${t('fuel_updated', 'Aktualisiert')}: vor ${s.upd} min`
          : (KPI_STAND.fuel && KPI_STAND.fuel.standDate
              ? `${t('fuel_updated', 'Aktualisiert')}: ${KPI_STAND.fuel.standDate}`
              : t('fuel_updated', 'Aktualisiert'))
      }</div>
      ${fuelUserLoc ? `<div style="margin-top:6px; font-size:11px; display:inline-flex; align-items:center; gap:4px;">${wbIcon('map-pin', 12)} ${distKm(fuelUserLoc, s).toFixed(1)} km ${t('fuel_from_you', 'von dir')}</div>` : ''}
      ${reports.length ? `
        <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">
          <div style="font-size:10px; color: var(--text-tertiary); letter-spacing:.06em; display:inline-flex; align-items:center; gap:4px;">${wbIcon('users', 12)} ${t('fuel_citizen_seen', 'BÜRGER MELDUNGEN')}</div>
          ${reports.slice(-3).reverse().map(r => `
            <div style="font-size:11px; margin-top:4px;">
              ${r.fuel === 'e10' ? 'E10' : 'Diesel'}: <strong>${r.price.toFixed(3)} €</strong>
              <span style="color: var(--text-tertiary);">· ${minutesAgo(r.ts)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  function minutesAgo(ts) {
    const m = Math.max(1, Math.floor((Date.now() - ts) / 60000));
    if (m < 60) return `vor ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `vor ${h} h`;
    return `vor ${Math.floor(h / 24)} Tg`;
  }

  function renderFuelDetailDefault() {
    const detail = document.getElementById('fuel-detail');
    if (!detail) return;
    detail.innerHTML = `
      <div style="font-family: var(--font-mono); font-size:10px; letter-spacing:.08em; color: var(--text-tertiary);">${t('fuel_detail_label', 'TANKSTELLE')}</div>
      <div style="margin-top:14px; font-size:12px; color: var(--text-secondary); line-height:1.6;">
        ${t('fuel_detail_hint', 'Klicke einen Pin oder eine Top-3-Karte, um Details zu sehen.')}
      </div>
      <div style="margin-top:14px; padding:10px; background: rgba(74,111,165,0.1); border-radius:4px; font-size:11px;">
        ${wbIcon('lightbulb', 14)} ${t('fuel_detail_tip', 'PLZ eingeben für Entfernungs-Sortierung.')}
      </div>
    `;
  }

  // ----- PLZ → coordinates (Nominatim) -----
  async function geocodePLZ(plz) {
    const url = `https://nominatim.openstreetmap.org/search?q=${plz}+Wiesbaden&format=json&limit=1&countrycodes=de`;
    try {
      const r = await fetch(url, { headers: { 'Accept-Language': 'de' } });
      if (!r.ok) return null;
      const arr = await r.json();
      if (!arr.length) return null;
      return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon), display: arr[0].display_name };
    } catch (e) { return null; }
  }

  function setupFuelPLZ() {
    const input = document.getElementById('fuel-plz');
    const btn = document.getElementById('fuel-plz-btn');
    const info = document.getElementById('fuel-plz-info');
    if (!btn || !input) return;
    async function go() {
      const v = (input.value || '').trim();
      if (!/^\d{5}$/.test(v)) {
        info.textContent = t('fuel_plz_invalid', '5-stellige PLZ eingeben');
        info.style.color = '#B63D3D';
        return;
      }
      info.textContent = t('fuel_plz_loading', 'Suche…');
      info.style.color = 'var(--text-tertiary)';
      const loc = await geocodePLZ(v);
      if (!loc) {
        info.textContent = t('fuel_plz_notfound', 'PLZ nicht gefunden');
        info.style.color = '#B63D3D';
        return;
      }
      fuelUserLoc = { lat: loc.lat, lng: loc.lng, plz: v };
      info.textContent = `📍 ${v} · ${loc.display.split(',').slice(0, 2).join(',')}`;
      info.style.color = 'var(--text-secondary)';
      renderFuelTop3();
      renderFuelMiniMap();
      // Auto-pan map to user's PLZ
      if (fuelMiniMap) fuelMiniMap.setView([loc.lat, loc.lng], 12);
    }
    btn.addEventListener('click', go);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  }

  // ----- Citizen price-report modal -----
  function setupFuelReportModal() {
    const ctaBtn = document.getElementById('fuel-cta-btn');
    const modal = document.getElementById('fuel-report-modal');
    const cancel = document.getElementById('fuel-report-cancel');
    const form = document.getElementById('fuel-report-form');
    const stationSel = document.getElementById('fuel-report-station');
    if (!ctaBtn || !modal || !form) return;

    function populateStations() {
      const stations = fuelStations();
      stationSel.innerHTML = stations
        .map(s => `<option value="${s.id}">${s.brand} · ${s.addr || s.district}</option>`)
        .join('');
    }

    ctaBtn.addEventListener('click', () => {
      populateStations();
      modal.classList.add('active');
    });
    cancel.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = parseInt(stationSel.value, 10);
      const fuel = document.getElementById('fuel-report-fuel').value;
      const price = parseFloat(document.getElementById('fuel-report-price').value);
      if (!id || isNaN(price)) return;
      const reports = loadCitizenReports();
      reports.push({ id, fuel, price: +price.toFixed(3), ts: Date.now() });
      saveCitizenReports(reports);
      modal.classList.remove('active');
      form.reset();
      renderFuelCitizenList();
      // If detail is showing this station, refresh it
      const station = fuelStations().find(s => s.id === id);
      if (station) focusFuelStation(station);
      showToast(t('fuel_thanks', '✓ Danke! Deine Meldung wurde anonym gespeichert.'));
    });
  }

  function renderFuelCitizenList() {
    const list = document.getElementById('fuel-citizen-list');
    if (!list) return;
    const reports = loadCitizenReports();
    if (!reports.length) { list.style.display = 'none'; return; }
    list.style.display = 'block';
    const recent = reports.slice(-5).reverse();
    list.innerHTML = `
      <div style="font-family: var(--font-mono); font-size:10px; letter-spacing:.06em; color: var(--text-tertiary); margin-bottom:6px;">
        ${t('fuel_citizen_recent', 'LETZTE BÜRGER-MELDUNGEN')} (${reports.length})
      </div>
      ${recent.map(r => {
        const s = fuelStations().find(x => x.id === r.id);
        return `<div style="margin-bottom:3px;">${s ? s.brand : '?'} · ${r.fuel === 'e10' ? 'E10' : 'Diesel'} <strong>${r.price.toFixed(3)} €</strong> <span style="color: var(--text-tertiary);">· ${minutesAgo(r.ts)}</span></div>`;
      }).join('')}
    `;
  }

  function renderFuelTable() {
    const table = document.getElementById('fuel-table');
    if (!table) return;
    const I = D.I18N[lang()] || D.I18N.de;
    const stations = fuelStations().slice().sort((a, b) => a.e10 - b.e10);
    if (!stations.length) return;
    const minE10 = stations[0].e10;
    const maxE10 = stations[stations.length - 1].e10;
    table.innerHTML = `
      <thead>
        <tr>
          <th>${I.fuel_table_station || 'Tankstelle'}</th>
          <th>${I.fuel_table_district || 'Stadtteil'}</th>
          <th style="text-align:right;">${I.fuel_table_e10 || 'Super E10'}</th>
          <th style="text-align:right;">${I.fuel_table_diesel || 'Diesel'}</th>
          <th>${I.fuel_table_updated || 'Aktualisiert'}</th>
        </tr>
      </thead>
      <tbody>
        ${stations.map(s => {
          const cls = s.e10 === minE10 ? 'cheap' : (s.e10 === maxE10 ? 'expensive' : '');
          const updatedLabel = s.upd != null ? `vor ${s.upd} min` : (s.updated || '—');
          const display = s.brand ? `${s.brand}` : (s.name || '?');
          const subtitle = s.addr ? `<br><span style="color: var(--text-tertiary); font-size:11px;">${s.addr}</span>` : '';
          return `
            <tr>
              <td><strong>${display}</strong>${subtitle}</td>
              <td>${s.district || '—'}</td>
              <td style="text-align:right;"><span class="fuel-price ${cls}">${s.e10 != null ? s.e10.toFixed(3) + ' €' : '—'}</span></td>
              <td style="text-align:right;"><span class="fuel-price">${s.diesel != null ? s.diesel.toFixed(3) + ' €' : '—'}</span></td>
              <td><span class="fuel-updated">${updatedLabel}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  // ----- Grocery Section -----
  function renderGrocery() {
    const stats = document.getElementById('grocery-stats');
    const table = document.getElementById('grocery-table');
    if (!stats || !table) return;
    const G = D.GROCERY_PRICES;

    stats.innerHTML = `
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${G.contributors}</span>
        <span class="grocery-stat-label">${t('grocery_contributors', 'Beitragende')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${G.total_samples}</span>
        <span class="grocery-stat-label">${t('grocery_samples', 'Datenpunkte / Woche')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value" style="color: var(--accent-warm);">+${G.last_week_change}%</span>
        <span class="grocery-stat-label">${t('grocery_change', 'gg. Vorwoche')}</span>
      </div>
    `;

    // Find cheapest store per item
    const cheapest = {};
    G.items.forEach(item => {
      let min = Infinity, store = null;
      G.stores.forEach(s => {
        if (s.prices[item.id] < min) { min = s.prices[item.id]; store = s.name; }
      });
      cheapest[item.id] = store;
    });

    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('grocery_table_header', 'Markt / Produkt')}</th>
          ${G.items.map(item => `<th style="text-align:right;">${item.icon} ${pickLang(item, 'name')}</th>`).join('')}
          <th style="text-align:right;">n</th>
        </tr>
      </thead>
      <tbody>
        ${G.stores.map(s => `
          <tr>
            <td><strong>${s.name}</strong></td>
            ${G.items.map(item => {
              const isCheap = cheapest[item.id] === s.name;
              return `<td style="text-align:right;" class="${isCheap ? 'grocery-cheapest' : ''}">${s.prices[item.id].toFixed(2)} €</td>`;
            }).join('')}
            <td style="text-align:right; color: var(--text-tertiary); font-size:11px;">${s.samples}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  // ----- Economy Section -----
  function renderEconomy() {
    const grid = document.getElementById('economy-grid');
    if (!grid) return;
    const E = D.ECONOMY;
    grid.innerHTML = `
      <div class="economy-card">
        <div class="economy-card-label">${t('economy_new', 'Neue Gewerbe')}</div>
        <div class="economy-card-value">${E.new_businesses_week}</div>
        <div class="economy-card-change positive">+${E.new_businesses_week - E.closed_businesses_week} ${t('economy_net', 'netto')}</div>
      </div>
      <div class="economy-card">
        <div class="economy-card-label">${t('economy_closed', 'Abmeldungen')}</div>
        <div class="economy-card-value">${E.closed_businesses_week}</div>
        <div class="economy-card-change negative">−5 ${t('economy_vs_last', 'gg. Vorwoche')}</div>
      </div>
      <div class="economy-card">
        <div class="economy-card-label">${t('economy_unemployment', 'Arbeitslosenquote')}</div>
        <div class="economy-card-value">${E.unemployment_rate}%</div>
        <div class="economy-card-change positive">${E.unemployment_change_pp} pp</div>
      </div>
      <div class="economy-card">
        <div class="economy-card-label">${t('economy_jobs', 'Offene Stellen')}</div>
        <div class="economy-card-value">${E.jobs_open.toLocaleString('de-DE')}</div>
        <div class="economy-card-change positive">+148 ${t('economy_per_week', '/ Woche')}</div>
      </div>
    `;
  }

  // ----- Citizen Science Projects -----
  function renderCitizenScience() {
    const grid = document.getElementById('cs-projects-grid');
    if (!grid) return;
    const projects = D.CITIZEN_SCIENCE.projects;
    grid.innerHTML = projects.map(p => {
      const pct = Math.round((p.participants_current / p.participants_target) * 100);
      return `
        <div class="cs-project-card">
          <div class="cs-project-icon">${p.icon}</div>
          <h4 class="cs-project-title">${pickLang(p, 'title')}</h4>
          <p class="cs-project-desc">${pickLang(p, 'desc')}</p>
          <div class="cs-project-status">${pickLang(p, 'status')}</div>
          <div class="cs-project-progress">
            <div class="cs-project-progress-bar" style="width: ${pct}%"></div>
          </div>
          <div class="cs-project-numbers">${p.participants_current} / ${p.participants_target} ${t('cs_participants', 'Teilnehmende')}</div>
          <div class="cs-project-partner">${t('cs_partner', 'Partner')}: ${p.partner}</div>
          <button class="cs-project-join-btn">+ ${t('cs_join', 'Mitmachen')}</button>
        </div>
      `;
    }).join('');
  }

  // ----- AI Register -----
  function renderAIRegister() {
    const table = document.getElementById('ai-register-table');
    if (!table) return;
    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('ai_purpose', 'Algorithmus & Zweck')}</th>
          <th>${t('ai_type', 'Typ')}</th>
          <th>${t('ai_risk', 'Risiko')}</th>
          <th>${t('ai_since', 'Seit')}</th>
        </tr>
      </thead>
      <tbody>
        ${D.AI_REGISTER.map(a => {
          const note = pickLang(a, 'note');
          return `
            <tr>
              <td>
                <div class="ai-register-name">${pickLang(a, 'name')}</div>
                <div style="font-size:12px; color: var(--text-secondary); margin-top:3px;">${pickLang(a, 'purpose')}</div>
                ${note ? `<div class="ai-register-note">⚠ ${note}</div>` : ''}
              </td>
              <td style="font-size:11px; color: var(--text-secondary);">${a.type}</td>
              <td><span class="ai-risk-badge ai-risk-${a.risk}">${t('ai_risk_' + a.risk, a.risk)}</span></td>
              <td style="font-size:11px; color: var(--text-tertiary);">${a.since}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  // ----- Meta Usage -----
  function renderMetaUsage() {
    const total = document.getElementById('meta-total');
    const bars = document.getElementById('meta-bars');
    if (!total || !bars) return;
    const M = D.META_USAGE;
    total.innerHTML = `${t('meta_visits', 'Besuche im Monat')} (${M.month}): <strong>${M.total_visits.toLocaleString('de-DE')}</strong>`;
    bars.innerHTML = M.top_panels.map(p => `
      <div class="meta-bar-row">
        <div class="meta-bar-label">${pickLang(p, 'name')}</div>
        <div class="meta-bar-track">
          <div class="meta-bar-fill" style="width: ${p.share * 2}%">${p.views.toLocaleString('de-DE')}</div>
        </div>
        <div class="meta-bar-pct">${p.share}%</div>
      </div>
    `).join('');
  }

  // ----- PDF Snapshot Export (audit Ideation #10) -----
  // Opens a new window with a print-optimized "Stand der Stadt" snapshot;
  // user saves as PDF via browser Print → Save dialog. No external libs.
  function exportSnapshotPDF() {
    const today = new Date().toISOString().slice(0, 10);
    // v2.9 — mirror the citizen's actual on-screen KPI curation. The curator
    // persists under 'wiesbaden_lagebild_kpis' (loadKpiSelection); the previous
    // 'wiesbaden_lagebild_kpi_selection' key was never written, so the PDF always
    // fell back to defaults and silently ignored any customization.
    const selection = loadKpiSelection();
    const cards = selection
      .map(id => D.KPI_OPTIONS.find(k => k.id === id))
      .filter(Boolean);
    const stories = (D.STORIES || []);
    const sources = (D.DATA_SOURCES || []).slice(0, 25);
    // v2.9 — Live-Daten reflect the runtime fetches (refreshAirLive / refreshFuelLive)
    // when available, else the build-time snapshot. Badges use fmtStand() so label+date
    // match the dashboard exactly (live / Stand / zuletzt — never a faked "live").
    const air = D.UBA_AIRQUALITY && D.UBA_AIRQUALITY.headline;
    const airHead = (typeof _liveAir !== 'undefined' && _liveAir) || air;
    const fuelList = (typeof fuelStations === 'function' ? fuelStations() : (D.FUEL_STATIONS_V2 || []))
      .filter(s => s.e10 != null && s.isOpen !== false);
    const fuel = fuelList.slice().sort((a, b) => a.e10 - b.e10)[0];

    const css = `
      <style>
        @page { size: A4; margin: 18mm; }
        body { font-family: 'Inter', system-ui, sans-serif; color: #1a1f2e; line-height: 1.55; max-width: 760px; margin: 0 auto; padding: 24px; }
        h1 { font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; margin: 0 0 6px 0; color: #1B2B4C; }
        h2 { font-family: 'Lora', Georgia, serif; font-size: 18px; font-weight: 600; margin: 24px 0 8px 0; color: #1B2B4C; border-bottom: 1px solid #E2E5EB; padding-bottom: 4px; }
        h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #5C6580; margin: 16px 0 6px 0; }
        .stand { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #5C6580; }
        .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 14px; margin: 10px 0; }
        .kpi { padding: 8px 10px; border: 1px solid #E2E5EB; border-radius: 4px; }
        .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #5C6580; }
        .kpi-val { font-family: 'Lora', Georgia, serif; font-size: 22px; font-weight: 600; color: #1B2B4C; }
        .kpi-meta { font-size: 10px; color: #8892A8; }
        .story { padding: 8px 0; border-bottom: 1px dotted #E2E5EB; }
        .story-title { font-weight: 600; font-size: 13px; }
        .story-source { font-size: 10px; color: #8892A8; font-style: italic; }
        ul.sources { font-size: 10.5px; padding-left: 16px; column-count: 2; column-gap: 16px; }
        ul.sources li { margin-bottom: 3px; break-inside: avoid; }
        footer { margin-top: 28px; font-size: 10px; color: #8892A8; line-height: 1.6; border-top: 1px solid #E2E5EB; padding-top: 10px; }
        .badge { display: inline-block; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-size: 9px; border: 1px solid currentColor; border-radius: 3px; color: #2F855A; margin-left: 6px; }
        @media print { body { padding: 0; } .no-print { display: none; } }
        .no-print { background: #1B2B4C; color: #fff; border: 0; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .snap-map-block { break-inside: avoid; }
        .snap-map { display: block; width: 100%; max-width: 500px; height: auto; margin: 6px auto 4px; border: 1px solid #E2E5EB; border-radius: 4px; background: #fff; break-inside: avoid; }
        .map-legend { display: flex; align-items: center; justify-content: center; gap: 2px; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5C6580; margin: 0 0 8px 0; break-inside: avoid; }
        .map-legend .sw { display: inline-block; width: 18px; height: 10px; }
        .map-legend-min { margin-right: 5px; } .map-legend-max { margin-left: 5px; }
        .map-legend-note { width: 100%; text-align: center; margin-top: 3px; color: #8892A8; }
      </style>
    `;

    const kpiBlock = cards.map(c => {
      const change = c.change_de || c.change || '';
      const src = c.source_de || c.source || '';
      return `<div class="kpi">
        <div class="kpi-label">${c.icon} ${c.label_de || c.label || c.id}</div>
        <div class="kpi-val">${c.value || '—'}</div>
        <div class="kpi-meta">${change}${change && src ? ' · ' : ''}${src}</div>
      </div>`;
    }).join('');

    const storyBlock = stories.map((s, i) => {
      const title = (D.I18N.de && D.I18N.de[s.titleKey]) || s.titleKey;
      return `<div class="story">
        <div class="story-title">${String(i+1).padStart(2,'0')} · ${title}</div>
        <div class="story-source">${_slPick(s)}</div>
      </div>`;
    }).join('');

    const sourcesBlock = sources.map(s => {
      const title = (s.title_de || s.title || s.label || s.slug || '');
      const license = (s.license || s.lizenz || '');
      return `<li>${title}${license ? ' · <em>' + license + '</em>' : ''}</li>`;
    }).join('');

    // ----- v2.9: inline SVG choropleth of the active map layer -----
    // Print-safe vector map (no tiles / no canvas → no CORS taint, no blank
    // captures). Reuses the live dashboard geometry (ORTSBEZIRKE[].polygon) and
    // color scale so the PDF mirrors exactly what the citizen sees on screen.
    function buildSnapshotMap(layerKey) {
      const dists = (typeof ORTSBEZIRKE !== 'undefined' ? ORTSBEZIRKE : [])
        .filter(o => Array.isArray(o.polygon) && o.polygon.length);
      if (!dists.length) return '';
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
      dists.forEach(o => o.polygon.forEach(p => {
        if (p[0] < minLat) minLat = p[0]; if (p[0] > maxLat) maxLat = p[0];
        if (p[1] < minLng) minLng = p[1]; if (p[1] > maxLng) maxLng = p[1];
      }));
      const meanLat = (minLat + maxLat) / 2;
      const kx = Math.cos(meanLat * Math.PI / 180);   // equirectangular aspect correction
      const W = 700;
      const geoW = Math.max((maxLng - minLng) * kx, 1e-9);
      const geoH = Math.max((maxLat - minLat), 1e-9);
      const H = Math.round(W * geoH / geoW);
      const px = lng => (((lng - minLng) * kx) / geoW) * W;
      const py = lat => (((maxLat - lat)) / geoH) * H;   // flip Y so north is up
      const paths = dists.map(o => {
        const fill = getLayerColor(getLayerValue(o, layerKey), layerKey);
        const d = o.polygon
          .map((p, i) => (i ? 'L' : 'M') + px(p[1]).toFixed(1) + ' ' + py(p[0]).toFixed(1))
          .join(' ') + ' Z';
        return `<path d="${d}" fill="${fill}" stroke="#ffffff" stroke-width="0.6" stroke-linejoin="round"/>`;
      }).join('');
      const palette = COLOR_PALETTES[layerKey] || COLOR_PALETTES.pop;
      const mm = getLayerMinMax(layerKey);
      const swatches = palette.map(c => `<span class="sw" style="background:${c}"></span>`).join('');
      const label = getLayerLabelForLayer(layerKey) || layerKey;
      const unit = getLayerUnit(layerKey);
      return `
        <section class="snap-map-block">
        <h2>Karte — ${label}${unit ? ' (' + unit + ')' : ''}</h2>
        <svg class="snap-map" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Choroplethenkarte ${label}">
          <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
          ${paths}
        </svg>
        <div class="map-legend">
          <span class="map-legend-min">${formatLayerValue(mm.min, layerKey)}</span>
          ${swatches}
          <span class="map-legend-max">${formatLayerValue(mm.max, layerKey)}</span>
          <span class="map-legend-note">${dists.length} Ortsbezirke · Choroplethenkarte aus dem Live-Dashboard</span>
        </div>
        </section>`;
    }
    const mapBlock = buildSnapshotMap(currentLayer);

    const html = `<!DOCTYPE html><html lang="de"><head>
      <meta charset="utf-8"><title>Wiesbaden-Lagebild · Stand ${today}</title>
      ${css}
    </head><body>
      <button class="no-print btn-with-icon" onclick="window.print()">${wbIcon('file-text', 14)}<span>Als PDF speichern (Browser → Drucken → "Als PDF speichern")</span></button>
      <h1>Wiesbaden-Lagebild · Stand ${today}</h1>
      <div class="stand">Stadt-Snapshot · Landeshauptstadt Wiesbaden · v2.8</div>

      <h2>KPI-Übersicht (${cards.length} Indikatoren)</h2>
      <div class="kpi-grid">${kpiBlock}</div>

      ${mapBlock}

      ${air ? `<h3>Live-Daten</h3>
        <div style="font-size: 12px; line-height: 1.6;">
          ${wbIcon('wind', 13)} Luftqualität (UBA · DEHE112 Schiersteiner): NO₂ Ø ${airHead.no2_avg} µg/m³ · PM₁₀ Ø ${airHead.pm10_avg} µg/m³ · PM₂,₅ Ø ${airHead.pm25_avg} µg/m³
          <span class="badge">${fmtStand(KPI_STAND.air)}</span>
          ${fuel ? `<br>${wbIcon('fuel', 13)} Günstigster Super E10 (Tankerkönig): ${fuel.e10.toFixed(3).replace('.',',')} € · ${fuel.brand} ${fuel.addr || fuel.address || ''}<span class="badge">${fmtStand(KPI_STAND.fuel)}</span>` : ''}
        </div>` : ''}

      <h2>Daten-Stories (${stories.length})</h2>
      ${storyBlock}

      <h2>Datenquellen</h2>
      <ul class="sources">${sourcesBlock}</ul>

      <footer>
        Quellen: opendata.cloud.wiesbaden.de · destatis Genesis · Umweltbundesamt · Bundeskartellamt MTS-K · OpenStreetMap.<br>
        Lizenzen: Datenlizenz Deutschland — Namensnennung 2.0 (Stadt, destatis, UBA) · CC BY 4.0 (MTS-K) · ODbL (OSM).<br>
        Kein personenbezogener Datenpunkt. Kein Backend. Erstellt am ${today} aus dem aktuellen Browser-Stand.<br>
        <em>Wiesbaden-Lagebild — Mock-up · Bewerbung Amt für Statistik und Stadtforschung · Sujin Park</em>
      </footer>
    </body></html>`;

    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) {
      alert(t('pdf_export_blocked', 'Pop-up blockiert? Bitte erlauben und erneut klicken.'));
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // ----- v2.8 First-time visitor onboarding (audit §6.1 hint + BMWK pattern) -----
  // Opens automatically once per browser; localStorage flag prevents re-opening.
  // Citizens who clear storage / use private browsing see it again — that's fine.
  const ONBOARDING_KEY = 'wiesbaden_lagebild_seen_onboarding';
  function setupOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    const closeBtn = document.getElementById('onb-close');
    if (!modal || !closeBtn) return;
    let seen = false;
    try { seen = localStorage.getItem(ONBOARDING_KEY) === '1'; } catch (e) {}
    if (!seen) {
      // Defer slightly so the page paints first
      setTimeout(() => modal.classList.add('active'), 600);
    }
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch (e) {}
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch (e2) {}
      }
    });
    // Allow re-open via footer
    const reopenBtn = document.getElementById('onboarding-reopen');
    if (reopenBtn) reopenBtn.addEventListener('click', e => {
      e.preventDefault();
      modal.classList.add('active');
    });
  }

  // ----- Footer link handlers -----
  function setupFooterLinks() {
    const aiLink = document.getElementById('open-ai-register');
    const metaLink = document.getElementById('open-meta-usage');
    const pdfBtn  = document.getElementById('pdf-snapshot-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportSnapshotPDF);
    const aiModal = document.getElementById('ai-modal');
    const metaModal = document.getElementById('meta-modal');
    if (aiLink && aiModal) {
      aiLink.addEventListener('click', () => {
        renderAIRegister();
        aiModal.classList.add('active');
      });
      aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) aiModal.classList.remove('active');
      });
    }
    if (metaLink && metaModal) {
      metaLink.addEventListener('click', () => {
        renderMetaUsage();
        metaModal.classList.add('active');
      });
      metaModal.addEventListener('click', (e) => {
        if (e.target === metaModal) metaModal.classList.remove('active');
      });
    }

    // Address search
    const addrBtn = document.getElementById('address-search-btn');
    const addrInput = document.getElementById('address-input');
    if (addrBtn && addrInput) {
      const search = () => {
        const q = addrInput.value.trim();
        if (!q) return;
        const districts = D.ORTSBEZIRKE;
        // Heuristic match — find district name in query, else random hit
        let match = districts.find(d => q.toLowerCase().includes(d.name.toLowerCase().split('/')[0].toLowerCase()));
        if (!match) match = districts.find(d => d.name === 'Mitte') || districts[0];
        // Trigger detail panel via existing showDetail or a simpler scroll
        const evt = new CustomEvent('district-selected', { detail: match });
        document.dispatchEvent(evt);
        // Simple toast feedback
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:12px 20px;border-radius:6px;z-index:10000;font-size:13px;animation:toastIn 0.3s;';
        toast.textContent = `Treffer: ${match.name} (Ortsbezirk ${match.id})`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      };
      addrBtn.addEventListener('click', search);
      addrInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
    }
  }

  // ----- Re-render on language change -----
  function setupLanguageReact() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Wait for original setLanguage to finish, then force re-render
        setTimeout(() => {
          const grid = document.getElementById('kpi-grid');
          if (grid) grid.innerHTML = ''; // Hard clear first
          renderKpiGrid();
          renderFuelTop3();
          renderFuelTable();
          renderFuelMiniMap();
          renderFuelCitizenList();
          renderGrocery();
          renderEconomy();
          renderCitizenScience();
          renderWohnungsmarkt();
          try { renderDemokratie(); } catch (e) {}
          try { renderKiezHeadlines(); } catch (e) {}
          try { fillMoSelectOptions(); } catch (e) {}
          // Re-render currently open modals
          const curatorModal = document.getElementById('curator-modal');
          if (curatorModal && curatorModal.classList.contains('active')) renderCuratorModal();
          const aiModal = document.getElementById('ai-modal');
          if (aiModal && aiModal.classList.contains('active')) renderAIRegister();
          const metaModal = document.getElementById('meta-modal');
          if (metaModal && metaModal.classList.contains('active')) renderMetaUsage();
          const kitaModal = document.getElementById('kita-modal');
          if (kitaModal && kitaModal.classList.contains('active')) {
            const activeBand = kitaModal.querySelector('.kita-tab.active')?.dataset.kitaBand || 'u3';
            renderKitaModal(activeBand);
          }
        }, 150);
      });
    });
  }

  // ===== v2.1 Wohnungsmarkt (real Wiesbaden housing data) =====
  let wmTrendChart = null;

  function fmtEur(v) { return '€' + Number(v).toFixed(2); }

  function renderWmStats() {
    const el = document.getElementById('wm-stats');
    if (!el || !D.MIETSPIEGEL_2025 || !D.ANGEBOTSMIETEN_TIMELINE) return;
    const ag2024 = D.ANGEBOTSMIETEN_TIMELINE.find(y => y.jahr === 2024);
    const cells = D.MIETSPIEGEL_2025.cells.map(c => c.mittel).sort((a,b)=>a-b);
    const msMedian = cells[Math.floor(cells.length/2)];
    const angebot = ag2024 ? ag2024.durchschnittsmiete_median_in_euro_je_qm : null;
    const gap = angebot && msMedian ? ((angebot - msMedian) / msMedian * 100) : 0;
    const yearStart = D.ANGEBOTSMIETEN_TIMELINE[D.ANGEBOTSMIETEN_TIMELINE.length-1];
    const yearEnd = D.ANGEBOTSMIETEN_TIMELINE[0];
    const trendPct = yearStart && yearEnd
      ? ((yearEnd.durchschnittsmiete_median_in_euro_je_qm - yearStart.durchschnittsmiete_median_in_euro_je_qm)
         / yearStart.durchschnittsmiete_median_in_euro_je_qm * 100)
      : 0;

    el.innerHTML = `
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${fmtEur(angebot)}</span>
        <span class="grocery-stat-label">${t('wm_kpi_angebot', 'Angebot 2024 · Median €/m²')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${fmtEur(msMedian)}</span>
        <span class="grocery-stat-label">${t('wm_kpi_bestand', 'Mietspiegel 2025 · Median')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value" style="color: var(--accent-warm);">+${gap.toFixed(1)}%</span>
        <span class="grocery-stat-label">${t('wm_kpi_gap', 'Angebot vs Bestand')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">+${trendPct.toFixed(0)}%</span>
        <span class="grocery-stat-label">${t('wm_kpi_trend', 'Angebote 2007→2024')}</span>
      </div>
    `;
  }

  function renderWmTrend() {
    const canvas = document.getElementById('wm-trend-chart');
    if (!canvas || !D.ANGEBOTSMIETEN_TIMELINE || typeof Chart === 'undefined') return;
    const sorted = D.ANGEBOTSMIETEN_TIMELINE.slice().sort((a,b)=>a.jahr-b.jahr);
    const labels = sorted.map(r => r.jahr);
    const median = sorted.map(r => r.durchschnittsmiete_median_in_euro_je_qm);
    const small = sorted.map(r => r.durchschnittsmiete_median_in_euro_0_40_qm);
    const large = sorted.map(r => r.durchschnittsmiete_median_in_euro_100_qm);

    if (wmTrendChart) wmTrendChart.destroy();
    wmTrendChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: t('wm_chart_median', 'Median (alle Größen)'),
            data: median, borderColor: '#1B2B4C',
            backgroundColor: 'rgba(27, 43, 76, 0.12)', borderWidth: 2.5, tension: 0.25, pointRadius: 2, fill: true },
          { label: t('wm_chart_small', '<40 m² (klein)'),
            data: small, borderColor: '#9e9ac8', borderWidth: 1.5, tension: 0.25, pointRadius: 0, borderDash: [4,4], fill: false },
          { label: t('wm_chart_large', '>100 m² (groß)'),
            data: large, borderColor: '#41b6c4', borderWidth: 1.5, tension: 0.25, pointRadius: 0, borderDash: [4,4], fill: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: €${ctx.parsed.y.toFixed(2)}/m²` } }
        },
        scales: {
          x: { ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(140,149,176,0.08)' } },
          y: { ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => '€' + v }, grid: { color: 'rgba(140,149,176,0.08)' } }
        }
      }
    });
  }

  function renderWmMatrix() {
    const table = document.getElementById('wm-matrix-table');
    if (!table || !D.MIETSPIEGEL_2025) return;
    const size = (document.getElementById('wm-matrix-size') || {}).value || 'B';
    const aus = (document.getElementById('wm-matrix-aus') || {}).value || 'b';
    const M = D.MIETSPIEGEL_2025;
    const baualters = ['I','II','III','IV'];
    const wohnlagen = ['einfach','mittel','gut','sehr_gut'];
    const cells = M.cells;

    function get(ba, wl) {
      return cells.find(c => c.baualter===ba && c.groesse===size && c.ausstattung===aus && c.wohnlage===wl);
    }

    // Choropleth via min-max of currently-shown cells
    const visible = baualters.flatMap(ba => wohnlagen.map(wl => get(ba,wl))).filter(Boolean);
    const vals = visible.map(c => c.mittel);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    function bg(v) {
      if (v == null) return 'transparent';
      const r = (v - mn) / (mx - mn || 1);
      // Use the same Purples palette as the foreign layer for visual coherence
      const palette = ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'];
      const idx = Math.min(palette.length-1, Math.floor(r * palette.length));
      return palette[idx];
    }
    function fg(v) {
      if (v == null) return 'var(--text-tertiary)';
      const r = (v - mn) / (mx - mn || 1);
      return r > 0.55 ? '#fff' : 'var(--text-primary)';
    }

    const wlLabels = M.meta.labels.wohnlage;
    const baLabels = M.meta.labels.baualter;
    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('wm_matrix_th_baualter', 'Baujahr')}</th>
          ${wohnlagen.map(wl => `<th style="text-align:right;">${wlLabels[wl]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${baualters.map(ba => `
          <tr>
            <td><strong>${baLabels[ba]}</strong></td>
            ${wohnlagen.map(wl => {
              const c = get(ba, wl);
              if (!c) return '<td style="text-align:right; color: var(--text-tertiary);">—</td>';
              const span = c.spanne ? `<div style="font-size:10px; opacity:0.8;">${c.spanne[0].toFixed(2)}–${c.spanne[1].toFixed(2)}</div>` : '';
              return `<td style="text-align:right; background:${bg(c.mittel)}; color:${fg(c.mittel)};">
                <strong>${c.mittel.toFixed(2)} €</strong>${span}
              </td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  function renderWmGap() {
    const grid = document.getElementById('wm-gap-grid');
    if (!grid || !D.MIETSPIEGEL_2025 || !D.ANGEBOTSMIETEN_TIMELINE) return;
    const ag2024 = D.ANGEBOTSMIETEN_TIMELINE.find(y => y.jahr === 2024);
    if (!ag2024) return;

    // Use 60-100 m², mit Heizung+Bad, mittlere Wohnlage as the "typical" baseline
    const baseline = D.MIETSPIEGEL_2025.cells.find(c =>
      c.groesse === 'B' && c.ausstattung === 'b' && c.wohnlage === 'mittel' && c.baualter === 'III');

    function row(label, marketVal, mietspiegelVal, note) {
      const gap = mietspiegelVal ? ((marketVal - mietspiegelVal) / mietspiegelVal * 100) : 0;
      const cls = gap >= 0 ? 'positive' : 'negative';
      const sign = gap >= 0 ? '+' : '';
      return `
        <div class="economy-card">
          <div class="economy-card-label">${label}</div>
          <div class="economy-card-value">${fmtEur(marketVal)}</div>
          <div class="economy-card-change ${cls}">${sign}${gap.toFixed(1)}% ${t('wm_gap_vs', 'vs Mietspiegel')} ${fmtEur(mietspiegelVal)}</div>
          ${note ? `<div style="font-size:11px; color: var(--text-tertiary); margin-top:6px;">${note}</div>` : ''}
        </div>
      `;
    }

    grid.innerHTML = [
      row(t('wm_gap_overall', 'Gesamtmedian'),
          ag2024.durchschnittsmiete_median_in_euro_je_qm,
          (D.MIETSPIEGEL_2025.cells.map(c => c.mittel).sort((a,b)=>a-b)[Math.floor(D.MIETSPIEGEL_2025.cells.length/2)]),
          t('wm_gap_overall_note', 'Angebote 2024 vs Mietspiegel-Median')),
      row(t('wm_gap_typical', 'Typ. Wohnung 60–100 m²'),
          ag2024.durchschnittsmiete_median_in_euro_60_80_qm,
          baseline ? baseline.mittel : null,
          t('wm_gap_typical_note', 'Standard mittlere Wohnlage, 1975–99')),
      row(t('wm_gap_small', 'Kleine Wohnung <40 m²'),
          ag2024.durchschnittsmiete_median_in_euro_0_40_qm,
          (D.MIETSPIEGEL_2025.cells.find(c => c.groesse==='A' && c.ausstattung==='b' && c.wohnlage==='mittel' && c.baualter==='IV') || {}).mittel,
          t('wm_gap_small_note', 'Höchster Aufschlag — Studentenmarkt')),
      row(t('wm_gap_first', 'Erstbezug (neu)'),
          ag2024.durchschnittsmiete_median_in_euro_bei_erstbezug,
          (D.MIETSPIEGEL_2025.cells.find(c => c.groesse==='B' && c.ausstattung==='c' && c.wohnlage==='gut' && c.baualter==='IV') || {}).mittel,
          t('wm_gap_first_note', 'Neubau, gute Lage'))
    ].join('');
  }

  function setupWmTabs() {
    document.querySelectorAll('[data-wm-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.wmTab;
        document.querySelectorAll('[data-wm-tab]').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#wm-trend, #wm-matrix, #wm-gap, #wm-boden').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('wm-' + target).classList.add('active');
        // Charts need explicit redraw when a hidden canvas becomes visible
        if (target === 'trend') renderWmTrend();
        if (target === 'boden') renderWmBoden();
      });
    });
    const sizeSel = document.getElementById('wm-matrix-size');
    const ausSel = document.getElementById('wm-matrix-aus');
    if (sizeSel) sizeSel.addEventListener('change', renderWmMatrix);
    if (ausSel) ausSel.addEventListener('change', renderWmMatrix);
  }

  // ===== v2.1 Bodenrichtwert (25-year real-estate price index) =====
  let wmBodenChart = null;
  function renderWmBoden() {
    if (!D.BODENRICHTWERT_TIMELINE) return;
    const stats = document.getElementById('wm-boden-stats');
    const canvas = document.getElementById('wm-boden-chart');
    const series = D.BODENRICHTWERT_TIMELINE;
    const oldest = series[0], newest = series[series.length - 1];
    function pct(a, b) { return ((b - a) / a * 100); }

    if (stats) {
      const land = pct(oldest.wohnbauland_durchschnittspreise_eur_pro_qm, newest.wohnbauland_durchschnittspreise_eur_pro_qm);
      const apt = pct(oldest.durchschnittspreise_eur_pro_qm_eigentumswohnungen, newest.durchschnittspreise_eur_pro_qm_eigentumswohnungen);
      const newBuild = pct(oldest.durchschnittspreise_eur_pro_qm_neubauwohnungen, newest.durchschnittspreise_eur_pro_qm_neubauwohnungen);
      const efh = pct(oldest.durchschnittspreise_1000_eur_freistehende_einfamilienhaeuser, newest.durchschnittspreise_1000_eur_freistehende_einfamilienhaeuser);
      stats.innerHTML = `
        <div class="grocery-stat-item">
          <span class="grocery-stat-value">€${newest.wohnbauland_durchschnittspreise_eur_pro_qm}</span>
          <span class="grocery-stat-label">${t('wm_boden_kpi_land', 'Wohnbauland 2024 · €/m²')} <span style="color: var(--accent-warm);">+${land.toFixed(0)}%</span></span>
        </div>
        <div class="grocery-stat-item">
          <span class="grocery-stat-value">€${newest.durchschnittspreise_eur_pro_qm_eigentumswohnungen.toLocaleString('de-DE')}</span>
          <span class="grocery-stat-label">${t('wm_boden_kpi_apt', 'Eigentumswohnung 2024 · €/m²')} <span style="color: var(--accent-warm);">+${apt.toFixed(0)}%</span></span>
        </div>
        <div class="grocery-stat-item">
          <span class="grocery-stat-value">€${newest.durchschnittspreise_eur_pro_qm_neubauwohnungen.toLocaleString('de-DE')}</span>
          <span class="grocery-stat-label">${t('wm_boden_kpi_new', 'Neubau 2024 · €/m²')} <span style="color: var(--accent-warm);">+${newBuild.toFixed(0)}%</span></span>
        </div>
        <div class="grocery-stat-item">
          <span class="grocery-stat-value">€${newest.durchschnittspreise_1000_eur_freistehende_einfamilienhaeuser}k</span>
          <span class="grocery-stat-label">${t('wm_boden_kpi_efh', 'Einfamilienhaus 2024')} <span style="color: var(--accent-warm);">+${efh.toFixed(0)}%</span></span>
        </div>
      `;
    }

    if (!canvas || typeof Chart === 'undefined') return;
    if (wmBodenChart) wmBodenChart.destroy();
    wmBodenChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: series.map(r => r.jahr),
        datasets: [
          { label: t('wm_boden_land', 'Wohnbauland'),
            data: series.map(r => r.wohnbauland_durchschnittspreise_eur_pro_qm),
            borderColor: '#fbbf24', borderWidth: 2, tension: 0.25, pointRadius: 0, fill: false },
          { label: t('wm_boden_apt', 'Eigentumswohnung'),
            data: series.map(r => r.durchschnittspreise_eur_pro_qm_eigentumswohnungen),
            borderColor: '#6a51a3', borderWidth: 2, tension: 0.25, pointRadius: 0, fill: false },
          { label: t('wm_boden_resale', 'Wiederverkauf'),
            data: series.map(r => r.durchschnittspreise_eur_pro_qm_wiederverkauf),
            borderColor: '#41b6c4', borderWidth: 1.5, tension: 0.25, pointRadius: 0, borderDash: [4,4], fill: false },
          { label: t('wm_boden_new', 'Neubau'),
            data: series.map(r => r.durchschnittspreise_eur_pro_qm_neubauwohnungen),
            borderColor: '#1B2B4C', borderWidth: 2.5, tension: 0.25, pointRadius: 2, fill: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: €${ctx.parsed.y.toLocaleString('de-DE')}/m²` } }
        },
        scales: {
          x: { ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(140,149,176,0.08)' } },
          y: { ticks: { color: '#8C95B0', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => '€' + v }, grid: { color: 'rgba(140,149,176,0.08)' } }
        }
      }
    });
  }

  function renderWohnungsmarkt() {
    renderWmStats();
    renderWmTrend();
    renderWmMatrix();
    renderWmGap();
    renderWmBoden();
  }

  // ===== v2.2 — Kita-Versorgung citizen modal =====
  // Citizen-facing breakdown when the user clicks the Kita KPI card.
  // Data: D.KITA_VERSORGUNG (extracted from the official Tagesbetreuungsbericht 2024/25).
  function fmtPct(v)   { return v.toFixed(1).replace('.', ',') + ' %'; }
  function fmtSigned(v){ return (v >= 0 ? '+' : '') + v; }
  function fmtPP(v)    { return (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + 'pp'; }

  // Quote thresholds (same scale for u3 & elem; works across both distributions).
  function kitaStatus(quote) {
    if (quote < 30)        return 'critical';
    if (quote < 95)        return 'under';
    if (quote <= 105)      return 'balanced';
    return 'over';
  }

  function renderKitaModal(band) {
    const data = D.KITA_VERSORGUNG;
    if (!data) return;
    band = band || 'u3';
    const sw = data.stadtweit[band];

    // Summary tiles
    const summaryEl = document.getElementById('kita-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="kita-summary-tile ${sw.bilanz < 0 ? 'crisis' : ''}">
          <div class="label">${t('kita_summary_label') || 'Stadtweit'}</div>
          <div class="value">${fmtPct(sw.quote)}</div>
          <div class="meta">${data.ortsbezirke.length} Ortsbezirke</div>
        </div>
        <div class="kita-summary-tile ${sw.bilanz < 0 ? 'crisis' : ''}">
          <div class="label">${t('kita_col_bilanz') || 'Bilanz'}</div>
          <div class="value">${fmtSigned(sw.bilanz)}</div>
          <div class="meta">${t('kita_summary_bilanz') || 'fehlende Plätze stadtweit'}</div>
        </div>
        <div class="kita-summary-tile">
          <div class="label">${t('kita_col_delta') || 'Δ ggü. Vorjahr'}</div>
          <div class="value">${fmtPP(sw.delta_pp)}</div>
          <div class="meta">${data.meta.stand}</div>
        </div>
      `;
    }

    // Sortable table — sort ascending by quote (worst first).
    const rows = data.ortsbezirke
      .map(o => ({ name: o.name, ...o[band] }))
      .sort((a, b) => a.quote - b.quote);

    const statusKey = { critical: 'kita_status_critical', under: 'kita_status_under',
                        balanced: 'kita_status_balanced', over: 'kita_status_over' };

    const tbody = document.querySelector('#kita-table tbody');
    if (tbody) {
      tbody.innerHTML = rows.map(r => {
        const st = kitaStatus(r.quote);
        const deltaCls = r.delta_pp > 0.05 ? 'kita-delta-up'
                       : r.delta_pp < -0.05 ? 'kita-delta-down'
                       : 'kita-delta-zero';
        return `
          <tr>
            <td>${r.name}</td>
            <td class="num">
              <span class="kita-status ${st}">${t(statusKey[st]) || st}</span>
              ${fmtPct(r.quote)}
            </td>
            <td class="num">${fmtSigned(r.bilanz)}</td>
            <td class="num ${deltaCls}">${fmtPP(r.delta_pp)}</td>
          </tr>
        `;
      }).join('');
    }
  }

  function setupKitaModal() {
    const modal = document.getElementById('kita-modal');
    if (!modal) return;

    // Open when the kita KPI card is clicked (delegated, survives re-render).
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-kpi="kita"]');
      if (!card) return;
      renderKitaModal('u3');
      modal.classList.add('active');
    });

    // Tab switch within the modal.
    modal.querySelectorAll('.kita-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.kita-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderKitaModal(btn.dataset.kitaBand);
      });
    });

    // Close on backdrop click.
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // ----- Init v2 features -----
  function initV2() {
    // v2.7: hydrate KPIs from build-time snapshots before first render
    applyAirSnapshot();
    applyFuelSnapshot();
    renderKpiGrid();
    // v2.7: kick off non-blocking runtime refreshes for live data sources.
    // Both functions cache 5–30 min and degrade gracefully (Mock-Badge §9.2).
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      Promise.resolve().then(() => refreshAirLive());
      Promise.resolve().then(() => refreshFuelLive());
    }
    setupCurator();
    setupAlltagTabs();
    renderFuelTop3();
    renderFuelTable();
    renderFuelMiniMap();
    renderFuelDetailDefault();
    renderFuelCitizenList();
    setupFuelPLZ();
    setupFuelReportModal();
    renderGrocery();
    renderEconomy();
    renderCitizenScience();
    renderWohnungsmarkt();
    setupWmTabs();
    setupFooterLinks();
    setupOnboarding();
    setupLanguageReact();
    setupMitmachen();
    renderMitmachenHistory();
    setupKitaModal();
    if (typeof setupKpiDetailModal === 'function') setupKpiDetailModal();
    renderDemokratie();
    setupDemoTabs();
    renderDatenkatalog();
    setupMeinOrtsbezirk();
    // v2.5 Datenkatalog Browser
    renderCatalogChips();
    renderCatalog();
    renderCatalogStats();
    setupCatalogFilters();
    // Apply deep-anchor on first load if hash already targets daten
    if ((location.hash || '').startsWith('#daten')) {
      setTimeout(applyDatenAnchor, 100);
    }
    // v2.5 Datenassistent (BM25 drawer)
    setupAssistantDrawer();
    // v2.6 Mein Kiez (citizen-perspective dashboard)
    setupKiez();
  }

  // ===== v2.1 — Demokratie view (turnout choropleth + compare + AI) =====
  let demoMap = null;
  let demoLayerGroup = null;

  // Diverging palette: low turnout = red, high = green
  const DEMO_PALETTE_DIVERGING = ['#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850'];

  function turnoutColor(pct) {
    if (pct == null) return '#444';
    const r = Math.max(0, Math.min(1, (pct - 30) / 45));
    const idx = Math.min(DEMO_PALETTE_DIVERGING.length - 1, Math.floor(r * DEMO_PALETTE_DIVERGING.length));
    return DEMO_PALETTE_DIVERGING[idx];
  }

  // IIFE-local helper — outer scope's _normName isn't visible from in here.
  function _normNameLocal(s) {
    if (!s) return '';
    return s.toLowerCase()
      .replace(/[äöüß]/g, m => ({ä:'a', ö:'o', ü:'u', ß:'ss'}[m]))
      .replace(/[\/\-\s]+/g, '');
  }

  function findTurnoutForOrtsbezirk(o) {
    return (D.ELECTION_TURNOUT || []).find(e =>
      e.name === o.name ||
      e.name_opendata === o.name ||
      _normNameLocal(e.name) === _normNameLocal(o.name) ||
      _normNameLocal(e.name_opendata || '') === _normNameLocal(o.name)
    ) || null;
  }

  function renderDemoStats() {
    const el = document.getElementById('dem-stats');
    if (!el || !D.ELECTION_TURNOUT) return;
    const all = D.ELECTION_TURNOUT.filter(e => e.wahlbeteiligung_2026 != null);
    const totalEligible = all.reduce((s, e) => s + (e.wahlberechtigte_2026 || 0), 0);
    const totalVoters = all.reduce((s, e) => s + Math.round((e.wahlberechtigte_2026 || 0) * (e.wahlbeteiligung_2026 || 0) / 100), 0);
    const cityPct = totalEligible ? (totalVoters / totalEligible * 100) : 0;
    const total21 = all.reduce((s, e) => s + (e.wahlberechtigte_2021 || 0), 0);
    const voted21 = all.reduce((s, e) => s + Math.round((e.wahlberechtigte_2021 || 0) * (e.wahlbeteiligung_2021 || 0) / 100), 0);
    const cityPct21 = total21 ? (voted21 / total21 * 100) : 0;
    const diff = cityPct - cityPct21;
    const sorted = all.slice().sort((a, b) => a.wahlbeteiligung_2026 - b.wahlbeteiligung_2026);
    const lowest = sorted[0], highest = sorted[sorted.length - 1];
    el.innerHTML = `
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${cityPct.toFixed(1)}%</span>
        <span class="grocery-stat-label">${t('dem_kpi_city', 'Wahlbeteiligung Stadt 2026')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value" style="color:#2F855A;">+${diff.toFixed(1)} pp</span>
        <span class="grocery-stat-label">${t('dem_kpi_diff', 'gegenüber 2021')}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value">${highest.wahlbeteiligung_2026.toFixed(1)}%</span>
        <span class="grocery-stat-label">${t('dem_kpi_highest', 'Höchste:')} ${highest.name}</span>
      </div>
      <div class="grocery-stat-item">
        <span class="grocery-stat-value" style="color:#B63D3D;">${lowest.wahlbeteiligung_2026.toFixed(1)}%</span>
        <span class="grocery-stat-label">${t('dem_kpi_lowest', 'Niedrigste:')} ${lowest.name}</span>
      </div>
    `;
  }

  function renderDemoLegend() {
    const el = document.getElementById('dem-legend');
    if (el) el.innerHTML = DEMO_PALETTE_DIVERGING.map(c => `<div style="flex:1; background:${c};"></div>`).join('');
  }

  function renderDemoMap() {
    const el = document.getElementById('dem-minimap');
    if (!el || typeof L === 'undefined') return;
    const districts = (D.ORTSBEZIRKE || []).filter(o => o.polygon && o.polygon.length);
    if (!districts.length) {
      console.warn('[Demokratie] No district polygons available');
      return;
    }
    if (!demoMap) {
      demoMap = L.map(el, { center: [50.0782, 8.2398], zoom: 11, zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OSM, © CartoDB', subdomains: 'abcd', maxZoom: 19
      }).addTo(demoMap);
    }
    if (demoLayerGroup) demoMap.removeLayer(demoLayerGroup);
    demoLayerGroup = L.layerGroup();
    const allPoints = [];
    districts.forEach(o => {
      const tu = findTurnoutForOrtsbezirk(o);
      const pct = tu ? tu.wahlbeteiligung_2026 : null;
      const color = turnoutColor(pct);
      const poly = L.polygon(o.polygon, {
        color: '#fff', weight: 1, opacity: 0.7,
        fillColor: color, fillOpacity: pct != null ? 0.78 : 0.2,
        smoothFactor: 1.5
      });
      poly.bindTooltip(
        `<div class="tooltip-name">${o.name}</div>` +
        `<div class="tooltip-label">${_i18nFromActiveLang('dem_tooltip_turnout', 'Wahlbeteiligung 2026')}</div>` +
        `<div class="tooltip-value">${pct != null ? pct.toFixed(1) + '%' : '—'}</div>`,
        { sticky: true, direction: 'top' }
      );
      poly.on('mouseover', function() { this.setStyle({ weight: 3, fillOpacity: 0.95 }); });
      poly.on('mouseout',  function() { this.setStyle({ weight: 1, fillOpacity: pct != null ? 0.78 : 0.2 }); });
      poly.on('click', () => showDemoDetail(o, tu));
      poly.addTo(demoLayerGroup);
      o.polygon.forEach(p => allPoints.push(p));
    });
    demoLayerGroup.addTo(demoMap);
    // Fit to all polygons — required because the map may have been initialised
    // while its container was still display:none, so the default center/zoom
    // can leave the polygons outside the viewport on first paint.
    if (allPoints.length) {
      try { demoMap.fitBounds(allPoints, { padding: [20, 20] }); } catch (e) {}
    }
    setTimeout(() => demoMap.invalidateSize(), 80);
  }

  function showDemoDetail(o, turnout) {
    const el = document.getElementById('dem-detail');
    if (!el) return;
    if (!turnout) {
      el.innerHTML = `<strong>${o.name}</strong> — ${t('dem_detail_nodata', 'keine Wahldaten verfügbar')}`;
      return;
    }
    const diff = turnout.diff_pp;
    const diffColor = diff > 0 ? '#2F855A' : '#B63D3D';
    el.innerHTML = `
      <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start;">
        <div style="flex:0 0 auto;">
          <div style="font-family: var(--font-mono); font-size:10px; letter-spacing:.08em; color: var(--text-tertiary);">${t('dem_detail_label', 'ORTSBEZIRK')}</div>
          <div style="font-size:20px; font-weight:600; margin-top:4px;">${o.name}</div>
        </div>
        <div style="display:flex; gap:18px; flex-wrap:wrap;">
          <div><div style="font-size:10px; color: var(--text-tertiary);">2026</div><div style="font-size:20px; font-weight:600;">${turnout.wahlbeteiligung_2026.toFixed(1)}%</div></div>
          <div><div style="font-size:10px; color: var(--text-tertiary);">2021</div><div style="font-size:20px; color: var(--text-secondary);">${turnout.wahlbeteiligung_2021.toFixed(1)}%</div></div>
          <div><div style="font-size:10px; color: var(--text-tertiary);">${t('dem_detail_change', 'Veränderung')}</div><div style="font-size:20px; color:${diffColor};">${diff > 0 ? '+' : ''}${diff.toFixed(1)} pp</div></div>
          <div><div style="font-size:10px; color: var(--text-tertiary);">${t('dem_detail_brief', 'Briefwahl')}</div><div style="font-size:20px;">${turnout.briefwahl_2026_pct ? turnout.briefwahl_2026_pct.toFixed(1) + '%' : '—'}</div></div>
          <div><div style="font-size:10px; color: var(--text-tertiary);">${t('dem_detail_eligible', 'Wahlberechtigte 2026')}</div><div style="font-size:20px;">${(turnout.wahlberechtigte_2026 || 0).toLocaleString('de-DE')}</div></div>
        </div>
      </div>
    `;
  }

  function renderDemoCompareTable() {
    const table = document.getElementById('dem-compare-table');
    if (!table || !D.ELECTION_TURNOUT) return;
    const rows = D.ELECTION_TURNOUT.slice().sort((a, b) => (b.wahlbeteiligung_2026 || 0) - (a.wahlbeteiligung_2026 || 0));
    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('dem_th_district', 'Ortsbezirk')}</th>
          <th style="text-align:right;">${t('dem_th_2026', 'Beteiligung 2026')}</th>
          <th style="text-align:right;">${t('dem_th_2021', '2021')}</th>
          <th style="text-align:right;">${t('dem_th_diff', 'Δ pp')}</th>
          <th style="text-align:right;">${t('dem_th_brief', 'Briefwahl 2026')}</th>
          <th style="text-align:right;">${t('dem_th_eligible', 'Wahlberechtigte')}</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          if (r.wahlbeteiligung_2026 == null) return '';
          const dColor = r.diff_pp > 0 ? '#2F855A' : '#B63D3D';
          return `
            <tr>
              <td><strong>${r.name}</strong>${r.name_opendata !== r.name ? `<br><span style="font-size:10px; color:var(--text-tertiary);">(${r.name_opendata})</span>` : ''}</td>
              <td style="text-align:right;"><span style="color:${turnoutColor(r.wahlbeteiligung_2026)}; font-weight:600;">${r.wahlbeteiligung_2026.toFixed(1)}%</span></td>
              <td style="text-align:right; color: var(--text-secondary);">${r.wahlbeteiligung_2021 != null ? r.wahlbeteiligung_2021.toFixed(1) + '%' : '—'}</td>
              <td style="text-align:right; color:${dColor};">${r.diff_pp != null ? (r.diff_pp > 0 ? '+' : '') + r.diff_pp.toFixed(1) : '—'}</td>
              <td style="text-align:right;">${r.briefwahl_2026_pct != null ? r.briefwahl_2026_pct.toFixed(1) + '%' : '—'}</td>
              <td style="text-align:right; font-family: var(--font-mono); color: var(--text-secondary);">${(r.wahlberechtigte_2026 || 0).toLocaleString('de-DE')}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  function renderDemoAI() {
    const table = document.getElementById('dem-ai-table');
    if (!table || !D.AI_REGISTER) return;
    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('ai_purpose', 'Algorithmus & Zweck')}</th>
          <th>${t('ai_type', 'Typ')}</th>
          <th>${t('ai_risk', 'Risiko')}</th>
          <th>${t('ai_since', 'Seit')}</th>
        </tr>
      </thead>
      <tbody>
        ${D.AI_REGISTER.map(a => {
          const note = pickLang(a, 'note');
          return `
            <tr>
              <td>
                <div class="ai-register-name">${pickLang(a, 'name')}</div>
                <div style="font-size:12px; color: var(--text-secondary); margin-top:3px;">${pickLang(a, 'purpose')}</div>
                ${note ? `<div class="ai-register-note">⚠ ${note}</div>` : ''}
              </td>
              <td style="font-size:11px; color: var(--text-secondary);">${a.type}</td>
              <td><span class="ai-risk-badge ai-risk-${a.risk}">${t('ai_risk_' + a.risk, a.risk)}</span></td>
              <td style="font-size:11px; color: var(--text-tertiary);">${a.since}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  function setupDemoTabs() {
    document.querySelectorAll('[data-dem-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.demTab;
        document.querySelectorAll('[data-dem-tab]').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#dem-map, #dem-compare, #dem-ai').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('dem-' + target).classList.add('active');
        if (target === 'map' && demoMap) setTimeout(() => demoMap.invalidateSize(), 50);
      });
    });
  }

  function renderDemokratie() {
    renderDemoStats();
    renderDemoLegend();
    renderDemoMap();
    renderDemoCompareTable();
    renderDemoAI();
  }

  // ===== v2.1 — Mein Ortsbezirk (personalized district view on home) =====
  const MO_KEY = 'wiesbaden_lagebild_my_ortsbezirk';

  function moCityAvg() {
    const list = D.ORTSBEZIRKE || [];
    if (!list.length) return {};
    const sum = (k) => list.reduce((s, o) => s + (Number(o[k]) || 0), 0);
    const totalPop = sum('pop') || 1;
    return {
      pop: sum('pop'),
      foreign: list.reduce((s, o) => s + (Number(o.foreign) || 0) * (Number(o.pop) || 0), 0) / totalPop,
      age: list.reduce((s, o) => s + (Number(o.age) || 0) * (Number(o.pop) || 0), 0) / totalPop,
      rent: list.reduce((s, o) => s + (Number(o.rent) || 0), 0) / list.length,
      kita_free: list.reduce((s, o) => s + (Number(o.kita_free) || 0), 0) / list.length,
      complaint_days: list.reduce((s, o) => s + (Number(o.complaint_days) || 0), 0) / list.length,
      baustellen: sum('baustellen') / list.length,
      aqi: list.reduce((s, o) => s + (Number(o.aqi) || 0), 0) / list.length,
      charging: sum('charging') / list.length
    };
  }

  function moTurnoutFor(o) {
    return (D.ELECTION_TURNOUT || []).find(e =>
      e.name === o.name ||
      e.name_opendata === o.name ||
      _normNameLocal(e.name) === _normNameLocal(o.name) ||
      _normNameLocal(e.name_opendata || '') === _normNameLocal(o.name)
    ) || null;
  }

  function moTurnoutAvg() {
    const list = D.ELECTION_TURNOUT || [];
    const valid = list.filter(e => e.wahlbeteiligung_2026 != null);
    if (!valid.length) return null;
    const totalEligible = valid.reduce((s, e) => s + (e.wahlberechtigte_2026 || 0), 0);
    const totalVoters = valid.reduce((s, e) => s + Math.round((e.wahlberechtigte_2026 || 0) * (e.wahlbeteiligung_2026 || 0) / 100), 0);
    return totalEligible ? totalVoters / totalEligible * 100 : null;
  }

  function moDeltaBadge(my, avg, unit, invert) {
    if (my == null || avg == null || avg === 0) return '';
    const diff = my - avg;
    const pct = (diff / avg) * 100;
    const better = invert ? diff < 0 : diff > 0;
    const color = Math.abs(pct) < 3 ? 'var(--text-tertiary)' : (better ? '#2F855A' : '#B63D3D');
    const sign = diff > 0 ? '+' : '';
    return `<span style="color:${color}; font-family: var(--font-mono); font-size:11px; margin-left:6px;">(${sign}${diff.toFixed(unit === '%' ? 1 : 1)}${unit || ''} ${t('mo_vs', 'vs Stadt')})</span>`;
  }

  function moCard(label, myVal, formatter, deltaHtml, sublabel) {
    return `
      <div class="grocery-stat-item" style="text-align:left; padding:10px 12px; align-items:flex-start;">
        <span style="font-family: var(--font-mono); font-size:9px; letter-spacing:.08em; color: var(--text-tertiary); margin-bottom:4px;">${label}</span>
        <span class="grocery-stat-value" style="font-size:18px; line-height:1.2;">${formatter(myVal)}</span>
        ${sublabel ? `<span class="grocery-stat-label" style="margin-top:2px;">${sublabel}</span>` : ''}
        ${deltaHtml ? `<span style="margin-top:2px;">${deltaHtml}</span>` : ''}
      </div>
    `;
  }

  // v2.7 — Mein-Bezirk wiring (audit §6.5): list Stories that focus on the
  // selected district. Stories with no `districtTags` count as citywide. Click
  // jumps directly to the story modal — closes the data-narrative loop.
  function renderMoStoriesSection(o) {
    if (!o || !Array.isArray(STORIES)) return '';
    const tagged = [];
    const citywide = [];
    STORIES.forEach((s, idx) => {
      if (Array.isArray(s.districtTags) && s.districtTags.length) {
        if (s.districtTags.includes(o.name)) tagged.push({ s, idx });
      } else {
        citywide.push({ s, idx });
      }
    });
    if (!tagged.length && !citywide.length) return '';
    const renderList = (entries) => entries.map(({ s, idx }) => {
      const title = t(s.titleKey);
      return `<button class="mo-story-link" data-mo-story="${idx}" type="button">
        <span class="mo-story-num">0${idx + 1}</span>
        <span class="mo-story-title">${title}</span>
      </button>`;
    }).join('');
    const taggedLabel = t('mo_stories_about', 'Daten-Stories über');
    const citywideLabel = t('mo_stories_citywide', 'Stadt-weite Stories (auch für hier relevant)');
    return `
      <div class="mo-stories-block" style="margin-top:18px; padding-top:14px; border-top:1px solid var(--border-subtle);">
        ${tagged.length ? `
          <div class="mo-stories-heading">${wbIcon('book-open', 14)} ${taggedLabel} <strong>${o.name}</strong> · ${tagged.length}</div>
          <div class="mo-stories-list">${renderList(tagged)}</div>
        ` : ''}
        ${citywide.length ? `
          <div class="mo-stories-heading mo-stories-heading--citywide">${citywideLabel} · ${citywide.length}</div>
          <div class="mo-stories-list">${renderList(citywide)}</div>
        ` : ''}
      </div>
    `;
  }

  function moRender(o) {
    const wrap = document.getElementById('mo-cards');
    if (!wrap) return;
    if (!o) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
    wrap.style.display = 'block';
    const avg = moCityAvg();
    const tu = moTurnoutFor(o);
    const turnoutCity = moTurnoutAvg();
    const turnoutMy = tu ? tu.wahlbeteiligung_2026 : null;
    const fmtInt = (v) => v == null ? '—' : Number(v).toLocaleString('de-DE');
    const fmtPct = (v) => v == null ? '—' : Number(v).toFixed(1) + '%';
    const fmtAge = (v) => v == null ? '—' : Number(v).toFixed(1) + ' J.';
    const fmtRent = (v) => v == null ? '—' : '€' + Number(v).toFixed(2) + '/m²';

    wrap.innerHTML = `
      <div style="display:flex; gap:12px; align-items:baseline; flex-wrap:wrap; margin-bottom:10px;">
        <h3 style="margin:0; font-family: var(--font-display); font-size:24px;">${o.name}</h3>
        <span style="font-size:11px; color: var(--text-tertiary); font-family: var(--font-mono);">Ortsbezirk ${o.id}</span>
        <span style="flex:1; text-align:right; font-size:11px; color: var(--text-tertiary);" data-i18n="mo_compare_note">Vergleich mit Stadt-Durchschnitt</span>
      </div>
      <div class="grocery-stats" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));">
        ${moCard(t('mo_lbl_pop', 'BEVÖLKERUNG'), o.pop, fmtInt, moDeltaBadge(o.pop, avg.pop / (D.ORTSBEZIRKE || []).length, '', false), t('mo_sub_pop', 'Einwohner'))}
        ${moCard(t('mo_lbl_foreign', 'AUSLÄNDERANTEIL'), o.foreign, fmtPct, moDeltaBadge(o.foreign, avg.foreign, ' pp', false), '')}
        ${moCard(t('mo_lbl_age', 'Ø ALTER'), o.age, fmtAge, moDeltaBadge(o.age, avg.age, ' J.', false), '')}
        ${o.rent != null ? moCard(t('mo_lbl_rent', 'KALTMIETE Ø'), o.rent, fmtRent, moDeltaBadge(o.rent, avg.rent, '€', false), '') : ''}
        ${o.kita_free != null ? moCard(t('mo_lbl_kita', 'KITA-PLÄTZE FREI'), o.kita_free, fmtInt, moDeltaBadge(o.kita_free, avg.kita_free, '', false), t('mo_sub_kita', 'Plätze')) : ''}
        ${turnoutMy != null ? moCard(t('mo_lbl_turnout', 'WAHLBETEILIGUNG 2026'), turnoutMy, fmtPct, moDeltaBadge(turnoutMy, turnoutCity, ' pp', false), '') : ''}
        ${o.charging != null ? moCard(t('mo_lbl_charging', 'E-LADESÄULEN'), o.charging, fmtInt, moDeltaBadge(o.charging, avg.charging, '', false), t('mo_sub_charging', 'Ladepunkte')) : ''}
        ${o.baustellen != null ? moCard(t('mo_lbl_baustellen', 'BAUSTELLEN'), o.baustellen, fmtInt, moDeltaBadge(o.baustellen, avg.baustellen, '', true), '') : ''}
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button data-mm-goto="demokratie" class="btn-secondary btn-with-icon" style="padding:7px 14px; font-size:12px;">${wbIcon('ballot', 14)} ${t('mo_action_demo', 'Mehr im Demokratie-Tab')}</button>
        <button data-mm-goto="wohnen" class="btn-secondary btn-with-icon" style="padding:7px 14px; font-size:12px;">${wbIcon('building', 14)} ${t('mo_action_wohnen', 'Mietspiegel im Wohnen-Tab')}</button>
        <button data-mm-goto="mitmachen" class="btn-secondary btn-with-icon" style="padding:7px 14px; font-size:12px;">${wbIcon('clipboard', 14)} ${t('mo_action_report', 'Mängel hier melden')}</button>
      </div>
      ${renderMoStoriesSection(o)}
    `;
    // Wire goto buttons (router already binds [data-mm-goto] but those were
    // bound at init time before this card existed)
    wrap.querySelectorAll('[data-mm-goto]').forEach(el => {
      el.addEventListener('click', () => {
        const v = el.dataset.mmGoto;
        location.hash = v === 'home' ? '' : v;
      });
    });
    // v2.7 — Mein-Bezirk story-link clicks → openStoryModal
    wrap.querySelectorAll('[data-mo-story]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.moStory, 10);
        if (typeof openStoryModal === 'function' && !isNaN(idx)) openStoryModal(idx);
      });
    });
  }

  // v2.9 — re-fillable so the district picker re-localizes on language change
  // (placeholder + "Ortsbezirk" label), preserving the current selection.
  function fillMoSelectOptions() {
    const sel = document.getElementById('mo-select');
    if (!sel) return;
    const cur = sel.value;
    const list = (D.ORTSBEZIRKE || []).slice();
    sel.innerHTML = `<option value="">— ${t('mo_pick_placeholder', 'Bitte wählen')} —</option>` +
      list.map(o => `<option value="${o.id}">${o.name} (${t('detail_district', 'Ortsbezirk')} ${o.id})</option>`).join('');
    if (cur) sel.value = cur;
  }

  function setupMeinOrtsbezirk() {
    const sel = document.getElementById('mo-select');
    const clearBtn = document.getElementById('mo-clear');
    if (!sel) return;
    const list = (D.ORTSBEZIRKE || []).slice();
    fillMoSelectOptions();

    function pick(id) {
      const o = list.find(x => x.id === id);
      moRender(o);
      try { id ? localStorage.setItem(MO_KEY, id) : localStorage.removeItem(MO_KEY); } catch (e) {}
    }

    sel.addEventListener('change', () => pick(sel.value));
    if (clearBtn) clearBtn.addEventListener('click', () => { sel.value = ''; pick(''); });

    // Restore previous selection
    let saved = '';
    try { saved = localStorage.getItem(MO_KEY) || ''; } catch (e) {}
    if (saved && list.some(o => o.id === saved)) {
      sel.value = saved;
      pick(saved);
    }
  }

  // ===== v2.5 — Datenkatalog Browser (232 Piveau-API datasets) =====
  // Citizen-facing browser of every dataset on opendata.cloud.wiesbaden.de.
  // Pure DOM filtering — deterministic, no LLM, no remote calls. The same
  // catalog feeds the Datenassistent drawer in Day 2 (BM25 search).

  const CAT_PAGE_SIZE = 50;
  const CAT_QUERY_LOG_KEY = 'wiesbaden_search_log';

  // Theme labels (DCAT-AP codes → human label, 5+1 langs)
  const THEME_LABELS = {
    SOCI: { de: 'Bevölkerung & Gesellschaft', en: 'Population & society',  tr: 'Nüfus & toplum',     ua: 'Населення', kr: '인구·사회',     ls: 'Menschen' },
    REGI: { de: 'Regionen & Städte',          en: 'Regions & cities',      tr: 'Bölgeler & şehirler', ua: 'Регіони',  kr: '지역·도시',     ls: 'Stadt-Teile' },
    TRAN: { de: 'Verkehr',                    en: 'Transport',             tr: 'Ulaşım',              ua: 'Транспорт', kr: '교통',          ls: 'Verkehr' },
    GOVE: { de: 'Verwaltung',                 en: 'Government',            tr: 'Yönetim',             ua: 'Уряд',     kr: '행정',          ls: 'Stadt-Verwaltung' },
    EDUC: { de: 'Bildung & Kultur',           en: 'Education & culture',   tr: 'Eğitim & kültür',     ua: 'Освіта',   kr: '교육·문화',     ls: 'Bildung' },
    ECON: { de: 'Wirtschaft',                 en: 'Economy',               tr: 'Ekonomi',             ua: 'Економіка', kr: '경제',          ls: 'Wirtschaft' },
    ENVI: { de: 'Umwelt',                     en: 'Environment',           tr: 'Çevre',               ua: 'Довкілля', kr: '환경',          ls: 'Umwelt' },
    HEAL: { de: 'Gesundheit',                 en: 'Health',                tr: 'Sağlık',              ua: 'Здоров’я', kr: '보건',          ls: 'Gesundheit' },
    TECH: { de: 'Technologie',                en: 'Technology',            tr: 'Teknoloji',           ua: 'Технології', kr: '기술',          ls: 'Technik' },
    AGRI: { de: 'Landwirtschaft',             en: 'Agriculture',           tr: 'Tarım',               ua: 'Сільське госп.', kr: '농업',     ls: 'Landwirtschaft' },
    JUST: { de: 'Justiz',                     en: 'Justice',               tr: 'Adalet',              ua: 'Юстиція',  kr: '사법',          ls: 'Recht' },
    INTR: { de: 'Internationales',            en: 'International',         tr: 'Uluslararası',        ua: 'Міжнародне', kr: '국제',         ls: 'International' },
    ENER: { de: 'Energie',                    en: 'Energy',                tr: 'Enerji',              ua: 'Енергетика', kr: '에너지',       ls: 'Energie' }
  };

  function themeLabel(code) {
    const langKey = (lang() === 'kr') ? 'kr' : lang();
    return (THEME_LABELS[code] && (THEME_LABELS[code][langKey] || THEME_LABELS[code].de)) || code;
  }

  // ----- search-stats log (정교화 2) -----
  function logSearchQuery(q) {
    if (!q || q.length < 2) return;
    try {
      const raw = localStorage.getItem(CAT_QUERY_LOG_KEY);
      const log = raw ? JSON.parse(raw) : [];
      log.push({ q: q.toLowerCase().trim(), ts: Date.now() });
      // Cap at 200 entries, keep most recent
      const capped = log.slice(-200);
      localStorage.setItem(CAT_QUERY_LOG_KEY, JSON.stringify(capped));
    } catch (e) {}
  }
  function loadRecentSearches(daysBack = 30) {
    try {
      const raw = localStorage.getItem(CAT_QUERY_LOG_KEY);
      if (!raw) return [];
      const log = JSON.parse(raw);
      const cutoff = Date.now() - daysBack * 86400 * 1000;
      return log.filter(e => e.ts >= cutoff);
    } catch (e) { return []; }
  }
  function topQueries(daysBack = 30, n = 8) {
    const recent = loadRecentSearches(daysBack);
    const counts = {};
    recent.forEach(e => { counts[e.q] = (counts[e.q] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([q, c]) => ({ q, c }));
  }

  // ----- catalog state -----
  const catalogState = {
    activeThemes: new Set(),
    activeFormats: new Set(),
    sort: 'modified',
    query: '',
    visibleCount: CAT_PAGE_SIZE,
    highlightId: null  // for deep-anchor (정교화 1)
  };

  function getCatalog() {
    return D.OPEN_DATA_CATALOG || [];
  }

  function uniqueThemes() {
    const counts = {};
    getCatalog().forEach(r => (r.th || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }
  function uniqueFormats() {
    const counts = {};
    getCatalog().forEach(r => (r.f || []).forEach(f => { counts[f] = (counts[f] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function filterCatalog() {
    const q = (catalogState.query || '').toLowerCase().trim();
    const themes = catalogState.activeThemes;
    const formats = catalogState.activeFormats;
    let list = getCatalog().filter(r => {
      if (q) {
        const hay = (r.t + ' ' + r.d + ' ' + (r.th || []).join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (themes.size && !(r.th || []).some(t => themes.has(t))) return false;
      if (formats.size && !(r.f || []).some(f => formats.has(f))) return false;
      return true;
    });
    if (catalogState.sort === 'title') {
      list.sort((a, b) => a.t.localeCompare(b.t, 'de'));
    } else {
      list.sort((a, b) => (b.m || '').localeCompare(a.m || ''));
    }
    return list;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderCatalogChips() {
    const themeBox = document.getElementById('cat-theme-chips');
    const fmtBox = document.getElementById('cat-format-chips');
    if (themeBox) {
      themeBox.innerHTML = uniqueThemes().map(([code, n]) => `
        <button type="button" class="catalog-chip${catalogState.activeThemes.has(code) ? ' active' : ''}"
          data-theme="${code}" aria-pressed="${catalogState.activeThemes.has(code)}">
          ${escapeHtml(themeLabel(code))} <span style="opacity:.55;">· ${n}</span>
        </button>
      `).join('');
      themeBox.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = btn.dataset.theme;
          catalogState.activeThemes.has(c) ? catalogState.activeThemes.delete(c) : catalogState.activeThemes.add(c);
          catalogState.visibleCount = CAT_PAGE_SIZE;
          renderCatalogChips();
          renderCatalog();
        });
      });
    }
    if (fmtBox) {
      fmtBox.innerHTML = uniqueFormats().map(([code, n]) => `
        <button type="button" class="catalog-chip${catalogState.activeFormats.has(code) ? ' active' : ''}"
          data-format="${code}" aria-pressed="${catalogState.activeFormats.has(code)}">
          ${escapeHtml(code)} <span style="opacity:.55;">· ${n}</span>
        </button>
      `).join('');
      fmtBox.querySelectorAll('[data-format]').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = btn.dataset.format;
          catalogState.activeFormats.has(c) ? catalogState.activeFormats.delete(c) : catalogState.activeFormats.add(c);
          catalogState.visibleCount = CAT_PAGE_SIZE;
          renderCatalogChips();
          renderCatalog();
        });
      });
    }
  }

  function renderCatalog() {
    const grid = document.getElementById('cat-grid');
    const empty = document.getElementById('cat-empty');
    const pagBtn = document.getElementById('cat-show-more');
    const pagInfo = document.getElementById('cat-pagination-info');
    const counter = document.getElementById('cat-result-count');
    if (!grid) return;

    const filtered = filterCatalog();
    const total = filtered.length;
    const allTotal = getCatalog().length;
    const slice = filtered.slice(0, catalogState.visibleCount);

    if (counter) {
      counter.textContent = `${total} / ${allTotal}`;
    }

    if (!total) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      if (pagBtn) pagBtn.hidden = true;
      if (pagInfo) pagInfo.textContent = '';
      return;
    }
    if (empty) empty.hidden = true;

    grid.innerHTML = slice.map(r => {
      const isHighlight = catalogState.highlightId === r.i;
      const themeBadges = (r.th || []).slice(0, 3).map(t =>
        `<span class="catalog-theme-badge" title="${escapeHtml(themeLabel(t))}">${escapeHtml(t)}</span>`
      ).join('');
      const fmtBadges = (r.f || []).slice(0, 3).map(f =>
        `<span class="catalog-format-badge">${escapeHtml(f)}</span>`
      ).join('');
      return `
        <a href="${r.l ? escapeHtml(r.l) : '#'}" target="_blank" rel="noopener"
           class="catalog-card${isHighlight ? ' highlight' : ''}"
           data-cat-id="${escapeHtml(r.i)}">
          <div class="catalog-card-title">${escapeHtml(r.t)}</div>
          <div class="catalog-card-desc">${escapeHtml(r.d || '')}</div>
          <div class="catalog-card-meta">
            ${themeBadges}
            ${fmtBadges}
          </div>
          <div class="catalog-card-footer">
            <span>${r.m ? 'Stand: ' + r.m : ''}</span>
            <span class="catalog-card-link">opendata.cloud ↗</span>
          </div>
        </a>
      `;
    }).join('');

    if (pagBtn) {
      pagBtn.hidden = catalogState.visibleCount >= total;
    }
    if (pagInfo) {
      pagInfo.textContent = total > 0
        ? `${Math.min(catalogState.visibleCount, total)} / ${total}`
        : '';
    }

    // Highlight scroll-to (for deep-anchor URL)
    if (catalogState.highlightId) {
      const card = grid.querySelector(`[data-cat-id="${CSS.escape(catalogState.highlightId)}"]`);
      if (card) {
        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
      catalogState.highlightId = null;
    }
  }

  function renderCatalogStats() {
    const wrap = document.getElementById('cat-stats');
    const list = document.getElementById('cat-stats-list');
    if (!wrap || !list) return;
    const top = topQueries(30, 8);
    if (!top.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    list.innerHTML = top.map(({ q, c }) => `
      <button type="button" class="catalog-stats-pill" data-q="${escapeHtml(q)}">
        ${escapeHtml(q)} <span class="catalog-stats-count">${c}×</span>
      </button>
    `).join('');
    list.querySelectorAll('[data-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('cat-search');
        if (input) {
          input.value = btn.dataset.q;
          input.dispatchEvent(new Event('input'));
          input.focus();
        }
      });
    });
  }

  function setupCatalogFilters() {
    const search = document.getElementById('cat-search');
    const sort = document.getElementById('cat-sort');
    const reset = document.getElementById('cat-reset');
    const showMore = document.getElementById('cat-show-more');
    const emptyCta = document.getElementById('cat-empty-cta');

    if (search) {
      let debounceTimer = null;
      search.addEventListener('input', () => {
        catalogState.query = search.value;
        catalogState.visibleCount = CAT_PAGE_SIZE;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          renderCatalog();
          if (search.value && search.value.length >= 3) {
            logSearchQuery(search.value);
            renderCatalogStats();
          }
        }, 180);
      });
    }
    if (sort) {
      sort.addEventListener('change', () => {
        catalogState.sort = sort.value;
        renderCatalog();
      });
    }
    if (reset) {
      reset.addEventListener('click', () => {
        catalogState.activeThemes.clear();
        catalogState.activeFormats.clear();
        catalogState.query = '';
        catalogState.visibleCount = CAT_PAGE_SIZE;
        if (search) search.value = '';
        if (sort) sort.value = 'modified';
        catalogState.sort = 'modified';
        renderCatalogChips();
        renderCatalog();
      });
    }
    if (showMore) {
      showMore.addEventListener('click', () => {
        catalogState.visibleCount += CAT_PAGE_SIZE;
        renderCatalog();
      });
    }
    if (emptyCta) {
      emptyCta.addEventListener('click', () => {
        location.hash = 'mitmachen';
        // Open the Datenwunsch panel after navigation
        setTimeout(() => {
          const panel = document.getElementById('mm-data-panel');
          if (panel) panel.style.display = 'block';
          if (typeof renderDatenwunsch === 'function') renderDatenwunsch();
        }, 200);
      });
    }
  }

  // ----- 정교화 1: deep-anchor URL parsing (#daten?id=foo&q=bar) -----
  function parseHashQuery() {
    const hash = location.hash || '';
    const qmark = hash.indexOf('?');
    if (qmark < 0) return {};
    const queryStr = hash.substring(qmark + 1);
    const params = {};
    queryStr.split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) params[decodeURIComponent(k)] = v != null ? decodeURIComponent(v) : '';
    });
    return params;
  }

  function applyDatenAnchor() {
    const params = parseHashQuery();
    if (params.q) {
      catalogState.query = params.q;
      const search = document.getElementById('cat-search');
      if (search) search.value = params.q;
    }
    if (params.id) {
      catalogState.highlightId = params.id;
      // Make sure the matching card is in the visible page
      const list = filterCatalog();
      const idx = list.findIndex(r => r.i === params.id);
      if (idx >= 0 && idx >= catalogState.visibleCount) {
        catalogState.visibleCount = Math.ceil((idx + 1) / CAT_PAGE_SIZE) * CAT_PAGE_SIZE;
      }
    }
    renderCatalog();
  }

  // v2.8 — render the "Neu im Katalog" banner (audit §11.2). Idempotent + cached;
  // only the first daten-view activation triggers the network call.
  let _neuLoaded = false;
  async function renderNeuImKatalog() {
    if (_neuLoaded) return;
    const wrap = document.getElementById('neu-im-katalog');
    if (!wrap) return;
    _neuLoaded = true;
    try {
      const items = await fetchNeuImKatalog(7, 5);
      if (!items.length) {
        wrap.style.display = 'block';
        wrap.innerHTML = `<div class="neu-im-katalog-inner">
          <h3 class="neu-im-katalog-title">📡 ${escapeHtml(t('neu_im_katalog_title', 'Diese Woche neu im Katalog'))}</h3>
          <p class="neu-im-katalog-empty">${escapeHtml(t('neu_im_katalog_empty', 'Diese Woche keine neuen Datensätze.'))}</p>
        </div>`;
        return;
      }
      wrap.style.display = 'block';
      wrap.innerHTML = `
        <div class="neu-im-katalog-inner">
          <h3 class="neu-im-katalog-title">📡 ${escapeHtml(t('neu_im_katalog_title', 'Diese Woche neu im Katalog'))}
            <span class="neu-im-katalog-count">· ${items.length}</span>
            <span class="neu-im-katalog-mode">🟢 live</span>
          </h3>
          <ul class="neu-im-katalog-list">
            ${items.map(it => `
              <li>
                <a href="${escapeHtml(it.l)}" target="_blank" rel="noopener" class="neu-im-katalog-item">
                  <span class="neu-im-katalog-date">${escapeHtml((it.m || '').slice(0, 10))}</span>
                  <span class="neu-im-katalog-itemtitle">${escapeHtml(it.t)}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } catch (e) {
      // Silently hide on failure — the rest of the catalog still works
      console.warn('Neu im Katalog fetch failed:', e && e.message);
      wrap.style.display = 'none';
      _neuLoaded = false;  // allow retry on next activation
    }
  }

  // Wire view-router → datenkatalog: when the daten view becomes visible,
  // apply any anchor params and refresh stats.
  window.addEventListener('view-changed-late', (e) => {
    if (e.detail.view === 'daten') {
      applyDatenAnchor();
      renderCatalogStats();
      renderNeuImKatalog();
    }
  });

  // ===== v2.6 — MEIN KIEZ (citizen-perspective dashboard, 6 cards) =====
  // Kiez = neighbourhood. Each card surfaces an external source we wired
  // (build-time fetched or manually curated) with a link back to the
  // authoritative provider. State is shared with Mein Ortsbezirk on home.

  function kiezDistricts() { return D.ORTSBEZIRKE || []; }
  function getKiezDistrict() {
    try {
      const saved = localStorage.getItem('wiesbaden_lagebild_my_ortsbezirk');
      if (saved) return kiezDistricts().find(o => o.id === saved) || null;
    } catch (e) {}
    return null;
  }
  function setKiezDistrict(id) {
    try {
      if (id) localStorage.setItem('wiesbaden_lagebild_my_ortsbezirk', id);
      else localStorage.removeItem('wiesbaden_lagebild_my_ortsbezirk');
    } catch (e) {}
  }

  function renderKiezHeadlines() {
    const d = getKiezDistrict();

    // Gastro — v2.6.4 shape: { meta, items }
    if (D.OSM_GASTRONOMIE) {
      const all = D.OSM_GASTRONOMIE.items || D.OSM_GASTRONOMIE;
      const list = all.filter(g => !d || g.d === d.name);
      const cafe = list.filter(x => x.t === 'cafe').length;
      const rest = list.filter(x => x.t === 'restaurant').length;
      const ghead = document.getElementById('kiez-gastro-headline');
      if (ghead) ghead.textContent = `${list.length} · ${cafe} ${t('kiez_cafe_short', 'Cafés')} · ${rest} ${t('kiez_rest_short', 'Restaurants')}`;
    }
    // Parking
    if (D.OSM_PARKING) {
      const list = D.OSM_PARKING.filter(p => !d || p.d === d.name);
      const free = list.filter(x => x.f === 'no').length;
      const paid = list.filter(x => x.f === 'yes').length;
      const phead = document.getElementById('kiez-parking-headline');
      if (phead) phead.textContent = `${list.length} · ${free} ${t('kiez_free', 'kostenlos')} · ${paid} ${t('kiez_paid', 'gebührenpflichtig')}`;
    }
    // CPI — show YoY for Eier
    if (D.CPI_TIMELINE) {
      const eier = D.CPI_TIMELINE.series.find(s => s.id === 'eier');
      const chead = document.getElementById('kiez-cpi-headline');
      if (chead && eier) {
        const first = eier.values[0], last = eier.values[eier.values.length - 1];
        const pct = ((last - first) / first * 100);
        const sign = pct >= 0 ? '+' : '';
        chead.textContent = `${eier.icon} ${t('kiez_cpi_eier_label', 'Eier')} ${sign}${pct.toFixed(1)}% (${t('kiez_cpi_window', '12 Mon.')})`;
      }
    }
    // ELW
    if (D.ELW_SCHEDULE) {
      const ehead = document.getElementById('kiez-elw-headline');
      if (ehead) ehead.textContent = `${D.ELW_SCHEDULE.bins.length} ${t('kiez_elw_bins', 'Tonnen · Rhythmen')}`;
    }
    // PKS
    if (D.PKS_2025) {
      const total = D.PKS_2025.metrics.find(m => m.id === 'total');
      const phead2 = document.getElementById('kiez-pks-headline');
      if (phead2 && total) {
        const diff = total.value_cur - total.value_prev;
        const pct = (diff / total.value_prev * 100);
        const sign = pct >= 0 ? '+' : '';
        phead2.textContent = `${total.value_cur.toLocaleString('de-DE')} · ${sign}${pct.toFixed(1)}% ${t('kiez_pks_yoy', 'ggü. 2024')}`;
      }
    }
    // Events
    if (D.EVENTS_2026) {
      const evhead = document.getElementById('kiez-events-headline');
      if (evhead) evhead.textContent = `${D.EVENTS_2026.events.length} ${t('kiez_events_count', 'Top-Events 2026')}`;
    }
    // Picker info element no longer exists — Mein Kiez now uses
    // the shared #mo-select picker in view-home (no separate UI).
  }

  // ----- detail builders -----
  // v2.6.4: Gastronomie drawer with per-category tabs (Top 10 each).
  // OSM-tag completeness (score 0..5) used as a public, ToS-clean proxy
  // for "well-curated, currently-operating" places. Google Places ToS
  // forbids displaying external ratings outside Google Maps + 30-day
  // cache limit, so we explain in-line and rank by data completeness.
  function kiezBuildGastro(district) {
    const all = (D.OSM_GASTRONOMIE && D.OSM_GASTRONOMIE.items) || [];
    const meta = (D.OSM_GASTRONOMIE && D.OSM_GASTRONOMIE.meta) || {};
    const list = all.filter(g => !district || g.d === district.name);
    const types = ['cafe', 'restaurant', 'bar', 'pub', 'biergarten', 'fast_food'];

    // Pick a default tab: most-populated category in the current selection.
    // Fall back to 'restaurant' if no items.
    const counts = Object.fromEntries(types.map(tp => [tp, list.filter(x => x.t === tp).length]));
    const defaultTab = types
      .filter(tp => counts[tp] > 0)
      .sort((a, b) => counts[b] - counts[a])[0] || 'restaurant';

    const tabs = types.map(tp => {
      const c = counts[tp];
      const disabled = c === 0;
      return `<button type="button" class="kiez-tab${tp === defaultTab ? ' active' : ''}${disabled ? ' kiez-tab-disabled' : ''}" data-kiez-tab="${tp}"${disabled ? ' disabled' : ''}>
        <span class="kiez-tab-label">${escapeHtml(t('kiez_amenity_' + tp, tp))}</span>
        <span class="kiez-tab-count">${c}</span>
      </button>`;
    }).join('');

    // Pre-render Top-10 panels for each type (cheap; max 60 venues).
    const renderVenue = (s) => {
      const tags = [];
      if (s.c) tags.push(`<span class="kiez-tag">${escapeHtml(s.c)}</span>`);
      if (s.os === 'yes') tags.push(`<span class="kiez-tag">${t('kiez_gastro_outdoor', '🌤 Terrasse')}</span>`);
      if (s.wc === 'yes') tags.push(`<span class="kiez-tag">${t('kiez_gastro_wheelchair', '♿ barrierefrei')}</span>`);
      const links = [];
      if (s.w) links.push(`<a href="${escapeHtml(s.w)}" target="_blank" rel="noopener" class="kiez-link">${t('kiez_gastro_website', 'Website ↗')}</a>`);
      if (s.h) links.push(`<span class="kiez-hours" title="${escapeHtml(s.h)}">🕐 ${escapeHtml(s.h.length > 30 ? s.h.slice(0,28)+'…' : s.h)}</span>`);
      const score = '★'.repeat(Math.max(1, s.s || 0));
      return `
        <div class="kiez-venue-item">
          <div class="kiez-venue-row">
            <div class="kiez-venue-name">${escapeHtml(s.n)}</div>
            <div class="kiez-venue-score" title="${t('kiez_gastro_score_hint', 'OSM-Datenvollständigkeit')}">${score}</div>
          </div>
          <div class="kiez-venue-sub">${escapeHtml(t('kiez_amenity_' + s.t, s.t))}${s.d ? ' · ' + escapeHtml(s.d) : ''}</div>
          ${tags.length ? `<div class="kiez-venue-meta">${tags.join(' ')}</div>` : ''}
          ${links.length ? `<div class="kiez-venue-links">${links.join(' · ')}</div>` : ''}
        </div>`;
    };

    const panels = types.map(tp => {
      const top = list
        .filter(x => x.t === tp && x.n)
        .sort((a, b) => (b.s || 0) - (a.s || 0) || a.n.localeCompare(b.n, 'de'))
        .slice(0, 10);
      const empty = `<p class="kiez-tab-empty">${escapeHtml(t('kiez_gastro_tab_empty', 'Keine Einträge in dieser Kategorie für die aktuelle Auswahl.'))}</p>`;
      return `<div class="kiez-tab-panel${tp === defaultTab ? ' active' : ''}" data-kiez-panel="${tp}">${
        top.length ? `<div class="kiez-venues-list">${top.map(renderVenue).join('')}</div>` : empty
      }</div>`;
    }).join('');

    const fetched = meta.fetched
      ? `<span class="kiez-stand">${escapeHtml(t('kiez_stand', 'Stand:'))} ${escapeHtml(meta.fetched)}</span>`
      : '';

    return {
      title: t('kiez_gastro_title', 'Gastronomie'),
      body: `
        <h4 class="kiez-section-h4">${escapeHtml(t('kiez_gastro_top_title', 'Top 10 pro Kategorie'))}</h4>
        <p class="kiez-section-note">${escapeHtml(t('kiez_gastro_top_note', 'Sortiert nach OSM-Tag-Vollständigkeit (Name · Küche · Öffnungszeiten · Website · Barrierefreiheit). Kein Bewertungs-Score — die Google-Places-API verbietet das Anzeigen externer Sterne. Vollständig gepflegte Einträge sind aber ein guter Proxy für „wirklich offene, gut betreute" Orte.'))}</p>
        <div class="kiez-tabs" role="tablist">${tabs}</div>
        <div class="kiez-tab-panels">${panels}</div>
        <p class="kiez-source-note">
          ${fetched}
          ${escapeHtml(t('kiez_gastro_note', 'Quelle: OpenStreetMap, Community-gepflegt. Neue Lokale brauchen Tage bis Wochen, bis sie eingetragen werden. ODbL.'))}
        </p>
      `,
      sourceUrl: meta.source_url || 'https://www.openstreetmap.org/relation/62496',
      sourceLabel: t('kiez_source_osm', 'OpenStreetMap ↗'),
      onMount: function() {
        // Tab click handler (scoped to the drawer instance).
        const det = document.getElementById('kiez-detail');
        if (!det) return;
        det.querySelectorAll('.kiez-tab').forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const tp = btn.dataset.kiezTab;
            det.querySelectorAll('.kiez-tab').forEach(b => b.classList.toggle('active', b === btn));
            det.querySelectorAll('.kiez-tab-panel').forEach(p =>
              p.classList.toggle('active', p.dataset.kiezPanel === tp)
            );
          });
        });
      }
    };
  }

  function kiezBuildParking(district) {
    const list = (D.OSM_PARKING || []).filter(p => !district || p.d === district.name);
    const cap = list.reduce((s, x) => s + (x.c || 0), 0);
    const free = list.filter(x => x.f === 'no').length;
    const paid = list.filter(x => x.f === 'yes').length;
    const unknown = list.filter(x => x.f === 'unknown').length;
    // Free + named, sorted by capacity desc (when known).
    const freeNamed = list
      .filter(x => x.f === 'no' && x.n)
      .sort((a, b) => (b.c || 0) - (a.c || 0))
      .slice(0, 10);
    const paidNamed = list
      .filter(x => x.f === 'yes' && x.n)
      .sort((a, b) => (b.c || 0) - (a.c || 0))
      .slice(0, 5);
    const renderRow = (p) => {
      const tags = [];
      if (p.c) tags.push(`${p.c} ${t('kiez_park_spots_short', 'Plätze')}`);
      if (p.t && p.t !== 'surface') tags.push(t('kiez_park_type_' + p.t, p.t));
      if (p.wc === 'yes') tags.push('♿');
      if (p.op) tags.push(escapeHtml(p.op));
      return `
        <div class="kiez-venue-item">
          <div class="kiez-venue-row">
            <div class="kiez-venue-name">${escapeHtml(p.n)}</div>
            <div class="kiez-venue-score">${p.f === 'no' ? `<span class="kiez-tag-good">${t('kiez_free', 'kostenlos')}</span>` : `<span class="kiez-tag-warn">${t('kiez_paid', 'gebührenpflichtig')}</span>`}</div>
          </div>
          <div class="kiez-venue-sub">${p.d ? escapeHtml(p.d) : ''}${tags.length ? ' · ' + tags.join(' · ') : ''}</div>
        </div>`;
    };
    return {
      title: t('kiez_parking_title', 'Parken'),
      body: `
        <div class="kiez-stat-grid">
          <div class="kiez-stat-cell"><div class="kiez-stat-label">${t('kiez_park_total', 'Total')}</div><div class="kiez-stat-value">${list.length}</div></div>
          <div class="kiez-stat-cell"><div class="kiez-stat-label">${t('kiez_park_free', 'Kostenlos')}</div><div class="kiez-stat-value" style="color:#2d8659;">${free}</div></div>
          <div class="kiez-stat-cell"><div class="kiez-stat-label">${t('kiez_park_paid', 'Gebührenpflichtig')}</div><div class="kiez-stat-value">${paid}</div></div>
          <div class="kiez-stat-cell"><div class="kiez-stat-label">${t('kiez_park_unknown', 'Unbekannt')}</div><div class="kiez-stat-value">${unknown}</div></div>
        </div>
        ${cap > 0 ? `<p style="font-size:12px; color: var(--text-secondary, var(--text-muted));">${t('kiez_park_capacity_note', 'Bekannte Stellplätze gesamt:')} <strong>${cap}</strong></p>` : ''}
        ${freeNamed.length ? `
          <h4 class="kiez-section-h4">${wbIcon('check', 13)} ${escapeHtml(t('kiez_park_free_title', 'Kostenlos parken — benannte Plätze'))}</h4>
          <div class="kiez-venues-list">${freeNamed.map(renderRow).join('')}</div>
        ` : ''}
        ${paidNamed.length ? `
          <h4 class="kiez-section-h4">${wbIcon('euro', 13)} ${escapeHtml(t('kiez_park_paid_title', 'Größte gebührenpflichtige Anlagen'))}</h4>
          <div class="kiez-venues-list">${paidNamed.map(renderRow).join('')}</div>
        ` : ''}
        <p class="kiez-source-note">${escapeHtml(t('kiez_park_osm_note', 'Quelle: OpenStreetMap. Hoher „Unbekannt"-Anteil = nicht alle Schilder im OSM gepflegt — ggf. vor Ort prüfen.'))}</p>
      `,
      sourceUrl: 'https://www.openstreetmap.org/',
      sourceLabel: t('kiez_source_osm', 'OpenStreetMap ↗')
    };
  }

  function kiezBuildCpi() {
    const cpi = D.CPI_TIMELINE;
    if (!cpi) return { title: '', body: '' };
    const lng = lang();
    const labelKey = 'label_' + (lng === 'kr' ? 'kr' : lng);

    // Lebensmittel cells (5-Steller, Deutschland)
    const cells = cpi.series.map(s => {
      const first = s.values[0], last = s.values[s.values.length - 1];
      const pct = ((last - first) / first * 100);
      const sign = pct >= 0 ? '+' : '';
      const klass = pct > 1 ? 'kiez-stat-delta-bad' : pct < -1 ? 'kiez-stat-delta-good' : '';
      return `
        <div class="kiez-stat-cell">
          <div class="kiez-stat-label">${s.icon} ${escapeHtml(s[labelKey] || s.label_de)}</div>
          <div class="kiez-stat-value">${last.toFixed(1)} <span class="kiez-stat-delta ${klass}">${sign}${pct.toFixed(1)}%</span></div>
          <div class="kiez-stat-label" style="margin-top:4px; text-transform:none;">${cpi.months[0]} → ${cpi.months[cpi.months.length - 1]}</div>
        </div>
      `;
    }).join('');

    // Gesamtindex Hessen vs Deutschland — Wiesbaden context
    let overallBlock = '';
    const ov = cpi.overall;
    if (ov && ov.hessen && ov.germany) {
      const hVals = ov.hessen.filter(v => v != null);
      const dVals = ov.germany.filter(v => v != null);
      if (hVals.length >= 2 && dVals.length >= 2) {
        const hPct = (hVals[hVals.length-1] - hVals[0]) / hVals[0] * 100;
        const dPct = (dVals[dVals.length-1] - dVals[0]) / dVals[0] * 100;
        const sgn = v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
        const klass = v => v > 1 ? 'kiez-stat-delta-bad' : v < -1 ? 'kiez-stat-delta-good' : '';
        overallBlock = `
          <h4 style="font-family:var(--font-display, 'Lora', Georgia, serif); margin:18px 0 10px; font-size:15px;">${escapeHtml(t('kiez_cpi_overall_title', 'Gesamtindex · Hessen im Vergleich'))}</h4>
          <div class="kiez-stat-grid">
            <div class="kiez-stat-cell">
              <div class="kiez-stat-label">🏴 ${escapeHtml(t('kiez_cpi_hessen', 'Hessen'))}</div>
              <div class="kiez-stat-value">${hVals[hVals.length-1].toFixed(1)} <span class="kiez-stat-delta ${klass(hPct)}">${sgn(hPct)}</span></div>
              <div class="kiez-stat-label" style="margin-top:4px; text-transform:none;">${escapeHtml(t('kiez_cpi_overall_note_geo', 'Bundesland-Wert (näher an Wiesbaden)'))}</div>
            </div>
            <div class="kiez-stat-cell">
              <div class="kiez-stat-label">🇩🇪 ${escapeHtml(t('kiez_cpi_germany', 'Deutschland'))}</div>
              <div class="kiez-stat-value">${dVals[dVals.length-1].toFixed(1)} <span class="kiez-stat-delta ${klass(dPct)}">${sgn(dPct)}</span></div>
              <div class="kiez-stat-label" style="margin-top:4px; text-transform:none;">${escapeHtml(t('kiez_cpi_overall_note_de', 'Bundes-Durchschnitt'))}</div>
            </div>
          </div>
          <p style="font-size:11px; color: var(--text-tertiary, var(--text-muted)); line-height:1.55; margin-top:8px;">
            ${escapeHtml(t('kiez_cpi_overall_caveat', 'Lebensmittel-Einzelindizes (oben) gibt es nur bundesweit — die Stichprobe je Bundesland ist zu klein. Der Gesamtindex Hessen ist der nähere verfügbare Wert für Wiesbaden.'))}
          </p>
        `;
      }
    }

    return {
      title: t('kiez_cpi_title', 'Lebensmittelpreise'),
      body: `
        <h4 style="font-family:var(--font-display, 'Lora', Georgia, serif); margin:0 0 10px; font-size:15px;">${escapeHtml(t('kiez_cpi_items_title', '5 Lebensmittel · Deutschland'))}</h4>
        <div class="kiez-stat-grid">${cells}</div>
        ${overallBlock}
        <p style="font-size:11px; color: var(--text-tertiary, var(--text-muted)); line-height:1.55; margin-top:10px;">
          ${escapeHtml(t('kiez_cpi_disclaimer', 'Quelle: destatis VPI Tabellen 61111-0006 (5-Steller), 61111-0011 (Bundesländer), 61111-0002 (Deutschland). Live über Genesis-API beim Build geladen. Index 2020 = 100.'))}
        </p>
      `,
      sourceUrl: cpi.meta.source,
      sourceLabel: t('kiez_source_destatis', 'destatis Verbraucherpreise ↗')
    };
  }

  function kiezBuildElw() {
    const e = D.ELW_SCHEDULE;
    if (!e) return { title: '', body: '' };
    const lng = lang();
    const labelKey = 'label_' + (lng === 'kr' ? 'kr' : lng);
    const rhythmKey = 'rhythm_' + (lng === 'kr' ? 'kr' : lng);
    const rows = e.bins.map(b => `
      <div class="kiez-bin-row" style="--bin-color: ${b.color};">
        <span class="kiez-bin-icon">${b.icon}</span>
        <span class="kiez-bin-label">${escapeHtml(b[labelKey] || b.label_de)}</span>
        <span class="kiez-bin-rhythm">${escapeHtml(b[rhythmKey] || b.rhythm_de)}</span>
      </div>
    `).join('');
    return {
      title: t('kiez_elw_title', 'Müllabfuhr'),
      body: `${rows}<p style="font-size:11px; color: var(--text-tertiary, var(--text-muted)); line-height:1.55;">${escapeHtml(e.meta.note_de)}</p>`,
      sourceUrl: e.meta.source_url,
      sourceLabel: e.meta.source_label || 'elw.de/abfallkalender ↗'
    };
  }

  function kiezBuildPks() {
    const p = D.PKS_2025;
    if (!p) return { title: '', body: '' };
    const lng = lang();
    const labelKey = 'label_' + (lng === 'kr' ? 'kr' : lng);
    const cells = p.metrics.map(m => {
      const a = m.value_cur, b = m.value_prev;
      const isPct = m.unit === '%';
      const diff = a - b;
      const pct = b ? ((a - b) / b * 100) : 0;
      const better = m.lower_is_better ? (diff < 0) : (diff > 0);
      const klass = Math.abs(pct) < 0.5 ? '' : (better ? 'kiez-stat-delta-good' : 'kiez-stat-delta-bad');
      const sign = diff > 0 ? '+' : '';
      const valueStr = isPct ? a.toFixed(1) + '%' : a.toLocaleString('de-DE');
      const deltaStr = isPct ? sign + diff.toFixed(1) + ' pp' : sign + pct.toFixed(1) + '%';
      return `
        <div class="kiez-stat-cell">
          <div class="kiez-stat-label">${escapeHtml(m[labelKey] || m.label_de)}</div>
          <div class="kiez-stat-value">${valueStr} <span class="kiez-stat-delta ${klass}">${deltaStr}</span></div>
          <div class="kiez-stat-label" style="text-transform:none; margin-top:4px;">${p.meta.year_prev} → ${p.meta.year_cur}</div>
        </div>
      `;
    }).join('');
    return {
      title: t('kiez_pks_title', 'Sicherheit'),
      body: `<div class="kiez-stat-grid">${cells}</div><p style="font-size:11px; color: var(--text-tertiary, var(--text-muted)); line-height:1.55;">${escapeHtml(p.meta.note_de)}</p>`,
      sourceUrl: p.meta.source_url,
      sourceLabel: p.meta.source_label || 'PKS 2025 · Polizeidirektion Wiesbaden (PDF) ↗'
    };
  }

  function kiezBuildEvents() {
    const e = D.EVENTS_2026;
    if (!e) return { title: '', body: '' };
    const sorted = e.events.slice().sort((a, b) => a.month.localeCompare(b.month));
    const monthLabels = {
      '01':'Jan','02':'Feb','03':'Mär','04':'Apr','05':'Mai','06':'Jun',
      '07':'Jul','08':'Aug','09':'Sep','10':'Okt','11':'Nov','12':'Dez'
    };
    const cards = sorted.map(ev => `
      <div class="kiez-event-item">
        <span class="kiez-event-month">${monthLabels[ev.month] || ev.month}</span>
        <div>
          <div class="kiez-event-title">${ev.icon} ${escapeHtml(ev.title_de)}</div>
          <div class="kiez-event-where">${escapeHtml(ev.where || '')}</div>
        </div>
      </div>
    `).join('');
    return {
      title: t('kiez_events_title', 'Events'),
      body: `<div class="kiez-events-list">${cards}</div><p style="font-size:11px; color: var(--text-tertiary, var(--text-muted));">${escapeHtml(e.meta.note_de)}</p>`,
      sourceUrl: e.meta.source_url,
      sourceLabel: e.meta.source_label || 'Stadt Wiesbaden Veranstaltungskalender ↗'
    };
  }

  const kiezBuilders = {
    gastro:  (d) => kiezBuildGastro(d),
    parking: (d) => kiezBuildParking(d),
    cpi:     ()  => kiezBuildCpi(),
    elw:     ()  => kiezBuildElw(),
    pks:     ()  => kiezBuildPks(),
    events:  ()  => kiezBuildEvents()
  };

  function showKiezDetail(cardId) {
    const det = document.getElementById('kiez-detail');
    const tEl = document.getElementById('kiez-detail-title');
    const bEl = document.getElementById('kiez-detail-body');
    const sEl = document.getElementById('kiez-detail-source');
    if (!det || !tEl || !bEl) return;
    const builder = kiezBuilders[cardId];
    if (!builder) return;
    const district = getKiezDistrict();
    const result = builder(district);
    tEl.textContent = result.title;
    bEl.innerHTML = result.body;
    if (sEl) {
      if (result.sourceUrl) {
        sEl.href = result.sourceUrl;
        sEl.textContent = result.sourceLabel;
        sEl.style.display = 'inline-block';
      } else {
        sEl.style.display = 'none';
      }
    }
    det.hidden = false;
    document.querySelectorAll('.kiez-card').forEach(c => {
      c.classList.toggle('active', c.dataset.kiezCard === cardId);
    });
    // v2.6.4: builders may attach interactive handlers (e.g. tab clicks)
    if (typeof result.onMount === 'function') {
      try { result.onMount(); } catch (e) { console.error('kiez onMount failed:', e); }
    }
    setTimeout(() => det.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function setupKiez() {
    // v2.6.2 — Mein Kiez is now embedded inside view-home and shares
    // the existing #mo-select picker (Mein Ortsbezirk). No separate
    // dropdown; we hook into mo-select's change event so cards refresh
    // whenever the home picker changes.
    const moSel = document.getElementById('mo-select');
    const moClear = document.getElementById('mo-clear');
    const closeBtn = document.getElementById('kiez-detail-close');
    const det = document.getElementById('kiez-detail');

    if (moSel) {
      moSel.addEventListener('change', () => renderKiezHeadlines());
    }
    if (moClear) {
      moClear.addEventListener('click', () => {
        // mo-clear runs first; defer headline refresh so MO_KEY is cleared.
        setTimeout(() => renderKiezHeadlines(), 0);
      });
    }
    document.querySelectorAll('.kiez-card').forEach(card => {
      card.addEventListener('click', () => showKiezDetail(card.dataset.kiezCard));
    });
    if (closeBtn && det) {
      closeBtn.addEventListener('click', () => {
        det.hidden = true;
        document.querySelectorAll('.kiez-card').forEach(c => c.classList.remove('active'));
      });
    }
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', () => {
        setTimeout(() => {
          renderKiezHeadlines();
          const open = document.querySelector('.kiez-card.active');
          if (open) showKiezDetail(open.dataset.kiezCard);
        }, 200);
      });
    });
    renderKiezHeadlines();
  }

  // ===== v2.5 — Datenassistent (BM25 search drawer, deterministic) =====
  // v2.8 — Piveau Living Mode (audit §11 Bonus): if the city's Piveau search
  // endpoint is reachable, queries hit the live API (CORS-frei,
  // Access-Control-Allow-Origin: *). On any failure (offline, rate-limit,
  // schema change) we fall back to the build-time Fuse.js BM25 over 232
  // cached datasets. The Algorithmus-Karte discloses both modes.
  let fuseInstance = null;
  let assistOpen = false;
  let assistSearchCache = {};  // 30-second cache by query
  let lastFocusedBeforeDrawer = null;
  let _liveModeAvailable = null;       // null = unknown, true/false after probe
  const PIVEAU_BASE = 'https://opendata.cloud.wiesbaden.de/api/hub/search';

  async function probePiveauLive() {
    if (_liveModeAvailable !== null) return _liveModeAvailable;
    try {
      const r = await fetch(`${PIVEAU_BASE}/search?q=wiesbaden&limit=1`, {
        method: 'GET', mode: 'cors',
        signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
      });
      _liveModeAvailable = r.ok;
    } catch (e) {
      _liveModeAvailable = false;
    }
    return _liveModeAvailable;
  }

  // Map a Piveau search hit to the same shape Fuse returns
  // (see _catalog.js.snippet: { i, t, d, th, f, m, l }).
  function _normalizePiveauHit(hit) {
    const titleObj = hit.title || {};
    const descObj = hit.description || {};
    const langCode = lang();
    const pickLocalized = obj => obj[langCode] || obj.de || obj.en || Object.values(obj)[0] || '';
    return {
      i:  hit.id || '',
      t:  pickLocalized(titleObj),
      d:  pickLocalized(descObj).slice(0, 220),
      th: (hit.categories || []).map(c => (c && c.id) || c).filter(Boolean),
      f:  ((hit.distributions || []).map(d => (d.format && d.format.id) || '')).filter(Boolean),
      m:  hit.modified || hit.issued || '',
      l:  `https://opendata.cloud.wiesbaden.de/app/data-catalog/${hit.id}`,
      _live: true
    };
  }

  async function searchLivePiveau(query, limit = 8) {
    const q = (query || '').trim();
    if (!q) return [];
    const url = `${PIVEAU_BASE}/search?q=${encodeURIComponent(q)}&limit=${limit}&filters=dataset`;
    const r = await fetch(url, { mode: 'cors',
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
    if (!r.ok) throw new Error('Piveau search HTTP ' + r.status);
    const json = await r.json();
    const hits = ((json.result || {}).results || []);
    return hits.map(_normalizePiveauHit);
  }

  // v2.8 "Neu im Katalog" — datasets modified in the last N days. The Piveau
  // search API expects `dateFrom` (verified empirically; audit said minDate but
  // that path returns empty). Sort by modified DESC.
  async function fetchNeuImKatalog(days = 7, limit = 5) {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const url = `${PIVEAU_BASE}/search?dateFrom=${since}&filters=dataset&limit=${limit}&sort=modified+desc`;
    const r = await fetch(url, { mode: 'cors',
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
    if (!r.ok) throw new Error('Neu-im-Katalog HTTP ' + r.status);
    const json = await r.json();
    return ((json.result || {}).results || []).map(_normalizePiveauHit);
  }

  function getFuse() {
    if (fuseInstance) return fuseInstance;
    if (typeof Fuse === 'undefined') return null;
    fuseInstance = new Fuse(getCatalog(), {
      keys: [
        { name: 't',  weight: 0.55 },
        { name: 'd',  weight: 0.30 },
        { name: 'th', weight: 0.15 }
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      distance: 200
    });
    return fuseInstance;
  }

  // v2.8 — Living Mode wrapper around BM25 fallback. Returns
  // { results, mode: 'live' | 'cache' }. async; UI must rerender on resolve.
  async function runDataSearch(query) {
    const q = (query || '').trim();
    if (!q) return { results: [], mode: 'cache' };
    const cacheKey = q.toLowerCase();
    const cached = assistSearchCache[cacheKey];
    if (cached && (Date.now() - cached.ts) < 30000) return cached.payload;

    let payload;
    const live = await probePiveauLive();
    if (live) {
      try {
        const liveHits = await searchLivePiveau(q, 8);
        // Accept live results only when non-empty; a transient empty/flaky
        // response must fall through to the cache, not blank the assistant.
        payload = liveHits.length ? { results: liveHits, mode: 'live' } : null;
      } catch (e) {
        // Live probe said yes but the request failed (rate limit? schema?) —
        // fall through to cache and remember the live mode is flaky.
        _liveModeAvailable = false;
        payload = null;
      }
    }
    if (!payload) {
      const fuse = getFuse();
      const hits = fuse ? fuse.search(q).slice(0, 5) : [];
      payload = {
        results: hits.map(h => ({ ...h.item, score: h.score })),
        mode: 'cache'
      };
    }
    // Cache only non-empty results so a transient blank doesn't persist 30 s.
    if (payload.results.length) assistSearchCache[cacheKey] = { payload, ts: Date.now() };
    return payload;
  }

  // (v2.7 sync runBM25Search removed — all callers migrated to async runDataSearch.)

  function suggestionsForLang() {
    return [
      { de: 'Wahlbeteiligung 2026',          en: 'Voter turnout 2026',          tr: 'Seçim katılımı 2026',     ua: 'Явка 2026',          kr: '2026 투표율',            ls: 'Wahl 2026' },
      { de: 'Mietspiegel Wiesbaden',         en: 'Wiesbaden rent index',        tr: 'Wiesbaden kira',           ua: 'Орендна плата',      kr: '비스바덴 임대료',         ls: 'Mieten' },
      { de: 'Ladestationen Elektroauto',     en: 'EV charging stations',        tr: 'Elektrikli şarj',          ua: 'Заряджання',         kr: '전기차 충전소',           ls: 'Auto laden' },
      { de: 'Bevölkerung Ortsbezirke',       en: 'Population per district',     tr: 'Mahalle nüfusu',           ua: 'Населення округів',  kr: '동네별 인구',             ls: 'Menschen pro Stadt-Teil' },
      { de: 'Baugenehmigungen',              en: 'Building permits',            tr: 'Yapı izinleri',            ua: 'Дозволи на будівництво', kr: '건축 허가',           ls: 'Bauen' }
    ];
  }

  function pickByLang(obj) {
    const l = lang();
    return obj[l] || obj.de || '';
  }

  function renderAssistSuggestions() {
    const el = document.getElementById('assist-results');
    if (!el) return;
    const sug = suggestionsForLang();
    el.innerHTML = `
      <div class="assist-hint">
        <strong data-i18n="assist_hint_title">${t('assist_hint_title', 'Beispielfragen')}</strong>
        <div class="assist-hint-list">
          ${sug.map(s => `<button type="button" class="assist-suggestion" data-q="${escapeHtml(pickByLang(s))}">${escapeHtml(pickByLang(s))}</button>`).join('')}
        </div>
      </div>
    `;
    el.querySelectorAll('[data-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('assist-input');
        if (!input) return;
        input.value = btn.dataset.q;
        triggerAssistSearch(btn.dataset.q);
      });
    });
  }

  function renderAssistResults(query) {
    const el = document.getElementById('assist-results');
    if (!el) return;
    // v2.8 Living Mode — async; first render a "Suche…" placeholder, then
    // hydrate with live or cached results.
    el.innerHTML = `<div class="assist-empty"><div>${escapeHtml(t('assist_searching', 'Suche…'))}</div></div>`;
    runDataSearch(query).then(({ results, mode }) => {
      // If user typed something else in the meantime, ignore stale results
      const input = document.getElementById('assist-input');
      if (input && input.value.trim() !== query.trim()) return;

      if (!results.length) {
        el.innerHTML = `
          <div class="assist-empty">
            <div data-i18n="assist_no_results_title">${t('assist_no_results_title', 'Keine Treffer für: ') + escapeHtml(query)}</div>
            <p style="margin-top:6px;" data-i18n="assist_no_results_desc">${t('assist_no_results_desc', 'Diese Daten sind möglicherweise nicht im Katalog. Möchten Sie die Stadt darum bitten?')}</p>
            <button type="button" id="assist-empty-cta" class="assist-empty-cta" data-i18n="assist_no_results_cta">${t('assist_no_results_cta', '→ Datenwunsch eintragen')}</button>
          </div>
        `;
        const cta = document.getElementById('assist-empty-cta');
        if (cta) {
          cta.addEventListener('click', () => {
            closeAssistDrawer();
            location.hash = 'mitmachen';
            setTimeout(() => {
              const panel = document.getElementById('mm-data-panel');
              if (panel) panel.style.display = 'block';
              renderDatenwunsch();
            }, 200);
          });
        }
        return;
      }

      const modeBadge = mode === 'live'
        ? `<div class="assist-mode-badge assist-mode-badge--live">🟢 ${escapeHtml(t('assist_mode_live', 'Live · opendata.cloud.wiesbaden.de'))}</div>`
        : `<div class="assist-mode-badge assist-mode-badge--cache">⚪ ${escapeHtml(t('assist_mode_cache', 'Cache · 232 Datensätze'))}</div>`;

      el.innerHTML = modeBadge + results.map((r, idx) => {
        const themeBadges = (r.th || []).slice(0, 3).map(th =>
          `<span class="catalog-theme-badge">${escapeHtml(th)}</span>`).join('');
        const fmtBadges = (r.f || []).slice(0, 3).map(f =>
          `<span class="catalog-format-badge">${escapeHtml(f)}</span>`).join('');
        const matchPct = r.score != null ? Math.round((1 - r.score) * 100) : null;
        const rank = matchPct != null
          ? `#${idx + 1} · ${matchPct}% ${t('assist_match', 'Übereinstimmung')}`
          : `#${idx + 1}`;
        return `
          <a href="${r.l ? escapeHtml(r.l) : '#'}" target="_blank" rel="noopener"
             class="assist-result-card" data-cat-id="${escapeHtml(r.i)}">
            <div class="assist-result-rank">${rank}</div>
            <div class="assist-result-title">${escapeHtml(r.t)}</div>
            <div class="assist-result-desc">${escapeHtml(r.d || '')}</div>
            <div class="assist-result-meta">${themeBadges}${fmtBadges}</div>
            <div class="assist-result-link">${r.m ? 'Stand: ' + escapeHtml(r.m.slice(0, 10)) + ' · ' : ''}opendata.cloud ↗</div>
          </a>
        `;
      }).join('');
    }).catch(e => {
      console.warn('Datenassistent search failed:', e && e.message);
      el.innerHTML = `<div class="assist-empty"><div>${escapeHtml(t('assist_error', 'Suche derzeit nicht möglich.'))}</div></div>`;
    });
  }

  function triggerAssistSearch(query) {
    const q = (query || '').trim();
    if (!q) {
      renderAssistSuggestions();
      return;
    }
    logSearchQuery(q);
    renderAssistResults(q);
    renderCatalogStats();
  }

  function openAssistDrawer() {
    const drawer = document.getElementById('assist-drawer');
    if (!drawer) return;
    lastFocusedBeforeDrawer = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    assistOpen = true;
    setTimeout(() => {
      const input = document.getElementById('assist-input');
      if (input) input.focus();
    }, 250);
  }

  function closeAssistDrawer() {
    const drawer = document.getElementById('assist-drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    assistOpen = false;
    if (lastFocusedBeforeDrawer && lastFocusedBeforeDrawer.focus) {
      lastFocusedBeforeDrawer.focus();
    }
  }

  function setupAssistantDrawer() {
    const btn = document.getElementById('assist-btn');
    const closeBtn = document.getElementById('assist-close');
    const input = document.getElementById('assist-input');
    const submit = document.getElementById('assist-submit');
    const infoBtn = document.getElementById('assist-info-toggle');
    const card = document.getElementById('assist-algorithm-card');

    if (btn) btn.addEventListener('click', () => {
      assistOpen ? closeAssistDrawer() : (openAssistDrawer(), renderAssistSuggestions());
    });
    if (closeBtn) closeBtn.addEventListener('click', closeAssistDrawer);

    let debounceTimer = null;
    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const v = input.value;
        debounceTimer = setTimeout(() => triggerAssistSearch(v), 220);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerAssistSearch(input.value);
        }
      });
    }
    if (submit) submit.addEventListener('click', () => triggerAssistSearch(input ? input.value : ''));

    if (infoBtn && card) {
      infoBtn.addEventListener('click', () => {
        const isHidden = card.hidden;
        card.hidden = !isHidden;
        infoBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && assistOpen) closeAssistDrawer();
    });

    // Re-render suggestions when language changes (assistOpen check)
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (assistOpen) {
          const v = input ? input.value : '';
          v ? renderAssistResults(v) : renderAssistSuggestions();
        }
      });
    });
  }

  // ===== v2.1 — Daten view (data-source transparency) =====
  function statusBadge(s) {
    const map = {
      live:        { bg: '#1F5C3F', label: 'LIVE' },
      static_real: { bg: '#0ea5e9', label: 'STATIC' },
      mock:        { bg: '#f59e0b', label: 'MOCK' },
      mock_demo:   { bg: '#a78bfa', label: 'DEMO-MOCK' },
      citizen:     { bg: '#1B2B4C', label: 'BÜRGER' }
    };
    const c = map[s] || { bg: '#475569', label: s.toUpperCase() };
    return `<span style="background:${c.bg}; color:#fff; padding:2px 8px; border-radius:3px; font-family: var(--font-mono); font-size:9px; letter-spacing:.06em; font-weight:600;">${c.label}</span>`;
  }

  function renderDatenkatalog() {
    const summary = document.getElementById('dk-summary');
    const table = document.getElementById('dk-table');
    if (!table || !D.DATA_SOURCES) return;

    const counts = { live: 0, static_real: 0, mock: 0, mock_demo: 0, citizen: 0 };
    D.DATA_SOURCES.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });

    if (summary) {
      summary.innerHTML = `
        <div class="grocery-stat-item"><span class="grocery-stat-value">${D.DATA_SOURCES.length}</span><span class="grocery-stat-label">${t('dk_kpi_total', 'Datenquellen insgesamt')}</span></div>
        <div class="grocery-stat-item"><span class="grocery-stat-value" style="color:#1F5C3F;">${counts.live + counts.static_real}</span><span class="grocery-stat-label">${t('dk_kpi_live', 'Echte Daten (live + static)')}</span></div>
        <div class="grocery-stat-item"><span class="grocery-stat-value" style="color:#f59e0b;">${counts.mock + counts.mock_demo}</span><span class="grocery-stat-label">${t('dk_kpi_mock', 'Mock (transparent ausgewiesen)')}</span></div>
        <div class="grocery-stat-item"><span class="grocery-stat-value" style="color:#1B2B4C;">${counts.citizen}</span><span class="grocery-stat-label">${t('dk_kpi_citizen', 'Bürger-Beiträge')}</span></div>
      `;
    }

    table.innerHTML = `
      <thead>
        <tr>
          <th>${t('dk_th_dataset', 'Datensatz')}</th>
          <th>${t('dk_th_used', 'Verwendet in')}</th>
          <th>${t('dk_th_publisher', 'Herausgeber')}</th>
          <th>${t('dk_th_license', 'Lizenz')}</th>
          <th>${t('dk_th_freq', 'Frequenz')}</th>
          <th>${t('dk_th_status', 'Status')}</th>
        </tr>
      </thead>
      <tbody>
        ${D.DATA_SOURCES.map(s => `
          <tr>
            <td>
              <strong style="font-size:13px;">${s.name_de}</strong>
              <div style="font-size:11px; color: var(--text-tertiary); margin-top:2px;">${s.source}</div>
              ${s.url && s.url !== '—' ? `<a href="${s.url}" target="_blank" rel="noopener" style="font-size:11px; color: var(--accent);">${s.url.replace(/^https?:\/\//, '').substring(0, 40)}↗</a>` : ''}
            </td>
            <td style="font-size:11px; color: var(--text-secondary);">${s.used_de}</td>
            <td style="font-size:11px;">${s.publisher}</td>
            <td style="font-family: var(--font-mono); font-size:11px;">${s.license}</td>
            <td style="font-size:11px; color: var(--text-tertiary);">${s.freq}</td>
            <td>${statusBadge(s.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  window.addEventListener('view-changed-late', (e) => {
    const v = e.detail.view;
    if (v === 'demokratie' && demoMap) {
      demoMap.invalidateSize();
      // After becoming visible, re-fit to the polygons so they're centered.
      const all = [];
      (D.ORTSBEZIRKE || []).forEach(o => {
        if (o.polygon && o.polygon.length) o.polygon.forEach(p => all.push(p));
      });
      if (all.length) {
        try { demoMap.fitBounds(all, { padding: [20, 20] }); } catch (err) {}
      }
    }
    if (v === 'alltag' && fuelMiniMap) fuelMiniMap.invalidateSize();
  });

  // ===== v2.1 — Datenwunsch (citizen vote on missing datasets) =====
  const DATENWUNSCH_KEY = 'wiesbaden_lagebild_datenwunsch_votes';
  function loadVotes() {
    try { const raw = localStorage.getItem(DATENWUNSCH_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return {};
  }
  function saveVotes(v) { try { localStorage.setItem(DATENWUNSCH_KEY, JSON.stringify(v)); } catch (e) {} }

  function renderDatenwunsch() {
    const list = document.getElementById('mm-data-list');
    if (!list || !D.DATENWUNSCH_CANDIDATES) return;
    const votes = loadVotes();
    // Compose list with current vote for each candidate; sort by score desc, then by id
    const enriched = D.DATENWUNSCH_CANDIDATES.map(c => ({ ...c, score: votes[c.id] || 0 }));
    enriched.sort((a, b) => b.score - a.score);

    list.innerHTML = enriched.map((c, i) => {
      const myVote = votes['_my_' + c.id] || 0; // 1 = up, -1 = down, 0 = none
      const upClass = myVote === 1 ? 'style="color: #2F855A;"' : '';
      const downClass = myVote === -1 ? 'style="color: #B63D3D;"' : '';
      return `
        <div role="listitem" style="display:flex; gap:14px; align-items:flex-start; padding:12px 0; border-top:1px solid var(--border);">
          <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
            <button data-vote="up" data-id="${c.id}" ${upClass} aria-label="${t('mm_data_upvote', 'Hochstimmen')}" style="background:none; border:1px solid var(--border); color: var(--text-secondary); width:28px; height:24px; border-radius:3px; cursor:pointer; font-size:12px;">▲</button>
            <span style="font-family: var(--font-mono); font-size:14px; font-weight:600; color: ${c.score > 0 ? '#2F855A' : c.score < 0 ? '#B63D3D' : 'var(--text-secondary)'};">${c.score > 0 ? '+' : ''}${c.score}</span>
            <button data-vote="down" data-id="${c.id}" ${downClass} aria-label="${t('mm_data_downvote', 'Runterstimmen')}" style="background:none; border:1px solid var(--border); color: var(--text-secondary); width:28px; height:24px; border-radius:3px; cursor:pointer; font-size:12px;">▼</button>
          </div>
          <div style="flex:1;">
            <div style="display:flex; gap:8px; align-items:baseline;">
              ${i < 3 && c.score > 0 ? `<span style="background: var(--accent); color: white; padding:1px 6px; border-radius:3px; font-size:9px; font-family: var(--font-mono); letter-spacing:.05em;">TOP ${i+1}</span>` : ''}
              <span style="font-size:18px;">${c.icon}</span>
              <strong style="font-size:13px;">${pickLang(c, 'name')}</strong>
            </div>
            <div style="font-size:11px; color: var(--text-tertiary); margin-top:4px; line-height:1.5;">${pickLang(c, 'why')}</div>
          </div>
        </div>
      `;
    }).join('');

    // Wire vote buttons (toggle pattern: clicking same vote twice removes it)
    list.querySelectorAll('[data-vote]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const dir = btn.dataset.vote === 'up' ? 1 : -1;
        const v = loadVotes();
        const prev = v['_my_' + id] || 0;
        if (prev === dir) {
          // Same direction → undo
          v[id] = (v[id] || 0) - dir;
          v['_my_' + id] = 0;
        } else {
          // New direction → swing by 1 or 2 depending on previous
          v[id] = (v[id] || 0) + (dir - prev);
          v['_my_' + id] = dir;
        }
        saveVotes(v);
        renderDatenwunsch();
      });
    });
    list.dataset.rendered = '1';
  }

  // ===== v2.1 — Mitmachen view wiring =====
  function setupMitmachen() {
    // Mängelmelder card → reuse the existing Hinweis modal
    const meldenBtn = document.getElementById('mm-melden-btn');
    if (meldenBtn) {
      meldenBtn.addEventListener('click', () => {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) backdrop.classList.add('active');
      });
    }
    // Datenwunsch card → toggle expanded panel + render
    const dataBtn = document.getElementById('mm-data-btn');
    const dataPanel = document.getElementById('mm-data-panel');
    if (dataBtn && dataPanel) {
      dataBtn.addEventListener('click', () => {
        const open = dataPanel.style.display !== 'none';
        dataPanel.style.display = open ? 'none' : 'block';
        if (!open) renderDatenwunsch();
      });
    }

    // Datenwunsch → send accumulated votes via mailto to open-data team
    const sendBtn = document.getElementById('mm-data-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const votes = loadVotes();
        const cands = (D.DATENWUNSCH_CANDIDATES || []).map(c => ({
          ...c, score: votes[c.id] || 0
        })).filter(c => c.score !== 0);

        if (!cands.length) {
          showToast(_i18nFromActiveLang('mm_data_send_empty', 'Bitte erst mindestens einen Datenwunsch hochstimmen.'));
          return;
        }
        cands.sort((a, b) => b.score - a.score);

        const subject = encodeURIComponent('[Datenwunsch] Bürgervotum — Wiesbaden-Lagebild Dashboard');
        const lines = [
          'Sehr geehrtes Open-Data-Team,',
          '',
          'über das Wiesbaden-Lagebild-Bürger-Dashboard möchte ich folgende Datensatzvorschläge unterstützen, die aktuell nicht im Katalog sind. Reihenfolge nach meiner Stimmgewichtung:',
          '',
          ...cands.map((c, i) => `${i + 1}. ${c.name_de}  (Stimme: ${c.score > 0 ? '+' : ''}${c.score})\n   Begründung: ${c.why_de}`),
          '',
          `Anzahl unterstützter Vorschläge: ${cands.length}`,
          `Gesendet am: ${new Date().toLocaleString('de-DE')}`,
          '',
          '— Bürger:in via Wiesbaden-Lagebild Dashboard',
          '   github.com/Sujin-Arin-DataWorld/Public-Verbesserung'
        ];
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:opendata@wiesbaden.de?subject=${subject}&body=${body}`;
        showToast(_i18nFromActiveLang('mm_data_send_ok', '✓ E-Mail vorbereitet · ') + cands.length + ' ' + _i18nFromActiveLang('mm_data_send_count', 'Datenwunsch-Stimmen'));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV2);
  } else {
    initV2();
  }
})();
