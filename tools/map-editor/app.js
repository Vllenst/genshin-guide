/* =========================================================================
 * 图标字典编辑器 · app.js
 * =========================================================================
 * 模块导航（搜索 "【JS 模块 N】" 快速跳转）：
 *   【JS 模块 1】 常量配置
 *   【JS 模块 2】 DOM 引用
 *   【JS 模块 3】 全局状态
 *   【JS 模块 4】 Amber 数据加载 + 查询
 *   【JS 模块 5】 characters.txt 加载
 *   【JS 模块 6】 查找辅助（字典 ↔ 编号）
 *   【JS 模块 7】 本地存储
 *   【JS 模块 8】 工具函数
 *   【JS 模块 9】 条目列表渲染
 *   【JS 模块 10】 粘贴 URL 解析
 *   【JS 模块 11】 本地文件上传
 *   【JS 模块 12】 清空当前分类
 *   【JS 模块 13】 从仓库载入 icon-dict.js
 *   【JS 模块 14】 导出 icon-dict.js
 *   【JS 模块 15】 主题（由父页面控制，本页仅被动接收）
 *   【JS 模块 16】 图标注入
 *   【JS 模块 17】 事件绑定
 *   【JS 模块 18】 跨 iframe 通信
 *   【JS 模块 19】 初始化
 * ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * 【JS 模块 1】常量配置
   * ------------------------------------------------------------------- */
  var STORAGE_KEY = "icon_dict_editor_v3";

  var DEFAULT_CONFIG = {
    characters: { prefix: "https://api.lunaris.moe/data/assets/avataricon/UI_AvatarIcon_", ext: ".webp" },
    artifacts:  { prefix: "https://api.lunaris.moe/data/assets/artifacts/UI_RelicIcon_",   ext: ".webp" },
    weapons:    { prefix: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_",   ext: ".webp" }
  };

  var AMBER_ENDPOINTS = {
    characters: "https://gi.yatta.moe/api/v2/CHS/avatar",
    weapons:    "https://gi.yatta.moe/api/v2/CHS/weapon",
    artifacts:  "https://gi.yatta.moe/api/v2/CHS/reliquary"
  };

  /* 本地图片模式：共享图目录（相对 app.js 所在位置） */
  var LOCAL_IMG_BASE = "../../shared/gi-icons/";

  /* ---------------------------------------------------------------------
   * 【JS 模块 2】DOM 引用
   * ------------------------------------------------------------------- */
  var entriesEl     = document.getElementById("entries");
  var emptyTip      = document.getElementById("emptyTip");
  var statusBar     = document.getElementById("status");
  var fileInput     = document.getElementById("fileInput");
  var modalBackdrop = document.getElementById("modalBackdrop");
  var pasteArea     = document.getElementById("pasteArea");

  /* ---------------------------------------------------------------------
   * 【JS 模块 3】全局状态
   * ------------------------------------------------------------------- */
  var config      = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  var editorData  = { characters: [], artifacts: [], weapons: [] };
  var currentTab  = "characters";
  var tempThumbs  = {};

  var amberCache   = { characters: null, weapons: null, artifacts: null };
  var amberLoading = {};

  var CHAR_ORDER_TO_NAME = {};
  var CHAR_NAME_TO_ORDER = {};

  /* ---------------------------------------------------------------------
   * 【JS 模块 4】Amber 数据加载 + 查询
   * ------------------------------------------------------------------- */
  function stripAmberPrefix(icon) {
    if (!icon) return "";
    return String(icon)
      .replace(/^UI_AvatarIcon_/i, "")
      .replace(/^UI_EquipIcon_/i, "")
      .replace(/^UI_RelicIcon_/i, "")
      .toLowerCase();
  }

  async function loadAmberData(type) {
    if (amberCache[type]) return amberCache[type];
    if (amberLoading[type]) return amberLoading[type];

    var promise = (async function () {
      var res = await fetch(AMBER_ENDPOINTS[type]);
      if (!res.ok) throw new Error("HTTP " + res.status);
      var json = await res.json();
      var raw = (json && json.data) || json || {};
      var items = raw.items || raw;
      var result = {};
      Object.keys(items).forEach(function (k) {
        var item = items[k];
        if (!item || typeof item !== "object") return;
        var name = item.name || "";
        if (!name) return;
        var icon = item.icon || "";
        var id = stripAmberPrefix(icon);
        if (id) result[id] = name;
        if (item.id != null) result[String(item.id)] = name;
      });
      amberCache[type] = result;
      return result;
    })();

    amberLoading[type] = promise;
    try { await promise; } finally { amberLoading[type] = null; }
    return promise;
  }

  async function lookupAmberName(type, id) {
    if (!id) return "";
    var normalized = String(id).toLowerCase()
      .replace(/^ui_avataricon_/i, "")
      .replace(/^ui_equipicon_/i, "")
      .replace(/^ui_relicicon_/i, "");
    try {
      var table = await loadAmberData(type);
      return table[normalized] || table[String(id).toLowerCase()] || "";
    } catch (e) {
      return "";
    }
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 5】characters.txt 加载
   * ------------------------------------------------------------------- */
  async function loadCharOrderTxt() {
    try {
      var res = await fetch("../../shared/data/characters.txt?t=" + Date.now());
      if (!res.ok) { console.warn("characters.txt HTTP " + res.status); return; }
      var text = await res.text();
      CHAR_ORDER_TO_NAME = {};
      CHAR_NAME_TO_ORDER = {};
      text.split(/\r?\n/).forEach(function (line) {
        line = line.trim();
        if (!line || line.startsWith("#")) return;
        var parts = line.split(/[\s,，\t]+/);
        if (parts.length < 2) return;
        var order = parseInt(parts[0], 10);
        var name = parts.slice(1).join(" ").trim();
        if (!order || !name) return;
        CHAR_ORDER_TO_NAME[order] = name;
        CHAR_NAME_TO_ORDER[name] = order;
      });
      console.log("characters.txt 加载成功，共 " + Object.keys(CHAR_NAME_TO_ORDER).length + " 条");
    } catch (e) {
      console.warn("characters.txt 加载失败：", e.message);
    }
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 6】查找辅助：字典优先，其次 txt
   * ------------------------------------------------------------------- */
  function findOrderByName(name, excludeRow) {
    if (!name) return 0;
    var list = editorData.characters || [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r !== excludeRow && r.name === name && r.order) return r.order;
    }
    if (CHAR_NAME_TO_ORDER[name]) return CHAR_NAME_TO_ORDER[name];
    return 0;
  }

  function findNameByOrder(order, excludeRow) {
    if (!order) return "";
    var list = editorData.characters || [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r !== excludeRow && r.order === order && r.name) return r.name;
    }
    if (CHAR_ORDER_TO_NAME[order]) return CHAR_ORDER_TO_NAME[order];
    return "";
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 7】本地存储
   * ------------------------------------------------------------------- */
  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: editorData, config: config }));
    } catch (e) {}
  }
  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.data && parsed.data.characters && parsed.data.artifacts && parsed.data.weapons) {
        editorData = parsed.data;
        if (parsed.config) config = parsed.config;
      }
    } catch (e) {}
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 8】工具函数
   * ------------------------------------------------------------------- */
  function setStatus(msg, type) {
    statusBar.textContent = msg;
    statusBar.className = "status-bar" + (type ? " " + type : "");
  }

  function starColor(s) {
    var lib = window.ICON_LIB;
    return (lib && lib.starColors && lib.starColors[s]) || "#939393";
  }

  function detectMode(key) {
    if (!key) return "id";
    if (/^https?:\/\//i.test(key)) return "url";
    if (/\.(webp|png|jpe?g|gif|svg)$/i.test(key)) return "local";
    return "id";
  }

  function resolveUrl(type, key, mode) {
    if (!key) return "";
    if (mode === "local") return LOCAL_IMG_BASE + key;
    if (mode === "url") return key;
    var cfg = config[type];
    return cfg.prefix + key + (cfg.ext || "");
  }

  function extractShortId(fileName) {
    var fullId = String(fileName || "").replace(/\.[^.]+$/, "");
    return fullId.replace(/^UI_(?:AvatarIcon|EquipIcon|RelicIcon)_/i, "");
  }

  function extractRelicOrder(shortId) {
    var m = /^(\d{5})(?:_\d+)?$/.exec(String(shortId || ""));
    return m ? parseInt(m[1], 10) : 0;
  }

  function makeThumbFor(row, cb) {
    var star = row.star || 5;
    var mode = detectMode(row.key);
    var src = "";
    if (mode === "local" && tempThumbs[row.key]) src = tempThumbs[row.key];
    else src = resolveUrl(currentTab, row.key, mode);
    if (!src) { cb(""); return; }

    var lib = window.ICON_LIB;
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      try { cb(lib.applyBackground(img, star, { size: 80 })); } catch (e) { cb(""); }
    };
    img.onerror = function () { cb(""); };
    img.src = src;
  }

  function esc(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 9】条目列表渲染
   * ------------------------------------------------------------------- */
  function render() {
    var list = editorData[currentTab] || [];
    var sorted = list.slice().sort(function (a, b) {
      var ao = a.order || 99999;
      var bo = b.order || 99999;
      return ao - bo;
    });

    entriesEl.innerHTML = "";
    if (!sorted.length) { emptyTip.style.display = "block"; return; }
    emptyTip.style.display = "none";

    sorted.forEach(function (row) {
      var card = document.createElement("div");
      card.className = "entry-card";

      /* 顶部行：序号 + 缩略图 + key */
      var top = document.createElement("div");
      top.className = "entry-top";

      var inpOrder = document.createElement("input");
      inpOrder.type = "number"; inpOrder.className = "entry-order";
      inpOrder.value = row.order || "";
      inpOrder.title = "序号";
      inpOrder.addEventListener("change", function () {
        var v = (inpOrder.value || "").trim();
        var newOrder = v === "" ? 0 : (parseInt(v, 10) || 0);

        if (currentTab === "characters") {
          var curName = (row.name || "").trim();
          if (curName) {
            var autoOrder = findOrderByName(curName, row);
            row.order = autoOrder ? autoOrder : newOrder;
          } else {
            row.order = newOrder;
            if (newOrder > 0) {
              var autoName = findNameByOrder(newOrder, row);
              if (autoName) row.name = autoName;
            }
          }
        } else {
          row.order = newOrder;
        }
        saveLocal(); render();
      });
      top.appendChild(inpOrder);

      var thumb = document.createElement("img");
      thumb.className = "entry-thumb"; thumb.alt = "";
      top.appendChild(thumb);
      makeThumbFor(row, function (url) {
        if (url) thumb.src = url;
        else { thumb.style.background = starColor(row.star || 5); thumb.removeAttribute("src"); }
      });

      var inpKey = document.createElement("input");
      inpKey.type = "text"; inpKey.className = "entry-key";
      inpKey.value = row.key || "";
      var mode = detectMode(row.key);
      inpKey.placeholder = mode === "url" ? "完整 URL" : mode === "local" ? "本地文件名" : "短 ID（如 SkirkNew）";
      inpKey.addEventListener("input", function () {
        var oldKey = row.key;
        row.key = inpKey.value;
        if (oldKey !== row.key && tempThumbs[oldKey]) {
          tempThumbs[row.key] = tempThumbs[oldKey];
          delete tempThumbs[oldKey];
        }
        saveLocal();
      });
      inpKey.addEventListener("blur", render);
      top.appendChild(inpKey);
      card.appendChild(top);

      /* 中部行：中文名 + 星级 + 模式切换 + 删除 */
      var mid = document.createElement("div");
      mid.className = "entry-mid";

      var inpName = document.createElement("input");
      inpName.type = "text"; inpName.className = "entry-name";
      inpName.value = row.name || ""; inpName.placeholder = "中文名";
      inpName.addEventListener("input", function () { row.name = inpName.value; saveLocal(); });
      inpName.addEventListener("blur", function () {
        var name = (inpName.value || "").trim();
        row.name = name;

        if (currentTab === "characters") {
          if (name) {
            var autoOrder = findOrderByName(name, row);
            if (autoOrder) row.order = autoOrder;
          } else {
            row.order = 0;
          }
        }
        saveLocal(); render();
      });
      mid.appendChild(inpName);

      var selStar = document.createElement("select");
      selStar.className = "star-select";
      [1, 2, 3, 4, 5].forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s; opt.textContent = s + "★";
        if (s === (row.star || 5)) opt.selected = true;
        selStar.appendChild(opt);
      });
      selStar.addEventListener("change", function () {
        row.star = parseInt(selStar.value, 10) || 5;
        saveLocal(); render();
      });
      mid.appendChild(selStar);

      var modeBtn = document.createElement("button");
      modeBtn.type = "button";
      var modes = ["id", "url", "local"];
      var modeIdx = modes.indexOf(mode);
      modeBtn.className = "mode-btn mode-" + mode;
      modeBtn.textContent = mode === "id" ? "ID" : mode === "url" ? "URL" : "本地";
      modeBtn.addEventListener("click", function () {
        var next = modes[(modeIdx + 1) % 3];
        var oldKey = row.key;
        if (next === "id" && oldKey) row.key = extractShortId(oldKey);
        else if (next === "url") row.key = "";
        else if (next === "local") row.key = "";
        saveLocal(); render();
      });
      mid.appendChild(modeBtn);

      var btnDel = document.createElement("button");
      btnDel.type = "button"; btnDel.className = "entry-del";
      btnDel.innerHTML = ICONS.ui.trash;
      btnDel.addEventListener("click", function () {
        var idx = editorData[currentTab].indexOf(row);
        if (idx >= 0) editorData[currentTab].splice(idx, 1);
        delete tempThumbs[row.key];
        saveLocal(); render(); setStatus("已删除", "ok");
      });
      mid.appendChild(btnDel);

      card.appendChild(mid);
      entriesEl.appendChild(card);
    });
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 10】粘贴 URL 解析
   * ------------------------------------------------------------------- */
  async function parsePastedUrls(text) {
    var lines = String(text || "").split(/\r?\n/);
    var urls = lines.map(function (l) { return l.trim(); }).filter(function (l) { return /^https?:\/\//i.test(l); });
    if (!urls.length) { setStatus("未识别到有效链接", "err"); return; }

    setStatus("正在加载 Amber 数据…");
    var amberReady = false;
    try { await loadAmberData(currentTab); amberReady = true; } catch (e) { amberReady = false; }

    var list = editorData[currentTab];
    var maxOrder = list.reduce(function (m, r) { return Math.max(m, r.order || 0); }, 0);

    var newRows = [];
    urls.forEach(function (url) {
      maxOrder++;
      var fileName = url.split("/").pop().split("?")[0];
      var shortId = extractShortId(fileName);
      var row = { order: maxOrder, key: shortId, name: "", star: 5 };

      if (currentTab === "artifacts") {
        var relicOrder = extractRelicOrder(shortId);
        if (relicOrder) row.order = relicOrder;
      }

      list.push(row);
      newRows.push({ row: row, fullId: fileName.replace(/\.[^.]+$/, "") });
    });

    saveLocal(); render();
    setStatus("已添加 " + urls.length + " 条，正在查询中文名…");

    for (var i = 0; i < newRows.length; i++) {
      var item = newRows[i];
      if (!amberReady) break;
      var name = await lookupAmberName(currentTab, item.fullId);
      if (name) {
        item.row.name = name;
        if (currentTab === "characters") {
          var autoOrder = findOrderByName(name, item.row);
          if (autoOrder) item.row.order = autoOrder;
        }
      }
      saveLocal(); render();
    }

    if (!amberReady) {
      setStatus("Amber 加载失败，中文名请手动填", "err");
    } else {
      var filled = newRows.filter(function (it) { return it.row.name; }).length;
      setStatus("完成 · 自动填充 " + filled + " / " + newRows.length + " 条", "ok");
    }
    saveLocal(); render();
  }

  function openPasteModal() {
    pasteArea.value = "";
    modalBackdrop.classList.add("show");
    setTimeout(function () { pasteArea.focus(); }, 50);
  }
  function closePasteModal() { modalBackdrop.classList.remove("show"); }

  /* ---------------------------------------------------------------------
   * 【JS 模块 11】本地文件上传
   * ------------------------------------------------------------------- */
  function handleFiles(files) {
    if (!files || !files.length) return;
    var list = editorData[currentTab];
    var maxOrder = list.reduce(function (m, r) { return Math.max(m, r.order || 0); }, 0);
    var total = files.length, done = 0;
    Array.prototype.forEach.call(files, function (f) {
      maxOrder++;
      var row = { order: maxOrder, key: f.name, name: "", star: 5 };
      list.push(row);
      var reader = new FileReader();
      reader.onload = function (e) {
        tempThumbs[f.name] = e.target.result;
        done++;
        if (done >= total) { saveLocal(); render(); setStatus("已导入 " + total + " 张", "ok"); }
      };
      reader.onerror = function () { done++; if (done >= total) { saveLocal(); render(); } };
      reader.readAsDataURL(f);
    });
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 12】清空当前分类
   * ------------------------------------------------------------------- */
  function clearCurrent() {
    var label = { characters: "角色", artifacts: "圣遗物", weapons: "武器" }[currentTab];
    if (!confirm("确定清空「" + label + "」的所有条目吗？")) return;
    editorData[currentTab] = [];
    saveLocal(); render(); setStatus("已清空", "ok");
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 13】从仓库载入 icon-dict.js
   * ------------------------------------------------------------------- */
  function loadFromRepo() {
    setStatus("正在从仓库载入…");
    fetch("../../shared/gi-icons/icon-dict.js?t=" + Date.now())
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (code) {
        var sandbox = { window: {} };
        new Function("window", code)(sandbox.window);
        var dict = sandbox.window.ICON_DICT || {};
        if (dict.config) config = dict.config;
        ["characters", "artifacts", "weapons"].forEach(function (type) {
          var obj = dict[type] || {};
          var keys = Object.keys(obj);
          editorData[type] = keys.map(function (k, i) {
            var item = obj[k] || {};
            return { order: item.order || (i + 1), key: k, name: item.name || "", star: item.star || 5 };
          });
        });
        saveLocal(); render(); setStatus("已从仓库载入", "ok");
      })
      .catch(function (e) { setStatus("载入失败：" + e.message, "err"); });
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 14】导出 icon-dict.js
   * ------------------------------------------------------------------- */
  function buildDictJS() {
    var lines = [];
    lines.push("window.ICON_DICT = {");
    lines.push("  config: {");
    ["characters", "artifacts", "weapons"].forEach(function (type, ti) {
      var cfg = config[type];
      lines.push('    ' + type + ': { prefix: "' + esc(cfg.prefix) + '", ext: "' + esc(cfg.ext || "") + '" }' + (ti < 2 ? "," : ""));
    });
    lines.push("  },");

    var types = ["characters", "artifacts", "weapons"];
    var labels = { characters: "角色", artifacts: "圣遗物", weapons: "武器" };

    types.forEach(function (type, ti) {
      lines.push("");
      lines.push("  /* ============ " + labels[type] + " ============ */");
      lines.push("  " + type + ": {");

      var list = editorData[type].slice()
        .filter(function (it) { return it.key; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      if (!list.length) lines.push("    // 暂无条目");

      list.forEach(function (item, i) {
        var mode = detectMode(item.key);
        var parts = ['name: "' + esc(item.name) + '"', "star: " + (item.star || 5), "order: " + (item.order || (i + 1))];
        if (mode === "local") parts.push("local: true");
        var line = '    "' + esc(item.key) + '": { ' + parts.join(", ") + " }";
        if (i < list.length - 1) line += ",";
        lines.push(line);
      });

      lines.push("  }" + (ti < types.length - 1 ? "," : ""));
    });

    lines.push("};");
    lines.push("");
    return lines.join("\n");
  }

  function exportJS() {
    var blob = new Blob([buildDictJS()], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "icon-dict.js";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    setStatus("已导出，上传到 shared/gi-icons/ 覆盖", "ok");
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 15】主题（由父页面控制，本页仅被动接收）
   * ------------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 16】图标注入
   * ------------------------------------------------------------------- */
  function injectIcons() {
    var iconMap = {
      "btnPaste":  ICONS.ui.plus,
      "btnLoad":   ICONS.ui.import,
      "btnExport": ICONS.ui.export,
      "btnClear":  ICONS.ui.trash
    };
    Object.keys(iconMap).forEach(function (id) {
      var el = document.querySelector("#" + id + " .btn-icon");
      if (el) el.innerHTML = iconMap[id];
    });
    var fileBtn = document.querySelector("label.btn .btn-icon");
    if (fileBtn) fileBtn.innerHTML = ICONS.ui.plus;
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 17】事件绑定
   * ------------------------------------------------------------------- */
  function bindEvents() {
    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentTab = btn.dataset.tab;
        document.querySelectorAll(".tab").forEach(function (b) { b.classList.toggle("active", b === btn); });
        render();
      });
    });

    fileInput.addEventListener("change", function (e) { handleFiles(e.target.files); e.target.value = ""; });
    document.getElementById("btnPaste").addEventListener("click", openPasteModal);
    document.getElementById("modalCancel").addEventListener("click", closePasteModal);
    document.getElementById("modalConfirm").addEventListener("click", function () {
      closePasteModal();
      parsePastedUrls(pasteArea.value);
    });
    modalBackdrop.addEventListener("click", function (e) { if (e.target === modalBackdrop) closePasteModal(); });
    document.getElementById("btnClear").addEventListener("click", clearCurrent);
    document.getElementById("btnLoad").addEventListener("click", loadFromRepo);
    document.getElementById("btnExport").addEventListener("click", exportJS);
  }

  /* ---------------------------------------------------------------------
   * 【JS 模块 18】跨 iframe 通信（主题同步）
   * ------------------------------------------------------------------- */
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "theme") {
      applyTheme(e.data.theme);
    }
  });

  /* ---------------------------------------------------------------------
   * 【JS 模块 19】初始化
   * ------------------------------------------------------------------- */
  (async function init() {
    injectIcons();
    await loadCharOrderTxt();
    loadLocal();
    bindEvents();
    render();
    setStatus("就绪 · 编辑自动保存");
  })();

})();
