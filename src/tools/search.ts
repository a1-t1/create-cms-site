import { cmsRequest } from "../utils/api-client.js";

interface SearchResult {
  type: "block" | "page";
  block?: Record<string, unknown>;
  page?: Record<string, unknown>;
}

interface PaginatedResponse {
  data: SearchResult[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

export async function searchContent(params: {
  query: string;
  type?: string;
  page?: number;
  page_size?: number;
}): Promise<string> {
  const qs = new URLSearchParams();
  qs.set("q", params.query);
  if (params.type) qs.set("type", params.type);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const result = await cmsRequest<PaginatedResponse>(
    "GET",
    `/content/search?${qs.toString()}`,
  );

  const lines = [`Search results for "${params.query}" (${result.total} total):\n`];
  for (const item of result.data) {
    if (item.type === "block" && item.block) {
      const b = item.block as any;
      lines.push(`- [Block] **${b.name}** (${b.uuid}) — type: ${b.type}`);
    } else if (item.type === "page" && item.page) {
      const p = item.page as any;
      lines.push(`- [Page] **${p.title}** (/${p.slug}) — ${p.uuid}`);
    }
  }

  if (result.data.length === 0) lines.push("No results found.");
  return lines.join("\n");
}
