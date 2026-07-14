# RepoGallery

一款 GitHub 风格的仓库展示画廊页面。填入你的仓库 URL，跑一个命令，通过 GitHub Pages 发布。

> English version below 🇬🇧

---

## ✨ 特性

- **GitHub 原生风格 UI** — 干净的卡片布局，显示 stars、语言色标、话题标签
- **完整 README 弹窗** — 点击卡片的摘要，弹窗展示渲染后的完整 README
- **排序** — 按 stars / 名称 / 更新时间排序，支持升序降序切换
- **响应式** — 桌面、平板、手机都适配
- **零运行时 API 调用** — 数据预取，静态服务
- **一行命令搞定** — `bash fetch-repos.sh` 从 URL 列表获取所有数据

## 🚀 快速开始

### 1. 使用模板

点击 GitHub 上的 **"Use this template"**，或者 clone 后自己 push。

### 2. 添加你的仓库

编辑 `URLs.txt`，每行一个 GitHub 仓库 URL：

```
https://github.com/你的用户名/仓库一
https://github.com/你的用户名/仓库二
```

### 3. 获取仓库数据

```bash
# 可选：设置 GitHub Token 避免 API 限速
export GITHUB_TOKEN=ghp_你的token

bash fetch-repos.sh
```

会生成 `repos.json`，里面包含所有仓库的元数据 + 完整 README 内容。

### 4. 配置排序（可选）

编辑 `config.json`：

```json
{
  "sortBy": "stars",
  "sortOrder": "desc"
}
```

`sortBy`: `"stars"`（星数）| `"name"`（名称）| `"updatedAt"`（更新时间）
`sortOrder`: `"asc"`（升序）| `"desc"`（降序）

### 5. 构建

```bash
npm install
npm run build
```

### 6. 部署到 GitHub Pages

推送到 `main` 分支 → CI 会自动构建并部署到 `gh-pages` 分支。

**一次配置：**
1. 进仓库 **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **`gh-pages`**，folder: **`/root`**
4. Save

本地预览：

```bash
python3 -m http.server 3000
open http://localhost:3000
```

## 📁 项目结构

```
├── index.html            # 入口页面（CSS 内联）
├── src/
│   ├── index.ts          # 应用入口 — 加载数据、渲染、连接 UI
│   ├── gallery.ts        # 卡片渲染、排序、README 弹窗
│   └── types.ts          # TypeScript 类型定义
├── config.json           # 排序偏好配置
├── repos.json            # 仓库数据（由脚本生成）
├── URLs.txt              # 你的仓库 URL 列表
├── fetch-repos.sh        # 数据获取脚本
├── package.json          # esbuild 构建脚本
├── tsconfig.json
└── .github/workflows/    # CI: 自动构建 + 部署到 gh-pages
```

## 🛠 自定义

### 修改标题文案

编辑 `src/index.ts` 中 header 模板：

```ts
<a href="https://github.com/你的用户名" class="gallery-title-user">你的用户名</a> 的 RepoGallery
```

### 修改主题色

设计默认使用 GitHub 蓝（`#0969da`）。要改颜色，替换 `index.html` 中所有出现的地方：

- `--color-accent: #0969da`
- `.card-readme` 左边框
- `.lang-btn.active` 背景色
- `.github-corner svg` 填充色

### 添加搜索筛选（默认未包含）

搜索筛选被移除以保持简洁。如果你需要，查看 git 历史中的 `setupFilterUI()` 和 `filterRepos()`。

## ⚙️ 工作原理

1. **`fetch-repos.sh`** 读取 `URLs.txt`，调用 GitHub API 获取每个仓库的元数据和 README，写入 `repos.json`
2. **`npm run build`** 用 esbuild 编译 `src/*.ts` 为单个 `dist/bundle.js`
3. **`index.html`** 加载 bundle，fetch `repos.json` 和 `config.json`，渲染画廊
4. **GitHub Actions**（`.github/workflows/deploy.yml`）每次 push 自动构建并部署到 `gh-pages` 分支

## 📄 许可

MIT — 自由使用、修改、分享。

---

## 🇬🇧 English

A sleek, GitHub-styled gallery page to showcase your repositories. Drop in your repo URLs, run one command, and publish via GitHub Pages.

**Quick start:** Edit `URLs.txt` → `bash fetch-repos.sh` → `npm run build` → push to `main`. CI auto-deploys to `gh-pages` branch. Go to Settings → Pages and set the source to `gh-pages` branch at `/root`.
