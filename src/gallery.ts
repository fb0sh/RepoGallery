import { Repo } from "./types";
import { marked } from "marked";

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
    readmeHtml = `<blockquote class="card-readme card-readme-clickable" data-repo="${escapeHtml(repo.name)}">${escapeHtml(excerpt)}</blockquote>`;
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

// ── README Modal ──────────────────────────────────────────────────────────

const repoDataMap = new Map<string, Repo>();

function indexRepos(repos: Repo[]): void {
  repos.forEach((r) => repoDataMap.set(r.name, r));
}

function setupReadmeModals(): void {
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest(".card-readme-clickable") as HTMLElement | null;
    if (!target) {
      // Check for modal close
      const modal = (e.target as HTMLElement).closest(".readme-modal") as HTMLElement | null;
      if (!modal && document.querySelector(".readme-modal-overlay")) {
        closeReadmeModal();
      }
      return;
    }

    const repoName = target.getAttribute("data-repo");
    if (!repoName) return;

    const repo = repoDataMap.get(repoName);
    if (!repo || !repo.readmeFull) return;

    openReadmeModal(repo);
  });
}

function openReadmeModal(repo: Repo): void {
  const existing = document.querySelector(".readme-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "readme-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "readme-modal";

  const header = document.createElement("div");
  header.className = "readme-modal-header";
  header.innerHTML = `
    <h3 class="readme-modal-title">
      <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
    </h3>
    <button class="readme-modal-close" aria-label="Close">&times;</button>
  `;

  const body = document.createElement("div");
  body.className = "readme-modal-body";

  const content = document.createElement("div");
  content.className = "readme-modal-content";
  content.innerHTML = marked.parse(repo.readmeFull, { async: false }) as string;

  body.appendChild(pre);
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.body.style.overflow = "hidden";

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeReadmeModal();
  });

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeReadmeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Close button
  const closeBtn = modal.querySelector(".readme-modal-close") as HTMLElement;
  closeBtn.addEventListener("click", closeReadmeModal);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    modal.style.transform = "translateY(0)";
    modal.style.opacity = "1";
  });
}

function closeReadmeModal(): void {
  const overlay = document.querySelector(".readme-modal-overlay") as HTMLElement;
  if (!overlay) return;

  const modal = overlay.querySelector(".readme-modal") as HTMLElement;
  if (modal) {
    modal.style.transform = "translateY(20px)";
    modal.style.opacity = "0";
  }
  overlay.style.opacity = "0";

  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = "";
  }, 250);
}

export {
  createCardHtml,
  renderCards,
  getLanguageColor,
  escapeHtml,
  formatDate,
  indexRepos,
  setupReadmeModals,
};
