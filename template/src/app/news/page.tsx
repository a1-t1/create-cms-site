import { getBlocksByTags } from "@/lib/cms-api";
import { str } from "@/lib/types";
import { formatDate } from "@/lib/content-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news",
};

export default async function NewsListingPage() {
  let blocks: Awaited<ReturnType<typeof getBlocksByTags>> = [];
  try {
    blocks = await getBlocksByTags(["news"]);
  } catch {
    // CMS unavailable
  }

  const sorted = [...blocks].sort((a, b) => {
    const da = str(a.content.publishDate) || a.created_at;
    const db = str(b.content.publishDate) || b.created_at;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">News</h1>
        {sorted.length === 0 ? (
          <p className="text-gray-500">No news articles yet.</p>
        ) : (
          <div className="space-y-8">
            {sorted.map((block) => {
              const slug = str(block.content.slug);
              const title = str(block.content.title, block.name);
              const excerpt = str(block.content.excerpt);
              const category = str(block.content.category);
              const date = str(block.content.publishDate) || block.created_at;

              return (
                <article key={block.uuid} className="border-b pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    {category && (
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {category}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{formatDate(date)}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    {slug ? (
                      <a href={`/news/${slug}`} className="hover:underline">
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </h2>
                  {excerpt && <p className="text-gray-600 mt-2">{excerpt}</p>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
