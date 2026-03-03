import { executeCollection } from "@/lib/cms-api";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const metadata: Metadata = {
  title: "Collection",
};

export default async function CollectionPage({ params }: PageProps) {
  const { uuid } = await params;
  const blocks = await executeCollection(uuid);

  return (
    <div className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {blocks.length === 0 ? (
          <p className="text-gray-500 text-center">No items in this collection.</p>
        ) : (
          <SectionRenderer blocks={blocks} />
        )}
      </div>
    </div>
  );
}
