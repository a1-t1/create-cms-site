import { cmsRequest } from "../utils/api-client.js";

interface Collection {
  uuid: string;
  name: string;
  query: Record<string, unknown>;
  order_by: string;
  order_dir: string;
  limit: number;
  metadata: Record<string, unknown>;
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

export async function listCollections(params: {
  page?: number;
  size?: number;
}): Promise<string> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));

  const qs = query.toString();
  const result = await cmsRequest<Collection[] | PaginatedResponse<Collection>>(
    "GET",
    `/content/collections${qs ? `?${qs}` : ""}`,
  );

  const collections = Array.isArray(result) ? result : result.data;
  const lines = [`Found ${collections.length} collection(s):\n`];
  for (const c of collections) {
    lines.push(`- **${c.name}** (${c.uuid})`);
    lines.push(`  Order: ${c.order_by} ${c.order_dir} | Limit: ${c.limit}`);
  }
  return lines.join("\n");
}

export async function getCollection(uuid: string): Promise<string> {
  const collection = await cmsRequest<Collection>("GET", `/content/collections/${uuid}`);
  return JSON.stringify(collection, null, 2);
}

export async function createCollection(data: {
  name: string;
  query: Record<string, unknown>;
  order_by?: string;
  order_dir?: string;
  limit?: number;
}): Promise<string> {
  const collection = await cmsRequest<Collection>("POST", "/content/collections", data);
  return `Collection created successfully.\nUUID: ${collection.uuid}\nName: ${collection.name}`;
}

export async function updateCollection(
  uuid: string,
  data: {
    name?: string;
    query?: Record<string, unknown>;
    order_by?: string;
    order_dir?: string;
    limit?: number;
  },
): Promise<string> {
  const collection = await cmsRequest<Collection>("PUT", `/content/collections/${uuid}`, data);
  return `Collection updated successfully.\nUUID: ${collection.uuid}\nName: ${collection.name}`;
}

export async function deleteCollection(uuid: string): Promise<string> {
  await cmsRequest<unknown>("DELETE", `/content/collections/${uuid}`);
  return `Collection ${uuid} deleted successfully.`;
}

export async function executeCollection(uuid: string): Promise<string> {
  const blocks = await cmsRequest<unknown[]>("GET", `/content/collections/${uuid}/blocks`);
  return JSON.stringify(blocks, null, 2);
}
