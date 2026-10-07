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
| 封面制作 | 视频封面 / 合集封面 | ⏳ |
| 图表 | 雷达图 / 柱状图 | ⏳ |
| 角色梯队 | S / A / B 三档排行榜 | ⏳ |

---

## 📁 仓库结构

```
genshin-guide/
│
├── index.html                    主页（iframe 切换 + 侧边抽屉 + 主题切换）
├── README.md                     本文件
│
├── tools/                        所有工具页
│   ├── character/                角色一图流（已拆三件套）
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── map-editor/               图标字典编辑器（已拆三件套）
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── image-tools.html          图片处理（待拆）
│   ├── video-cover.html          封面制作（待拆）
│   ├── chart.html                图表（待拆）
│   └── tier.html                 角色梯队（待拆）
│
└── shared/                       全站共享资源
    ├── ui-icons.js               共享 UI 图标库（Solar 图标）
    ├── theme.css                 共享主题变量（浅色 / 深色）
    ├── gi-icons/                 游戏图标系统
    │   ├── icon-dict.js          图标映射表（ID / URL / 本地）
    │   ├── icon-loader.js        图标加载器
    │   └── UI_AvatarIcon_Traveler.webp
    ├── data/                     纯文本数据
    │   ├── characters.txt        角色编号 ↔ 中文名
    │   ├── monsters.txt          BOSS 名 → 图标短 ID
    │   ├── character-art.txt     角色名 → 立绘 URL
    │   └── logos.txt             游戏 Logo 清单
    ├── fonts/                    字体库
    │   ├── fonts.json            字体清单
    │   └── *.ttf / *.otf         字体文件
    ├── assets/                   本地素材
    │   └── characters/
    │       ├── standing/         立绘图（编号.角色名.png）
    │       └── element/          元素图（元素名.png）
    └── saves/                    在线存档
        └── characters/           编号.角色名.json
```

---

## 🧭 主页导航结构

主页是单页应用，左侧抽屉菜单切换工具，工具页面在 iframe 中运行。

| 一级菜单 | 二级菜单 | 状态 |
|---|---|---|
| 角色一图流 | — | ✅ |
| 图标字典编辑器 | — | ✅ |
| 图片处理 | 背景修改 / 双图羽化 / 对位裁切 / 图层拼接 / 武器图标 / 武器卡片 / 成就制作 | ⏳ |
| 封面制作 | 视频封面 / 合集封面 | ⏳ |
| 图表 | 雷达图 / 柱状图 | ⏳ |
| 角色梯队 | — | ⏳ |

**机制说明**：
- 有独立 `src` 的子工具 → 独立 iframe
- 没有独立 `src` 的子工具 → 沿用父工具 iframe，`postMessage` 通知切换

---

## 🎨 角色一图流

**入口：** https://vllenst.github.io/genshin-guide/#character

功能：
- 编辑角色信息（名称 / 版本 / 日期 / 作者）
- 一键匹配样式图（立绘 / 元素图 / 名片图）
- 武器、圣遗物、天赋、词条、面板、命座、配队编辑
- 导出 4K PNG
- 导出 / 导入 JSON 配置
- 载入在线存档

---

## 🎨 图标字典编辑器

**入口：** https://vllenst.github.io/genshin-guide/#map-editor

维护 `shared/gi-icons/icon-dict.js` 的可视化工具。

功能：
- 粘贴 Lunaris 图标链接批量添加
- 自动从 Amber 数据库查中文名
- 手动调整序号 / 星级
- 一键导出 icon-dict.js

---

## 🖼️ 图片素材来源

| 素材 | 来源 |
|---|---|
| 立绘 | shared/assets/characters/standing/编号.角色名.png |
| 元素图 | shared/assets/characters/element/元素名.png |
| 名片图 | Lunaris 外链 |
| 武器图标 | Lunaris 外链 |
| 圣遗物图标 | Lunaris 外链 |
| 角色头像 | Lunaris 外链 |

---

## 📝 在线存档

存档路径：`shared/saves/characters/`
命名格式：`编号.角色名.json`

- **导出**：角色卡右上角浮动工具栏「导出」
- **上传**：手动上传到 shared/saves/characters/
- **载入**：外观样式 Tab →「载入在线存档」

---

## 🔧 本地开发

纯静态站点，双击 index.html 就能跑。

**注意**：浏览器对 `file://` 协议有 CORS 限制，使用 `fetch` 加载本地文件（如 `characters.txt`、字体文件）时会失败，建议用本地服务器：

```
python -m http.server 8000
```

然后访问 http://localhost:8000/

推送到 main 分支后 GitHub Pages 自动部署，1~3 分钟生效。

---

## 📝 备注

- 中文名查询：Project Amber（gi.yatta.moe）
- 主题系统：通过 `shared/theme.css` 统一管理；切换时加 `.theme-switching` class 禁用过渡
- 所有编辑数据存在浏览器本地（IndexedDB），不上传服务器
- 图标来自 Solar Icons

---

*个人自用，随意参考。*
