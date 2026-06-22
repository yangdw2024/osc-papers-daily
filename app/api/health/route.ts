import { NextResponse } from "next/server";
import { getLastFetchTime, getTotalPapersCount } from "@/lib/db";


export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const lastFetch = await getLastFetchTime();
    const totalPapers = await getTotalPapersCount();

    return NextResponse.json({
      status: "ok",
      lastFetch,
      totalPapers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
