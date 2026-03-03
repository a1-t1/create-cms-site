import type { MetadataRoute } from "next";
import { getAllPages, getBlocksByTags } from "@/lib/cms-api";
import { str } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const pages = await getAllPages();
    for (const page of pages) {
      if (!page.is_published) continue;
      const slug = page.slug === "index" || page.slug === "" ? "" : page.slug;
      entries.push({
        url: `${SITE_URL}/${slug}`,
        lastModified: page.updated_at,
      });
    }
  } catch {
    entries.push({ url: SITE_URL, lastModified: new Date().toISOString() });
  }

  const contentTypes = [
    { tag: "blogs", prefix: "blog" },
    { tag: "news", prefix: "news" },
    { tag: "events", prefix: "events" },
  ];

  for (const { tag, prefix } of contentTypes) {
    try {
      const blocks = await getBlocksByTags([tag]);
      for (const block of blocks) {
        const slug = str(block.content.slug);
        if (slug) {
          entries.push({
            url: `${SITE_URL}/${prefix}/${slug}`,
            lastModified: block.updated_at,
          });
        }
      }
    } catch {
      // tag not available
    }
  }

  return entries;
}
