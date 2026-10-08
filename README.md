# 原神攻略工具集

个人自用的原神攻略图制作工具集，纯前端，本地处理，不收集任何数据。

**在线访问：** https://vllenst.github.io/genshin-guide/

---

## 🛠️ 工具列表

| 工具 | 说明 | 状态 |
|---|---|---|
| 角色一图流 | 武器 / 圣遗物 / 天赋 / 命座 / 配队总览 | ✅ |
| 图标字典编辑器 | 维护 icon-dict.js 用 | ✅ |
| 图片处理 | 背景修改、双图羽化、对位裁切、图层拼接、武器图标、武器卡片、成就制作 | ⏳ |
| 封面制作 | 视频封面 / 合集封面 | ✅ |
| 图表 | 雷达图 / 柱状图 | ⏳ |
| 角色梯队 | S / A / B 三档排行榜 | ⏳ |

---

## 📁 仓库结构

```
genshin-guide/
├── index.html            主页
├── README.md
├── CHANGELOG.md          更新记录
├── favicon.png           网站图标
│
├── tools/                所有工具页
│   ├── character/        角色一图流（已拆）
│   ├── map-editor/       图标字典编辑器（已拆）
│   ├── video-cover/      封面制作（已拆）
│   │   ├── video/        视频封面
│   │   └── collection/   合集封面
│   ├── image-tools.html  图片处理（待拆）
│   ├── chart.html        图表（待拆）
│   └── tier.html         角色梯队（待拆）
│
└── shared/               共享资源
    ├── theme.css         共享主题变量 + 通用控件
    ├── ui-icons.js       共享 UI 图标库
    ├── gi-icons/         游戏图标系统
    ├── data/             纯文本数据
    ├── fonts/            字体库
    ├── assets/           本地素材
    └── saves/            在线存档
```

---

## 🧭 主页导航

主页是单页应用，左侧抽屉切换工具，工具页面在 iframe 中运行。

| 一级菜单 | 二级菜单 | 状态 |
|---|---|---|
| 角色一图流 | — | ✅ |
| 图标字典编辑器 | — | ✅ |
| 图片处理 | 背景修改 / 双图羽化 / 对位裁切 / 图层拼接 / 武器图标 / 武器卡片 / 成就制作 | ⏳ |
| 封面制作 | 视频封面 / 合集封面 | ✅ |
| 图表 | 雷达图 / 柱状图 | ⏳ |
| 角色梯队 | — | ⏳ |

---

## 🎨 角色一图流

**入口：** https://vllenst.github.io/genshin-guide/#character

- 编辑角色信息（名称 / 版本 / 日期 / 作者）
- 一键匹配样式图（立绘 / 元素图 / 名片图）
- 武器、圣遗物、天赋、词条、面板、命座、配队编辑
- 导出 4K PNG / JSON 配置
- 载入在线存档

**编辑界面：** 预览区在上，横向胶囊 Tab 切换编辑区。点预览图可隐藏浮动按钮。

---

## 🎨 图标字典编辑器

**入口：** https://vllenst.github.io/genshin-guide/#map-editor

维护 `shared/gi-icons/icon-dict.js` 的可视化工具。

- **从 Amber 同步**：一键拉取角色 / 圣遗物 / 武器 / 怪物 4 类数据
- 粘贴 Lunaris 图标链接手动添加
- 手动调整序号 / 星级
- 一键导出 icon-dict.js

**字典 key 格式**：图标全名（如 `UI_AvatarIcon_HuTao`）

---

## 🎨 封面制作

**入口：** https://vllenst.github.io/genshin-guide/#video-cover

### 视频封面

三种模式：

| 模式 | 主标题 | 胶囊标签 | 副标题第一行 | 副标题第二行 |
|---|---|---|---|---|
| **角色攻略** | 固定 `角色培养\n攻略图鉴` | 固定 `攻略` | 固定 `No.xxx`（自动编号，小字号） | 角色名（大字号，可编辑） |
| **Boss攻略** | 固定 `世界Boss\n&地方传奇` | 固定 `攻略` | BOSS 名（大字号，可编辑） | 任意文本（小字号，可编辑） |
| **自定义** | 可编辑 | 可编辑 | 可编辑 + 字号选择 | 可编辑 + 字号选择 |

**角色攻略**的匹配逻辑（走「名字（元素）」→「名字」回退）：
- 编号 ← `characters.txt`
- 立绘 ← `character-art.txt`
- 名片图 ← `namecards.txt`

**Boss攻略**的头像 ← `icon-dict.js` 的 monsters 字典（走 `ICON_LIB.fromName`）。

**其他功能：**
- 游戏 Logo 选择
- 画布背景上传 + 亮度 / 模糊调整
- 参考线 / 导出配置 / 导入配置 / 清空
- 导出 4K PNG

### 合集封面

- 输出分辨率固定 2K（2560 × 1440）
- 背景图上传（自动模糊）
- 主副标题文字
- 字体选择
- 导出 PNG（≤ 5MB）

---

## 🖼️ 图片素材来源

| 素材 | 来源 |
|---|---|
| 立绘 | `shared/data/character-art.txt` 字典（官方外链为主，个别本地文件放 `shared/assets/portrait/`） |
| 元素图 | `shared/assets/characters/element/` |
| 名片图 | `shared/data/namecards.txt` 字典（Lunaris 外链） |
| 角色头像 / 武器 / 圣遗物 / 怪物图标 | `shared/gi-icons/icon-dict.js`（Lunaris 外链） |

---

## 📝 在线存档

存档路径：`shared/saves/characters/`
命名格式：`编号.角色名.json`（编号补零三位，如 `001.旅行者.json`）

- **导出**：角色卡右上角浮动工具栏「导出」
- **上传**：手动上传到 shared/saves/characters/
- **载入**：外观样式 Tab →「载入在线存档」

---

## 🎨 主题 / 控件系统

所有样式统一由 `shared/theme.css` 管理，分为 22 个模块：

- **变量**（浅色 / 深色）
- **通用控件**：图标 / 表单 / 按钮 / iOS 容器 / 滑块 / 缩略图 / 条目卡片 /
  浮动按钮 / 浮动工具栏 / 横向 Tab / 分段控件 / 预览区 / 文件选择器 /
  只读文本 / 底部 Dock / Toast / 确认弹窗 / 字体抽屉

**改一处样式，所有工具同步生效。** 各工具的 `style.css` 只保留自己的布局。

---

## 📝 备注

- 中文名查询：Project Amber（gi.yatta.moe）
- 所有编辑数据存在浏览器本地（IndexedDB）
- **UI 图标**：来自 Phosphor Icons
  https://yesicon.app/zh-Hans/ph
- **元素 / 圣遗物图标**：来自 iconfont 的「原神图标」库（作者 SwordMasterJS）
  https://www.iconfont.cn/collections/detail?cid=34264
- **favicon**：AI 生成（豆包），工具箱 + 游戏手柄

---

*个人自用，随意参考。*
