import { BookOpen, Database, Clock, Tag, Globe, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          关于 OSC Papers Daily
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          一个专注于有机太阳能电池领域的学术文献追踪平台，每日自动抓取最新论文，
          帮助研究人员快速了解领域动态。
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Database className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">多数据源聚合</h3>
          </div>
          <p className="text-gray-600">
            同时从 arXiv 预印本服务器和 Semantic Scholar 学术数据库抓取论文，
            确保覆盖全面，不错过任何重要研究。
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">每日自动更新</h3>
          </div>
          <p className="text-gray-600">
            通过 Vercel Cron 定时任务，每日 UTC 0 点自动执行抓取，
            无需人工干预，数据始终保持最新。
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Tag className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">智能标签分类</h3>
          </div>
          <p className="text-gray-600">
            基于论文标题和摘要内容，自动识别并打上领域标签，
            包括非富勒烯受体、本体异质结、器件物理等方向。
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Globe className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">响应式设计</h3>
          </div>
          <p className="text-gray-600">
            适配桌面、平板、手机等各种设备，随时随地查阅最新文献，
            提供流畅的阅读体验。
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">数据来源</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">arXiv</h4>
              <p className="text-sm text-gray-600">
                全球最大的预印本论文库，覆盖物理学、数学、计算机科学、
                定量生物学、定量金融、统计学、电气工程和系统科学、经济学等领域。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Semantic Scholar</h4>
              <p className="text-sm text-gray-600">
                由 Allen Institute for AI 开发的免费学术搜索引擎，
                提供论文摘要、引用关系、开放获取PDF等丰富信息。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">追踪关键词</h2>
        <div className="flex flex-wrap gap-2">
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
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Update Info */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">更新说明</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">v1.0.0</span>
            <span>初始版本发布，支持 arXiv 和 Semantic Scholar 双数据源抓取</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">功能</span>
            <span>每日自动抓取、智能标签分类、关键词搜索、响应式页面</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
