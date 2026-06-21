import { NextResponse } from "next/server";
import { fetchArxivPapers, fetchSemanticScholarPapers } from "@/lib/fetchers";
import { insertPapers, getTags, incrementTags, setLastFetchTime, getAllPapers } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const isVercelCron = url.searchParams.get("source") === "vercel-cron";
      if (!isVercelCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const arxivPapers = await fetchArxivPapers();
    const semanticPapers = await fetchSemanticScholarPapers();

    const allFetched = [...arxivPapers, ...semanticPapers];

    // 去重：检查已有论文
    const existingPapers = await getAllPapers();
    const existingIds = new Set(existingPapers.map((p) => p.id));
    const newPapers = allFetched.filter((p) => !existingIds.has(p.id));

    // 插入新论文到数据库
    if (newPapers.length > 0) {
      await insertPapers(newPapers);

      // 更新标签计数
      const allTagNames = newPapers.flatMap((p) => p.tags);
      await incrementTags(allTagNames);
    }

    await setLastFetchTime(new Date().toISOString());

    const result: FetchResult = {
      totalFetched: allFetched.length,
      newPapers: newPapers.length,
      duplicates: allFetched.length - newPapers.length,
      errors: [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch papers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch papers", details: String(error) },
      { status: 500 }
    );
  }
}
