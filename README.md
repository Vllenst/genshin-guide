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
├── index.html            主页
├── README.md
├── CHANGELOG.md          更新记录
│
├── tools/                所有工具页
│   ├── character/        角色一图流（已拆）
│   ├── map-editor/       图标字典编辑器（已拆）
│   ├── image-tools.html  图片处理（待拆）
│   ├── video-cover.html  封面制作（待拆）
│   ├── chart.html        图表（待拆）
│   └── tier.html         角色梯队（待拆）
│
└── shared/               共享资源
    ├── ui-icons.js       共享 UI 图标库
    ├── theme.css         共享主题
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
| 封面制作 | 视频封面 / 合集封面 | ⏳ |
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

## 🖼️ 图片素材来源

| 素材 | 来源 |
|---|---|
| 立绘 | shared/assets/characters/standing/ |
| 元素图 | shared/assets/characters/element/ |
| 名片图 / 武器 / 圣遗物 / 怪物 / 角色头像 | Lunaris 外链 |

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

**注意**：`file://` 协议下 `fetch` 加载本地文件会失败，建议用本地服务器：

```
python -m http.server 8000
```

然后访问 http://localhost:8000/

推送到 main 分支后 GitHub Pages 自动部署，1~3 分钟生效。

---

## 📝 备注

- 中文名查询：Project Amber（gi.yatta.moe）
- 主题系统：通过 `shared/theme.css` 统一管理
- 所有编辑数据存在浏览器本地（IndexedDB）
- **UI 图标**：来自 Phosphor Icons
  https://yesicon.app/zh-Hans/ph
- **元素 / 圣遗物图标**：来自 iconfont 的「原神图标」库（作者 SwordMasterJS）
  https://www.iconfont.cn/collections/detail?cid=34264

---

*个人自用，随意参考。*
