import Link from "next/link";
import { BookOpen, TrendingUp, Calendar, ArrowRight, Sparkles } from "lucide-react";
import PaperCard from "@/components/PaperCard";
import { getPapersWithFilter, getTotalPapersCount } from "@/lib/db";
import type { Paper } from "@/types/paper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats = { todayCount: 0, totalPapers: 0 };
  let recentPapers: Paper[] = [];

  try {
    const [papersData, totalPapers] = await Promise.all([
      getPapersWithFilter({ limit: 6, sort: "date-desc" }),
      getTotalPapersCount(),
    ]);

    recentPapers = papersData.papers;
    stats = {
      todayCount: papersData.todayCount,
      totalPapers,
    };
  } catch (error) {
    console.error("HomePage fetch error:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-3xl md:text-5xl font-bold">
                有机太阳能电池文献日报
              </h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              每日自动追踪有机太阳能电池领域的最新学术进展，
              <br className="hidden md:block" />
              涵盖非富勒烯受体、本体异质结、聚合物太阳能电池等方向
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/papers" className="btn-primary text-base px-6 py-3">
                浏览文献
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-6 w-6 text-primary-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.todayCount}
                </span>
              </div>
              <p className="text-gray-500">今日新增论文</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-primary-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalPapers}
                </span>
              </div>
              <p className="text-gray-500">累计收录论文</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <span className="text-3xl font-bold text-gray-900">2</span>
              </div>
              <p className="text-gray-500">数据源 (arXiv + Semantic Scholar)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Papers Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新论文</h2>
            <Link
              href="/papers"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentPapers.length > 0 ? (
            <div className="grid gap-6">
              {recentPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无论文数据</p>
              <p className="text-sm text-gray-400 mt-2">
                数据将在每日 UTC 0 点自动更新
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Keywords Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">追踪关键词</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "organic solar cell",
              "organic photovoltaics",
              "OSC",
              "OPV",
              "non-fullerene acceptor",
              "bulk heterojunction",
              "polymer solar cell",
              "organic photodetector",
            ].map((keyword) => (
              <span
                key={keyword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}