import { kv } from "@vercel/kv";

const PAPERS_KEY = "osc-papers";
const TAGS_KEY = "osc-tags";
const LAST_FETCH_KEY = "osc-last-fetch";

export async function getAllPapers(): Promise<Paper[]> {
  const papers = await kv.get<Paper[]>(PAPERS_KEY);
  return papers || [];
}

export async function savePapers(papers: Paper[]): Promise<void> {
  await kv.set(PAPERS_KEY, papers);
}

export async function getTags(): Promise<Record<string, number>> {
  const tags = await kv.get<Record<string, number>>(TAGS_KEY);
  return tags || {};
}

export async function saveTags(tags: Record<string, number>): Promise<void> {
  await kv.set(TAGS_KEY, tags);
}

export async function getLastFetchTime(): Promise<string | null> {
  return await kv.get<string>(LAST_FETCH_KEY);
}

export async function setLastFetchTime(time: string): Promise<void> {
  await kv.set(LAST_FETCH_KEY, time);
}

export async function appendPapers(newPapers: Paper[]): Promise<void> {
  const existing = await getAllPapers();
  const existingIds = new Set(existing.map((p) => p.id));
  const uniqueNew = newPapers.filter((p) => !existingIds.has(p.id));
  const combined = [...uniqueNew, ...existing];
  await savePapers(combined);
}
