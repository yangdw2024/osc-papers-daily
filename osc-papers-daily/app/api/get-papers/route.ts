import { NextResponse } from "next/server";
import { getAllPapers } from "@/lib/kv";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "date-desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let papers = await getAllPapers();

    if (tag && tag !== "all") {
      papers = papers.filter((p) => p.tags.includes(tag));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.abstract.toLowerCase().includes(searchLower) ||
          p.authors.some((a) => a.toLowerCase().includes(searchLower))
      );
    }

    switch (sort) {
      case "date-asc":
        papers.sort(
          (a, b) =>
            new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
        );
        break;
      case "date-desc":
      default:
        papers.sort(
          (a, b) =>
            new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );
        break;
    }

    const total = papers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPapers = papers.slice(startIndex, endIndex);

    const today = new Date().toISOString().split("T")[0];
    const todayCount = papers.filter((p) =>
      p.fetchedAt.startsWith(today)
    ).length;

    return NextResponse.json({
      papers: paginatedPapers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      todayCount,
    });
  } catch (error) {
    console.error("Get papers error:", error);
    return NextResponse.json(
      { error: "Failed to get papers", details: String(error) },
      { status: 500 }
    );
  }
}
