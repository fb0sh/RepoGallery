# Repo Gallery 设计规格

## 概述

一个优雅的静态 HTML 页面，展示用户在 GitHub 上的仓库集合。通过本地脚本获取 GitHub API 数据生成静态 JSON，页面读取后以响应式网格呈现。最终通过 GitHub Pages 发布。

## 技术方案

### 数据流

URLs.txt（用户维护仓库 URL 列表）→ fetch-repos.sh（调用 GitHub API 获取数据）→ repos.json（静态数据文件）→ index.html（渲染卡片画廊）

### 构建工具

- **esbuild**：TypeScript → 单文件 bundle + 压缩
- 命令：`esbuild src/index.ts --bundle --minify --outfile=dist/bundle.js`

## 项目结构

```
RepoGallery/
├── src/
│   ├── index.ts          ← 主入口，初始化页面
│   ├── types.ts          ← 仓库数据、筛选状态等类型定义
│   └── gallery.ts        ← 卡片渲染、动效、筛选逻辑
├── index.html            ← 入口 HTML（引用 dist/bundle.js）
├── repos.json            ← GitHub 仓库数据（由脚本生成）
├── fetch-repos.sh        ← 数据获取脚本（用户自维护）
├── URLs.txt              ← GitHub 仓库 URL 列表
├── tsconfig.json
├── package.json
└── .gitignore
```

## 视觉设计

### 整体风格
- **GitHub 原生 UI 风格 + 现代微动效**
- 纯白背景 `#ffffff`，卡片使用 GitHub 风格的边框 + 投影
- 主色调 GitHub 蓝 `#0969da`（用于链接、强调、悬停亮点）
- 系统无衬线字体（`-apple-system, BlinkMacSystemFont, sans-serif`）
- 干净留白，圆角 6px（GitHub 标准圆角）

### 布局

滚动式单页布局：
1. **Header** — 标题 "RepoGallery" + 简短副标题
2. **筛选栏** — 搜索输入框 + 语言标签按钮组
3. **Gallery 网格** — CSS Grid 响应式布局，自适应列数（移动端 1 列 → 平板 2 列 → 桌面 3+ 列）
4. **Footer** — 简单标注

### 卡片设计

```
┌─ GitHub 6px 边框 ─────────────┐
│  Repo Name  →  ↗              │  标题（蓝链接） + 新窗图标
│  Project brief description     │  灰色描述
│                                │
│  ⭐ 1,234  💬 56  🔵 TS      │  GitHub 标准计数风格
│                                │
│  README 精华摘要……             │  内联文本，不特殊加框
│                                │
│  #react  #tooling  #cli       │  话题标签
└────────────────────────────────┘
```

卡片设计遵循 GitHub 仓库列表的风格：白色卡片 + 边框 + 内容直排，无多余装饰。

### 动效

| 动效 | 实现方式 |
|------|----------|
| 卡片入场 | Intersection Observer + CSS transition，staggered 淡入上浮 0.4s |
| 卡片悬停 | transform: translateY(-2px) + box-shadow 加深 + 边框微光 |
| 搜索筛选 | 卡片根据搜索词/语言标签显示/隐藏，带 opacity + scale 过渡 |
| 语言标签点击 | CSS 缩放动画反馈 |

### 色彩体系

- 背景：`#ffffff`
- 内容区底纹：`#f6f8fa`（如 Header / 筛选栏底色）
- 卡片：`#ffffff` + `border: 1px solid #d0d7de` + `border-radius: 6px`
- 卡片悬停：`border-color: #0969da` + 微阴影扩散
- 主色：`#0969da`
- 文本主色：`#1f2328`
- 文本辅色：`#656d76`
- 语言颜色：按 GitHub 语言色谱动态映射
- 话题标签背景：`#e5e7eb`，文字 `#374151`

### 响应式断点

- 手机 < 640px：1 列
- 平板 640-1024px：2 列
- 桌面 > 1024px：3 列

## 数据格式（repos.json）

```json
[
  {
    "name": "repo-name",
    "owner": "username",
    "description": "项目简介",
    "url": "https://github.com/username/repo-name",
    "stars": 1234,
    "language": "TypeScript",
    "languageColor": "#3178c6",
    "topics": ["react", "tooling"],
    "readmeExcerpt": "从 README 提取的一段精华内容...",
    "readmeSections": ["安装", "使用", "特性"],
    "updatedAt": "2025-06-15T..."
  }
]
```

## 实现顺序

1. 初始化项目（package.json、tsconfig.json、esbuild 配置）
2. 编写 types.ts（类型定义）
3. 编写 gallery.ts（卡片渲染、筛选、动效）
4. 编写 index.ts（主入口）
5. 编写 index.html
6. 配置 .gitignore
7. 构建验证

## 非功能性需求

- 纯静态，零运行时 API 调用
- 支持 GitHub Pages 部署
- 离线可用（数据已固化在 repos.json）
- 现代浏览器支持（Chrome / Firefox / Safari / Edge 最近 2 个版本）
