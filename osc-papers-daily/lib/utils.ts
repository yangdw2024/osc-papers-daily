import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(title: string, authors: string[]): string {
  const normalized = title.toLowerCase().trim();
  const authorPart = authors.slice(0, 2).join("-").toLowerCase().replace(/\s+/g, "-");
  return `${normalized.slice(0, 50)}-${authorPart}`.replace(/[^a-z0-9-]/g, "-");
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncateAbstract(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
