# 更新记录

按日期倒序排列（最新在最上）。

> **文件定位**：给 AI 助手「恢复记忆」用。
> 只记**关键里程碑**（让 AI 知道什么已经做完，不要重复做）和**待办**（让 AI 知道可能的下一个方向）。
> 不记流水账。细节看代码本身。

---

## 2026-10-09

**里程碑**：
- 角色一图流重构：拆 `app.js` → `{consts.js, svg.js, app.js}`；导出 JSON 剥离图片、导入自动重匹配；字体加 IndexedDB 缓存；导出 PNG 前把图片洗成 dataURL
- 角色一图流：配队区 2/3/4 号位和备选支持 `名字·元素` 输入（两级回退）；匹配完成后只刷新缩略图，不重建编辑器
- 立绘匹配 key 从 `名字（元素）` 改为 `名字·元素`
- 视频封面稳定化：修一批 bug（无字 / 清空还原 / 导出虚线 / 图片丢失 / 胶囊文字隐形 / 预览撑爆），图层顺序调整
- 图标字典编辑器支持 `url` 字段；粘贴 URL 语义改为「给 key 挂源」
- 图标系统支持单条 `url` 覆盖，优先级 `local > url > http key > 拼接`（`icon-loader.js`）
- `ui-icons.js` export / import 方向对调

---

## 2026-10-08

**里程碑**：
- 拆 `tools/video-cover.html` → `tools/video-cover/{video,collection}/`
- `shared/theme.css` 从「只有变量」扩展成「变量 + 通用控件」（22 模块）
- 角色卡改造：横向 Tab、浮动按钮方形、立绘 / 名片图走字典
- 图标字典编辑器：统一风格、一行布局、缩略图 lazy
- 新增字典：`shared/data/namecards.txt`、`shared/data/character-art.txt`
- 新增目录：`shared/assets/portrait/`
- favicon 换成 `favicon.png`
- 字体加载机制重写

**删除**：
- `tools/video-cover.html`
- `shared/assets/characters/standing/`
- `temp-namecard-check.html`

---

## 2026-10-07

**里程碑**：
- 新建 `shared/` 目录
- 拆 `tools/character.html` → `tools/character/`，`tools/map-editor.html` → `tools/map-editor/`
- 主页重写：支持「单工具 + 多子工具」两种形态
- UI 图标从 Solar 换成 Phosphor
- 字典 key 从短 ID 改为图标全名

---

## 命名规范

- **文件夹 / 文件名**：英文小写，多词用短横线
- **工具拆分结构**：`tools/<name>/{index.html, style.css, app.js}`
- **多子工具**：`tools/<name>/{subA, subB}/`，各自完整三件套
- **文件顶部带模块导航注释**
- **路径规则**：
  - `tools/<name>/index.html` → `../../shared/xxx`
  - `tools/<name>/<sub>/index.html` → `../../../shared/xxx`

---

## 关键路径速查

| 内容 | 路径 |
|---|---|
| 主页 | `index.html` |
| 共享主题 + 通用控件 | `shared/theme.css` |
| 共享 UI 图标 | `shared/ui-icons.js` |
| 游戏图标 | `shared/gi-icons/` |
| 角色编号 | `shared/data/characters.txt` |
| 名片图字典 | `shared/data/namecards.txt` |
| 立绘字典 | `shared/data/character-art.txt` |
| 字体库 | `shared/fonts/` |
| 本地立绘 | `shared/assets/portrait/` |
| 元素图 | `shared/assets/characters/element/` |
| 在线存档 | `shared/saves/characters/` |
| 角色卡拆分文件 | `tools/character/{consts.js, svg.js, app.js}` |

---

## 给 AI 的备忘

### 0. 你的定位

你是我的助手，协助我运营这个仓库。我发你 `README.md` + `CHANGELOG.md` 是让你**恢复记忆**。

**读完后的正确反应**：简单确认已了解现状（一两句话）→ **等我下指令**。

**不要**主动从「待办」里挑任务、给方案、或开始改代码。修什么、怎么修、什么时候修，我先提。

### 1. 修改流程

- **每次改代码前先出方案**，我确认后再给代码
- 代码必须给**完整版**，一次一个文件
- 大段代码用 **4 个反引号**包裹

### 2. 环境约束

- 我**只能用手机**操作 GitHub 网页端
- 我**看不到 Console**，诊断只能看现象 / UI 反馈 / 导出结果
- 改完没效果 → 先关浏览器重开或换无痕测试

### 3. 关键坑位（具体看代码注释，别重复踩）

- **图片**：导出 PNG 时 SVG 装进 blob URL，相对路径失效 + 外链受 CORS 限制 → 导出前要把图片洗成 dataURL
- **图片标记**：`imgManual` 区分手动上传 / 字典匹配，导出 JSON 时前者保留后者剥离
- **匹配不重建编辑器**：只更新缩略图 `src`（`data-img-target` 定位），避免打断输入框编辑
- **字体**：首次慢是 GitHub Pages 问题，靠 IndexedDB 缓存
- **角色名匹配**：立绘 / 名片 / 1 号位严格，2/3/4 号位 / 备选两级回退（`·` 分隔）
- **视频封面图层**：底层 → `underMiddle=true` 素材 → 模糊层 → `underMiddle=false` 素材 → 胶囊 → 文字

### 4. 界面 / 控件规范

- 优先参考 `shared/theme.css` 和 `tools/character/`
- 能直接用就不新增样式，内缩（padding）在 HTML 层控制
- 目的：全站风格统一

---

## 待办

**（仅供 AI 了解可能的方向，不代表要立刻做）**

- 拆 `tools/image-tools.html` → `tools/image-tools/{7 个子工具}/`，拆完给每个 subtool 加独立 `src`
- 拆 `tools/chart.html` → `tools/chart/{radar,bar}/`，同上
- `tools/tier.html` 是否拆待定
