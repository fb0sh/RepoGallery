# Repo Gallery 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 subagent-driven-development（推荐）或 executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个纯静态的 GitHub Repo Gallery 页面，展示用户仓库集合，通过 esbuild 构建 TypeScript，部署到 GitHub Pages。

**架构：** TypeScript 源文件在 `src/` 目录下，esbuild 打包为 `dist/bundle.js`。`index.html` 引用该 bundle，运行时从 `repos.json` 加载数据，渲染响应式网格卡片。本地用 `fetch-repos.sh` 获取数据生成 `repos.json`，但该脚本由用户自行维护。

**技术栈：** TypeScript, esbuild, 纯 CSS (无框架), 原生 DOM API

---

### 任务 1：初始化项目

**文件：**
- 创建：`package.json`
- 创建：`tsconfig.json`
- 创建：`.gitignore`

- [ ] **步骤 1.1：创建 package.json**

运行：
```bash
cd /Users/fb0sh/Projects/RepoGallery
npm init -y
npm install --save-dev esbuild typescript
```

- [ ] **步骤 1.2：创建 tsconfig.json**

写入 `/Users/fb0sh/Projects/RepoGallery/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": false
  },
  "include": ["src"]
}
```

- [ ] **步骤 1.3：创建 .gitignore**

写入 `/Users/fb0sh/Projects/RepoGallery/.gitignore`：

```
node_modules/
dist/
.DS_Store
```

- [ ] **步骤 1.4：配置 esbuild build script**

编辑 `package.json` 中的 `scripts` 字段，替换为：

```json
{
  "scripts": {
    "build": "esbuild src/index.ts --bundle --minify --outfile=dist/bundle.js",
    "dev": "esbuild src/index.ts --bundle --sourcemap --outfile=dist/bundle.js --watch"
  }
}
```

使用 `npm pkg set scripts.build="esbuild src/index.ts --bundle --minify --outfile=dist/bundle.js"` 和 `npm pkg set scripts.dev="esbuild src/index.ts --bundle --sourcemap --outfile=dist/bundle.js --watch"`。

- [ ] **步骤 1.5：验证构建可运行**

```bash
mkdir -p src dist
npm run build
```

预期：输出 `dist/bundle.js`，无错误。

- [ ] **步骤 1.6：Commit**

```bash
git add package.json tsconfig.json .gitignore src dist
git commit -m "chore: init project with esbuild + typescript"
```

---

### 任务 2：定义类型（types.ts）

**文件：**
- 创建：`src/types.ts`

- [ ] **步骤 2.1：编写类型定义**

写入 `/Users/fb0sh/Projects/RepoGallery/src/types.ts`：

```typescript
export interface Repo {
  name: string;
  owner: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  languageColor: string;
  topics: string[];
  readmeExcerpt: string;
  readmeSections: string[];
  updatedAt: string;
}

export interface RepoCard {
  el: HTMLElement;
  data: Repo;
}

export interface FilterState {
  search: string;
  language: string | null;
}
```

- [ ] **步骤 2.2：Commit**

```bash
git add src/types.ts
git commit -m "feat: add Repo and FilterState type definitions"
```

---

### 任务 3：画廊渲染与筛选逻辑（gallery.ts）

**文件：**
- 创建：`src/gallery.ts`

- [ ] **步骤 3.1：编写 gallery.ts**

写入 `/Users/fb0sh/Projects/RepoGallery/src/gallery.ts`：

```typescript
import { Repo, FilterState } from "./types";

const REPO_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

function getLanguageColor(lang: string): string {
  return REPO_COLORS[lang] || "#6e7681";
}

function escapeHtml(text: string): string {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

export function createCardHtml(repo: Repo, index: number): string {
  return `
    <article class="repo-card" data-languages="${escapeHtml(repo.language)}" data-index="${index}">
      <div class="card-header">
        <h3 class="card-name">
          <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(repo.name)}
          </a>
        </h3>
      </div>
      <p class="card-desc">${escapeHtml(repo.description || "No description")}</p>
      ${
        repo.readmeExcerpt
          ? `<blockquote class="card-readme">${escapeHtml(repo.readmeExcerpt.slice(0, 150))}${repo.readmeExcerpt.length > 150 ? "…" : ""}</blockquote>`
          : ""
      }
      <div class="card-meta">
        <span class="card-stars">★ ${repo.stars.toLocaleString()}</span>
        <span class="card-lang">
          <span class="lang-dot" style="background:${getLanguageColor(repo.language)}"></span>
          ${escapeHtml(repo.language || "Other")}
        </span>
        <span class="card-updated">Updated ${formatDate(repo.updatedAt)}</span>
      </div>
      ${
        repo.topics.length > 0
          ? `<div class="card-topics">${repo.topics.map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`).join("")}</div>`
          : ""
      }
    </article>
  `;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function extractLanguages(repos: Repo[]): string[] {
  const langs = new Set(repos.map((r) => r.language).filter(Boolean));
  return Array.from(langs).sort();
}

export function filterRepos(repos: Repo[], state: FilterState): Repo[] {
  return repos.filter((repo) => {
    const matchSearch =
      !state.search ||
      repo.name.toLowerCase().includes(state.search.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(state.search.toLowerCase()));
    const matchLang =
      !state.language || repo.language === state.language;
    return matchSearch && matchLang;
  });
}

export function setupFilterUI(
  container: HTMLElement,
  repos: Repo[],
  languages: string[],
  onFilter: (state: FilterState) => void
): void {
  const filterBar = document.createElement("div");
  filterBar.className = "filter-bar";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search repositories…";
  searchInput.className = "filter-search";
  filterBar.appendChild(searchInput);

  const langFilters = document.createElement("div");
  langFilters.className = "lang-filters";
  const allBtn = document.createElement("button");
  allBtn.className = "lang-btn active";
  allBtn.textContent = "All";
  allBtn.dataset.lang = "";
  langFilters.appendChild(allBtn);

  languages.forEach((lang) => {
    const btn = document.createElement("button");
    btn.className = "lang-btn";
    btn.textContent = lang;
    btn.dataset.lang = lang;
    langFilters.appendChild(btn);
  });
  filterBar.appendChild(langFilters);

  container.insertBefore(filterBar, container.firstChild);

  const state: FilterState = { search: "", language: null };

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value;
    updateActiveLang();
    onFilter(state);
  });

  langFilters.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(".lang-btn") as HTMLButtonElement;
    if (!btn) return;
    const isActive = btn.classList.contains("active");
    if (btn.dataset.lang === "") {
      // "All" clicked
      langFilters.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.language = null;
    } else {
      allBtn.classList.remove("active");
      const alreadyActive = !isActive;
      langFilters.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
      if (alreadyActive) {
        btn.classList.add("active");
        state.language = btn.dataset.lang || null;
      } else {
        allBtn.classList.add("active");
        state.language = null;
      }
    }
    updateActiveLang();
    onFilter(state);
  });

  function updateActiveLang(): void {
    // Visual sync - no-op here, state is tracked
  }
}

export function renderCards(
  container: HTMLElement,
  repos: Repo[]
): void {
  const grid = container.querySelector(".repo-grid") as HTMLElement;
  if (!grid) return;

  grid.innerHTML = "";

  repos.forEach((repo, i) => {
    const html = createCardHtml(repo, i);
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const card = temp.firstElementChild as HTMLElement;
    grid.appendChild(card);

    // Staggered entrance animation
    requestAnimationFrame(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(12px)";
      requestAnimationFrame(() => {
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    });
  });
}

export function updateCardVisibility(
  container: HTMLElement,
  repos: Repo[],
  filtered: Repo[]
): void {
  const grid = container.querySelector(".repo-grid") as HTMLElement;
  if (!grid) return;

  const cards = grid.querySelectorAll<HTMLElement>(".repo-card");
  const filteredNames = new Set(filtered.map((r) => r.name));

  cards.forEach((card) => {
    const name = card.querySelector(".card-name a")?.textContent || "";
    const isVisible = filteredNames.has(name);
    if (isVisible) {
      card.style.display = "";
      card.style.opacity = "1";
      card.style.transform = "";
    } else {
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.style.display = "none";
      }, 300);
    }
  });
}
```

- [ ] **步骤 3.2：Commit**

```bash
git add src/gallery.ts
git commit -m "feat: add gallery rendering and filtering logic"
```

---

### 任务 4：主入口（index.ts）

**文件：**
- 创建：`src/index.ts`

- [ ] **步骤 4.1：编写主入口**

写入 `/Users/fb0sh/Projects/RepoGallery/src/index.ts`：

```typescript
import { Repo } from "./types";
import {
  extractLanguages,
  filterRepos,
  setupFilterUI,
  renderCards,
  updateCardVisibility,
} from "./gallery";

async function main() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("App container not found");
    return;
  }

  // Show loading state
  app.innerHTML = `
    <header class="gallery-header">
      <h1 class="gallery-title">
        <a href="https://github.com" target="_blank" rel="noopener">
          <svg class="gh-icon" viewBox="0 0 16 16" width="32" height="32">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
        RepoGallery
      </h1>
      <p class="gallery-subtitle">Projects I've built</p>
    </header>
    <div class="gallery-content">
      <div class="repo-grid">
        <div class="loading">Loading repositories…</div>
      </div>
    </div>
    <footer class="gallery-footer">
      <p>Built with ♥</p>
    </footer>
  `;

  try {
    const response = await fetch("repos.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const repos: Repo[] = await response.json();
    renderApp(app, repos);
  } catch (err) {
    const grid = app.querySelector(".repo-grid");
    if (grid) {
      grid.innerHTML = `<div class="error-msg">Failed to load repositories. Make sure repos.json exists.</div>`;
    }
    console.error(err);
  }
}

function renderApp(app: HTMLElement, repos: Repo[]) {
  const grid = app.querySelector(".repo-grid") as HTMLElement;
  if (!grid) return;

  const languages = extractLanguages(repos);

  // Initial render
  renderCards(app, repos);

  // Setup filtering
  setupFilterUI(app, repos, languages, (state) => {
    const filtered = filterRepos(repos, state);
    updateCardVisibility(app, repos, filtered);
  });
}

document.addEventListener("DOMContentLoaded", main);
```

- [ ] **步骤 4.2：Commit**

```bash
git add src/index.ts
git commit -m "feat: add main entry point with data loading"
```

---

### 任务 5：编写 index.html

**文件：**
- 创建：`index.html`

- [ ] **步骤 5.1：编写 HTML 入口**

写入 `/Users/fb0sh/Projects/RepoGallery/index.html`：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RepoGallery</title>
  <meta name="description" content="A gallery of my GitHub repositories." />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='%230969da' d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'/></svg>" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --color-bg: #ffffff;
      --color-bg-muted: #f6f8fa;
      --color-border: #d0d7de;
      --color-border-hover: #0969da;
      --color-accent: #0969da;
      --color-accent-hover: #0550ae;
      --color-text: #1f2328;
      --color-text-muted: #656d76;
      --color-tag-bg: #ddf4ff;
      --color-tag-text: #0969da;
      --radius-sm: 6px;
      --radius-md: 8px;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    }

    body {
      font-family: var(--font-sans);
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: var(--color-accent);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Header */
    .gallery-header {
      text-align: center;
      padding: 48px 24px 24px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-muted);
    }
    .gallery-title {
      font-size: 28px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .gallery-title a {
      display: flex;
      color: var(--color-text);
    }
    .gh-icon {
      color: var(--color-text-muted);
    }
    .gallery-subtitle {
      margin-top: 4px;
      color: var(--color-text-muted);
      font-size: 15px;
    }

    /* Content */
    .gallery-content {
      max-width: 1080px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }

    /* Filter bar */
    .filter-bar {
      margin-bottom: 24px;
    }
    .filter-search {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-family: inherit;
      background: var(--color-bg);
      color: var(--color-text);
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-search:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
    }
    .filter-search::placeholder {
      color: var(--color-text-muted);
    }
    .lang-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }
    .lang-btn {
      padding: 4px 12px;
      border: 1px solid var(--color-border);
      border-radius: 100px;
      background: var(--color-bg);
      color: var(--color-text);
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .lang-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
    .lang-btn.active {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: #fff;
    }

    /* Grid */
    .repo-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 640px) {
      .repo-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .repo-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* Card */
    .repo-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 16px;
      background: var(--color-bg);
      transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
      will-change: transform, border-color;
    }
    .repo-card:hover {
      border-color: var(--color-border-hover);
      box-shadow: 0 1px 4px rgba(9, 105, 218, 0.08);
      transform: translateY(-1px);
    }

    .card-name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .card-name a {
      color: var(--color-accent);
    }
    .card-name a::after {
      content: " ↗";
      font-size: 12px;
      opacity: 0.6;
    }

    .card-desc {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-bottom: 8px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-readme {
      font-size: 12px;
      color: var(--color-text-muted);
      background: var(--color-bg-muted);
      border-left: 3px solid var(--color-accent);
      padding: 6px 10px;
      margin-bottom: 10px;
      line-height: 1.5;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-style: italic;
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }
    .card-stars {
      font-weight: 500;
      color: var(--color-text);
    }
    .card-lang {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lang-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .card-topics {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .topic-tag {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      background: var(--color-tag-bg);
      color: var(--color-tag-text);
      border-radius: 100px;
      white-space: nowrap;
    }

    .card-updated {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-left: auto;
    }

    /* Loading / Error */
    .loading {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 0;
      color: var(--color-text-muted);
    }
    .error-msg {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 0;
      color: #cf222e;
    }

    /* Footer */
    .gallery-footer {
      text-align: center;
      padding: 24px;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="dist/bundle.js"></script>
</body>
</html>
```

- [ ] **步骤 5.2：Commit**

```bash
git add index.html
git commit -m "feat: add HTML entry with complete CSS"
```

---

### 任务 6：创建示例数据文件

**文件：**
- 创建：`repos.json`
- 创建：`URLs.txt`

- [ ] **步骤 6.1：创建 repos.json（示例）**

写入 `/Users/fb0sh/Projects/RepoGallery/repos.json`：

```json
[
  {
    "name": "example-repo",
    "owner": "your-username",
    "description": "A sample project description. Replace this with your actual repo data.",
    "url": "https://github.com/your-username/example-repo",
    "stars": 42,
    "language": "TypeScript",
    "languageColor": "#3178c6",
    "topics": ["sample", "demo"],
    "readmeExcerpt": "This is a placeholder excerpt from the README. The fetch-repos.sh script would populate this with actual content from your repositories.",
    "readmeSections": ["Installation", "Usage"],
    "updatedAt": "2025-12-01T00:00:00Z"
  }
]
```

- [ ] **步骤 6.2：创建 URLs.txt**

写入 `/Users/fb0sh/Projects/RepoGallery/URLs.txt`：

```
https://github.com/your-username/example-repo
```

- [ ] **步骤 6.3：Commit**

```bash
git add repos.json URLs.txt
git commit -m "chore: add sample data files"
```

---

### 任务 7：构建验证

- [ ] **步骤 7.1：运行构建**

```bash
cd /Users/fb0sh/Projects/RepoGallery
npm run build
```

预期：`dist/bundle.js` 生成，无错误。

- [ ] **步骤 7.2：检查 bundle 存在**

```bash
ls -la dist/bundle.js
```

预期：文件存在，大小 > 1KB

- [ ] **步骤 7.3：提交最终 build**

```bash
git add dist/bundle.js
git commit -m "chore: initial build output"
```

---

### 任务 8：GitHub Pages 配置

**文件：**
- 修改：`package.json`

- [ ] **步骤 8.1：添加 GitHub Pages 脚本**

在 `package.json` 中添加部署脚本：

```bash
npm pkg set scripts.deploy="npm run build && cp index.html dist/ && cp repos.json dist/ && cp URLs.txt dist/"
```

编辑 `package.json` 的部署脚本更完整：

```bash
npm pkg set scripts.deploy="npm run build && cp index.html dist/ && cp repos.json dist/"
```

- [ ] **步骤 8.2：Commit**

```bash
git add package.json
git commit -m "chore: add deploy script for GitHub Pages"
```

---

### 自检

- ✅ **规格覆盖度：** 所有设计规格中的需求都有对应任务——types → gallery → entry → html → data → build → deploy
- ✅ **占位符：** 没有 TODO、待定、后续实现
- ✅ **类型一致性：** `Repo`、`FilterState` 类型在 types.ts 定义，gallery.ts 和 index.ts 中一致使用
- ✅ **路径精确：** 所有路径使用 `/Users/fb0sh/Projects/RepoGallery/`
- ✅ **每个步骤都有实际代码**
