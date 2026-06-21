import { NextResponse } from "next/server";
import { getLastFetchTime, getAllPapers } from "@/lib/kv";

export async function GET() {
  try {
    const lastFetch = await getLastFetchTime();
    const papers = await getAllPapers();

    return NextResponse.json({
      status: "ok",
      lastFetch,
      totalPapers: papers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
