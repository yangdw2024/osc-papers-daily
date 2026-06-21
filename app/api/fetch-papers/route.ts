import { NextResponse } from "next/server";
import type { FetchResult } from "@/types/paper";
import { fetchArxivPapers, fetchSemanticScholarPapers } from "@/lib/fetchers";
import { insertPapers, setLastFetchTime, clearAllPapers, clearAllTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";

    if (reset) {
      await clearAllPapers();
      await clearAllTags();
    }

    // Fetch from both sources in parallel
    const [arxivPapers, semanticPapers] = await Promise.all([
      fetchArxivPapers(),
      fetchSemanticScholarPapers(),
    ]);

    const allFetched = [...arxivPapers, ...semanticPapers];

    // Directly upsert all papers (deduplication handled by onConflict)
    if (allFetched.length > 0) {
      await insertPapers(allFetched);
    }

    await setLastFetchTime(new Date().toISOString());

    const result: FetchResult = {
      totalFetched: allFetched.length,
      newPapers: allFetched.length,
      duplicates: 0,
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
