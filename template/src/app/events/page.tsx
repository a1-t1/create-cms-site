import { getBlocksByTags } from "@/lib/cms-api";
import { str } from "@/lib/types";
import { formatDate } from "@/lib/content-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming events",
};

export default async function EventsListingPage() {
  let blocks: Awaited<ReturnType<typeof getBlocksByTags>> = [];
  try {
    blocks = await getBlocksByTags(["events"]);
  } catch {
    // CMS unavailable
  }

  const sorted = [...blocks].sort((a, b) => {
    const da = str(a.content.startDate) || a.created_at;
    const db = str(b.content.startDate) || b.created_at;
    return new Date(da).getTime() - new Date(db).getTime();
  });

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">Events</h1>
        {sorted.length === 0 ? (
          <p className="text-gray-500">No events scheduled.</p>
        ) : (
          <div className="space-y-8">
            {sorted.map((block) => {
              const slug = str(block.content.slug);
              const title = str(block.content.title, block.name);
              const description = str(block.content.description);
              const location = str(block.content.location);
              const startDate = str(block.content.startDate);
              const endDate = str(block.content.endDate);

              return (
                <article key={block.uuid} className="border-b pb-8">
                  <h2 className="text-2xl font-semibold">
                    {slug ? (
                      <a href={`/events/${slug}`} className="hover:underline">
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    {startDate && (
                      <span>
                        {formatDate(startDate)}
                        {endDate && ` – ${formatDate(endDate)}`}
                      </span>
                    )}
                    {location && <span>{location}</span>}
                  </div>
                  {description && <p className="text-gray-600 mt-2">{description}</p>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
