import { Repo, SortConfig } from "./types";
import { renderCards, indexRepos, setupReadmeModals, sortRepos, setupSortUI } from "./gallery";

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
        <a href="https://github.com/fb0sh" target="_blank" rel="noopener noreferrer" class="gallery-title-user">fb0sh</a>'s RepoGallery
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
    const [reposRes, configRes] = await Promise.all([
      fetch("repos.json"),
      fetch("config.json"),
    ]);
    if (!reposRes.ok) throw new Error(`repos.json HTTP ${reposRes.status}`);
    const repos: Repo[] = await reposRes.json();

    let config: SortConfig = { sortBy: "stars", sortOrder: "desc" };
    if (configRes.ok) {
      config = await configRes.json();
    }

    renderApp(app, repos, config);
  } catch (err) {
    const grid = app.querySelector(".repo-grid");
    if (grid) {
      grid.innerHTML = `<div class="error-msg">Failed to load repositories. Make sure repos.json and config.json exist.</div>`;
    }
    console.error(err);
  }
}

function renderApp(app: HTMLElement, repos: Repo[], config: SortConfig) {
  const sorted = sortRepos(repos, config);
  renderCards(app, sorted);
  indexRepos(repos);
  setupReadmeModals();
  setupSortUI(app, config, (newConfig) => {
    const reSorted = sortRepos(repos, newConfig);
    renderCards(app, reSorted);
  });
}

document.addEventListener("DOMContentLoaded", main);
