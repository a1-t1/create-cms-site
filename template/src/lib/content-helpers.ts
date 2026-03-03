import type { ContentBlock } from "./types";
import { str } from "./types";

export function findBlockBySlug(blocks: ContentBlock[], slug: string): ContentBlock | undefined {
  return blocks.find((b) => str(b.content.slug) === slug);
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
