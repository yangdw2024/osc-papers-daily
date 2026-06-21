import type { NextApiRequest, NextApiResponse } from "next";
import { fetchArxivPapers, fetchSemanticScholarPapers } from "@/lib/fetchers";
import { insertPapers, getAllPapers, incrementTags, setLastFetchTime } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = req.query.source === "vercel-cron";
      if (!isVercelCron) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const arxivPapers = await fetchArxivPapers();
    const semanticPapers = await fetchSemanticScholarPapers();

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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Fetch papers error:", error);
    return res.status(500).json({
      error: "Failed to fetch papers",
      details: String(error),
    });
  }
}
