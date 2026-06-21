import type { NextApiRequest, NextApiResponse } from "next";
import { getTags } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const tags = await getTags();
    const tagList = Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({ tags: tagList });
  } catch (error) {
    console.error("Get tags error:", error);
    return res.status(500).json({
      error: "Failed to get tags",
      details: String(error),
    });
  }
}
