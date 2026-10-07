/* =========================================================================
 * 原神一图流生成器 · app.js
 * =========================================================================
 * 模块导航（搜索 "【JS 模块 N】" 快速跳转）：
 *   【JS 模块 1】    图标常量
 *   【JS 模块 2】    全局常量（尺寸 / 布局 LAYOUT / 元素色 / Tab 定义）
 *   【JS 模块 3】    State 全局状态 + IndexedDB 持久化
 *   【JS 模块 4】    Toast 提示 + Confirm 弹窗
 *   【JS 模块 5】    通用工具函数
 *   【JS 模块 5.5】  SVG 图标 viewBox 收紧
 *   【JS 模块 6】    SVG 绘制辅助
 *   【JS 模块 7】    SVG 图层构建
 *   【JS 模块 8】    预览挂载 + 字段增量更新
 *   【JS 模块 8.5】  Tab Sheet 切换
 *   【JS 模块 9】    UI 编辑器渲染
 *   【JS 模块 10】   图片上传
 *   【JS 模块 10.3】 字体库
 *   【JS 模块 10.4】 characters.txt 读取
 *   【JS 模块 10.5】 样式图匹配 + 在线存档
 *   【JS 模块 10.6】 图标库匹配
 *   【JS 模块 11】   数据归一化
 *   【JS 模块 12】   导出 / 导入 / 清空
 *   【JS 模块 13】   UI 交互（字段 / 增删改 / 移动）
 *   【JS 模块 14】   App 接口
 *   【JS 模块 15】   初始化
 * ========================================================================= */

/* =========================================================================
 * 【JS 模块 1】图标
 * ========================================================================= */
const SHARED = window.ICONS || { ui: {}, element: {}, artifact: {}, nav: {}, app: {} };

const ICONS = {
  up: SHARED.ui.arrowUp || '',
  down: '<span class="icon-flip-y">' + (SHARED.ui.arrowUp || '') + '</span>',
  trash: SHARED.ui.trash || '',
  collapse: SHARED.ui.chevronDown || '',
  expand: '<span class="icon-flip-y">' + (SHARED.ui.chevronDown || '') + '</span>',
  plus: SHARED.ui.plus || '',
  export: SHARED.ui.export || '',
  import: SHARED.ui.import || ''
};

const ELEMENT_ICONS = SHARED.element || {};
const ARTIFACT_ICON_PATHS = SHARED.artifact || {};

const PLUS_ICON_PATH = 'M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5z';

/* =========================================================================
 * 【JS 模块 2】全局常量
 * ========================================================================= */
const SVG_W = 1280;
const SVG_H = 720;
const EXPORT_SCALE = 3;
const IDB_KEY = 'genshin_card_db_v5';
const STORE_NAME = 'card_store';
const WEAPON_ORDER = ['graduate', 'optional', 'newbie'];
const WEAPON_MAX = 4;

const LAYOUT = {
  left: { x: 20, y: 20, w: 340, h: 680 },
  right: { x: 380, y: 20, w: 880, h: 680 },
  title: { offX: 20, offY: 20, fs: 15, dotR: 4, dotGap: 11 },
  padX: 20, bottomPad: 15, contentOffsetY: 42.5,
  layers: {
    weapon: { y: 20, h: 135 },
    row2: { y: 165, h: 120 },
    artifact: { x: 380, w: 580 },
    talent: { x: 970, w: 290 },
    mid: {
      y: 295, h: 175,
      stat: { x: 380, w: 290 },
      panel: { x: 680, w: 280 },
      cons: { x: 970, w: 290 }
    },
    team: { y: 480, h: 220 }
  },
  iconSize: 55, iconGap: 10, doubleGap: 2,
  weaponSlotY: 62.5, artifactSlotY: 207.5,
  weaponLabelOffsetY: 10, weaponLabelFs: 12,
  stat: { boxW: 76, boxH: 62, gap: 10, subH: 45.5, subGap: 10, iconSize: 12, labelFs: 12, subLabelFs: 12 },
  talent: { colGap: 10, boxH: 62.5, labelFs: 12, valueFs: 20 },
  panel: { cols: 2, rows: 3, cellW: 115, cellH: 32.5, gapX: 10, gapY: 10, innerPadX: 10, labelFs: 12, valueFs: 12 },
  cons: { boxW: 120, boxH: 32.5, gapX: 10, gapY: 10, seqFs: 12, descFs: 10 },
  team: { w: 270, gap: 15, mainSize: 35, mainGap: 20, altSize: 25, altGap: 10, altRowGap: 5, nameFs: 12, nameOffsetY: 16, mainOffsetY: 27, altOffsetY: 67, altLabelPadL: 20, altRangePadR: 20 },
  plusSize: 14, plusStrokeW: 1.5,
  charInfo: { padL: 20, padB: 20, lineGap: 15 },
  radius: { panel: 12, inner: 6, slotFactor: 0.15 },
  labelColor: '#FFE898',
  innerBoxFill: 'rgba(255,255,255,.15)'
};
const MID_CONTENT_Y = LAYOUT.layers.mid.y + LAYOUT.contentOffsetY;

const elementColors = [
  ['火', '#EC4923', 'fire'], ['水', '#498FCC', 'water'], ['风', '#359697', 'wind'],
  ['雷', '#6957C2', 'thunder'], ['草', '#66AD16', 'grass'], ['冰', '#35AACC', 'ice'],
  ['岩', '#CC9046', 'rock'], ['无', '#939393', 'none']
];

const FONT_FAMILY_DEFAULT = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
const FONT_FAMILY_CUSTOM = 'CardCustomFont, "PingFang SC", "Microsoft YaHei", sans-serif';
const WEAPON_LABELS = { graduate: '毕业', optional: '可选', newbie: '新手' };
const PANEL_PRIMARY_LABELS = { hp: '生命值', atk: '攻击力', def: '防御力' };
const PANEL_PRIMARY_KEYS = ['hp', 'atk', 'def'];
const PANEL_EMPTY_TEXT = '任意';
const EMPTY_FILL = 'rgba(255,255,255,.5)';

const TAB_DEFS = [
  { key: 'style', label: '外观样式' },
  { key: 'base', label: '立绘区' },
  { key: 'weapon', label: '武器区' },
  { key: 'artifact', label: '圣遗物区' },
  { key: 'talent', label: '天赋区' },
  { key: 'stats', label: '词条区' },
  { key: 'panel', label: '面板区' },
  { key: 'cons', label: '命座区' },
  { key: 'team', label: '配队区' }
];
let currentTab = 'style';
let tabSheetOpen = false;

let CHAR_NAME_TO_ORDER = {};

/* =========================================================================
 * 【JS 模块 3】State 与持久化
 * ========================================================================= */
const State = {
  data: {
    charName: '', version: '', date: '', author: '烤吃虎鱼LW',
    imgX: 0, theme: '#939393',
    charImg: '', charImgMeta: null, charImgDeleted: false,
    bgImg: '', bgImgDeleted: false,
    nameBgImg: '', nameBgImgMeta: null, nameBgImgDeleted: false,
    fontData: '', fontName: '', fontFileName: '',
    weaponData: { graduate: [], optional: [], newbie: [] },
    artifactData: [],
    constellationData: Array.from({ length: 6 }, () => ({ active: false, desc: '' })),
    sandMain: '', gobMain: '', cirMain: '', subStats: '',
    talentA: '', talentE: '', talentQ: '',
    panel: { primaryKey: 'hp', primaryValue: '', cr: '', cd: '', em: '', er: '' },
    teamCoreImg: '', teamData: []
  }
};

let saveTimer = null;
function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_KEY, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveStateToIDB() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(State.data, 'current_state');
  } catch (e) {}
}
function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveTimer = null; saveStateToIDB(); }, 500);
}
async function loadStateFromIDB() {
  try {
    const db = await openDatabase();
    return new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('current_state');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

/* =========================================================================
 * 【JS 模块 4】Toast 与 Confirm
 * ========================================================================= */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2400);
}
function showConfirm(title, message) {
  return new Promise(resolve => {
    const backdrop = document.getElementById('modalBackdrop');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');
    const cleanup = (result) => {
      backdrop.classList.remove('show');
      cancelBtn.onclick = null;
      confirmBtn.onclick = null;
      backdrop.onclick = null;
      resolve(result);
    };
    cancelBtn.onclick = () => cleanup(false);
    confirmBtn.onclick = () => cleanup(true);
    backdrop.onclick = (e) => { if (e.target === backdrop) cleanup(false); };
    backdrop.classList.add('show');
  });
}

/* =========================================================================
 * 【JS 模块 5】工具函数
 * ========================================================================= */
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function darken(hex, amt) {
  if (!hex || typeof hex !== 'string') return '#333333';
  let h = hex.startsWith('#') ? hex.slice(1) : hex;
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return '#333333';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(v => isNaN(v))) return '#333333';
  const rr = Math.max(0, r - amt);
  const gg = Math.max(0, g - amt);
  const bb = Math.max(0, b - amt);
  return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
}
function placeholder(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="100" y="112" font-size="52" text-anchor="middle" fill="#666" font-family="sans-serif">${esc(label)}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
function moveItem(arr, from, dir) {
  const to = from + dir;
  if (to < 0 || to >= arr.length) return false;
  [arr[from], arr[to]] = [arr[to], arr[from]];
  return true;
}
function padOrder(n) { return String(n).padStart(3, '0'); }
function themeToElementName() {
  var t = (State.data.theme || '').toLowerCase();
  for (var i = 0; i < elementColors.length; i++) {
    if (elementColors[i][1].toLowerCase() === t) return elementColors[i][0];
  }
  return '';
}
function findShortIdByName(name) {
  var dict = window.ICON_DICT && window.ICON_DICT.characters;
  if (!dict || !name) return '';
  for (var key in dict) {
    var item = dict[key];
    if (item && item.name === name) {
      if (item.local) {
        return key.replace(/^UI_AvatarIcon_/i, '').replace(/\.[^.]+$/, '');
      }
      return key;
    }
  }
  return '';
}
async function urlExists(url) {
  try {
    var res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return true;
    if (res.status === 405) {
      var res2 = await fetch(url);
      return res2.ok;
    }
    return false;
  } catch (e) {
    try { var res3 = await fetch(url); return res3.ok; } catch (e2) { return false; }
  }
}

/* =========================================================================
 * 【JS 模块 5.5】图标 viewBox 收紧
 * ========================================================================= */
function tightenSvgToSquareViewBox(svgString) {
  const ns = 'http://www.w3.org/2000/svg';
  const host = document.createElementNS(ns, 'svg');
  host.style.position = 'absolute'; host.style.left = '-9999px'; host.style.top = '-9999px';
  host.style.width = '1px'; host.style.height = '1px'; host.style.visibility = 'hidden';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  const wrap = document.createElementNS(ns, 'svg');
  wrap.innerHTML = svgString;
  host.appendChild(wrap);
  const paths = wrap.querySelectorAll('path');
  if (!paths.length) { host.remove(); return svgString; }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  paths.forEach(p => {
    let b;
    try { b = p.getBBox(); } catch (e) { return; }
    if (!b || (b.width === 0 && b.height === 0)) return;
    minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
  });
  host.remove();
  if (!isFinite(minX) || !isFinite(minY)) return svgString;
  const w = maxX - minX, h = maxY - minY, side = Math.max(w, h);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const nx = cx - side / 2, ny = cy - side / 2;
  const fmt = n => +n.toFixed(4);
  const vb = `${fmt(nx)} ${fmt(ny)} ${fmt(side)} ${fmt(side)}`;
  return svgString.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`);
}
function tightenAllIconViewBoxes() {
  Object.keys(ELEMENT_ICONS).forEach(k => { ELEMENT_ICONS[k] = tightenSvgToSquareViewBox(ELEMENT_ICONS[k]); });
  document.querySelectorAll('svg.icon').forEach(svg => {
    const outer = svg.outerHTML;
    const fixed = tightenSvgToSquareViewBox(outer);
    if (fixed !== outer) {
      const tpl = document.createElement('div');
      tpl.innerHTML = fixed;
      const next = tpl.firstElementChild;
      if (next) svg.replaceWith(next);
    }
  });
}

/* =========================================================================
 * 【JS 模块 6】SVG 绘制辅助
 * ========================================================================= */
function measureTextWidth(content, fontSize) {
  content = String(content || '');
  const family = State.data.fontData ? FONT_FAMILY_CUSTOM : FONT_FAMILY_DEFAULT;
  const canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px ${family}`;
  return ctx.measureText(content).width;
}
function fitSize(textContent, maxW, base, min = 8) {
  textContent = String(textContent || '');
  if (!textContent) return base;
  let size = base;
  while (size > min) { if (measureTextWidth(textContent, size) <= maxW) break; size -= 1; }
  return size;
}
function text(x, y, content, size, opts = {}) {
  const fill = opts.fill || '#fff';
  const anchor = opts.anchor || 'start';
  const weight = opts.weight || '400';
  const opacity = opts.opacity == null ? 1 : opts.opacity;
  const baseline = opts.baseline || 'middle';
  const parts = [
    `x="${x}"`, `y="${y}"`, `fill="${fill}"`, `font-size="${size}"`,
    `font-weight="${weight}"`, `text-anchor="${anchor}"`,
    `dominant-baseline="${baseline}"`, `opacity="${opacity}"`
  ];
  if (opts.stroke) {
    parts.push(`stroke="${opts.stroke}"`, `stroke-width="${opts.strokeWidth || 0}"`,
      `stroke-linejoin="round"`, `stroke-linecap="round"`, `paint-order="stroke fill"`);
  }
  if (opts.extra) parts.push(opts.extra);
  if (opts.field) parts.push(`data-field="${esc(opts.field)}"`);
  if (opts.fit) {
    parts.push(`data-fit-max-w="${opts.fit.maxW}"`, `data-fit-base="${opts.fit.base}"`, `data-fit-min="${opts.fit.min || 8}"`);
  }
  return `<text ${parts.join(' ')}>${esc(content)}</text>`;
}
function rect(x, y, w, h, fill, stroke = '', sw = 0, rx = 8, opacity = 1, clip = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${opacity}" ${stroke ? `stroke="${stroke}" stroke-width="${sw}"` : ''}${clip ? ` clip-path="url(#${clip})"` : ''}/>`;
}
function image(href, x, y, w, h, fit = 'xMidYMid slice', clip = '') {
  return `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}" ${clip}/>`;
}
function wrapTextLines(content, maxW, size, maxLines) {
  const chars = Array.from(String(content || ''));
  if (!chars.length) return [];
  const lines = [];
  let line = '';
  chars.forEach(ch => {
    const next = line + ch;
    if (!line || measureTextWidth(next, size) <= maxW) { line = next; }
    else { lines.push(line); line = ch; }
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) return null;
  if (lines.some(l => measureTextWidth(l, size) > maxW)) return null;
  return lines;
}
function wrappedCenteredText(x, areaTop, areaW, areaH, content, maxW, base, min, fill = '#ddd') {
  const centerX = x + areaW / 2;
  for (let size = base; size >= min; size -= 1) {
    const lineH = Math.round(size * 1.08);
    const maxLines = Math.max(1, Math.floor(areaH / lineH));
    const lines = wrapTextLines(content, maxW, size, maxLines);
    if (!lines) continue;
    const blockH = lines.length * lineH;
    const firstY = areaTop + (areaH - blockH) / 2 + lineH / 2;
    return lines.map((line, i) => text(centerX, firstY + i * lineH, line, size, { fill, anchor: 'middle' })).join('');
  }
  return text(centerX, areaTop + areaH / 2, content, min, { fill, anchor: 'middle' });
}
function wrappedLeftText(x, areaTop, areaW, areaH, content, maxW, base, min, fill = '#ddd', padY = 0) {
  const fitH = areaH - padY * 2;
  for (let size = base; size >= min; size -= 1) {
    const lineH = Math.round(size * 1.08);
    const maxLines = Math.max(1, Math.floor(fitH / lineH));
    const lines = wrapTextLines(content, maxW, size, maxLines);
    if (!lines) continue;
    const blockH = lines.length * lineH;
    const firstY = areaTop + (areaH - blockH) / 2 + lineH / 2;
    return lines.map((line, i) => text(x, firstY + i * lineH, line, size, { fill })).join('');
  }
  const lineH = Math.round(min * 1.08);
  const forcedLines = wrapTextLines(content, maxW, min, 999);
  if (forcedLines && forcedLines.length) {
    const firstY = areaTop + lineH / 2;
    return forcedLines.map((line, i) => text(x, firstY + i * lineH, line, min, { fill })).join('');
  }
  return text(x, areaTop + areaH / 2, content, min, { fill });
}

function sectionTitle(x, y, title) {
  const fs = LAYOUT.title.fs, dotR = LAYOUT.title.dotR, dotGap = LAYOUT.title.dotGap;
  const textX = x + dotR * 2 + dotGap;
  return `<circle cx="${x + dotR}" cy="${y}" r="${dotR}" fill="${State.data.theme || '#939393'}" filter="url(#glowTheme)"/>${text(textX, y, title, fs, { weight: 500 })}`;
}
function slot(x, y, size, img, name, key, field) {
  const cp = `clip_${key}`;
  const radius = Math.round(size * LAYOUT.radius.slotFactor);
  const labelH = Math.round(size / 5);
  const maxW = size - (radius / 3) * 2;
  const base = labelH * 0.8;
  const labelSize = fitSize(name, maxW, base, 3);
  const labelTextY = y + size - labelH / 2 + labelSize * 0.35;
  const showLabel = !!(name || field);
  let labelEl = '';
  if (showLabel) {
    const opts = { anchor: 'middle', baseline: 'alphabetic' };
    if (field) { opts.field = field; opts.fit = { maxW, base, min: 3 }; }
    labelEl = text(x + size / 2, labelTextY, name || '', labelSize, opts);
  }
  const bg = showLabel ? `<rect x="${x}" y="${y + size - labelH}" width="${size}" height="${labelH}" fill="url(#slotBottomGrad)" clip-path="url(#${cp})"/>` : '';
  return `
    <clipPath id="${cp}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}"/></clipPath>
    ${rect(x, y, size, size, 'rgba(0,0,0,.5)', '', 0, radius)}
    ${image(img || placeholder(''), x, y, size, size, 'xMidYMid slice', `clip-path="url(#${cp})"`)}
    ${bg}${labelEl}`;
}
function doubleArtifact(x, y, size, a, key) {
  const gap = LAYOUT.doubleGap;
  const w = size * 2 + gap, h = size;
  const radius = Math.round(size * LAYOUT.radius.slotFactor);
  const cpL = `clip_${key}_l`, cpR = `clip_${key}_r`;
  const labelH = Math.round(h / 5);
  const maxW = w - (radius / 3) * 2;
  const base = labelH * 0.8;
  const displayName = a.displayText || [a.name1, a.name2].filter(Boolean).join(' + ');
  const fs = fitSize(displayName, maxW, base, 4);
  const labelTextY = y + h - labelH / 2 + fs * 0.35;
  const showLabel = !!displayName;
  let labelEl = '';
  if (showLabel) { labelEl = text(x + w / 2, labelTextY, displayName, fs, { anchor: 'middle', baseline: 'alphabetic' }); }
  const bg = showLabel ? `
    <rect x="${x}" y="${y + h - labelH}" width="${size}" height="${labelH}" fill="url(#slotBottomGrad)" clip-path="url(#${cpL})"/>
    <rect x="${x + size}" y="${y + h - labelH}" width="${gap}" height="${labelH}" fill="url(#slotBottomGrad)"/>
    <rect x="${x + size + gap}" y="${y + h - labelH}" width="${size}" height="${labelH}" fill="url(#slotBottomGrad)" clip-path="url(#${cpR})"/>` : '';
  return `
    <clipPath id="${cpL}"><path d="M${x + radius} ${y}H${x + size}V${y + size}H${x + radius}Q${x} ${y + size} ${x} ${y + size - radius}V${y + radius}Q${x} ${y} ${x + radius} ${y}Z"/></clipPath>
    <clipPath id="${cpR}"><path d="M${x + size + gap} ${y}H${x + size + gap + size - radius}Q${x + size + gap + size} ${y} ${x + size + gap + size} ${y + radius}V${y + size - radius}Q${x + size + gap + size} ${y + size} ${x + size + gap + size - radius} ${y + size}H${x + size + gap}Z"/></clipPath>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="rgba(0,0,0,.5)" clip-path="url(#${cpL})"/>
    <rect x="${x + size + gap}" y="${y}" width="${size}" height="${size}" fill="rgba(0,0,0,.5)" clip-path="url(#${cpR})"/>
    ${image(a.img1 || placeholder(''), x, y, size, size, 'xMidYMid slice', `clip-path="url(#${cpL})"`)}
    ${image(a.img2 || placeholder(''), x + size + gap, y, size, size, 'xMidYMid slice', `clip-path="url(#${cpR})"`)}
    ${bg}${labelEl}`;
}

/* =========================================================================
 * 【JS 模块 7】SVG 图层
 * ========================================================================= */
function midSection(layerCfg, title, contentSvg) {
  const y = LAYOUT.layers.mid.y, h = LAYOUT.layers.mid.h;
  return `
    ${panelRect(layerCfg.x, y, layerCfg.w, h, LAYOUT.radius.panel)}
    ${sectionTitle(layerCfg.x + LAYOUT.title.offX, y + LAYOUT.title.offY, title)}
    ${contentSvg}`;
}
function buildWeapons() {
  const keys = WEAPON_ORDER.filter(k => State.data.weaponData[k].length);
  if (!keys.length) return '';
  let out = '';
  const step = LAYOUT.iconSize + LAYOUT.iconGap, size = LAYOUT.iconSize;
  const slotY = LAYOUT.weaponSlotY;
  const labelFs = LAYOUT.weaponLabelFs, labelOffsetY = LAYOUT.weaponLabelOffsetY;
  const sepGap = 20;
  let x = LAYOUT.right.x + LAYOUT.padX;
  keys.forEach((k, groupIndex) => {
    if (groupIndex > 0) out += `<rect x="${x - sepGap - 1}" y="${slotY}" width="2" height="${size}" fill="url(#sepGrad)"/>`;
    const group = State.data.weaponData[k];
    group.slice(0, WEAPON_MAX).forEach((w, i) => {
      out += slot(x + i * step, slotY, size, w.img, w.name, `w_${k}_${i}`, `weapon.${k}.${i}.name`);
    });
    const labelTop = slotY + size + labelOffsetY;
    const labelY = labelTop + labelFs / 2;
    const labelX = x + Math.max(26, (group.length * step - (step - size)) / 2);
    out += text(labelX, labelY, WEAPON_LABELS[k], labelFs, { fill: LAYOUT.labelColor, anchor: 'middle', weight: 500 });
    x += group.length * step + (sepGap + 2 + sepGap) - (step - size);
  });
  return out;
}
function buildArtifacts() {
  if (!State.data.artifactData.length) return '';
  let out = '';
  const step = LAYOUT.iconSize + LAYOUT.iconGap, size = LAYOUT.iconSize;
  const doubleStep = size * 2 + LAYOUT.doubleGap + LAYOUT.iconGap;
  const iconY = LAYOUT.artifactSlotY;
  let x = LAYOUT.layers.artifact.x + LAYOUT.padX;
  State.data.artifactData.forEach((a, i) => {
    if (a.type === 'double') { out += doubleArtifact(x, iconY, size, a, `a_${i}`); x += doubleStep; }
    else { out += slot(x, iconY, size, a.img, a.name, `a_${i}`, `artifact.${i}.name`); x += step; }
  });
  return out;
}
function renderArtifactIcon(iconKey, cx, cy, size) {
  const paths = ARTIFACT_ICON_PATHS[iconKey];
  if (!paths) return '';
  const scale = size / 1024;
  const iconX = cx - size / 2, iconY = cy - size / 2;
  const pathsStr = paths.map(d => `<path d="${d}"/>`).join('');
  return `<g transform="translate(${iconX}, ${iconY}) scale(${scale})" fill="${State.data.theme}" filter="url(#glowThemeSmall)">${pathsStr}</g>`;
}
function statBox(x, y, w, h, iconKey, title, value, field) {
  const boxRx = LAYOUT.radius.inner, iconSize = LAYOUT.stat.iconSize;
  const gap = 4, labelFs = LAYOUT.stat.labelFs;
  const labelW = measureTextWidth(title, labelFs);
  const totalW = iconSize + gap + labelW;
  const startX = x + (w - totalW) / 2;
  const centerY = y + 16;
  const iconCx = startX + iconSize / 2;
  const textX = startX + iconSize + gap;
  const iconElem = renderArtifactIcon(iconKey, iconCx, centerY, iconSize);
  const valueAreaTop = y + 32, valueAreaH = h - 36;
  const valueMidY = valueAreaTop + valueAreaH / 2;
  const maxW = w - boxRx * 2;
  const opts = { fill: '#fff', anchor: 'middle' };
  if (field) { opts.field = field; opts.fit = { maxW, base: 12, min: 6 }; }
  return `
    ${rect(x, y, w, h, LAYOUT.innerBoxFill, '', 0, boxRx)}
    ${iconElem}
    ${text(textX, centerY, title, labelFs, { fill: LAYOUT.labelColor, weight: 500 })}
    ${text(x + w / 2, valueMidY, value || '', fitSize(value, maxW, 12, 6), opts)}`;
}
function buildStats() {
  const layer = LAYOUT.layers.mid.stat;
  const contentX = layer.x + LAYOUT.padX;
  const contentW = layer.w - LAYOUT.padX * 2;
  const contentY = MID_CONTENT_Y;
  const boxW = LAYOUT.stat.boxW, boxH = LAYOUT.stat.boxH, gap = LAYOUT.stat.gap;
  const subH = LAYOUT.stat.subH, subGap = LAYOUT.stat.subGap;
  const subY = contentY + boxH + subGap;
  const totalW = boxW * 3 + gap * 2;
  const offsetX = contentX + (contentW - totalW) / 2;
  const subLabelX = offsetX + 10;
  const subLabelFs = LAYOUT.stat.subLabelFs;
  const subLabelW = measureTextWidth('副词条：', subLabelFs);
  const subTextX = subLabelX + subLabelW + 5;
  const subRightLimit = offsetX + totalW - 10;
  const subTextW = subRightLimit - subTextX;
  return `
    ${statBox(offsetX, contentY, boxW, boxH, 'flower', '时之沙', State.data.sandMain, 'stat.sandMain')}
    ${statBox(offsetX + boxW + gap, contentY, boxW, boxH, 'cup', '空之杯', State.data.gobMain, 'stat.gobMain')}
    ${statBox(offsetX + (boxW + gap) * 2, contentY, boxW, boxH, 'crown', '理之冠', State.data.cirMain, 'stat.cirMain')}
    ${rect(offsetX, subY, totalW, subH, LAYOUT.innerBoxFill, '', 0, LAYOUT.radius.inner)}
    ${text(subLabelX, subY + subH / 2, '副词条：', subLabelFs, { fill: LAYOUT.labelColor, weight: 500 })}
    ${wrappedLeftText(subTextX, subY, subTextW, subH, State.data.subStats, subTextW, 12, 6, '#fff', 4)}`;
}
function buildTalents() {
  const layer = LAYOUT.layers.talent;
  const contentX = layer.x + LAYOUT.padX;
  const contentW = layer.w - LAYOUT.padX * 2;
  const contentY = LAYOUT.layers.row2.y + LAYOUT.contentOffsetY;
  const contentH = LAYOUT.talent.boxH;
  const colGap = LAYOUT.talent.colGap;
  const colW = (contentW - colGap * 2) / 3;
  const r = LAYOUT.radius.inner;
  const items = [
    ['普通攻击', State.data.talentA, 'talent.A'],
    ['元素战技', State.data.talentE, 'talent.E'],
    ['元素爆发', State.data.talentQ, 'talent.Q']
  ];
  return items.map((it, i) => {
    const x = contentX + i * (colW + colGap);
    const val = it[1] || '—';
    const labelY = contentY + 17, valueY = contentY + 44;
    const maxW = colW - 16, base = LAYOUT.talent.valueFs;
    return `
      ${rect(x, contentY, colW, contentH, LAYOUT.innerBoxFill, '', 0, r)}
      ${text(x + colW / 2, labelY, it[0], LAYOUT.talent.labelFs, { fill: LAYOUT.labelColor, anchor: 'middle', weight: 500 })}
      ${text(x + colW / 2, valueY, val, fitSize(val, maxW, base, 10), { fill: '#fff', anchor: 'middle', weight: 600, field: it[2], fit: { maxW, base, min: 10 } })}`;
  }).join('');
}
function buildPanel() {
  const d = State.data.panel || {};
  const P = LAYOUT.panel;
  const layer = LAYOUT.layers.mid.panel;
  const contentX = layer.x + LAYOUT.padX;
  const baseY = MID_CONTENT_Y;
  const r = LAYOUT.radius.inner;
  const primaryLabel = PANEL_PRIMARY_LABELS[d.primaryKey] || PANEL_PRIMARY_LABELS.hp;
  const items = [
    { key: 'primaryValue', label: primaryLabel, value: d.primaryValue || '' },
    { key: 'em', label: '元素精通', value: d.em || '' },
    { key: 'cr', label: '暴击率', value: d.cr || '' },
    { key: 'cd', label: '暴击伤害', value: d.cd || '' },
    { key: 'er', label: '充能效率', value: d.er || '' }
  ];
  const { cols, cellW, cellH, gapX, gapY, innerPadX, labelFs, valueFs } = P;
  return items.map((it, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = contentX + col * (cellW + gapX);
    const cy = baseY + row * (cellH + gapY);
    const midY = cy + cellH / 2;
    const empty = !it.value;
    return `
      ${rect(cx, cy, cellW, cellH, LAYOUT.innerBoxFill, '', 0, r)}
      ${text(cx + innerPadX, midY, it.label, labelFs, { fill: LAYOUT.labelColor, weight: 500 })}
      ${text(cx + cellW - innerPadX, midY, empty ? PANEL_EMPTY_TEXT : it.value, valueFs, { fill: empty ? EMPTY_FILL : '#fff', anchor: 'end', weight: 400, field: `panel.${it.key}` })}`;
  }).join('');
}
function buildConstellations() {
  const layer = LAYOUT.layers.mid.cons;
  const colX = layer.x + LAYOUT.padX;
  const boxW = LAYOUT.cons.boxW, boxH = LAYOUT.cons.boxH;
  const gapX = LAYOUT.cons.gapX, gapY = LAYOUT.cons.gapY;
  const contentY = MID_CONTENT_Y;
  const theme = State.data.theme;
  const list = State.data.constellationData;
  return list.map((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = colX + col * (boxW + gapX);
    const y = contentY + row * (boxH + gapY);
    const active = !!c.active;
    const boxRx = LAYOUT.radius.inner;
    const badgeCx = x + 15, badgeCy = y + boxH / 2;
    const descX = x + 30;
    const descRightLimit = x + boxW - 5;
    const descAreaW = descRightLimit - descX;
    const descText = c.desc ? wrappedLeftText(descX, y + 2, descAreaW, boxH - 4, c.desc, descAreaW, LAYOUT.cons.descFs, 6, '#fff') : '';
    const badgeFill = active ? theme : 'rgba(0,0,0,.35)';
    if (active) {
      return `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${boxRx}" fill="${theme}" fill-opacity="0.15" stroke="${theme}" stroke-width="2" stroke-opacity="0.75"/>
        <circle cx="${badgeCx}" cy="${badgeCy}" r="10" fill="${badgeFill}" filter="url(#glowTheme)"/>
        ${text(badgeCx, badgeCy + 0.5, i + 1, LAYOUT.cons.seqFs, { fill: '#fff', anchor: 'middle', weight: 500 })}
        ${descText}`;
    }
    return `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${boxRx}" fill="${LAYOUT.innerBoxFill}"/>
      <circle cx="${badgeCx}" cy="${badgeCy}" r="10" fill="${badgeFill}"/>
      ${text(badgeCx, badgeCy + 0.5, i + 1, LAYOUT.cons.seqFs, { fill: '#fff', anchor: 'middle', weight: 500 })}
      ${descText}`;
  }).join('');
}
function buildTeams() {
  if (!State.data.teamData.length) return '';
  const T = LAYOUT.team;
  const whiteBoxY = LAYOUT.layers.team.y + LAYOUT.contentOffsetY;
  const whiteBoxH = LAYOUT.layers.team.h - LAYOUT.contentOffsetY - LAYOUT.bottomPad;
  return State.data.teamData.slice(0, 3).map((team, ti) => {
    const teamW = T.w, teamGap = T.gap;
    const x = LAYOUT.right.x + LAYOUT.padX + ti * (teamW + teamGap);
    const teamRx = LAYOUT.radius.inner;
    let out = `<rect x="${x}" y="${whiteBoxY}" width="${teamW}" height="${whiteBoxH}" rx="${teamRx}" fill="${LAYOUT.innerBoxFill}"/>`;
    const nameY = whiteBoxY + T.nameOffsetY;
    if (team.name) {
      out += text(x + teamW / 2, nameY, team.name, fitSize(team.name, 240, T.nameFs, 8),
        { fill: LAYOUT.labelColor, anchor: 'middle', weight: 500, field: `team.${ti}.name`, fit: { maxW: 240, base: T.nameFs, min: 8 } });
    }
    const mainSize = T.mainSize, mainGap = T.mainGap;
    const mainStartX = x + (teamW - (mainSize * 4 + mainGap * 3)) / 2;
    const mainY = whiteBoxY + T.mainOffsetY;
    const coreChar = {
      name: State.data.charName || team.chars[0].name || '',
      img: State.data.teamCoreImg || team.chars[0].img || ''
    };
    const mainChars = [coreChar, ...team.chars.slice(1, 4)];
    const plusSize = LAYOUT.plusSize;
    mainChars.forEach((c, ci) => {
      const cx = mainStartX + ci * (mainSize + mainGap);
      const mainField = ci === 0 ? 'charName' : `team.${ti}.char.${ci}.name`;
      out += slot(cx, mainY, mainSize, c.img, c.name, `t_${ti}_${ci}`, mainField);
      if (ci < 3) {
        const plusX = cx + mainSize + mainGap / 2 - plusSize / 2;
        const plusY = mainY + mainSize / 2 - plusSize / 2;
        const plusScale = plusSize / 16;
        out += `<g transform="translate(${plusX}, ${plusY}) scale(${plusScale})"><path d="${PLUS_ICON_PATH}" fill="${LAYOUT.labelColor}" stroke="${LAYOUT.labelColor}" stroke-width="${LAYOUT.plusStrokeW}" stroke-linejoin="round"/></g>`;
      }
    });
    const altStartY = whiteBoxY + T.altOffsetY;
    team.chars.slice(1, 4).forEach((c, ci) => {
      const rowY = altStartY + ci * (T.altSize + T.altRowGap);
      const alts = c.alts.filter(a => a.name || a.img).slice(0, 4);
      const altSize = T.altSize, altGap = T.altGap;
      const label = `${ci + 2}号位备选`;
      const labelFs = 10;
      const labelW = measureTextWidth(label, labelFs);
      const rangeL = x + T.altLabelPadL + labelW;
      const rangeR = x + teamW - T.altRangePadR;
      const rangeW = rangeR - rangeL;
      const centerX = rangeL + rangeW / 2;
      const clusterW = alts.length ? alts.length * altSize + (alts.length - 1) * altGap : 0;
      const startX = centerX - clusterW / 2;
      const emptyAltText = c.emptyAltText || '暂无备选';
      out += text(x + T.altLabelPadL, rowY + altSize / 2, label, labelFs, { fill: LAYOUT.labelColor, weight: 500 });
      if (!alts.length) out += wrappedCenteredText(rangeL, rowY, rangeW, altSize, emptyAltText, rangeW, 10, 5, EMPTY_FILL);
      alts.forEach((a, ai) => {
        const ax = startX + ai * (altSize + altGap);
        const altField = `team.${ti}.char.${ci + 1}.alt.${ai}.name`;
        out += slot(ax, rowY, altSize, a.img, a.name, `ta_${ti}_${ci + 1}_${ai}`, altField);
      });
    });
    return out;
  }).join('');
}
function panelRect(x, y, w, h, rx) {
  const theme = State.data.theme || '#939393';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="rgba(0,0,0,.5)" stroke="${theme}" stroke-width="2" filter="url(#glowTheme)"/>`;
}
function buildSVG(scale = 1) {
  const d = State.data;
  const W = SVG_W * scale, H = SVG_H * scale;
  const fontFace = d.fontData ? `@font-face{font-family:CardCustomFont;src:url("${d.fontData}");font-display:block}` : '';
  const fontFamily = d.fontData ? FONT_FAMILY_CUSTOM : FONT_FAMILY_DEFAULT;
  const nameFs = fitSize(d.charName, 280, 50, 18);
  const imgX = Number(d.imgX) || 0;
  const leftX = LAYOUT.left.x, leftY = LAYOUT.left.y, leftW = LAYOUT.left.w, leftH = LAYOUT.left.h;
  const imgMeta = d.charImgMeta || {};
  const imgIW = Number(imgMeta.w) || 0;
  const imgIH = Number(imgMeta.h) || 0;
  const charDrawH = leftH;
  const charDrawW = (imgIW > 0 && imgIH > 0) ? Math.round(leftH * imgIW / imgIH) : leftW;
  const charDrawY = leftY;
  const charDrawX = leftX + (leftW - charDrawW) / 2 + imgX;
  const nameElemCenterX = leftX + leftW / 2;
  const nameElemCenterY = leftY + leftH - 100;
  const nbMeta = d.nameBgImgMeta || {};
  const nbW = Number(nbMeta.w) || 0, nbH = Number(nbMeta.h) || 0;
  let elemBgW, elemBgH;
  if (nbW > 0 && nbH > 0) {
    if (nbW >= nbH) { elemBgW = leftW / 2; elemBgH = Math.round(elemBgW * nbH / nbW); }
    else { elemBgH = leftW / 2; elemBgW = Math.round(elemBgH * nbW / nbH); }
  } else { elemBgW = leftW / 2; elemBgH = elemBgW; }
  const elemBgX = nameElemCenterX - elemBgW / 2;
  const elemBgY = nameElemCenterY - elemBgH / 2;
  const infoRows = [
    d.version ? ['当前版本:', d.version, 'version'] : null,
    d.date ? ['制作日期:', d.date, 'date'] : null,
    d.author ? ['作者:', d.author, 'author'] : null
  ].filter(Boolean);
  const infoFs = 12;
  const CI = LAYOUT.charInfo;
  const infoBottomCenterY = leftY + leftH - CI.padB - infoFs / 2;
  let info = '';
  infoRows.forEach((r, i) => {
    const ix = leftX + CI.padL;
    const iy = infoBottomCenterY - (infoRows.length - 1 - i) * CI.lineGap;
    info += text(ix, iy, `${r[0]} ${r[1]}`, infoFs, { fill: '#ffffff', stroke: '#000000', strokeWidth: 1.2, field: r[2] });
  });
  const row2Y = LAYOUT.layers.row2.y, row2H = LAYOUT.layers.row2.h;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
    <defs>
      <style>${fontFace} text { font-family: ${fontFamily}; paint-order: stroke fill; }</style>
      <linearGradient id="slotBottomGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="50%" stop-color="#000" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#000" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="sepGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="50%" stop-color="#fff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="glowTheme" x="-200%" y="-200%" width="500%" height="500%">
        <feComponentTransfer in="SourceAlpha" result="alphaFull"><feFuncA type="linear" slope="2" intercept="0"/></feComponentTransfer>
        <feGaussianBlur in="alphaFull" stdDeviation="1.8" result="blur"/>
        <feComposite in="blur" in2="alphaFull" operator="out" result="outer"/>
        <feFlood flood-color="#ffffff" flood-opacity="1" result="white"/>
        <feComposite in="white" in2="outer" operator="in" result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glowThemeSmall" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="100" result="blur"/>
        <feComposite in="blur" in2="SourceAlpha" operator="out" result="outer"/>
        <feFlood flood-color="#ffffff" flood-opacity="1" result="white"/>
        <feComposite in="white" in2="outer" operator="in" result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="leftClip"><rect x="${leftX}" y="${leftY}" width="${leftW}" height="${leftH}" rx="${LAYOUT.radius.panel}"/></clipPath>
    </defs>
    <rect width="${SVG_W}" height="${SVG_H}" fill="#000"/>
    ${d.bgImg ? image(d.bgImg, 0, 0, SVG_W, SVG_H) : ''}
    <rect width="${SVG_W}" height="${SVG_H}" fill="rgba(0,0,0,0.25)"/>
    ${rect(leftX, leftY, leftW, leftH, 'rgba(0,0,0,.5)', '', 0, LAYOUT.radius.panel)}
    ${d.charImg ? image(d.charImg, charDrawX, charDrawY, charDrawW, charDrawH, 'xMidYMid meet', 'clip-path="url(#leftClip)"') : ''}
    ${info}
    ${d.nameBgImg ? image(d.nameBgImg, elemBgX, elemBgY, elemBgW, elemBgH, 'xMidYMid meet', 'opacity="0.75"') : ''}
    ${text(nameElemCenterX, nameElemCenterY, d.charName, nameFs, { anchor: 'middle', weight: 400, field: 'charName', fit: { maxW: 280, base: 50, min: 18 }, extra: 'filter="drop-shadow(0 3px 5px rgba(0,0,0,.9))"' })}
    ${panelRect(LAYOUT.right.x, LAYOUT.layers.weapon.y, LAYOUT.right.w, LAYOUT.layers.weapon.h, LAYOUT.radius.panel)}
    ${sectionTitle(LAYOUT.right.x + LAYOUT.title.offX, LAYOUT.layers.weapon.y + LAYOUT.title.offY, '武器推荐')}
    ${buildWeapons()}
    ${panelRect(LAYOUT.layers.artifact.x, row2Y, LAYOUT.layers.artifact.w, row2H, LAYOUT.radius.panel)}
    ${sectionTitle(LAYOUT.layers.artifact.x + LAYOUT.title.offX, row2Y + LAYOUT.title.offY, '圣遗物推荐')}
    ${buildArtifacts()}
    ${panelRect(LAYOUT.layers.talent.x, row2Y, LAYOUT.layers.talent.w, row2H, LAYOUT.radius.panel)}
    ${sectionTitle(LAYOUT.layers.talent.x + LAYOUT.title.offX, row2Y + LAYOUT.title.offY, '天赋加点')}
    ${buildTalents()}
    ${midSection(LAYOUT.layers.mid.stat, '词条推荐', buildStats())}
    ${midSection(LAYOUT.layers.mid.panel, '面板参考', buildPanel())}
    ${midSection(LAYOUT.layers.mid.cons, '核心命座', buildConstellations())}
    ${panelRect(LAYOUT.right.x, LAYOUT.layers.team.y, LAYOUT.right.w, LAYOUT.layers.team.h, LAYOUT.radius.panel)}
    ${sectionTitle(LAYOUT.right.x + LAYOUT.title.offX, LAYOUT.layers.team.y + LAYOUT.title.offY, '配队参考')}
    ${buildTeams()}
  </svg>`;
}

/* =========================================================================
 * 【JS 模块 8】预览挂载与字段增量更新
 * ========================================================================= */
let previewSvgEl = null;
const previewIndex = new Map();
let renderTimer = null;
function mountPreview() {
  const host = document.getElementById('svgPreviewHost');
  if (!host) return;
  host.innerHTML = buildSVG(1);
  previewSvgEl = host.querySelector('svg');
  previewIndex.clear();
  if (previewSvgEl) {
    previewSvgEl.querySelectorAll('[data-field]').forEach(el => {
      const f = el.dataset.field;
      if (!previewIndex.has(f)) previewIndex.set(f, []);
      previewIndex.get(f).push(el);
    });
  }
}
function applyTextFieldUpdate(el, textValue, fill) {
  el.textContent = textValue == null ? '' : String(textValue);
  if (fill) el.setAttribute('fill', fill);
  const maxW = el.dataset.fitMaxW;
  if (maxW) {
    const base = +el.dataset.fitBase || 12;
    const min = +el.dataset.fitMin || 8;
    el.setAttribute('font-size', fitSize(String(textValue || ''), +maxW, base, min));
  }
}
function getFieldDisplayValue(field) {
  const d = State.data;
  if (field === 'charName') return { text: d.charName || '' };
  if (field === 'version') return { text: d.version ? `当前版本: ${d.version}` : '' };
  if (field === 'date') return { text: d.date ? `制作日期: ${d.date}` : '' };
  if (field === 'author') return { text: d.author ? `作者: ${d.author}` : '' };
  if (field === 'talent.A') return { text: d.talentA || '—' };
  if (field === 'talent.E') return { text: d.talentE || '—' };
  if (field === 'talent.Q') return { text: d.talentQ || '—' };
  if (field === 'stat.sandMain') return { text: d.sandMain || '' };
  if (field === 'stat.gobMain') return { text: d.gobMain || '' };
  if (field === 'stat.cirMain') return { text: d.cirMain || '' };
  if (field.startsWith('panel.')) {
    const key = field.slice(6);
    const v = (d.panel && d.panel[key]) || '';
    return { text: v || PANEL_EMPTY_TEXT, fill: v ? '#fff' : EMPTY_FILL };
  }
  let m = /^weapon\.(\w+)\.(\d+)\.name$/.exec(field);
  if (m) { const arr = d.weaponData?.[m[1]]; return { text: (arr && arr[+m[2]] && arr[+m[2]].name) || '' }; }
  m = /^artifact\.(\d+)\.name$/.exec(field);
  if (m) { const a = d.artifactData?.[+m[1]]; return { text: (a && a.name) || '' }; }
  m = /^team\.(\d+)\.name$/.exec(field);
  if (m) { const t = d.teamData?.[+m[1]]; return { text: (t && t.name) || '' }; }
  m = /^team\.(\d+)\.char\.(\d+)\.name$/.exec(field);
  if (m) {
    const ci = +m[2];
    if (ci === 0) return { text: d.charName || '' };
    const c = d.teamData?.[+m[1]]?.chars?.[ci];
    return { text: (c && c.name) || '' };
  }
  m = /^team\.(\d+)\.char\.(\d+)\.alt\.(\d+)\.name$/.exec(field);
  if (m) {
    const a = d.teamData?.[+m[1]]?.chars?.[+m[2]]?.alts?.[+m[3]];
    return { text: (a && a.name) || '' };
  }
  return null;
}
function updatePreviewField(field) {
  if (!previewSvgEl || !previewIndex.size) { mountPreview(); return; }
  const els = previewIndex.get(field);
  if (!els || !els.length) { mountPreview(); return; }
  const info = getFieldDisplayValue(field);
  if (!info) { mountPreview(); return; }
  els.forEach(el => applyTextFieldUpdate(el, info.text, info.fill));
}
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => { syncInputs(); mountPreview(); debouncedSave(); }, 40);
}
function syncInputs() {
  const map = ['charName','version','date','author','sandMain','gobMain','cirMain','subStats','talentA','talentE','talentQ'];
  map.forEach(id => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = State.data[id] ?? '';
  });
  const elImgX = document.getElementById('imgX');
  const sImgX = document.getElementById('imgXSlider');
  if (elImgX && document.activeElement !== elImgX) elImgX.value = State.data.imgX ?? 0;
  if (sImgX && document.activeElement !== sImgX) sImgX.value = State.data.imgX ?? 0;
  const p = State.data.panel || {};
  const panelMap = {
    panelPrimaryKey: p.primaryKey || 'hp',
    panelPrimaryValue: p.primaryValue || '',
    panelCr: p.cr || '', panelCd: p.cd || '', panelEm: p.em || '', panelEr: p.er || ''
  };
  Object.keys(panelMap).forEach(id => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = panelMap[id];
  });
  document.documentElement.style.setProperty('--accent', State.data.theme);
  document.documentElement.style.setProperty('--accent-dark', darken(State.data.theme, 50));
}

/* =========================================================================
 * 【JS 模块 8.5】Tab Sheet
 * ========================================================================= */
function renderTabSheetList() {
  const el = document.getElementById('tabSheetList');
  if (!el) return;
  el.innerHTML = TAB_DEFS.map(t => `
    <button type="button" class="tab-sheet-item ${t.key === currentTab ? 'active' : ''}" onclick="App.selectTab('${t.key}')">
      <span>${t.label}</span>
      <svg class="tab-sheet-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
    </button>`).join('');
}
function openTabSheet() {
  if (tabSheetOpen) return;
  tabSheetOpen = true;
  renderTabSheetList();
  document.getElementById('tabSheetBackdrop').classList.add('show');
  document.getElementById('tabSheet').classList.add('show');
  const trigger = document.getElementById('tabTrigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
}
function closeTabSheet() {
  if (!tabSheetOpen) return;
  tabSheetOpen = false;
  document.getElementById('tabSheetBackdrop').classList.remove('show');
  document.getElementById('tabSheet').classList.remove('show');
  const trigger = document.getElementById('tabTrigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}
function selectTab(tabId) {
  if (!TAB_DEFS.find(t => t.key === tabId)) return;
  currentTab = tabId;
  document.querySelectorAll('.tabs-content .tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`tab-${tabId}`);
  if (panel) panel.classList.add('active');
  const label = document.getElementById('tabTriggerLabel');
  if (label) label.textContent = TAB_DEFS.find(t => t.key === tabId).label;
  const tc = document.querySelector('.tabs-content');
  if (tc) tc.scrollTop = 0;
  closeTabSheet();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && tabSheetOpen) closeTabSheet(); });

/* =========================================================================
 * 【JS 模块 9】UI 编辑器
 * ========================================================================= */
const collapseState = {};
function toggleCollapse(key) { collapseState[key] = !collapseState[key]; renderEditorsByKey(); }
function isCollapsed(key) { return !!collapseState[key]; }

function renderColorPicker() {
  const el = document.getElementById('colorPicker');
  if (!el) return;
  el.innerHTML = elementColors.map(([name, color, iconKey]) => {
    const isMatch = (State.data.theme || '').toLowerCase() === color.toLowerCase();
    const icon = ELEMENT_ICONS[iconKey] || '';
    return `<div class="swatch-btn ${isMatch ? 'active' : ''}" onclick="App.setTheme('${color}')" style="color:${color};">
      <span style="display:inline-flex;width:1em;height:1em;">${icon}</span>
      <span style="color:var(--text-secondary);">${name}</span>
    </div>`;
  }).join('');
}
function setTheme(color) {
  State.data.theme = color;
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-dark', darken(color, 50));
  renderColorPicker();
  mountPreview();
  debouncedSave();
}
function renderConstellationEditor() {
  const el = document.getElementById('constellationEditor');
  if (!el) return;
  el.innerHTML = State.data.constellationData.map((c, i) => `
    <div class="cons-item ${c.active ? 'active' : ''}">
      <div class="cons-badge" onclick="App.toggleConstellation(${i})">${i + 1}</div>
      <input type="text" value="${esc(c.desc)}" placeholder="${i + 1}命核心效果描述" oninput="App.setConstellationDesc(${i}, this.value)" />
    </div>`).join('');
}
function toggleConstellation(i) {
  if (!State.data.constellationData[i]) return;
  State.data.constellationData[i].active = !State.data.constellationData[i].active;
  renderConstellationEditor(); mountPreview(); debouncedSave();
}
function setConstellationDesc(i, value) {
  if (!State.data.constellationData[i]) return;
  State.data.constellationData[i].desc = value;
  mountPreview(); debouncedSave();
}
function renderWeaponEditor() {
  const el = document.getElementById('weaponEditor');
  if (!el) return;
  el.innerHTML = WEAPON_ORDER.map(type => {
    const key = `weapon_${type}`;
    const collapsed = isCollapsed(key);
    const toggleIcon = collapsed ? ICONS.expand : ICONS.collapse;
    const toggleText = collapsed ? '展开' : '收起';
    const group = State.data.weaponData[type];
    const list = group.map((w, i) => {
      const upDisabled = !canMoveWeapon(type, i, -1);
      const downDisabled = !canMoveWeapon(type, i, 1);
      return `
      <div class="item-card">
        <div class="item-header">
          <span style="font-size:12px;color:var(--text-secondary);font-weight:600;">#${i + 1} ${WEAPON_LABELS[type]}武器</span>
          <div class="item-actions">
            <button class="btn-xs" onclick="App.moveWeapon('${type}',${i},-1)" ${upDisabled ? 'disabled' : ''}>${ICONS.up}上移</button>
            <button class="btn-xs" onclick="App.moveWeapon('${type}',${i},1)" ${downDisabled ? 'disabled' : ''}>${ICONS.down}下移</button>
            <button class="btn-xs btn-danger" onclick="App.removeWeapon('${type}',${i})">${ICONS.trash}删除</button>
          </div>
        </div>
        <div class="item-row">
          <img src="${w.img || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('w_img_${type}_${i}')" alt="" />
          <input type="text" value="${esc(w.name)}" oninput="App.setWeaponName('${type}',${i},this.value)" onblur="App.matchWeaponIcon('${type}',${i},this.value)" style="flex:1;" />
          <input type="file" id="w_img_${type}_${i}" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.weaponData['${type}'][${i}].img = v; App.renderWeaponEditor(); App.mountPreview(); App.debouncedSave(); })" />
        </div>
      </div>`;
    }).join('');
    return `<div class="ios-group" style="padding:10px;">
      <div style="display:flex;align-items:center;margin-bottom:${collapsed ? '0' : '8px'};flex-wrap:wrap;gap:6px;">
        <span style="font-size:13px;font-weight:600;color:var(--accent);">${WEAPON_LABELS[type]}武器 (${group.length}/${WEAPON_MAX})</span>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;margin-left:auto;">
          <button class="ios-btn-fill btn-xs" onclick="App.addWeapon('${type}')">${ICONS.plus}添加</button>
          <button class="btn-xs" onclick="App.toggleCollapse('${key}')">${toggleIcon}${toggleText}</button>
        </div>
      </div>
      ${collapsed ? '' : `<div style="display:flex;flex-direction:column;gap:6px;">${list || '<div style="font-size:12px;color:var(--text-tertiary);padding:4px 0;">暂无配置</div>'}</div>`}
    </div>`;
  }).join('');
}
function renderArtifactEditor() {
  const sectionKey = 'artifact_section';
  const isSectionCollapsed = isCollapsed(sectionKey);
  const toggleIcon = isSectionCollapsed ? ICONS.expand : ICONS.collapse;
  const toggleText = isSectionCollapsed ? '展开' : '收起';
  const headEl = document.getElementById('artifactSectionHead');
  if (headEl) {
    headEl.innerHTML = `<span>圣遗物推荐 (${State.data.artifactData.length})</span>
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; justify-content:flex-end; margin-left:auto;">
        <button class="ios-btn-fill btn-xs" onclick="App.addArtifact('single')">${ICONS.plus}整套</button>
        <button class="ios-btn-fill btn-xs" onclick="App.addArtifact('double')">${ICONS.plus}散搭</button>
        <button class="btn-xs" onclick="App.toggleCollapse('${sectionKey}')">${toggleIcon}${toggleText}</button>
      </div>`;
  }
  const editorEl = document.getElementById('artifactEditor');
  if (!editorEl) return;
  if (isSectionCollapsed) { editorEl.style.display = 'none'; return; }
  editorEl.style.display = 'flex';
  editorEl.innerHTML = State.data.artifactData.map((a, i) => {
    if (a.type === 'double') {
      return `<div class="item-card">
        <div class="item-header">
          <span style="font-size:12px;color:var(--accent);font-weight:600;">散搭 #${i + 1}</span>
          <div class="item-actions">
            <button class="btn-xs" onclick="App.moveArtifact(${i},-1)" ${i === 0 ? 'disabled' : ''}>${ICONS.up}上移</button>
            <button class="btn-xs" onclick="App.moveArtifact(${i},1)" ${i === State.data.artifactData.length - 1 ? 'disabled' : ''}>${ICONS.down}下移</button>
            <button class="btn-xs btn-danger" onclick="App.removeArtifact(${i})">${ICONS.trash}删除</button>
          </div>
        </div>
        <input type="text" value="${esc(a.displayText)}" placeholder="卡片显示文本（可选，留空显示两个名字）" oninput="App.setArtifactDisplayText(${i},this.value)" />
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;display:flex;align-items:center;gap:8px;min-width:140px;">
            <img src="${a.img1 || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('a_img1_${i}')" alt="" />
            <input type="text" value="${esc(a.name1)}" placeholder="圣遗物1" oninput="App.setArtifactName1(${i},this.value)" onblur="App.matchArtifactDoubleIcon(${i},1,this.value)" style="flex:1;min-width:0;" />
            <input type="file" id="a_img1_${i}" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.artifactData[${i}].img1 = v; App.renderArtifactEditor(); App.mountPreview(); App.debouncedSave(); })" />
          </div>
          <div style="flex:1;display:flex;align-items:center;gap:8px;min-width:140px;">
            <img src="${a.img2 || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('a_img2_${i}')" alt="" />
            <input type="text" value="${esc(a.name2)}" placeholder="圣遗物2" oninput="App.setArtifactName2(${i},this.value)" onblur="App.matchArtifactDoubleIcon(${i},2,this.value)" style="flex:1;min-width:0;" />
            <input type="file" id="a_img2_${i}" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.artifactData[${i}].img2 = v; App.renderArtifactEditor(); App.mountPreview(); App.debouncedSave(); })" />
          </div>
        </div>
      </div>`;
    }
    return `<div class="item-card">
      <div class="item-header">
        <span style="font-size:12px;color:var(--text-primary);font-weight:600;">整套 #${i + 1}</span>
        <div class="item-actions">
          <button class="btn-xs" onclick="App.moveArtifact(${i},-1)" ${i === 0 ? 'disabled' : ''}>${ICONS.up}上移</button>
          <button class="btn-xs" onclick="App.moveArtifact(${i},1)" ${i === State.data.artifactData.length - 1 ? 'disabled' : ''}>${ICONS.down}下移</button>
          <button class="btn-xs btn-danger" onclick="App.removeArtifact(${i})">${ICONS.trash}删除</button>
        </div>
      </div>
      <div class="item-row">
        <img src="${a.img || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('a_img_${i}')" alt="" />
        <input type="text" value="${esc(a.name)}" oninput="App.setArtifactName(${i},this.value)" onblur="App.matchArtifactIcon(${i},this.value)" style="flex:1;" />
        <input type="file" id="a_img_${i}" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.artifactData[${i}].img = v; App.renderArtifactEditor(); App.mountPreview(); App.debouncedSave(); })" />
      </div>
    </div>`;
  }).join('') || '<div style="font-size:12px;color:var(--text-tertiary);padding:4px 0;">暂无圣遗物</div>';
}
function renderTeamEditor() {
  const el = document.getElementById('teamEditor');
  if (!el) return;
  el.innerHTML = State.data.teamData.map((team, ti) => {
    const teamKey = `team_${ti}`;
    const teamCollapsed = isCollapsed(teamKey);
    const teamToggleIcon = teamCollapsed ? ICONS.expand : ICONS.collapse;
    const teamToggleText = teamCollapsed ? '展开' : '收起';
    return `<div class="ios-group" style="padding:10px;">
      <div class="item-header" style="margin-bottom:${teamCollapsed ? '0' : '8px'};">
        <span style="font-size:13px;color:var(--accent);font-weight:600;">队伍 ${ti + 1}</span>
        <div class="item-actions">
          <button class="btn-xs" onclick="App.moveTeam(${ti},-1)" ${ti === 0 ? 'disabled' : ''}>${ICONS.up}上移</button>
          <button class="btn-xs" onclick="App.moveTeam(${ti},1)" ${ti === State.data.teamData.length - 1 ? 'disabled' : ''}>${ICONS.down}下移</button>
          <button class="btn-xs" onclick="App.toggleCollapse('${teamKey}')">${teamToggleIcon}${teamToggleText}</button>
          <button class="btn-xs btn-danger" onclick="App.removeTeam(${ti})">${ICONS.trash}删除</button>
        </div>
      </div>
      ${teamCollapsed ? '' : `
        <input type="text" value="${esc(team.name)}" oninput="App.setTeamName(${ti},this.value)" />
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
          ${team.chars.slice(1, 4).map((c, idx) => {
            const ci = idx + 1;
            const charKey = `team_${ti}_char_${ci}`;
            const charCollapsed = isCollapsed(charKey);
            const charToggleIcon = charCollapsed ? ICONS.expand : ICONS.collapse;
            const charToggleText = charCollapsed ? '展开' : '收起';
            return `<div class="item-card">
              <div class="item-header">
                <span style="font-size:12px;color:var(--accent);font-weight:600;">${ci + 1}号位主角色</span>
                <div class="item-actions">
                  <button class="btn-xs" onclick="App.moveTeamChar(${ti},${ci},-1)" ${ci === 1 ? 'disabled' : ''}>${ICONS.up}上移</button>
                  <button class="btn-xs" onclick="App.moveTeamChar(${ti},${ci},1)" ${ci === 3 ? 'disabled' : ''}>${ICONS.down}下移</button>
                  <button class="btn-xs" onclick="App.toggleCollapse('${charKey}')">${charToggleIcon}${charToggleText}</button>
                </div>
              </div>
              ${charCollapsed ? '' : `
                <div class="item-row">
                  <img src="${c.img || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('t_${ti}_${ci}_img')" alt="" />
                  <input type="text" value="${esc(c.name)}" oninput="App.setTeamCharName(${ti},${ci},this.value)" onblur="App.matchTeamCharIcon(${ti},${ci},this.value)" style="flex:1;" />
                  <input type="file" id="t_${ti}_${ci}_img" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.teamData[${ti}].chars[${ci}].img = v; App.renderTeamEditor(); App.mountPreview(); App.debouncedSave(); })" />
                </div>
                <div style="margin-left:8px;padding-left:8px;border-left:2px solid var(--border-subtle);display:flex;flex-direction:column;gap:6px;margin-top:4px;">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">备选角色 (${c.alts.length}/4)</span>
                    <button class="ios-btn-fill btn-xs" style="margin-left:auto;" onclick="App.addAlt(${ti},${ci})">${ICONS.plus}添加</button>
                  </div>
                  ${c.alts.map((a, ai) => `
                    <div class="item-card" style="background:var(--bg-surface);padding:8px;">
                      <div class="item-header">
                        <span style="font-size:11px;color:var(--text-secondary);">备选 #${ai + 1}</span>
                        <div class="item-actions">
                          <button class="btn-xs" onclick="App.moveAlt(${ti},${ci},${ai},-1)" ${ai === 0 ? 'disabled' : ''}>${ICONS.up}上移</button>
                          <button class="btn-xs" onclick="App.moveAlt(${ti},${ci},${ai},1)" ${ai === c.alts.length - 1 ? 'disabled' : ''}>${ICONS.down}下移</button>
                          <button class="btn-xs btn-danger" onclick="App.removeAlt(${ti},${ci},${ai})">${ICONS.trash}删除</button>
                        </div>
                      </div>
                      <div class="item-row">
                        <img src="${a.img || placeholder('')}" class="clickable-thumb" onclick="App.triggerUpload('t_${ti}_${ci}_${ai}_img')" alt="" />
                        <input type="text" value="${esc(a.name)}" oninput="App.setAltName(${ti},${ci},${ai},this.value)" style="flex:1;" />
                        <input type="file" id="t_${ti}_${ci}_${ai}_img" accept="image/*" style="display:none" onchange="App.uploadImageHandler(this, v => { State.data.teamData[${ti}].chars[${ci}].alts[${ai}].img = v; App.renderTeamEditor(); App.mountPreview(); App.debouncedSave(); })" />
                      </div>
                    </div>`).join('')}
                  ${!c.alts.length ? `<input type="text" value="${esc(c.emptyAltText || '暂无备选')}" oninput="App.setEmptyAltText(${ti},${ci},this.value)" />` : ''}
                </div>`}
            </div>`;
          }).join('')}
        </div>`}
    </div>`;
  }).join('') || '<div style="font-size:12px;color:var(--text-tertiary);padding:4px 0;">暂未添加配队</div>';
}
function renderEditorsByKey() {
  renderColorPicker();
  renderWeaponEditor();
  renderArtifactEditor();
  renderConstellationEditor();
  renderTeamEditor();
}
function updateThumb(thumbId, labelId, src, labelText) {
  const thumb = document.getElementById(thumbId);
  if (thumb) thumb.src = src;
  const label = document.getElementById(labelId);
  if (label) label.textContent = labelText;
}
function resetThumb(thumbId, labelId, labelText) {
  const thumb = document.getElementById(thumbId);
  if (thumb) thumb.removeAttribute('src');
  const label = document.getElementById(labelId);
  if (label) label.textContent = labelText;
}
function initThumbnails() {
  const d = State.data;
  if (d.charImg) updateThumb('thumbCharImg', 'labelCharImg', d.charImg, '已载入立绘（点击更换）');
  else resetThumb('thumbCharImg', 'labelCharImg', '点击上传立绘');
  if (d.nameBgImg) updateThumb('thumbNameBg', 'labelNameBg', d.nameBgImg, '已载入元素图（点击更换）');
  else resetThumb('thumbNameBg', 'labelNameBg', '点击上传元素图');
  if (d.bgImg) updateThumb('thumbBg', 'labelBg', d.bgImg, '已载入大背景（点击更换）');
  else resetThumb('thumbBg', 'labelBg', '默认暗黑原力色');
  if (d.teamCoreImg) updateThumb('thumbTeamCore', 'labelTeamCore', d.teamCoreImg, '已载入1号位头像（点击更换）');
  else resetThumb('thumbTeamCore', 'labelTeamCore', '主角色一号位头像（点击更换）');
  const fontLabel = document.getElementById('labelCustomFont');
  if (fontLabel) {
    if (d.fontName) fontLabel.textContent = '当前：' + d.fontName;
    else if (d.fontData) fontLabel.textContent = '已载入自定义字体';
    else fontLabel.textContent = '默认标准字体';
  }
  updateImgXHint();
}
function clearImage(stateKey, thumbId, labelId) {
  State.data[stateKey] = '';
  State.data[stateKey + 'Deleted'] = true;
  if (stateKey === 'charImg') State.data.charImgMeta = null;
  if (stateKey === 'nameBgImg') State.data.nameBgImgMeta = null;
  resetThumb(thumbId, labelId, '点击上传图片');
  updateImgXHint();
  mountPreview();
  debouncedSave();
}
function onThumbClick(inputId, stateKey) {
  if (State.data[stateKey]) {
    showToast('已有图片，如需更换请先删除', 'info');
    return;
  }
  triggerUpload(inputId);
}

/* =========================================================================
 * 【JS 模块 10】图片上传
 * ========================================================================= */
const IMAGE_WARN_SIZE = 15 * 1024 * 1024;
function triggerUpload(id) { document.getElementById(id)?.click(); }
function uploadImageHandler(input, setter) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > IMAGE_WARN_SIZE) {
    showConfirm('图片较大', `该图片 ${formatBytes(file.size)}，可能影响保存速度。是否继续？`).then(ok => {
      if (ok) doUpload(input, setter);
      else input.value = '';
    });
  } else {
    doUpload(input, setter);
  }
}
function doUpload(input, setter) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => { setter(e.target.result, img.width, img.height); mountPreview(); debouncedSave(); };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
  input.value = '';
}
/* 更新立绘偏移提示：有原图尺寸就显示尺寸，没有就显示默认文案 */
function updateImgXHint() {
  const el = document.getElementById('imgXHint');
  if (!el) return;
  const meta = State.data.charImgMeta;
  if (meta && meta.w && meta.h) {
    el.textContent = `立绘偏移（原图 ${meta.w}×${meta.h}）`;
  } else {
    el.textContent = '立绘偏移（左右移动）';
  }
}

/* =========================================================================
 * 【JS 模块 10.3】字体库
 * ========================================================================= */
let FONT_LIST = [];
let fontSheetOpen = false;

async function loadFontList() {
  try {
    const res = await fetch('../../shared/fonts/fonts.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    FONT_LIST = Array.isArray(json.fonts) ? json.fonts : [];
  } catch (e) {
    FONT_LIST = [];
    console.warn('字体清单加载失败：', e.message);
  }
}
function renderFontSheetList() {
  const el = document.getElementById('fontSheetList');
  if (!el) return;
  const currentFile = State.data.fontFileName || '';
  let html = '<button type="button" class="tab-sheet-item ' + (currentFile === '' ? 'active' : '') + '" onclick="App.selectFont(-1)">' +
    '<span>默认系统字体</span>' +
    '<svg class="tab-sheet-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
  '</button>';
  if (!FONT_LIST.length) {
    html += '<div style="padding:20px;text-align:center;color:var(--text-tertiary);font-size:13px;">字体库为空</div>';
  } else {
    html += FONT_LIST.map((f, i) => {
      const isActive = currentFile === f.file;
      return '<button type="button" class="tab-sheet-item ' + (isActive ? 'active' : '') + '" onclick="App.selectFont(' + i + ')">' +
        '<span>' + esc(f.name) + '</span>' +
        '<svg class="tab-sheet-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</button>';
    }).join('');
  }
  el.innerHTML = html;
}
function openFontPicker() {
  if (fontSheetOpen) return;
  fontSheetOpen = true;
  renderFontSheetList();
  document.getElementById('fontSheetBackdrop').classList.add('show');
  document.getElementById('fontSheet').classList.add('show');
}
function closeFontPicker() {
  if (!fontSheetOpen) return;
  fontSheetOpen = false;
  document.getElementById('fontSheetBackdrop').classList.remove('show');
  document.getElementById('fontSheet').classList.remove('show');
}
let loadedFontFace = null;
async function installPreviewFont() {
  if (!State.data.fontData || !window.FontFace) return;
  try {
    if (loadedFontFace) { try { document.fonts.delete(loadedFontFace); } catch (e) {} loadedFontFace = null; }
    const ff = new FontFace('CardCustomFont', `url("${State.data.fontData}")`);
    const loaded = await ff.load();
    document.fonts.add(loaded);
    loadedFontFace = loaded;
    await document.fonts.ready;
  } catch (e) {}
}
async function selectFont(index) {
  closeFontPicker();
  const labelEl = document.getElementById('labelCustomFont');
  if (index === -1) {
    State.data.fontData = ''; State.data.fontFileName = ''; State.data.fontName = '';
    if (loadedFontFace) { try { document.fonts.delete(loadedFontFace); } catch (e) {} loadedFontFace = null; }
    if (labelEl) labelEl.textContent = '默认标准字体';
    mountPreview(); debouncedSave();
    return;
  }
  const f = FONT_LIST[index];
  if (!f) return;
  if (State.data.fontFileName === f.file && State.data.fontData) {
    if (labelEl) labelEl.textContent = '当前：' + f.name;
    return;
  }
  if (labelEl) labelEl.textContent = '正在加载 ' + f.name + '…';
  try {
    const res = await fetch('../../shared/fonts/' + encodeURIComponent(f.file));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf]);
    const dataURL = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    State.data.fontData = dataURL;
    State.data.fontFileName = f.file;
    State.data.fontName = f.name;
    await installPreviewFont();
    if (labelEl) labelEl.textContent = '当前：' + f.name;
    mountPreview(); debouncedSave();
  } catch (e) {
    if (labelEl) labelEl.textContent = '字体加载失败：' + e.message;
  }
}

/* =========================================================================
 * 【JS 模块 10.4】characters.txt 读取
 * ========================================================================= */
async function loadCharOrderTxt() {
  try {
    const res = await fetch('../../shared/data/characters.txt?t=' + Date.now());
    if (!res.ok) { console.warn('characters.txt HTTP ' + res.status); return; }
    const text = await res.text();
    CHAR_NAME_TO_ORDER = {};
    text.split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const parts = line.split(/[\s,，\t]+/);
      if (parts.length < 2) return;
      const order = parseInt(parts[0], 10);
      const name = parts.slice(1).join(' ').trim();
      if (!order || !name) return;
      CHAR_NAME_TO_ORDER[name] = order;
    });
    console.log('characters.txt 加载成功，共 ' + Object.keys(CHAR_NAME_TO_ORDER).length + ' 条');
  } catch (e) {
    console.warn('characters.txt 加载失败：', e.message);
  }
}

/* =========================================================================
 * 【JS 模块 10.5】样式图匹配 + 在线存档载入
 * ========================================================================= */
async function matchStyleImages() {
  const name = (State.data.charName || '').trim();
  if (!name) { showToast('请先填写角色名', 'error'); return; }
  State.data.charImgDeleted = false;
  State.data.nameBgImgDeleted = false;
  State.data.bgImgDeleted = false;
  showToast('正在匹配样式图…', 'info');
  const results = { standing: false, element: false, namecard: false };
  const order = CHAR_NAME_TO_ORDER[name];
  const shortId = findShortIdByName(name);

  let standingUrl = '';
  if (order) {
    const ghUrl = '../../shared/assets/characters/standing/' + padOrder(order) + '.' + name + '.png';
    if (await urlExists(ghUrl)) standingUrl = ghUrl;
  }
  if (standingUrl) {
    State.data.charImg = standingUrl;
    State.data.charImgMeta = null;
    updateThumb('thumbCharImg', 'labelCharImg', standingUrl, '已匹配立绘');
    results.standing = true;
  } else {
    State.data.charImg = '';
    resetThumb('thumbCharImg', 'labelCharImg', '点击上传立绘');
  }

  const elementName = themeToElementName();
  let elementUrl = '';
  if (elementName) {
    const ghUrl = '../../shared/assets/characters/element/' + elementName + '.png';
    if (await urlExists(ghUrl)) elementUrl = ghUrl;
  }
  if (elementUrl) {
    State.data.nameBgImg = elementUrl;
    State.data.nameBgImgMeta = null;
    updateThumb('thumbNameBg', 'labelNameBg', elementUrl, '已匹配元素图：' + elementName);
    results.element = true;
  } else {
    State.data.nameBgImg = '';
    resetThumb('thumbNameBg', 'labelNameBg', '点击上传元素图');
  }

  let namecardUrl = '';
  if (shortId) {
    const lmUrl = 'https://api.lunaris.moe/data/assets/namecardpic/UI_NameCardPic_' + shortId + '_P.png';
    if (await urlExists(lmUrl)) namecardUrl = lmUrl;
  }
  if (namecardUrl) {
    State.data.bgImg = namecardUrl;
    updateThumb('thumbBg', 'labelBg', namecardUrl, '已匹配名片图');
    results.namecard = true;
  } else {
    State.data.bgImg = '';
    resetThumb('thumbBg', 'labelBg', '默认暗黑原力色');
  }

  const failed = [];
  if (order && !results.standing) failed.push('立绘');
  if (elementName && !results.element) failed.push('元素图');
  if (shortId && !results.namecard) failed.push('名片图');
  if (!order) failed.push('立绘（characters.txt 无此角色）');
  if (!elementName) failed.push('元素图（未选元素色）');
  if (!shortId) failed.push('名片图（字典无此角色）');
  if (failed.length) showToast('未找到：' + failed.join('、'), 'error');
  else showToast('全部匹配成功', 'success');
  updateImgXHint();
  mountPreview(); debouncedSave();
}

async function loadSaveFromRepo() {
  const name = (State.data.charName || '').trim();
  if (!name) { showToast('请先填写角色名', 'error'); return; }
  const order = CHAR_NAME_TO_ORDER[name];
  if (!order) { showToast('characters.txt 中找不到「' + name + '」', 'error'); return; }
  const filename = padOrder(order) + '.' + name + '.json';
  const url = '../../shared/saves/characters/' + filename;
  showToast('正在查找存档…', 'info');
  try {
    const res = await fetch(url + '?t=' + Date.now());
    if (!res.ok) { showToast('未找到存档「' + filename + '」', 'error'); return; }
    const json = await res.json();
    const ok = await showConfirm('发现存档', '是否载入「' + name + '」的存档？当前编辑内容会被覆盖。');
    if (!ok) return;
    State.data = normalizeState(json);
    await installPreviewFont();
    initThumbnails();
    renderEditorsByKey();
    scheduleRender();
    showToast('存档载入成功', 'success');
  } catch (e) {
    showToast('存档读取失败：' + e.message, 'error');
  }
}

/* =========================================================================
 * 【JS 模块 10.6】图标库匹配
 * ========================================================================= */
async function matchWeaponIcon(type, i, name) {
  if (!window.ICON_LIB) return;
  var trimmed = (name || '').trim();
  if (!trimmed) { State.data.weaponData[type][i].img = ''; renderWeaponEditor(); mountPreview(); debouncedSave(); return; }
  try {
    const r = await ICON_LIB.fromName('weapons', trimmed);
    State.data.weaponData[type][i].img = (r && r.dataURL) ? r.dataURL : '';
    renderWeaponEditor(); mountPreview(); debouncedSave();
  } catch (e) {
    State.data.weaponData[type][i].img = '';
    renderWeaponEditor(); mountPreview(); debouncedSave();
  }
}
async function matchArtifactIcon(i, name) {
  if (!window.ICON_LIB) return;
  var trimmed = (name || '').trim();
  if (!trimmed) { State.data.artifactData[i].img = ''; renderArtifactEditor(); mountPreview(); debouncedSave(); return; }
  try {
    const r = await ICON_LIB.fromName('artifacts', trimmed);
    State.data.artifactData[i].img = (r && r.dataURL) ? r.dataURL : '';
    renderArtifactEditor(); mountPreview(); debouncedSave();
  } catch (e) {
    State.data.artifactData[i].img = '';
    renderArtifactEditor(); mountPreview(); debouncedSave();
  }
}
async function matchArtifactDoubleIcon(i, part, name) {
  if (!window.ICON_LIB) return;
  var trimmed = (name || '').trim();
  var imgKey = part === 1 ? 'img1' : 'img2';
  if (!trimmed) { State.data.artifactData[i][imgKey] = ''; renderArtifactEditor(); mountPreview(); debouncedSave(); return; }
  try {
    const r = await ICON_LIB.fromName('artifacts', trimmed);
    State.data.artifactData[i][imgKey] = (r && r.dataURL) ? r.dataURL : '';
  } catch (e) { State.data.artifactData[i][imgKey] = ''; }
  renderArtifactEditor(); mountPreview(); debouncedSave();
}
function setArtifactName1(i, v) { State.data.artifactData[i].name1 = v; mountPreview(); debouncedSave(); }
function setArtifactName2(i, v) { State.data.artifactData[i].name2 = v; mountPreview(); debouncedSave(); }
function setArtifactDisplayText(i, v) { State.data.artifactData[i].displayText = v; mountPreview(); debouncedSave(); }
async function matchTeamCharIcon(ti, ci, name) {
  if (!window.ICON_LIB) return;
  var trimmed = (name || '').trim();
  if (!trimmed) { State.data.teamData[ti].chars[ci].img = ''; renderTeamEditor(); mountPreview(); debouncedSave(); return; }
  try {
    const r = await ICON_LIB.fromName('characters', trimmed);
    State.data.teamData[ti].chars[ci].img = (r && r.dataURL) ? r.dataURL : '';
    renderTeamEditor(); mountPreview(); debouncedSave();
  } catch (e) {
    State.data.teamData[ti].chars[ci].img = '';
    renderTeamEditor(); mountPreview(); debouncedSave();
  }
}
async function matchCharAvatar(name) {
  if (!window.ICON_LIB) return;
  var trimmed = (name || '').trim();
  if (!trimmed) {
    State.data.teamCoreImg = '';
    resetThumb('thumbTeamCore', 'labelTeamCore', '主角色一号位头像（点击更换）');
    mountPreview(); debouncedSave(); return;
  }
  try {
    const r = await ICON_LIB.fromName('characters', trimmed);
    if (r && r.dataURL) {
      State.data.teamCoreImg = r.dataURL;
      updateThumb('thumbTeamCore', 'labelTeamCore', r.dataURL, '已载入1号位头像（点击更换）');
    } else {
      State.data.teamCoreImg = '';
      resetThumb('thumbTeamCore', 'labelTeamCore', '主角色一号位头像（点击更换）');
    }
    mountPreview(); debouncedSave();
  } catch (e) {
    State.data.teamCoreImg = '';
    resetThumb('thumbTeamCore', 'labelTeamCore', '主角色一号位头像（点击更换）');
    mountPreview(); debouncedSave();
  }
}

/* =========================================================================
 * 【JS 模块 11】数据归一化
 * ========================================================================= */
function normalizeWeaponList(list) {
  return Array.isArray(list) ? list.map(w => ({ name: String(w?.name ?? ''), img: String(w?.img ?? '') })) : [];
}
function normalizeArtifactList(list) {
  return Array.isArray(list) ? list.map(a => {
    if (a?.type === 'double') {
      return {
        type: 'double',
        name1: String(a?.name1 ?? a?.name ?? ''),
        name2: String(a?.name2 ?? ''),
        displayText: String(a?.displayText ?? ''),
        img1: String(a?.img1 ?? ''),
        img2: String(a?.img2 ?? '')
      };
    }
    return { type: 'single', name: String(a?.name ?? ''), img: String(a?.img ?? '') };
  }) : [];
}
function normalizeAlts(list) {
  return Array.isArray(list) ? list.map(a => ({ name: String(a?.name ?? ''), img: String(a?.img ?? '') })) : [];
}
function normalizeTeamChars(chars) {
  return Array.from({ length: 4 }, (_, i) => {
    const c = chars?.[i] || {};
    return {
      name: String(c.name ?? ''), img: String(c.img ?? ''),
      emptyAltText: String(c.emptyAltText ?? '暂无备选'),
      alts: normalizeAlts(c.alts)
    };
  });
}
function normalizePanel(p) {
  const src = p || {};
  return {
    primaryKey: PANEL_PRIMARY_KEYS.includes(src.primaryKey) ? src.primaryKey : 'hp',
    primaryValue: String(src.primaryValue ?? ''), cr: String(src.cr ?? ''),
    cd: String(src.cd ?? ''), em: String(src.em ?? ''), er: String(src.er ?? '')
  };
}
function normalizeState(data = {}) {
  return {
    ...State.data, ...data,
    charImg: data.charImg || '', charImgMeta: data.charImgMeta || null,
    charImgDeleted: !!data.charImgDeleted,
    bgImg: data.bgImg || '', bgImgDeleted: !!data.bgImgDeleted,
    nameBgImg: data.nameBgImg || '', nameBgImgMeta: data.nameBgImgMeta || null,
    nameBgImgDeleted: !!data.nameBgImgDeleted,
    teamCoreImg: data.teamCoreImg || '',
    fontData: data.fontData || '',
    fontName: data.fontName || '',
    fontFileName: data.fontFileName || '',
    theme: data.theme || '#939393', imgX: Number(data.imgX) || 0,
    weaponData: {
      graduate: normalizeWeaponList(data?.weaponData?.graduate),
      optional: normalizeWeaponList(data?.weaponData?.optional),
      newbie: normalizeWeaponList(data?.weaponData?.newbie)
    },
    artifactData: normalizeArtifactList(data.artifactData),
    constellationData: Array.from({ length: 6 }, (_, i) => ({
      active: !!data?.constellationData?.[i]?.active,
      desc: String(data?.constellationData?.[i]?.desc ?? '')
    })),
    panel: normalizePanel(data.panel),
    teamData: Array.isArray(data.teamData) ? data.teamData.map(team => ({ ...team, chars: normalizeTeamChars(team?.chars) })) : []
  };
}

/* =========================================================================
 * 【JS 模块 12】导出与导入
 * ========================================================================= */
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function exportPNG() {
  const bd = document.getElementById('exportDesktopBtn');
  const bm = document.getElementById('exportMobileBtn');
  const btns = [
    bd ? { el: bd, text: bd.textContent } : null,
    bm ? { el: bm, text: bm.textContent } : null
  ].filter(Boolean);
  btns.forEach(b => { b.el.disabled = true; b.el.textContent = '正在导出...'; });
  try {
    if (document.fonts) await document.fonts.ready;
    const svg = buildSVG(EXPORT_SCALE);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('SVG 渲染失败'));
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = SVG_W * EXPORT_SCALE;
      canvas.height = SVG_H * EXPORT_SCALE;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1));
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      downloadBlob(pngBlob, `${State.data.charName || '角色'}_${y}-${m}-${d}.png`);
      showToast('导出成功', 'success');
    } finally { URL.revokeObjectURL(url); }
  } catch (e) {
    showToast('导出失败：' + (e.message || e), 'error');
  } finally {
    btns.forEach(b => { b.el.disabled = false; b.el.textContent = b.text; });
  }
}
function exportConfig() {
  var name = State.data.charName || '角色';
  var order = CHAR_NAME_TO_ORDER[name];
  var filename = order ? (padOrder(order) + '.' + name + '.json') : (name + '.json');
  downloadBlob(
    new Blob([JSON.stringify(State.data, null, 2)], { type: 'application/json' }),
    filename
  );
}
function importConfig(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      State.data = normalizeState(data);
      await installPreviewFont();
      initThumbnails();
      renderEditorsByKey();
      scheduleRender();
      showToast('配置导入成功', 'success');
    } catch (err) {
      showToast('配置解析失败', 'error');
    }
    input.value = '';
  };
  reader.readAsText(input.files[0]);
}
async function clearAllData() {
  const ok = await showConfirm('清空全部数据', '确定清空所有角色配置与图片数据吗？此操作不可撤销。');
  if (!ok) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    store.put({ author: State.data.author, fontData: State.data.fontData }, 'current_state');
  } catch (e) {}
  location.reload();
}

/* =========================================================================
 * 【JS 模块 13】UI 交互
 * ========================================================================= */
const FIELD_MAP = {
  charName: 'charName', version: 'version', date: 'date', author: 'author',
  talentA: 'talent.A', talentE: 'talent.E', talentQ: 'talent.Q',
  sandMain: 'stat.sandMain', gobMain: 'stat.gobMain', cirMain: 'stat.cirMain'
};
function setField(key, value) {
  if (key === 'imgX' && value !== '') value = Number(value) || 0;
  State.data[key] = value;
  if (key === 'imgX') {
    const s = document.getElementById('imgXSlider');
    if (s && document.activeElement !== s) s.value = value;
    mountPreview();
  } else if (key === 'subStats') {
    mountPreview();
  } else if (FIELD_MAP[key]) {
    updatePreviewField(FIELD_MAP[key]);
  } else {
    mountPreview();
  }
  debouncedSave();
}
function setPanelPrimaryKey(key) {
  State.data.panel.primaryKey = PANEL_PRIMARY_KEYS.includes(key) ? key : 'hp';
  mountPreview(); debouncedSave();
}
function setPanelField(key, value) {
  if (!State.data.panel) State.data.panel = normalizePanel(null);
  State.data.panel[key] = value;
  updatePreviewField(`panel.${key}`);
  debouncedSave();
}
function canMoveWeapon(type, i, dir) {
  const list = State.data.weaponData[type];
  if (!list) return false;
  const target = i + dir;
  if (target >= 0 && target < list.length) return true;
  const ti = WEAPON_ORDER.indexOf(type);
  const adjTi = ti + dir;
  if (adjTi < 0 || adjTi >= WEAPON_ORDER.length) return false;
  const adjList = State.data.weaponData[WEAPON_ORDER[adjTi]];
  return adjList.length < WEAPON_MAX;
}
function moveWeapon(type, i, dir) {
  const list = State.data.weaponData[type];
  if (!list || i < 0 || i >= list.length) return;
  const target = i + dir;
  if (target >= 0 && target < list.length) {
    [list[i], list[target]] = [list[target], list[i]];
    renderWeaponEditor(); mountPreview(); debouncedSave(); return;
  }
  const ti = WEAPON_ORDER.indexOf(type);
  const adjTi = ti + dir;
  if (adjTi < 0 || adjTi >= WEAPON_ORDER.length) return;
  const adjType = WEAPON_ORDER[adjTi];
  const adjList = State.data.weaponData[adjType];
  if (adjList.length >= WEAPON_MAX) {
    return showToast(`「${WEAPON_LABELS[adjType]}」区已满 ${WEAPON_MAX} 个`, 'error');
  }
  const [item] = list.splice(i, 1);
  if (dir === 1) adjList.unshift(item); else adjList.push(item);
  renderWeaponEditor(); mountPreview(); debouncedSave();
}
function addWeapon(type) {
  const list = State.data.weaponData[type];
  if (list.length >= WEAPON_MAX) return showToast(`「${WEAPON_LABELS[type]}」区最多 ${WEAPON_MAX} 个`, 'error');
  list.push({ name: '', img: '' });
  collapseState[`weapon_${type}`] = false;
  renderWeaponEditor(); mountPreview(); debouncedSave();
}
function removeWeapon(type, i) { State.data.weaponData[type].splice(i, 1); renderWeaponEditor(); mountPreview(); debouncedSave(); }
function setWeaponName(type, i, v) { State.data.weaponData[type][i].name = v; updatePreviewField(`weapon.${type}.${i}.name`); debouncedSave(); }
function addArtifact(type) {
  State.data.artifactData.push(type === 'double' ? { type, name1: '', name2: '', displayText: '', img1: '', img2: '' } : { type, name: '', img: '' });
  collapseState['artifact_section'] = false;
  renderArtifactEditor(); mountPreview(); debouncedSave();
}
function removeArtifact(i) { State.data.artifactData.splice(i, 1); renderArtifactEditor(); mountPreview(); debouncedSave(); }
function moveArtifact(i, dir) { if (moveItem(State.data.artifactData, i, dir)) { renderArtifactEditor(); mountPreview(); debouncedSave(); } }
function setArtifactName(i, v) { State.data.artifactData[i].name = v; updatePreviewField(`artifact.${i}.name`); debouncedSave(); }
function addTeam() {
  if (State.data.teamData.length >= 3) return showToast('最多支持 3 组队伍', 'error');
  State.data.teamData.push({
    name: '',
    chars: Array.from({ length: 4 }, () => ({ name: '', img: '', alts: [], emptyAltText: '暂无备选' }))
  });
  collapseState[`team_${State.data.teamData.length - 1}`] = false;
  renderTeamEditor(); mountPreview(); debouncedSave();
}
function removeTeam(ti) { State.data.teamData.splice(ti, 1); renderTeamEditor(); mountPreview(); debouncedSave(); }
function moveTeam(ti, dir) { if (moveItem(State.data.teamData, ti, dir)) { renderTeamEditor(); mountPreview(); debouncedSave(); } }
function setTeamName(ti, v) { State.data.teamData[ti].name = v; updatePreviewField(`team.${ti}.name`); debouncedSave(); }
function moveTeamChar(ti, ci, dir) {
  const chars = State.data.teamData[ti]?.chars;
  if (!chars) return;
  const target = ci + dir;
  if (target < 1 || target >= chars.length) return;
  if (moveItem(chars, ci, dir)) { renderTeamEditor(); mountPreview(); debouncedSave(); }
}
function setTeamCharName(ti, ci, v) {
  State.data.teamData[ti].chars[ci].name = v;
  if (ci === 0) updatePreviewField('charName');
  else updatePreviewField(`team.${ti}.char.${ci}.name`);
  debouncedSave();
}
function addAlt(ti, ci) {
  const alts = State.data.teamData[ti]?.chars?.[ci]?.alts;
  if (!alts) return;
  if (alts.length >= 4) return showToast('每位角色最多 4 个备选', 'error');
  alts.push({ name: '', img: '' });
  renderTeamEditor(); mountPreview(); debouncedSave();
}
function removeAlt(ti, ci, ai) {
  const alts = State.data.teamData[ti]?.chars?.[ci]?.alts;
  if (!alts) return;
  alts.splice(ai, 1);
  renderTeamEditor(); mountPreview(); debouncedSave();
}
function moveAlt(ti, ci, ai, dir) {
  const alts = State.data.teamData[ti]?.chars?.[ci]?.alts;
  if (alts && moveItem(alts, ai, dir)) { renderTeamEditor(); mountPreview(); debouncedSave(); }
}
function setAltName(ti, ci, ai, v) {
  State.data.teamData[ti].chars[ci].alts[ai].name = v;
  updatePreviewField(`team.${ti}.char.${ci}.alt.${ai}.name`);
  debouncedSave();
}
function setEmptyAltText(ti, ci, v) {
  State.data.teamData[ti].chars[ci].emptyAltText = v;
  mountPreview(); debouncedSave();
}

/* =========================================================================
 * 【JS 模块 14】App 接口
 * ========================================================================= */
const App = {
  openTabSheet, closeTabSheet, selectTab,
  setField, setTheme, setPanelPrimaryKey, setPanelField,
  toggleCollapse, toggleConstellation, setConstellationDesc,
  addWeapon, removeWeapon, moveWeapon, setWeaponName,
  addArtifact, removeArtifact, moveArtifact, setArtifactName,
  addTeam, removeTeam, moveTeam, setTeamName,
  moveTeamChar, setTeamCharName,
  addAlt, removeAlt, moveAlt, setAltName, setEmptyAltText,
  renderWeaponEditor, renderArtifactEditor, renderTeamEditor,
  mountPreview, debouncedSave,
  triggerUpload, uploadImageHandler,
  updateThumb, updateImgXHint, clearImage, onThumbClick,
  exportPNG, exportConfig, importConfig, clearAllData,
  matchWeaponIcon, matchArtifactIcon, matchArtifactDoubleIcon,
  setArtifactName1, setArtifactName2, setArtifactDisplayText,
  matchTeamCharIcon, matchCharAvatar,
  matchStyleImages, loadSaveFromRepo,
  openFontPicker, closeFontPicker, selectFont
};
window.App = App;

/* =========================================================================
 * 【JS 模块 15】初始化
 * ========================================================================= */
function injectFloatIcons() {
  const S = window.ICONS || { ui: {} };
  const ex = document.getElementById('floatExportBtn');
  const im = document.getElementById('floatImportBtn');
  const cl = document.getElementById('floatClearBtn');
  if (ex && S.ui) ex.innerHTML = S.ui.export || '';
  if (im && S.ui) im.innerHTML = S.ui.import || '';
  if (cl && S.ui) cl.innerHTML = S.ui.trash || '';
  const delTargets = ['btnDelCharImg', 'btnDelNameBg', 'btnDelBg', 'btnDelTeamCore'];
  delTargets.forEach(id => {
    const el = document.getElementById(id);
    if (el && S.ui) el.innerHTML = S.ui.trash || '';
  });
  const addTeamIcon = document.getElementById('btnAddTeamIcon');
  if (addTeamIcon && S.ui) addTeamIcon.innerHTML = S.ui.plus || '';
  const matchStyleIcon = document.getElementById('btnMatchStyleIcon');
  if (matchStyleIcon && S.ui) matchStyleIcon.innerHTML = S.ui.plus || '';
  const loadSaveIcon = document.getElementById('btnLoadSaveIcon');
  if (loadSaveIcon && S.ui) loadSaveIcon.innerHTML = S.ui.import || '';
}
async function init() {
  injectFloatIcons();
  tightenAllIconViewBoxes();
  const saved = await loadStateFromIDB();
  State.data = normalizeState(saved || {});
  await loadCharOrderTxt();
  await loadFontList();
  await installPreviewFont();
  initThumbnails();
  syncInputs();
  renderEditorsByKey();
  mountPreview();
  selectTab(currentTab);
}
window.addEventListener('DOMContentLoaded', init);

window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'theme') {
    var html = document.documentElement;
    html.classList.add('theme-switching');
    html.setAttribute('data-theme', e.data.theme);
    void html.offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.remove('theme-switching');
      });
    });
  }
});
