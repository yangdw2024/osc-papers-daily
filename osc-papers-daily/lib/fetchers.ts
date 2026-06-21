import { KEYWORDS, autoTag } from "./keywords";
import { generateId } from "./utils";

const ARXIV_DELAY_MS = 3000;
const SEMANTIC_SCHOLAR_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ArxivEntry {
  title: string[];
  author: Array<{ name: string[] }>;
  summary: string[];
  published: string[];
  id: string[];
}

export async function fetchArxivPapers(): Promise<Paper[]> {
  const papers: Paper[] = [];
  const errors: string[] = [];

  for (const keyword of KEYWORDS) {
    try {
      const query = encodeURIComponent(keyword);
      const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`;

      const response = await fetch(url, {
        headers: { "Accept": "application/atom+xml" },
      });

      if (!response.ok) {
        errors.push(`arXiv API error for "${keyword}": ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const entries = parseArxivXml(xmlText);

      for (const entry of entries) {
        const title = entry.title?.[0]?.trim() || "Untitled";
        const authors = entry.author?.map((a) => a.name?.[0] || "Unknown") || ["Unknown"];
        const abstract = entry.summary?.[0]?.trim() || "";
        const published = entry.published?.[0] || new Date().toISOString();
        const arxivId = entry.id?.[0] || "";

        const paper: Paper = {
          id: generateId(title, authors),
          title,
          authors,
          abstract,
          publishedDate: published,
          source: "arXiv",
          url: arxivId,
          arxivId: arxivId.split("/").pop() || arxivId,
          tags: autoTag(title, abstract),
          fetchedAt: new Date().toISOString(),
        };

        papers.push(paper);
      }

      await sleep(ARXIV_DELAY_MS);
    } catch (error) {
      errors.push(`arXiv fetch error for "${keyword}": ${String(error)}`);
    }
  }

  return papers;
}

function parseArxivXml(xmlText: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryXml = match[1];
    const entry: ArxivEntry = {
      title: extractXmlValues(entryXml, "title"),
      author: extractAuthors(entryXml),
      summary: extractXmlValues(entryXml, "summary"),
      published: extractXmlValues(entryXml, "published"),
      id: extractXmlValues(entryXml, "id"),
    };
    entries.push(entry);
  }

  return entries;
}

function extractXmlValues(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const values: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    values.push(match[1].trim());
  }
  return values;
}

function extractAuthors(xml: string): Array<{ name: string[] }> {
  const regex = /<author>([\s\S]*?)<\/author>/g;
  const authors: Array<{ name: string[] }> = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const nameMatch = match[1].match(/<name>(.*?)<\/name>/);
    if (nameMatch) {
      authors.push({ name: [nameMatch[1]] });
    }
  }
  return authors;
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: Array<{ name: string }>;
  abstract: string;
  publicationDate: string;
  externalIds?: { DOI?: string; ArXiv?: string };
  openAccessPdf?: { url: string };
  url: string;
}

export async function fetchSemanticScholarPapers(): Promise<Paper[]> {
  const papers: Paper[] = [];
  const errors: string[] = [];

  for (const keyword of KEYWORDS) {
    try {
      const query = encodeURIComponent(keyword);
      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&fields=paperId,title,authors,abstract,publicationDate,externalIds,openAccessPdf,url&limit=20&sort=publicationDate:desc`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          await sleep(5000);
          errors.push(`Semantic Scholar rate limited for "${keyword}"`);
        } else {
          errors.push(`Semantic Scholar API error for "${keyword}": ${response.status}`);
        }
        continue;
      }

      const data = await response.json();
      const items: SemanticScholarPaper[] = data.data || [];

      for (const item of items) {
        const title = item.title || "Untitled";
        const authors = item.authors?.map((a) => a.name) || ["Unknown"];
        const abstract = item.abstract || "";
        const publishedDate = item.publicationDate || new Date().toISOString();
        const doi = item.externalIds?.DOI;
        const arxivId = item.externalIds?.ArXiv;
        const url = item.openAccessPdf?.url || item.url || `https://www.semanticscholar.org/paper/${item.paperId}`;

        const paper: Paper = {
          id: generateId(title, authors),
          title,
          authors,
          abstract,
          publishedDate,
          source: "Semantic Scholar",
          url,
          doi,
          arxivId,
          tags: autoTag(title, abstract),
          fetchedAt: new Date().toISOString(),
        };

        papers.push(paper);
      }

      await sleep(SEMANTIC_SCHOLAR_DELAY_MS);
    } catch (error) {
      errors.push(`Semantic Scholar fetch error for "${keyword}": ${String(error)}`);
    }
  }

  return papers;
}
