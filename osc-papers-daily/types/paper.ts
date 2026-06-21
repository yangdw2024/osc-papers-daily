export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  source: "arXiv" | "Semantic Scholar" | string;
  url: string;
  doi?: string;
  arxivId?: string;
  tags: string[];
  fetchedAt: string;
}

export interface FetchResult {
  totalFetched: number;
  newPapers: number;
  duplicates: number;
  errors: string[];
}

export interface TagInfo {
  name: string;
  count: number;
}
