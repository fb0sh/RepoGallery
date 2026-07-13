import { Repo } from "./types";

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
<article class="repo-card">
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

export {
  createCardHtml,
  renderCards,
  getLanguageColor,
  escapeHtml,
  formatDate,
};
