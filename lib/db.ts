import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Paper } from "@/types/paper";

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  return _supabaseAdmin;
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function getAllPapers(): Promise<Paper[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("papers")
    .select("*")
    .order("published_date", { ascending: false });

  if (error) {
    console.error("getAllPapers error:", error);
    return [];
  }

  return (data || []).map(mapPaperFromDb);
}

export async function getPapersWithFilter(options: {
  tag?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ papers: Paper[]; total: number; todayCount: number }> {
  const { tag, search, sort = "date-desc", page = 1, limit = 20 } = options;

  let query = getSupabaseAdmin().from("papers").select("*", { count: "exact" });

  if (tag && tag !== "all") {
    query = query.contains("tags", [tag]);
  }

  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.or(
      `title.ilike.${searchLower},abstract.ilike.${searchLower},authors.cs.${searchLower}`
    );
  }

  if (sort === "date-asc") {
    query = query.order("published_date", { ascending: true });
  } else {
    query = query.order("published_date", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getPapersWithFilter error:", error);
    return { papers: [], total: 0, todayCount: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  const { count: todayCount } = await getSupabaseAdmin()
    .from("papers")
    .select("*", { count: "exact", head: true })
    .gte("fetched_at", today);

  return {
    papers: (data || []).map(mapPaperFromDb),
    total: count || 0,
    todayCount: todayCount || 0,
  };
}

export async function insertPapers(papers: Paper[]): Promise<number> {
  if (papers.length === 0) return 0;

  const rows = papers.map(mapPaperToDb);

  const { error } = await getSupabaseAdmin()
    .from("papers")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("insertPapers error:", error);
    return 0;
  }

  return papers.length;
}

export async function getTags(): Promise<Record<string, number>> {
  const { data, error } = await getSupabaseAdmin()
    .from("tags")
    .select("name, count");

  if (error || !data) {
    console.error("getTags error:", error);
    return {};
  }

  const result: Record<string, number> = {};
  for (const row of data) {
    result[row.name] = row.count;
  }
  return result;
}

export async function incrementTags(tagNames: string[]): Promise<void> {
  if (tagNames.length === 0) return;

  for (const name of tagNames) {
    const { data: existing } = await getSupabaseAdmin()
      .from("tags")
      .select("count")
      .eq("name", name)
      .single();

    if (existing) {
      await getSupabaseAdmin()
        .from("tags")
        .update({ count: existing.count + 1 })
        .eq("name", name);
    } else {
      await getSupabaseAdmin()
        .from("tags")
        .upsert({ name, count: 1 }, { onConflict: "name" });
    }
  }
}

export async function getLastFetchTime(): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("meta")
    .select("value")
    .eq("key", "last_fetch")
    .single();

  return data?.value || null;
}

export async function setLastFetchTime(time: string): Promise<void> {
  await getSupabaseAdmin()
    .from("meta")
    .upsert({ key: "last_fetch", value: time }, { onConflict: "key" });
}

export async function getTotalPapersCount(): Promise<number> {
  const { count } = await getSupabaseAdmin()
    .from("papers")
    .select("*", { count: "exact", head: true });

  return count || 0;
}

interface DbPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_date: string;
  source: string;
  url: string;
  doi: string | null;
  arxiv_id: string | null;
  tags: string[];
  fetched_at: string;
}

function mapPaperFromDb(row: DbPaper): Paper {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors || [],
    abstract: row.abstract || "",
    publishedDate: row.published_date,
    source: row.source,
    url: row.url,
    doi: row.doi || undefined,
    arxivId: row.arxiv_id || undefined,
    tags: row.tags || [],
    fetchedAt: row.fetched_at,
  };
}

function mapPaperToDb(paper: Paper): DbPaper {
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    abstract: paper.abstract,
    published_date: paper.publishedDate,
    source: paper.source,
    url: paper.url,
    doi: paper.doi || null,
    arxiv_id: paper.arxivId || null,
    tags: paper.tags,
    fetched_at: paper.fetchedAt,
  };
}
