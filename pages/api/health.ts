import type { NextApiRequest, NextApiResponse } from "next";
import { getLastFetchTime, getTotalPapersCount } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const lastFetch = await getLastFetchTime();
    const totalPapers = await getTotalPapersCount();

    return res.status(200).json({
      status: "ok",
      lastFetch,
      totalPapers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: String(error),
    });
  }
}
