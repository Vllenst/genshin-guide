# 更新记录

按日期倒序排列（最新在最上）。

> 规则：
> - 当天有新增 → 在最上方新增 `## 日期` 下按 `### 1.` `### 2.` 编号
> - 当天结束时 → 把当天所有编号项合并成一段总结，去掉编号

---

## 2026-10-08

### favicon 更换

- 图标从内联 SVG 改为外部文件 `favicon.png`
- 图样：工具箱 + 游戏手柄（通用游戏工具箱定位，不绑定具体游戏）
- 由 AI 生成（豆包）

**注意**：部分手机浏览器（如雨见 Cbeta）不认 favicon，显示自动生成的字母占位图。这是浏览器自身的问题，网站本身正常。

---

## 2026-10-07

### 目录重组

新建 `shared/` 目录，收拢所有共享资源：

| 原名 | 新名 |
|---|---|
| `icons.js` | `shared/ui-icons.js` |
| `shared-theme.css` | `shared/theme.css` |
| `icons/` | `shared/gi-icons/` |
| `data/` | `shared/data/` |
| `fonts/` | `shared/fonts/` |
| `assets/` | `shared/assets/` |
| `save/` | `shared/saves/` |
| `map-editor.html` | `tools/map-editor.html` |

### 工具拆分

- `tools/character.html` → `tools/character/{index.html, style.css, app.js}`
- `tools/map-editor.html` → `tools/map-editor/{index.html, style.css, app.js}`
- 删死代码（`ICONS.clear` / `switchTab` / `uploadFontHandler`）
- 所有文件顶部加模块导航注释（`【JS 模块 N】`）
- map-editor 去掉重复的顶部 header，主题改为被动接收

### 主页重写

- 支持单工具 + 多子工具两种形态
- 多子工具：每个子工具可独立 src
- 老式工具仍兼容（postMessage 切换）
- TOOLS 加 map-editor 入口
- 打开主页永远从角色卡开始，不恢复上次工具
- 菜单交互：点有子菜单的一级菜单只展开，不切换
- 加 `html.theme-switching` 规则禁用主题切换时的过渡

### 图标库更换

- 16 组 32 个图标从 Solar 换成 Phosphor（ui / nav / app 三段）
- element / artifact 保留旧图标
- 删无用的 `ui.star`
- arrowUp / chevronDown 加 transform 翻转调整方向

### 字典 key 格式改造 + 4 类数据全量同步

- 字典 key 从「短 ID」改为「图标全名」（如 `HuTao` → `UI_AvatarIcon_HuTao`）
- 词典 config 的 prefix 相应缩短
- map-editor 加「怪物」tab 和「从 Amber 同步」按钮
- 支持 4 类：角色 / 圣遗物 / 武器 / 怪物
- 同步合并策略：本地图 > Amber > 字典保留
- 武器过滤：只保留 5 位 order（过滤幻化皮肤、测试数据）
- 缩略图改用 CSS（div + img 叠加），不走 canvas（避免 CORS）
- 怪物图标无星级背景
- **旧字典必须重新同步一次**

**涉及文件**：
- `shared/gi-icons/icon-loader.js`
- `shared/gi-icons/icon-dict.js`
- `tools/character/app.js`
- `tools/map-editor/index.html`
- `tools/map-editor/style.css`
- `tools/map-editor/app.js`
- `index.html`

---

## 命名规范

- **文件夹 / 文件名**：英文小写，多词用短横线
- **工具拆分结构**：`tools/<name>/{index.html, style.css, app.js}`
- **文件顶部带模块导航注释**（如 `【JS 模块 1】`）
- **路径规则**：`tools/<name>/index.html` 引用共享资源用 `../../shared/xxx`

---

## 关键路径速查

| 内容 | 路径 |
|---|---|
| 主页 | `index.html` |
| 共享 UI 图标 | `shared/ui-icons.js` |
| 共享主题 | `shared/theme.css` |
| 游戏图标 | `shared/gi-icons/` |
| 图标映射表 | `shared/gi-icons/icon-dict.js` |
| 图标加载器 | `shared/gi-icons/icon-loader.js` |
| 角色编号 | `shared/data/characters.txt` |
| 字体库 | `shared/fonts/` |
| 立绘素材 | `shared/assets/characters/standing/` |
| 元素图 | `shared/assets/characters/element/` |
| 在线存档 | `shared/saves/characters/` |
| 图标来源 | Phosphor（ui/nav/app）+ Solar（element/artifact） |

---

## 给 AI 的备忘

1. **用户只能用手机操作 GitHub 网页端**
   - 所有代码必须给完整版
   - 用户不懂代码，需要能直接复制粘贴

2. **每次生成代码前先自查**
   - 删冗余、修错误
   - 保持模块化（文件顶部带【XX 模块 N】注释）

3. **改完没效果时**
   - 优先让用户**关浏览器重开**（手机缓存顽固）
   - 或**无痕模式**测试

4. **当前进度**
   - 已完成：拆 character、map-editor、主页交互、图标库、字典 key 改造
   - 待办：拆 video-cover、image-tools、chart

---

## 待办

- [ ] 拆 `tools/video-cover.html` → `tools/video-cover/{video,collection}/`
  - 注意：里面有 `CHAR_SHORTID` 表，逻辑类似 `findShortIdByName`，要一起改
- [ ] 拆 `tools/image-tools.html` → `tools/image-tools/{7 个子工具}/`
- [ ] 拆 `tools/chart.html` → `tools/chart/{radar,bar}/`
- [ ] `tools/tier.html` 是否拆待定
- [ ] 所有工具拆完后，主页 `TOOLS` 里各 `src` 替换为新路径
