import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// 客户端（只读，用于前端页面）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端（读写，用于 API 路由）
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseAnonKey);

// ========== 论文操作 ==========

export async function getAllPapers(): Promise<Paper[]> {
  const { data, error } = await supabaseAdmin
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

  let query = supabaseAdmin.from("papers").select("*", { count: "exact" });

  // 按标签筛选
  if (tag && tag !== "all") {
    query = query.contains("tags", [tag]);
  }

  // 关键词搜索
  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.or(
      `title.ilike.${searchLower},abstract.ilike.${searchLower},authors.cs.${searchLower}`
    );
  }

  // 排序
  if (sort === "date-asc") {
    query = query.order("published_date", { ascending: true });
  } else {
    query = query.order("published_date", { ascending: false });
  }

  // 分页
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getPapersWithFilter error:", error);
    return { papers: [], total: 0, todayCount: 0 };
  }

  // 今日新增数
  const today = new Date().toISOString().split("T")[0];
  const { count: todayCount } = await supabaseAdmin
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

  // 转换为数据库格式
  const rows = papers.map(mapPaperToDb);

  // 使用 upsert，基于 id 去重
  const { error } = await supabaseAdmin
    .from("papers")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("insertPapers error:", error);
    return 0;
  }

  return papers.length;
}

// ========== 标签操作 ==========

export async function getTags(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin
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
    // 尝试更新已有标签
    const { data: existing } = await supabaseAdmin
      .from("tags")
      .select("count")
      .eq("name", name)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("tags")
        .update({ count: existing.count + 1 })
        .eq("name", name);
    } else {
      await supabaseAdmin
        .from("tags")
        .upsert({ name, count: 1 }, { onConflict: "name" });
    }
  }
}

// ========== 系统状态 ==========

export async function getLastFetchTime(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("meta")
    .select("value")
    .eq("key", "last_fetch")
    .single();

  return data?.value || null;
}

export async function setLastFetchTime(time: string): Promise<void> {
  await supabaseAdmin
    .from("meta")
    .upsert({ key: "last_fetch", value: time }, { onConflict: "key" });
}

export async function getTotalPapersCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("papers")
    .select("*", { count: "exact", head: true });

  return count || 0;
}

// ========== 数据映射 ==========

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
