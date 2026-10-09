# 更新记录

按日期倒序排列（最新在最上）。

> **文件定位**：给 AI 助手「恢复记忆」用。
> 只记**关键里程碑**（让 AI 知道什么已经做完，不要重复做）和**待办**（让 AI 知道可能的下一个方向）。
> 不记流水账。细节看代码本身。

---

## 2026-10-09

**里程碑**：
- 拆 `tools/character/app.js` → `{consts.js, svg.js, app.js}` 三文件
- 角色卡导出 JSON 剥离非手动图片，导入自动重匹配（体积十几 MB → 几十 KB）
- 字体加 IndexedDB 缓存，首次下载后永久秒开
- 导出 PNG 前把所有图片洗成 dataURL（修外链 CORS 和本地相对路径丢图）
- 角色名校验：以 `characters.txt` 为准，非法名跳过立绘 / 名片 / 头像，元素图不受影响
- 图标 / 样式图并发下载，字体与图标并行不互相阻塞
- 展开收起按钮加旋转动画

**共享资源**：
- `shared/theme.css` 修按钮图标误判（删 `:has(> svg:only-child)`）
- `icon-loader.js` `getPath()` 加 `url` 覆盖，优先级 `local > url > http key > 拼接`
- `icon-dict.js` 夏洛蒂加 `url` 覆盖（原 Lunaris 源图错）
- `ui-icons.js` export / import 方向对调

**图标字典编辑器**：
- 支持 `url` 字段（载入 / 同步 / 导出都带上）
- 粘贴 URL 改为「给 key 挂源」语义（原来只是新增条目）
- Amber 同步时 `local` 或 `url` 的条目名字冲突 → 跳过

---

## 2026-10-08

**里程碑**：
- 拆 `tools/video-cover.html` → `tools/video-cover/{video,collection}/`（含三模式：角色攻略 / Boss攻略 / 自定义）
- `shared/theme.css` 从「只有变量」扩展成「变量 + 通用控件」（22 模块），各工具 `style.css` 精简为只留布局
- 角色卡改造：横向 Tab、浮动按钮方形、立绘 / 名片图走字典、拖动性能优化
- 图标字典编辑器：统一到新风格、一行布局、缩略图 lazy
- 新增字典：`shared/data/namecards.txt`、`shared/data/character-art.txt`
- 新增目录：`shared/assets/portrait/`（本地立绘）
- favicon 换成 `favicon.png`

**字体加载修复**：
- 角色卡 / 视频封面：字体加载机制重写为「fetch → ArrayBuffer → 直接喂给 FontFace」
- 根因：GitHub 上字体文件曾被重命名，导致文件损坏
- 视频封面：@font-face 同步注入 `document.head`

**删除**：
- `tools/video-cover.html`（已拆分）
- `shared/assets/characters/standing/`（迁移到 `portrait/`）
- `temp-namecard-check.html`（临时文件）

---

## 2026-10-07

**里程碑**：
- 新建 `shared/` 目录，收拢所有共享资源
- 拆 `tools/character.html` → `tools/character/`，`tools/map-editor.html` → `tools/map-editor/`
- 主页重写：支持「单工具 + 多子工具」两种形态
- UI 图标从 Solar 换成 Phosphor（ui / nav / app）
- 字典 key 从短 ID 改为图标全名（如 `UI_AvatarIcon_HuTao`）

---

## 命名规范

- **文件夹 / 文件名**：英文小写，多词用短横线
- **工具拆分结构**：`tools/<name>/{index.html, style.css, app.js}`
- **多子工具**：`tools/<name>/{subA, subB}/`，各自完整三件套
- **文件顶部带模块导航注释**（如 `【JS 模块 1】`）
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

**你是我的助手，协助我运营这个仓库（改代码 / 优化流程 / 拆文件）。**

我发你 `README.md` + `CHANGELOG.md` 是让你**恢复记忆**——知道这个仓库现状、什么已经做完、有什么规范。

**你读完后的正确反应**：
- 简单确认你已了解现状（一两句话）
- **然后等我下指令**
- **不要**主动从「待办」里挑任务、直接给方案、或开始改代码

**修什么、怎么修、什么时候修，我先提。** 你负责执行。

### 1. 用户只能用手机操作 GitHub 网页端

- 所有代码必须给**完整版**，不能给片段
- 用户不懂代码，需要能直接复制粘贴覆盖
- **一次给一个文件**（大文件会被截断）
- 大段代码用 **4 个反引号**包裹（避免嵌套代码块截断）
- **用户看不到 Console**，别要求他发 Console 报错。诊断方式改成「看现象 / 看 UI 反馈 / 看导出结果」

### 2. 每次生成代码前先自查

- 删冗余、修错误
- 保持模块化（文件顶部带【XX 模块 N】注释）

### 3. 界面 / 控件相关改动的规则

**新增 / 修改 / 拆分 HTML 时，涉及界面外观、控件属性的**（按钮 / 输入框 / 下拉 / 滑块 / 卡片 / Tab / 弹窗 / 图标尺寸 / 文字位置 / 内缩等）：

- **优先参考 `shared/theme.css` 和 `tools/character/`**
- **能直接用就不要自己新增样式**
- theme 里已有的类名（`.ios-group` / `.ios-row` / `.control-item` / `.slider-row` / `.num-box` / `.file-picker` / `.seg-control` / `.tab-sheet` 等）直接用
- **内缩（padding）不在 theme 里统一加**，在 HTML 层控制（因为 `.ios-group` 里可能放不同结构，统一加会误伤 `.ios-row` / `.field-grid`）
- 目的：保持全站风格统一

### 4. 改完没效果时

- 优先让用户**关浏览器重开**（手机缓存顽固）
- 或**无痕模式**测试

### 5. 角色卡的图片处理逻辑（别重复踩坑）

- **预览时**：SVG 插 DOM，相对路径 / 外链都能显示（CORS 不拦 image 显示）
- **导出 PNG 时**：SVG 装进 blob URL，相对路径失效 + 外链受 CORS 限制 → 所以导出前要把所有图片洗成 dataURL
- **`imgManual` 标记**：区分手动上传 vs 字典匹配；导出 JSON 时前者保留、后者剥离

### 6. 字体问题排查顺序

1. 先看是不是**没缓存**（首次下 20MB）→ IndexedDB
2. 再看是不是 **GitHub Pages 慢**（国内直连 87KB/s）
3. 最后才考虑压缩 / 子集化 / 换源

---

## 待办

**（仅供 AI 了解可能的方向，不代表要立刻做）**

- 拆 `tools/image-tools.html` → `tools/image-tools/{7 个子工具}/`
  - 背景修改 / 双图羽化 / 对位裁切 / 图层拼接 / 武器图标 / 武器卡片 / 成就制作
- 拆 `tools/chart.html` → `tools/chart/{radar,bar}/`
- `tools/tier.html` 是否拆待定
- 拆完后主页 `TOOLS` 里对应 subtool 加独立 `src`
- 角色卡 `app.js` 还能再拆（`render.js` 存 `renderXxxEditor` 家族，能再省 ~350 行），暂不急
- 立绘如果换源到国内 / 加缓存，可以参考字体的方案
