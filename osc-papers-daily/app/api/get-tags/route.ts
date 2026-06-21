import { NextResponse } from "next/server";
import { getTags } from "@/lib/kv";

export async function GET() {
  try {
    const tags = await getTags();
    const tagList = Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ tags: tagList });
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "Failed to get tags", details: String(error) },
      { status: 500 }
    );
  }
}
