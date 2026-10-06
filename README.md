# 原神攻略工具集

个人自用的原神攻略图制作工具集，纯前端，本地处理，不收集任何数据。

**在线访问：** https://vllenst.github.io/genshin-guide/

---

## 🛠️ 工具列表

| 工具 | 说明 |
|---|---|
| **角色一图流** | 武器 / 圣遗物 / 天赋 / 命座 / 配队总览，导出 4K PNG |
| **图片处理** | 背景修改、双图羽化、对位裁切、图层拼接、武器图标、武器卡片、成就制作 |
| **封面制作** | 视频封面 / 合集封面 |
| **图表** | 雷达图 / 柱状图，支持 Excel / TXT 导入 |
| **角色梯队** | S / A / B 三档排行榜 |

---

## 📁 仓库结构

```
genshin-guide/
├── index.html            首页入口
├── icons.js              共享图标库（Solar）
├── shared-theme.css      共享主题变量（浅色 / 深色）
├── map-editor.html       图标字典编辑器
├── README.md
├── tools/                工具页面
│   ├── character.html    角色一图流
│   ├── image-tools.html  图片处理
│   ├── video-cover.html  封面制作
│   ├── chart.html        图表
│   └── tier.html         角色梯队
├── icons/                图标系统
│   ├── icon-dict.js      图标映射表
│   ├── icon-loader.js    图标加载器
│   └── UI_AvatarIcon_Traveler.webp   （唯一的本地图）
└── fonts/                字体库
    ├── fonts.json        字体清单
    └── *.ttf / *.otf     字体文件
```

---

## 🎨 图标字典编辑器

维护图标映射表用的可视化工具，可以：

- 粘贴 Lunaris 图标链接批量添加
- 自动从 Amber 数据库查中文名
- 手动调整序号 / 星级
- 一键导出 `icon-dict.js`

**入口：** https://vllenst.github.io/genshin-guide/map-editor.html

---

## 🔧 本地开发

纯静态站点，直接双击 `index.html` 就能跑。  
推送到 `main` 分支后，GitHub Pages 自动部署，等 1~3 分钟刷新即可。

---

## 📝 备注

- 图标素材：大多数走 Lunaris 外链（`api.lunaris.moe`），旅行者的图放在本地
- 中文名查询：通过 Project Amber（`gi.yatta.moe`）
- 主题系统：浅色 / 深色手动切换，通过 `shared-theme.css` 统一管理
- 所有数据存储在浏览器本地（IndexedDB），不上传服务器

---

*个人自用，随意参考。*
