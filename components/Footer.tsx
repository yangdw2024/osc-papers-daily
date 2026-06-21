import Link from "next/link";
import { BookOpen, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">
              OSC Papers Daily
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              首页
            </Link>
            <Link href="/papers" className="hover:text-primary-600 transition-colors">
              文献列表
            </Link>
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              关于
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>数据来源: arXiv & Semantic Scholar</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>OSC Papers Daily - 有机太阳能电池文献日报</p>
        </div>
      </div>
    </footer>
  );
}
