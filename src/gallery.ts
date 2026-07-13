import { Repo, FilterState } from "./types";

// ── Language color map ──────────────────────────────────────────────────────

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

// ── Utility functions ───────────────────────────────────────────────────────

function getLanguageColor(lang: string): string {
  return REPO_COLORS[lang] ?? "#6e7681";
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay < 1) return "today";
  if (diffDay < 30) return `${diffDay} days ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} months ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} years ago`;
}

// ── Card HTML builder ───────────────────────────────────────────────────────

function createCardHtml(repo: Repo, index: number): string {
  const safeName = escapeHtml(repo.name);
  const safeDesc = escapeHtml(repo.description);
  const safeUrl = escapeHtml(repo.url);
  const safeLang = escapeHtml(repo.language);
  const langColor = getLanguageColor(repo.language);
  const starsFormatted = repo.stars.toLocaleString();
  const timeAgo = formatDate(repo.updatedAt);

  let readmeHtml = "";
  if (repo.readmeExcerpt) {
    const excerpt =
      repo.readmeExcerpt.length > 150
        ? repo.readmeExcerpt.slice(0, 150) + "…"
        : repo.readmeExcerpt;
    readmeHtml = `<blockquote class="card-readme">${escapeHtml(excerpt)}</blockquote>`;
  }

  const topicsHtml =
    repo.topics.length > 0
      ? repo.topics
          .map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`)
          .join("")
      : "";

  return `
<article class="repo-card" data-index="${index}">
  <h3 class="card-name"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a></h3>
  <p class="card-desc">${safeDesc}</p>
  ${readmeHtml}
  <div class="card-meta">
    <span class="card-stars">★ ${starsFormatted}</span>
    <span class="card-lang"><span class="lang-dot" style="color:${langColor}">●</span> ${safeLang}</span>
    <span class="card-updated">Updated ${timeAgo}</span>
  </div>
  ${topicsHtml ? `<div class="card-topics">${topicsHtml}</div>` : ""}
</article>`.trim();
}

// ── Language extraction ─────────────────────────────────────────────────────

function extractLanguages(repos: Repo[]): string[] {
  const langSet = new Set<string>();
  for (const r of repos) {
    if (r.language) langSet.add(r.language);
  }
  return Array.from(langSet).sort();
}

// ── Filtering ───────────────────────────────────────────────────────────────

function filterRepos(repos: Repo[], state: FilterState): Repo[] {
  return repos.filter((r) => {
    // Language filter
    if (state.language && r.language !== state.language) return false;

    // Search term filter (match name or description, case-insensitive)
    if (state.search) {
      const term = state.search.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(term);
      const descMatch = r.description.toLowerCase().includes(term);
      if (!nameMatch && !descMatch) return false;
    }

    return true;
  });
}

// ── Filter UI setup ─────────────────────────────────────────────────────────

function setupFilterUI(
  container: HTMLElement,
  repos: Repo[],
  languages: string[],
  onFilter: (state: FilterState) => void,
): void {
  // ── Search box ──────────────────────────────────────────────────────────
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "filter-search";
  searchInput.placeholder = "Search repositories…";
  searchInput.addEventListener("input", () => {
    onFilter({ search: searchInput.value, language: activeLang });
  });

  // ── Language tag buttons ────────────────────────────────────────────────
  const langGroup = document.createElement("div");
  langGroup.className = "filter-languages";

  let activeLang: string | null = null;

  const allBtn = document.createElement("button");
  allBtn.className = "lang-btn active";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    activeLang = null;
    setActive(allBtn);
    onFilter({ search: searchInput.value, language: null });
  });
  langGroup.appendChild(allBtn);

  for (const lang of languages) {
    const btn = document.createElement("button");
    btn.className = "lang-btn";
    btn.textContent = lang;
    btn.addEventListener("click", () => {
      activeLang = lang;
      setActive(btn);
      onFilter({ search: searchInput.value, language: lang });
    });
    langGroup.appendChild(btn);
  }

  function setActive(active: HTMLButtonElement) {
    const buttons = langGroup.querySelectorAll<HTMLButtonElement>(".lang-btn");
    buttons.forEach((b) => b.classList.remove("active"));
    active.classList.add("active");
  }

  // ── Assemble and insert ─────────────────────────────────────────────────
  const filterBar = document.createElement("div");
  filterBar.className = "filter-bar";
  filterBar.appendChild(searchInput);
  filterBar.appendChild(langGroup);

  container.insertBefore(filterBar, container.firstChild);
}

// ── Render cards with staggered animation ───────────────────────────────────

function renderCards(container: HTMLElement, repos: Repo[]): void {
  const grid = container.querySelector<HTMLElement>(".repo-grid") ?? container;

  const cardsHtml = repos.map((r, i) => createCardHtml(r, i)).join("\n");
  grid.innerHTML = cardsHtml;

  const cardEls = grid.querySelectorAll<HTMLElement>(".repo-card");

  // Trigger staggered fade-in via requestAnimationFrame
  requestAnimationFrame(() => {
    cardEls.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(12px)";
      card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      card.style.transitionDelay = `${i * 50}ms`;

      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    });
  });
}

// ── Visibility update with hide/show animations ────────────────────────────

function updateCardVisibility(
  container: HTMLElement,
  repos: Repo[],
  filtered: Repo[],
): void {
  const filteredSet = new Set(filtered);

  const cards = container.querySelectorAll<HTMLElement>(".repo-card");
  cards.forEach((card) => {
    const idx = parseInt(card.getAttribute("data-index") ?? "", 10);
    if (isNaN(idx)) return;

    const repo = repos[idx];
    const shouldShow = filteredSet.has(repo);

    if (shouldShow) {
      // Remove any pending hide timer
      const hideTimer = (card as any)._hideTimer;
      if (hideTimer) {
        clearTimeout(hideTimer);
        delete (card as any)._hideTimer;
      }

      // If currently hidden (display: none), fade in
      if (card.style.display === "none") {
        card.style.display = "";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        card.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        requestAnimationFrame(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        });
      }
    } else {
      // Fade out then hide
      if (card.style.display !== "none") {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        card.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        (card as any)._hideTimer = setTimeout(() => {
          card.style.display = "none";
          delete (card as any)._hideTimer;
        }, 300);
      }
    }
  });
}

export {
  createCardHtml,
  extractLanguages,
  filterRepos,
  setupFilterUI,
  renderCards,
  updateCardVisibility,
  getLanguageColor,
  escapeHtml,
  formatDate,
};
export type { Repo, FilterState };
