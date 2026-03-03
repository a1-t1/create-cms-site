import { cmsRequest } from "../utils/api-client.js";

export interface ContentBlock {
  uuid: string;
  tenant_uuid: string;
  type: string;
  name: string;
  tags: string[];
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export async function listBlocks(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  tags?: string;
  locale?: string;
}): Promise<string> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.locale) query.set("locale", params.locale);

  let path = "/content/blocks";
  if (params.tags) {
    path = "/content/blocks/by-tags";
    query.set("tags", params.tags);
  }

  const qs = query.toString();
  const result = await cmsRequest<ContentBlock[] | PaginatedResponse<ContentBlock>>(
    "GET",
    `${path}${qs ? `?${qs}` : ""}`,
  );

  const blocks = Array.isArray(result) ? result : result.data;
  const total = Array.isArray(result) ? blocks.length : result.total;

  const lines = [`Found ${total} block(s):\n`];
  for (const b of blocks) {
    lines.push(`- **${b.name}** (${b.uuid})`);
    lines.push(`  Type: ${b.type} | Tags: ${b.tags.join(", ") || "none"} | Published: ${b.is_published}`);
  }
  return lines.join("\n");
}

export async function getBlock(uuid: string): Promise<string> {
  const block = await cmsRequest<ContentBlock>("GET", `/content/blocks/${uuid}`);
  return JSON.stringify(block, null, 2);
}

export async function createBlock(data: {
  type: string;
  name: string;
  tags?: string[];
  content: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  locale?: string;
}): Promise<string> {
  const block = await cmsRequest<ContentBlock>("POST", "/content/blocks", data);
  return `Block created successfully.\nUUID: ${block.uuid}\nName: ${block.name}\nType: ${block.type}`;
}

export async function updateBlock(
  uuid: string,
  data: {
    name?: string;
    tags?: string[];
    content?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    locale?: string;
  },
): Promise<string> {
  const block = await cmsRequest<ContentBlock>("PUT", `/content/blocks/${uuid}`, data);
  return `Block updated successfully.\nUUID: ${block.uuid}\nName: ${block.name}\nVersion: ${block.version}`;
}

export async function deleteBlock(uuid: string): Promise<string> {
  await cmsRequest<unknown>("DELETE", `/content/blocks/${uuid}`);
  return `Block ${uuid} deleted successfully.`;
}

export async function publishBlock(uuid: string, publish: boolean): Promise<string> {
  await cmsRequest<unknown>("POST", `/content/blocks/${uuid}/publish`, { publish });
  return `Block ${uuid} ${publish ? "published" : "unpublished"} successfully.`;
}

export async function duplicateBlock(uuid: string): Promise<string> {
  const block = await cmsRequest<ContentBlock>("POST", `/content/blocks/${uuid}/duplicate`);
  return `Block duplicated successfully.\nNew UUID: ${block.uuid}\nName: ${block.name}`;
}
