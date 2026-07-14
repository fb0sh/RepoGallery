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
  readmeFull: string;
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
