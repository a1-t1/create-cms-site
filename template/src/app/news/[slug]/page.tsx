import { getBlocksByTags } from "@/lib/cms-api";
import { findBlockBySlug, formatDate } from "@/lib/content-helpers";
import { str } from "@/lib/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blocks = await getBlocksByTags(["news"]);
  const block = findBlockBySlug(blocks, slug);
  if (!block) return { title: "Article Not Found" };
  return {
    title: str(block.content.title, block.name),
    description: str(block.content.excerpt),
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blocks = await getBlocksByTags(["news"]);
  const block = findBlockBySlug(blocks, slug);

  if (!block) notFound();

  const title = str(block.content.title, block.name);
  const author = str(block.content.author);
  const category = str(block.content.category);
  const date = str(block.content.publishDate) || block.created_at;
  const featuredImage = str(block.content.featuredImage);
  const content = str(block.content.content);

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/news" className="text-sm text-gray-500 hover:underline">&larr; Back to News</a>
        {category && (
          <span className="ml-4 text-xs font-medium uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {category}
          </span>
        )}
        <h1 className="text-4xl font-bold mt-4 mb-4">{title}</h1>
        <div className="flex gap-4 text-sm text-gray-500 mb-8">
          {author && <span>By {author}</span>}
          <span>{formatDate(date)}</span>
        </div>
        {featuredImage && (
          <img
            src={featuredImage}
            alt={title}
            className="w-full rounded-lg mb-8"
          />
        )}
        {content && (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </article>
  );
}
