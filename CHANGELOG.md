# 更新记录

按日期倒序排列（最新在最上）。

> 规则：
> - 当天有新增 → 在最上方新增 `## 日期` 下按 `### 1.` `### 2.` 编号
> - 当天结束时 → 把当天所有编号项合并成一段总结，去掉编号

---

## 2026-10-08

### UI 统一 + 字典改造

**shared/theme.css 扩展：**
- 从「只有主题变量」扩展成「变量 + 通用控件」
- 新增模块：全局重置、图标通用、表单控件、按钮、iOS 容器、滑块框、缩略图、条目卡片、浮动按钮、横向 Tab、确认弹窗
- 拖动条改回原生渲染（`accent-color`），与图片处理风格一致

**角色一图流（tools/character/）：**
- 横向胶囊 Tab 替换原来的底部弹窗抽屉
- 浮动按钮改正方形（34×34，对齐父页面 nav-btn）
- 点预览图可隐藏浮动按钮（手机端）；桌面端 hover 恢复
- 立绘从本地目录探测改成走 `character-art.txt` 字典
  - 匹配逻辑：先查「名字（元素）」再查「名字」
  - 空白 URL 报「暂无链接」
  - 名字带全角括号（如 `旅行者（冰）`）
- 名片图从 icon-dict 拼 URL 改成查 `namecards.txt` 字典
- 立绘 x 轴拖动只更新 image 的 x 属性（不全量重绘）
- 拖动条与右侧数值框双向联动修复
- `character/style.css` 精简（控件已抽到 theme.css）

**图标字典编辑器（tools/map-editor/）：**
- 三文件统一到新风格（theme.css 控件 + 一行布局）
- Tab 从分段控件改成胶囊
- 按钮、输入框、下拉框风格统一
- 条目改成一行布局：编号 / 头像 / 名字 / 星级 / 删除

**新增数据文件：**
- `shared/data/namecards.txt`（122 条名片图 URL，按编号倒序）
- `shared/data/character-art.txt`（122 条立绘 URL，空白保留）
- `shared/assets/portrait/`（本地立绘：旅行者、旅行者（冰）、沃雅妮莎）

**删除：**
- `shared/assets/characters/standing/`（迁移到 `portrait/`）
- `temp-namecard-check.html`（临时探测页）

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
| 共享主题 + 通用控件 | `shared/theme.css` |
| 共享 UI 图标 | `shared/ui-icons.js` |
| 游戏图标 | `shared/gi-icons/` |
| 图标映射表 | `shared/gi-icons/icon-dict.js` |
| 图标加载器 | `shared/gi-icons/icon-loader.js` |
| 角色编号 | `shared/data/characters.txt` |
| 名片图字典 | `shared/data/namecards.txt` |
| 立绘字典 | `shared/data/character-art.txt` |
| 字体库 | `shared/fonts/` |
| 本地立绘 | `shared/assets/portrait/` |
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
   - 已完成：拆 character、map-editor、主页交互、图标库、字典 key 改造、UI 统一、字典改造
   - 待办：拆 video-cover、image-tools、chart

---

## 待办

- [ ] 拆 `tools/video-cover.html` → `tools/video-cover/{video,collection}/`
  - BOSS 模式改用 `ICON_LIB.fromName('monsters', ...)`
  - 角色模式立绘走 `character-art.txt`
  - 角色模式背景走 `namecards.txt`
  - 删 `subtools` 上报
- [ ] 拆 `tools/image-tools.html` → `tools/image-tools/{7 个子工具}/`
- [ ] 拆 `tools/chart.html` → `tools/chart/{radar,bar}/`
- [ ] `tools/tier.html` 是否拆待定
- [ ] 所有工具拆完后，主页 `TOOLS` 里各 `src` 替换为新路径
