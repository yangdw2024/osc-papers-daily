import { NextResponse } from "next/server";
import type { FetchResult } from "@/types/paper";
import { fetchArxivPapers, fetchSemanticScholarPapers } from "@/lib/fetchers";
import { insertPapers, getAllPapers, incrementTags, setLastFetchTime } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
