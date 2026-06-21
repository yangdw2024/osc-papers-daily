"use client";

import { useState } from "react";
import { Calendar, User, ExternalLink, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, truncateAbstract } from "@/lib/utils";
import type { Paper } from "@/types/paper";

interface PaperCardProps {
  paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : paper.arxivId
    ? `https://arxiv.org/abs/${paper.arxivId}`
    : paper.url;

  return (
    <div className="paper-card">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-snug">
            {paper.title}
          </h3>
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-primary-600 hover:text-primary-700 transition-colors"
            title="查看原文"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="truncate max-w-[300px]">
              {paper.authors.slice(0, 3).join(", ")}
              {paper.authors.length > 3 && " et al."}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(paper.publishedDate)}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {paper.source}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {paper.tags.map((tag) => (
            <span key={tag} className="tag-badge">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="text-gray-600 text-sm leading-relaxed">
          {isExpanded ? paper.abstract : truncateAbstract(paper.abstract, 250)}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium self-start"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              收起摘要
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              展开摘要
            </>
          )}
        </button>
      </div>
    </div>
  );
}
