"use client";

import { TagInfo } from "@/types/paper";

interface TagFilterProps {
  tags: TagInfo[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTag, onTagChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange("all")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedTag === "all"
            ? "bg-primary-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        全部
      </button>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onTagChange(tag.name)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTag === tag.name
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tag.name} ({tag.count})
        </button>
      ))}
    </div>
  );
}
