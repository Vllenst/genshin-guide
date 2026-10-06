# 原神攻略工具集

一个纯前端的原神攻略工具集合，所有数据本地处理，无需登录。

**在线访问：** https://vllenst.github.io/genshin-guide/

---

## 📁 仓库结构

| 文件 / 文件夹 | 说明 |
|---|---|
| `index.html` | 首页入口，统一导航 |
| `icons.js` | 共享图标库（Solar 图标） |
| `shared-theme.css` | 共享主题变量（浅色 / 深色） |
| `tools/` | 所有工具页面 |
| ├ `character.html` | 角色一图流 |
| ├ `image-tools.html` | 图片处理（含武器卡片等子功能） |
| ├ `video-cover.html` | 视频封面 / 合集封面 |
| ├ `chart.html` | 图表（雷达图 / 柱状图） |
| └ `tier.html` | 角色梯队排行榜 |

---

## 🎨 主题

支持浅色 / 深色模式，通过 `shared-theme.css` 统一管理。
所有页面引用同一份变量，切换主题时全站同步。

---

## 🛠️ 技术说明

- 纯 HTML / CSS / JavaScript，无框架依赖
- 图标来自 [Solar Icons](https://yesicon.app/zh-Hans/solar)
- 托管于 GitHub Pages
