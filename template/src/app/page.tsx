import { getPageBySlug } from "@/lib/cms-api";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { ContentBlock } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getPageBySlug("index");
    return {
      title: data.page.title || "Home",
      description: data.page.description || undefined,
    };
  } catch {
    return { title: "Home" };
  }
}

export default async function Home() {
  try {
    const data = await getPageBySlug("index");
    const orderedBlocks = getOrderedBlocks(data.page.blocks, data.blocks);
    return <SectionRenderer blocks={orderedBlocks} />;
  } catch {
    return (
      <div className="py-20 px-6 text-center">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="mt-4 text-gray-500">Content is not available yet. Configure your CMS to get started.</p>
      </div>
    );
  }
}

function getOrderedBlocks(
  blockUuids: string[],
  blocksMap: Record<string, ContentBlock>
): ContentBlock[] {
  return blockUuids
    .map((uuid) => blocksMap[uuid])
    .filter(Boolean);
}
