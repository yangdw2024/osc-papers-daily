import { NextResponse } from "next/server";
import type { FetchResult } from "@/types/paper";
import { fetchArxivPapers, fetchSemanticScholarPapers } from "@/lib/fetchers";
import { insertPapers, getAllPapers, incrementTags, setLastFetchTime, clearAllPapers, clearAllTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";

    // If reset flag is set, clear all existing data first
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

    const existingPapers = await getAllPapers();
    const existingIds = new Set(existingPapers.map((p) => p.id));
    const newPapers = allFetched.filter((p) => !existingIds.has(p.id));

    if (newPapers.length > 0) {
      await insertPapers(newPapers);
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
