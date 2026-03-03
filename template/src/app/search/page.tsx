import { searchContent } from "@/lib/cms-api";
import { str } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search content",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type, page: pageStr } = await searchParams;
  const query = q || "";
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10));

  const results = query
    ? await searchContent(query, type, currentPage, 20)
    : null;

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Search</h1>

        <form method="get" action="/search" className="flex gap-2 mb-10">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>

        {results && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {results.total} result{results.total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>

            {results.data.length === 0 ? (
              <p className="text-gray-500">No results found.</p>
            ) : (
              <div className="space-y-6">
                {results.data.map((item, i) => {
                  if (item.type === "page" && item.page) {
                    return (
                      <div key={`page-${item.page.uuid}`} className="border-b pb-4">
                        <span className="text-xs font-medium uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          Page
                        </span>
                        <h2 className="text-xl font-semibold mt-1">
                          <a
                            href={item.page.slug === "index" ? "/" : `/${item.page.slug}`}
                            className="hover:underline"
                          >
                            {item.page.title}
                          </a>
                        </h2>
                        {item.page.description && (
                          <p className="text-gray-600 mt-1">{item.page.description}</p>
                        )}
                      </div>
                    );
                  }

                  if (item.type === "block" && item.block) {
                    const title = str(item.block.content.title, item.block.name);
                    const slug = str(item.block.content.slug);
                    const tag = item.block.tags?.[0] || "";
                    let href = "#";
                    if (slug) {
                      if (tag === "blogs") href = `/blog/${slug}`;
                      else if (tag === "news") href = `/news/${slug}`;
                      else if (tag === "events") href = `/events/${slug}`;
                    }

                    return (
                      <div key={`block-${item.block.uuid}-${i}`} className="border-b pb-4">
                        <span className="text-xs font-medium uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          {tag || "Block"}
                        </span>
                        <h2 className="text-xl font-semibold mt-1">
                          {href !== "#" ? (
                            <a href={href} className="hover:underline">{title}</a>
                          ) : (
                            title
                          )}
                        </h2>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {results.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}${type ? `&type=${type}` : ""}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Previous
                  </a>
                )}
                <span className="flex items-center px-4 text-sm text-gray-500">
                  Page {currentPage} of {results.total_pages}
                </span>
                {currentPage < results.total_pages && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}${type ? `&type=${type}` : ""}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
