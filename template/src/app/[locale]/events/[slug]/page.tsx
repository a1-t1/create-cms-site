import { getBlocksByTags } from "@/lib/cms-api";
import { findBlockBySlug, formatDate } from "@/lib/content-helpers";
import { str } from "@/lib/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const blocks = await getBlocksByTags(["events"], locale);
  const block = findBlockBySlug(blocks, slug);
  if (!block) return { title: "Event Not Found" };
  return {
    title: str(block.content.title, block.name),
    description: str(block.content.description),
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const blocks = await getBlocksByTags(["events"], locale);
  const block = findBlockBySlug(blocks, slug);

  if (!block) notFound();

  const title = str(block.content.title, block.name);
  const description = str(block.content.description);
  const location = str(block.content.location);
  const startDate = str(block.content.startDate);
  const endDate = str(block.content.endDate);
  const organizer = str(block.content.organizer);
  const content = str(block.content.content);

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href={`/${locale}/events`} className="text-sm text-gray-500 hover:underline">&larr; Back to Events</a>
        <h1 className="text-4xl font-bold mt-4 mb-4">{title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
          {startDate && (
            <span>
              {formatDate(startDate)}
              {endDate && ` – ${formatDate(endDate)}`}
            </span>
          )}
          {location && <span>{location}</span>}
          {organizer && <span>Organized by {organizer}</span>}
        </div>
        {description && <p className="text-lg text-gray-700 mb-6">{description}</p>}
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
