# 原神攻略工具集

个人自用的原神攻略图制作工具集，纯前端，本地处理，不收集任何数据。

**在线访问：** https://vllenst.github.io/genshin-guide/

---

## 🛠️ 工具列表

| 工具 | 说明 | 状态 |
|---|---|---|
| 角色一图流 | 武器 / 圣遗物 / 天赋 / 命座 / 配队总览 | ✅ |
| 图片处理 | 背景修改、双图羽化、对位裁切、图层拼接、武器图标、武器卡片、成就制作 | ⏳ |
| 封面制作 | 视频封面 / 合集封面 | ⏳ |
| 图表 | 雷达图 / 柱状图 | ⏳ |
| 角色梯队 | S / A / B 三档排行榜 | ⏳ |

---

## 📁 仓库结构

```
genshin-guide/
├── index.html              首页（iframe 切换）
├── icons.js                共享图标库
├── shared-theme.css        共享主题变量
├── map-editor.html         图标字典编辑器
├── README.md
│
├── tools/                  工具页面
│   ├── character.html
│   ├── image-tools.html
│   ├── video-cover.html
│   ├── chart.html
│   └── tier.html
│
├── icons/                  图标系统
│   ├── icon-dict.js
│   ├── icon-loader.js
│   ├── characters.txt
│   └── UI_AvatarIcon_Traveler.webp
│
├── fonts/                  字体库
│   ├── fonts.json
│   └── *.ttf / *.otf
│
├── save/                   在线存档
│   └── characters/
│
└── assets/                 本地素材
    └── characters/
        ├── standing/
        └── element/
```

---

## 🎨 图标字典编辑器

维护 `icons/icon-dict.js` 用的可视化工具。

**入口：** https://vllenst.github.io/genshin-guide/map-editor.html

功能：
- 粘贴 Lunaris 图标链接批量添加
- 自动从 Amber 数据库查中文名
- 手动调整序号 / 星级
- 一键导出 icon-dict.js

---

## 🖼️ 图片素材来源

| 素材 | 来源 |
|---|---|
| 立绘 | assets/characters/standing/编号.角色名.png |
| 元素图 | assets/characters/element/元素名.png |
| 名片图 | Lunaris 外链 |
| 武器图标 | Lunaris 外链 |
| 圣遗物图标 | Lunaris 外链 |
| 角色头像 | Lunaris 外链 |

---

## 📝 在线存档

存档文件放在 `save/characters/`，命名：`编号.角色名.json`

- **导出**：角色卡右上角浮动工具栏「导出」
- **上传**：手动上传到 save/characters/
- **载入**：外观样式 Tab →「载入在线存档」

---

## 🔧 本地开发

纯静态站点，双击 index.html 就能跑。推送到 main 分支后 GitHub Pages 自动部署，等 1~3 分钟。

---

## 📝 备注

- 中文名查询：Project Amber（gi.yatta.moe）
- 主题系统：浅色 / 深色手动切换，通过 shared-theme.css 统一管理
- 所有编辑数据存在浏览器本地（IndexedDB），不上传服务器
- 图标来自 Solar Icons

---

*个人自用，随意参考。*
