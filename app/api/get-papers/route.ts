import { NextResponse } from "next/server";
import { getPapersWithFilter } from "@/lib/db";


export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "date-desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const { papers, total, todayCount } = await getPapersWithFilter({
      tag,
      search,
      sort,
      page,
      limit,
    });

    return NextResponse.json({
      papers,
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
