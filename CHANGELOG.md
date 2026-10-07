# 更新记录

按时间顺序排列（早 → 晚）。

---

## 1. 拆分 character 工具

**目录变动**
- `tools/character.html` → `tools/character/{index.html, style.css, app.js}`
- 删除源文件 `tools/character.html`

**代码清理**
- 删除 3 处死代码：
  - `ICONS.clear`（和 `ICONS.trash` 重复）
  - `switchTab`（`selectTab` 的别名，从未调用）
  - `uploadFontHandler`（没有 HTML 元素触发）
- `updateImgXHint`：从固定文案改为显示原图尺寸
- 所有文件加模块导航注释

**主页**
- `TOOLS` 里 `character` 的 `src` 改为 `tools/character/index.html`

---

## 2. 目录重组（大搬家）

**新建 `shared/` 目录，把根目录共享资源全部收拢**

| 原名 | 新名 |
|---|---|
| `icons.js` | `shared/ui-icons.js` |
| `shared-theme.css` | `shared/theme.css` |
| `icons/` | `shared/gi-icons/` |
| `data/` | `shared/data/` |
| `fonts/` | `shared/fonts/` |
| `assets/` | `shared/assets/` |
| `save/` | `shared/saves/`（加 s） |
| `map-editor.html` | `tools/map-editor.html` |

**搬家后的目录结构**

```
genshin-guide/
├── index.html
├── README.md
├── tools/
│   ├── character/{index.html, style.css, app.js}
│   ├── map-editor.html（待拆）
│   ├── image-tools.html（待拆）
│   ├── video-cover.html（待拆）
│   ├── chart.html（待拆）
│   └── tier.html
└── shared/
    ├── ui-icons.js
    ├── theme.css
    ├── gi-icons/
    ├── data/
    ├── fonts/
    ├── assets/
    └── saves/
```

---

## 3. 主页重写（index.html）

**新增能力**
- 支持两种工具形态：
  - 单工具：`src` 直接加载
  - 多子工具：`subtools` 展开二级菜单，子工具可独立 `src`
- iframe 缓存 key 算法：
  - 无子工具 → `tool.key`
  - 有独立 src 的子工具 → `tool.key::sub.key`
- 老式单 iframe 工具仍兼容（子工具无 src 时用 `postMessage` 通知切换）
- `TOOLS` 数组新增 `map-editor` 入口

**样式**
- 新增 `html.theme-switching` 规则：切换主题时禁用所有过渡 / 动画

**状态**
- Storage Key 新增 `gtt_active_subtool`

---

## 4. ui-icons.js 补充图标

- 新增 `ICONS.nav.mapEditor` / `ICONS.nav.mapEditorBold`
- 位置：`characterBold` 之后、`imageTools` 之前
- 用途：主页菜单「图标字典编辑器」的菜单图标

---

## 5. character 三件套路径修复

**`tools/character/index.html`**
- `../../shared-theme.css` → `../../shared/theme.css`
- `../../icons.js` → `../../shared/ui-icons.js`
- `../../icons/icon-loader.js` → `../../shared/gi-icons/icon-loader.js`
- `../../icons/icon-dict.js` → `../../shared/gi-icons/icon-dict.js`

**`tools/character/app.js`**（6 处 fetch 路径）
- `../../fonts/` → `../../shared/fonts/`
- `../../data/` → `../../shared/data/`
- `../../assets/` → `../../shared/assets/`
- `../../save/` → `../../shared/saves/`

---

## 6. 拆分 map-editor

**目录变动**
- `tools/map-editor.html` → `tools/map-editor/`
  - `index.html`
  - `style.css`
  - `app.js`

**代码改动**
- 删除子页面重复的顶部 header（原本和主页 navbar 叠成两层）
- `app.js` 主题改为被动接收：
  - 删掉 `THEME_KEY` 常量
  - 删掉 `toggleTheme` 函数
  - 删掉 `btnTheme` 事件绑定
  - `applyTheme` 简化为只设置 `data-theme`
- 保留 `postMessage` 监听，接收主页发来的主题切换

**修复**
- 3 处过期路径：
  - `fetch('./icons/characters.txt')` → `'../../shared/data/characters.txt'`
  - `fetch('./icons/icon-dict.js')` → `'../../shared/gi-icons/icon-dict.js'`
  - 本地图片路径 `'./icons/'` → `'../../shared/gi-icons/'`
- 2 处潜在崩溃：`ICON_LIB` 未定义时严格模式报错（改为 `window.ICON_LIB`）
- 导出提示更新为「上传到 shared/gi-icons/ 覆盖」

---

## 7. 主页 src 修正

- 修正主页 `index.html` 中 `map-editor` 的 `src`
- 从 `tools/map-editor.html`（旧）改为 `tools/map-editor/index.html`（新）
- 原因：`map-editor` 已拆为三件套

---

## 8. 主页菜单交互调整

**改动目标**
- 点有子菜单的一级菜单（如「图片处理」）→ 只展开 / 收起，**不切换 iframe**
- 点无子菜单的一级菜单（如「角色一图流」）→ 直接切换
- 点子菜单项 → 切换 iframe

**代码改动（`index.html`）**
- 新增运行时状态 `expandedTools`（Set，记录哪些一级菜单是展开的）
- `renderMenu` 里的 `isExpanded` 从「当前激活的工具自动展开」改为「看 `expandedTools` 集合」
- 一级菜单的 click 事件：有子菜单时**只 toggle 展开/收起**，删掉「自动切到第一个子工具」的分支
- `selectSubtool` 里把 `toolKey` 加入 `expandedTools`（保证进入子工具后一级菜单保持展开）

---

## 9. 主页初始化改为永远从角色卡开始

**问题**
- 原来初始化会读 localStorage 恢复上次用的工具
- 导致「上次用过图片处理 → 这次打开主页自动进图片处理」
- 容易被误认为「点菜单自动跳转」

**改动（`index.html`）**
- 删掉 `STORAGE_KEY` / `STORAGE_SUB` 常量
- `selectTool` / `selectSubtool` 里删掉写 localStorage 的代码
- `init()` 里删掉读 localStorage 恢复工具的逻辑
- 打开主页永远从 `DEFAULT_TOOL`（角色一图流）开始
- 保留 hash 直达（如 `#map-editor` 可直连）

---

## 命名规范（一直沿用）

- **文件夹名 / 文件名**：全部英文小写，多词用短横线（如 `map-editor`）
- **工具拆分结构**：

  ```
  tools/<tool-name>/
  ├── index.html    结构
  ├── style.css     样式
  └── app.js        逻辑
  ```

- **每个文件顶部带模块导航注释**：

  ```
  【JS 模块 1】常量配置
  【HTML 模块 2】分类 Tab
  【CSS 模块 3】条目卡片
  ```

- **路径规则**：
  `tools/<tool-name>/index.html` 引用共享资源用 `../../shared/xxx`

---

## 关键路径速查

| 内容 | 路径 |
|---|---|
| 主页 | `index.html`（根目录） |
| 共享 UI 图标 | `shared/ui-icons.js` |
| 共享主题 | `shared/theme.css` |
| 游戏图标 | `shared/gi-icons/` |
| 图标映射表 | `shared/gi-icons/icon-dict.js` |
| 角色编号 txt | `shared/data/characters.txt` |
| 字体库 | `shared/fonts/` |
| 立绘素材 | `shared/assets/characters/standing/` |
| 元素图素材 | `shared/assets/characters/element/` |
| 在线存档 | `shared/saves/characters/` |

---

## 给 AI 的备忘（新对话开场用）

如果开新对话继续这个项目，请把本文件贴给 AI，并告知：

1. **用户只能用手机操作 GitHub 网页端**
   - 所有代码必须给完整版，不能给「改某一行」这种片段
   - 用户不懂代码，需要能直接复制粘贴

2. **每次生成代码前先自查**
   - 删冗余、修错误
   - 保持模块化（文件顶部带【XX 模块 N】导航注释）

3. **遇到路径改动**
   - 一并给完整对照表

4. **如果改完代码用户反映没效果**
   - 优先让用户关掉浏览器重开（手机端缓存特别顽固）
   - 或让用户用无痕模式测试

5. **当前进度**
   - 已完成：拆 character、map-editor、主页交互调整
   - 待办：拆 video-cover、image-tools、chart
   - 详见下方「待办」章节

---

## 待办

- [ ] 拆 `tools/video-cover.html` → `tools/video-cover/{video,collection}/`
- [ ] 拆 `tools/image-tools.html` → `tools/image-tools/{7 个子工具}/`
- [ ] 拆 `tools/chart.html` → `tools/chart/{radar,bar}/`
- [ ] `tools/tier.html` 是否拆待定（单功能可能不用拆）
- [ ] 所有工具拆完后，主页 `TOOLS` 里各 `src` 全部替换为新路径
- [ ] 上传新版 `README.md`
