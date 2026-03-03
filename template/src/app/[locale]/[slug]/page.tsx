import { getPageBySlug } from "@/lib/cms-api";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { ContentBlock } from "@/lib/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const data = await getPageBySlug(slug, locale);
    return {
      title: data.page.title || slug,
      description: data.page.description || undefined,
    };
  } catch {
    return { title: slug };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const data = await getPageBySlug(slug, locale);
  const orderedBlocks = getOrderedBlocks(data.page.blocks, data.blocks);

  return <SectionRenderer blocks={orderedBlocks} />;
}

function getOrderedBlocks(
  blockUuids: string[],
  blocksMap: Record<string, ContentBlock>
): ContentBlock[] {
  return blockUuids
    .map((uuid) => blocksMap[uuid])
    .filter(Boolean);
}
