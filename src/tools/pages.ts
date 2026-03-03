import { cmsRequest } from "../utils/api-client.js";

export interface PageComposition {
  uuid: string;
  tenant_uuid: string;
  slug: string;
  title: string;
  description: string;
  blocks: string[];
  layout: string;
  tags: string[];
  metadata: Record<string, unknown>;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PageWithBlocks {
  page: PageComposition;
  blocks: Record<string, unknown>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export async function listPages(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}): Promise<string> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const result = await cmsRequest<PageComposition[] | PaginatedResponse<PageComposition>>(
    "GET",
    `/content/pages${qs ? `?${qs}` : ""}`,
  );

  const pages = Array.isArray(result) ? result : result.data;
  const total = Array.isArray(result) ? pages.length : result.total;

  const lines = [`Found ${total} page(s):\n`];
  for (const p of pages) {
    lines.push(`- **${p.title}** (/${p.slug})`);
    lines.push(`  UUID: ${p.uuid} | Blocks: ${p.blocks.length} | Published: ${p.is_published}`);
  }
  return lines.join("\n");
}

export async function getPage(uuid: string): Promise<string> {
  const result = await cmsRequest<PageWithBlocks>(
    "GET",
    `/content/pages/${uuid}/with-blocks`,
  );
  return JSON.stringify(result, null, 2);
}

export async function getPageBySlug(slug: string): Promise<string> {
  const result = await cmsRequest<PageWithBlocks>(
    "GET",
    `/public/content/pages/slug/${encodeURIComponent(slug)}`,
    undefined,
    true,
  );
  return JSON.stringify(result, null, 2);
}

export async function createPage(data: {
  slug: string;
  title: string;
  description?: string;
  blocks?: string[];
  layout?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const page = await cmsRequest<PageComposition>("POST", "/content/pages", data);
  return `Page created successfully.\nUUID: ${page.uuid}\nTitle: ${page.title}\nSlug: /${page.slug}`;
}

export async function updatePage(
  uuid: string,
  data: {
    slug?: string;
    title?: string;
    description?: string;
    blocks?: string[];
    layout?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  },
): Promise<string> {
  const page = await cmsRequest<PageComposition>("PUT", `/content/pages/${uuid}`, data);
  return `Page updated successfully.\nUUID: ${page.uuid}\nTitle: ${page.title}\nSlug: /${page.slug}`;
}

export async function deletePage(uuid: string): Promise<string> {
  await cmsRequest<unknown>("DELETE", `/content/pages/${uuid}`);
  return `Page ${uuid} deleted successfully.`;
}

export async function publishPage(uuid: string, publish: boolean): Promise<string> {
  await cmsRequest<unknown>("POST", `/content/pages/${uuid}/publish`, { publish });
  return `Page ${uuid} ${publish ? "published" : "unpublished"} successfully.`;
}

export async function duplicatePage(uuid: string): Promise<string> {
  const page = await cmsRequest<PageComposition>("POST", `/content/pages/${uuid}/duplicate`);
  return `Page duplicated successfully.\nNew UUID: ${page.uuid}\nTitle: ${page.title}\nSlug: /${page.slug}`;
}
