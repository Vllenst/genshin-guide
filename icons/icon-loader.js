/* ============================================================
 * 图标加载器 · 全站共享
 * 路径规则：icons/{type}/{star}star/{文件名}
 * ============================================================ */
(function () {
  'use strict';

  /* ============ 星级配色 ============ */
  var STAR_COLORS = {
    1: '#85949C', 2: '#649C74', 3: '#54A4B4', 4: '#9174A9', 5: '#DCA454'
  };

  /* ============ 颜色工具 ============ */
  function hexToHsl(hex) {
    var num = parseInt(hex.replace('#', ''), 16);
    var r = ((num >> 16) & 0xFF) / 255, g = ((num >> 8) & 0xFF) / 255, b = (num & 0xFF) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return '#' + [r + m, g + m, b + m]
      .map(function (v) { return Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0'); })
      .join('');
  }
  function darken(hex, percent) {
    var hsl = hexToHsl(hex);
    return hslToHex(hsl[0], hsl[1], Math.max(0, hsl[2] * (1 - percent)));
  }

  /* ============ 自动探测图标根路径 ============ */
  var ICON_BASE = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('icon-loader.js') >= 0) {
        return src.replace(/icon-loader\.js.*$/, '');
      }
    }
    return 'icons/';
  })();

  /* ============ 加载图片 ============ */
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('图标加载失败：' + src)); };
      img.src = src;
    });
  }

  /* ============ 生成带背景的 dataURL（径向渐变，无内边距） ============ */
  function applyBackground(img, star, opts) {
    opts = opts || {};
    var size = opts.size || 256;
    var padding = opts.padding != null ? opts.padding : 0;
    var color = STAR_COLORS[star] || '#939393';
    var edgeColor = darken(color, 0.5);

    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    var r = size * 0.707;
    var grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, edgeColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    var inner = size * (1 - padding * 2);
    var ratio = Math.min(inner / img.width, inner / img.height);
    var w = img.width * ratio;
    var h = img.height * ratio;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

    return canvas.toDataURL('image/png');
  }

  /* ============ 匹配 ============ */
  function stripExt(str) { return String(str || '').replace(/\.[^.]+$/, ''); }

  function stripSuffix(str) {
    return String(str || '')
      .replace(/[（(][^）)]*[）)]/g, '')
      .replace(/[·•・].*$/, '')
      .replace(/[—–\-].*$/, '')
      .trim();
  }

  function match(type, query) {
    var map = window.ICON_MAP && window.ICON_MAP[type];
    if (!map) return null;
    var q = String(query || '').trim();
    if (!q) return null;

    var qLower = q.toLowerCase();
    var qNoSuffix = stripSuffix(q).toLowerCase();
    var qNoExt = stripExt(q).toLowerCase();

    for (var key in map) {
      var item = map[key];
      var keyNoExt = stripExt(key).toLowerCase();
      var enList = [];
      if (item.en) {
        enList = Array.isArray(item.en) ? item.en : [item.en];
      }

      /* 1. 匹配中文名 */
      if (q === item.name || qNoSuffix === item.name.toLowerCase()) {
        return { key: key, name: item.name, star: item.star };
      }
      /* 2. 匹配英文名 */
      for (var i = 0; i < enList.length; i++) {
        if (qLower === enList[i].toLowerCase() || qNoSuffix === enList[i].toLowerCase()) {
          return { key: key, name: item.name, star: item.star };
        }
      }
      /* 3. 匹配完整文件名 */
      if (qLower === key.toLowerCase() || qNoExt === keyNoExt) {
        return { key: key, name: item.name, star: item.star };
      }
    }
    return null;
  }

  /* ============ 缓存 ============ */
  var cache = {};
  function ck(type, key) { return type + '::' + key; }

  /* 路径：icons/{type}/{star}star/{key} */
  function getPath(type, key) {
    var map = window.ICON_MAP && window.ICON_MAP[type];
    var star = (map && map[key] && map[key].star) ? map[key].star : 5;
    return ICON_BASE + type + '/' + star + 'star/' + key;
  }

  /* ============ 加载并合成 ============ */
  async function load(type, key, opts) {
    var map = window.ICON_MAP && window.ICON_MAP[type];
    if (!map || !map[key]) throw new Error('未知图标：' + type + '/' + key);
    var c = ck(type, key);
    if (cache[c]) return cache[c];
    var img = await loadImage(getPath(type, key));
    var dataURL = applyBackground(img, map[key].star, opts);
    cache[c] = dataURL;
    return dataURL;
  }

  async function fromName(type, name, opts) {
    var m = match(type, name);
    if (!m) return null;
    var dataURL = await load(type, m.key, opts);
    return { key: m.key, name: m.name, star: m.star, dataURL: dataURL };
  }

  function getCached(type, key) { return cache[ck(type, key)] || null; }

  /* ============ 图标选择器 ============ */
  var pickerCSS = [
    '.icon-picker-backdrop{position:fixed;inset:0;background:var(--mask,rgba(0,0,0,.4));z-index:9000;opacity:0;pointer-events:none;transition:opacity .22s}',
    '.icon-picker-backdrop.show{opacity:1;pointer-events:auto}',
    '.icon-picker{position:fixed;left:0;right:0;bottom:0;z-index:9001;background:var(--bg-base,#fff);border-radius:16px 16px 0 0;max-height:75vh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .28s cubic-bezier(.16,1,.3,1);box-shadow:0 -12px 40px rgba(0,0,0,.15)}',
    '.icon-picker.show{transform:translateY(0)}',
    '.icon-picker-header{padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle,#eee);flex-shrink:0}',
    '.icon-picker-title{font-size:15px;font-weight:600;color:var(--text-primary,#222)}',
    '.icon-picker-close{width:30px;height:30px;border-radius:8px;border:1px solid var(--border-default,#ddd);background:var(--bg-surface,#fff);color:var(--text-primary,#222);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:16px;padding:0}',
    '.icon-picker-search{padding:10px 16px;flex-shrink:0}',
    '.icon-picker-search input{width:100%;height:38px;padding:0 12px;border-radius:10px;border:1px solid var(--border-default,#ddd);background:var(--bg-sunken,#f5f5f5);color:var(--text-primary,#222);font-size:14px;outline:none}',
    '.icon-picker-search input:focus{border-color:var(--accent,#8B7355);background:var(--bg-surface,#fff)}',
    '.icon-picker-tabs{display:flex;gap:6px;padding:0 16px 10px;flex-shrink:0;overflow-x:auto}',
    '.icon-picker-tab{padding:6px 12px;border-radius:8px;border:1px solid var(--border-subtle,#eee);background:transparent;color:var(--text-secondary,#666);font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;height:auto}',
    '.icon-picker-tab.active{background:var(--bg-surface,#fff);color:var(--text-primary,#222);border-color:var(--border-default,#ddd);font-weight:600}',
    '.icon-picker-grid{flex:1;overflow-y:auto;padding:8px 16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px}',
    '.icon-picker-item{aspect-ratio:1;border-radius:10px;border:1px solid var(--border-subtle,#eee);background:var(--bg-surface,#fff);cursor:pointer;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;transition:transform .12s,border-color .15s}',
    '.icon-picker-item:hover{border-color:var(--accent,#8B7355)}',
    '.icon-picker-item:active{transform:scale(.94)}',
    '.icon-picker-item img{width:100%;height:100%;object-fit:contain;border-radius:6px;display:block}',
    '.icon-picker-item-name{font-size:10px;color:var(--text-tertiary,#999);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;text-align:center}',
    '.icon-picker-empty{grid-column:1/-1;text-align:center;color:var(--text-tertiary,#999);font-size:13px;padding:40px 0}',
    '@media(min-width:640px){.icon-picker{left:50%;right:auto;bottom:auto;top:50%;width:480px;max-height:70vh;border-radius:16px;transform:translate(-50%,-45%) scale(.96)}.icon-picker.show{transform:translate(-50%,-50%) scale(1)}}'
  ].join('');

  function ensureStyles() {
    if (document.getElementById('icon-picker-style')) return;
    var s = document.createElement('style');
    s.id = 'icon-picker-style';
    s.textContent = pickerCSS;
    document.head.appendChild(s);
  }

  function openPicker(type, onSelect, opts) {
    opts = opts || {};
    ensureStyles();

    var map = window.ICON_MAP && window.ICON_MAP[type];
    if (!map) return;

    var allItems = Object.keys(map).map(function (k) {
      return { key: k, name: map[k].name, star: map[k].star };
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'icon-picker-backdrop';

    var picker = document.createElement('div');
    picker.className = 'icon-picker';
    picker.innerHTML =
      '<div class="icon-picker-header">' +
        '<div class="icon-picker-title">' + (opts.title || '选择图标') + '</div>' +
        '<button type="button" class="icon-picker-close">×</button>' +
      '</div>' +
      '<div class="icon-picker-search"><input type="text" placeholder="搜索名称..." /></div>' +
      '<div class="icon-picker-tabs">' +
        '<button type="button" class="icon-picker-tab active" data-star="all">全部</button>' +
        '<button type="button" class="icon-picker-tab" data-star="5">5★</button>' +
        '<button type="button" class="icon-picker-tab" data-star="4">4★</button>' +
        '<button type="button" class="icon-picker-tab" data-star="3">3★</button>' +
      '</div>' +
      '<div class="icon-picker-grid"></div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(picker);

    var searchInput = picker.querySelector('.icon-picker-search input');
    var gridEl = picker.querySelector('.icon-picker-grid');
    var tabsEl = picker.querySelector('.icon-picker-tabs');
    var filterStar = 'all';
    var filterText = '';

    function renderGrid() {
      var list = allItems.filter(function (it) {
        if (filterStar !== 'all' && String(it.star) !== filterStar) return false;
        if (filterText) {
          var q = filterText.toLowerCase();
          var hit = it.name.toLowerCase().indexOf(q) >= 0
                 || it.key.toLowerCase().indexOf(q) >= 0;
          if (!hit) return false;
        }
        return true;
      });

      if (!list.length) {
        gridEl.innerHTML = '<div class="icon-picker-empty">没有匹配的图标</div>';
        return;
      }

      gridEl.innerHTML = list.map(function (it) {
        return '<div class="icon-picker-item" data-key="' + it.key + '">' +
          '<img src="' + getPath(type, it.key) + '" alt="" loading="lazy" onerror="this.style.opacity=.2" />' +
          '<div class="icon-picker-item-name">' + it.name + '</div>' +
        '</div>';
      }).join('');

      gridEl.querySelectorAll('.icon-picker-item').forEach(function (el) {
        el.addEventListener('click', async function () {
          var key = el.dataset.key;
          var dataURL = await load(type, key, opts.renderOpts);
          onSelect({ key: key, name: map[key].name, star: map[key].star, dataURL: dataURL });
          close();
        });
      });
    }

    function close() {
      backdrop.classList.remove('show');
      picker.classList.remove('show');
      setTimeout(function () {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        if (picker.parentNode) picker.parentNode.removeChild(picker);
      }, 300);
    }

    tabsEl.querySelectorAll('.icon-picker-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterStar = tab.dataset.star;
        tabsEl.querySelectorAll('.icon-picker-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderGrid();
      });
    });

    searchInput.addEventListener('input', function () {
      filterText = searchInput.value;
      renderGrid();
    });

    picker.querySelector('.icon-picker-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);

    renderGrid();
    requestAnimationFrame(function () {
      backdrop.classList.add('show');
      picker.classList.add('show');
    });
  }

  /* ============ 暴露接口 ============ */
  window.ICON_LIB = {
    base: ICON_BASE,
    starColors: STAR_COLORS,
    match: match,
    load: load,
    fromName: fromName,
    getCached: getCached,
    applyBackground: applyBackground,
    getPath: getPath,
    openPicker: openPicker,
    applyBackgroundToFile: function (file, star, opts) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var img = new Image();
          img.onload = function () { resolve(applyBackground(img, star, opts)); };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };
})();
