import { getBlocksByTags } from "@/lib/cms-api";
import { str } from "@/lib/types";
import { formatDate } from "@/lib/content-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest blog posts",
};

export default async function BlogListingPage() {
  let blocks: Awaited<ReturnType<typeof getBlocksByTags>> = [];
  try {
    blocks = await getBlocksByTags(["blogs"]);
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
        <h1 className="text-4xl font-bold mb-10">Blog</h1>
        {sorted.length === 0 ? (
          <p className="text-gray-500">No blog posts yet.</p>
        ) : (
          <div className="space-y-8">
            {sorted.map((block) => {
              const slug = str(block.content.slug);
              const title = str(block.content.title, block.name);
              const excerpt = str(block.content.excerpt);
              const featuredImage = str(block.content.featuredImage);
              const date = str(block.content.publishDate) || block.created_at;

              return (
                <article key={block.uuid} className="border-b pb-8">
                  {featuredImage && (
                    <img
                      src={featuredImage}
                      alt={title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-semibold">
                    {slug ? (
                      <a href={`/blog/${slug}`} className="hover:underline">
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(date)}</p>
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
