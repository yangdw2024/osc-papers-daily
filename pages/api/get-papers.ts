import type { NextApiRequest, NextApiResponse } from "next";
import { getPapersWithFilter } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const tag = (req.query.tag as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const sort = (req.query.sort as string) || "date-desc";
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const { papers, total, todayCount } = await getPapersWithFilter({
      tag,
      search,
      sort,
      page,
      limit,
    });

    return res.status(200).json({
      papers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      todayCount,
    });
  } catch (error) {
    console.error("Get papers error:", error);
    return res.status(500).json({
      error: "Failed to get papers",
      details: String(error),
    });
  }
}
