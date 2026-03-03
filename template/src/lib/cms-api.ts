import type {
  PageWithBlocksResponse,
  ContentBlock,
  PageComposition,
  PaginatedResponse,
  Collection,
  SearchResultItem,
} from "./types";

const CMS_API_URL = "https://cms-gateway.estation.io/api/v1";
const CMS_API_TOKEN = process.env.CMS_API_TOKEN || "";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

async function cmsFetch<T>(path: string, tags?: string[]): Promise<T> {
  const url = `${CMS_API_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch(url, {
    headers: {
      "X-API-TOKEN": CMS_API_TOKEN,
    },
    signal: controller.signal,
    next: {
      revalidate: 60,
      tags: tags || [],
    },
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`CMS API error: ${res.status} ${res.statusText} for ${path}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export async function getPageBySlug(slug: string, locale?: string): Promise<PageWithBlocksResponse> {
  const localeParam = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return cmsFetch<PageWithBlocksResponse>(
    `/public/content/pages/slug/${encodeURIComponent(slug)}${localeParam}`,
    [`page-${slug}`]
  );
}

export async function getBlocksByTags(tags: string[], locale?: string): Promise<ContentBlock[]> {
  const query = tags.map(encodeURIComponent).join(",");
  const localeParam = locale ? `&locale=${encodeURIComponent(locale)}` : "";
  return cmsFetch<ContentBlock[]>(
    `/public/content/blocks/by-tags?tags=${query}${localeParam}`,
    tags.map((t) => `tag-${t}`)
  );
}

export async function getBlocksByTagPaginated(
  tag: string,
  page = 1,
  size = 20,
  locale?: string
): Promise<PaginatedResponse<ContentBlock>> {
  const localeParam = locale ? `&locale=${encodeURIComponent(locale)}` : "";
  return cmsFetch<PaginatedResponse<ContentBlock>>(
    `/public/content/blocks/by-tags?tags=${encodeURIComponent(tag)}&page=${page}&size=${size}${localeParam}`,
    [`tag-${tag}`]
  );
}

export async function getBlockByUUID(uuid: string): Promise<ContentBlock> {
  return cmsFetch<ContentBlock>(
    `/public/content/blocks/${encodeURIComponent(uuid)}`,
    [`block-${uuid}`]
  );
}

export async function getAllPages(): Promise<PageComposition[]> {
  return cmsFetch<PageComposition[]>("/public/content/pages", ["all-pages"]);
}

export async function executeCollection(uuid: string, locale?: string): Promise<ContentBlock[]> {
  const localeParam = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  return cmsFetch<ContentBlock[]>(
    `/public/content/collections/${encodeURIComponent(uuid)}/execute${localeParam}`,
    [`collection-${uuid}`]
  );
}

export async function getCollections(): Promise<Collection[]> {
  return cmsFetch<Collection[]>("/public/content/collections", ["collections"]);
}

export async function searchContent(
  query: string,
  type?: string,
  page = 1,
  size = 20,
  locale?: string
): Promise<PaginatedResponse<SearchResultItem>> {
  const params = new URLSearchParams({ q: query, page: String(page), size: String(size) });
  if (type) params.set("type", type);
  if (locale) params.set("locale", locale);
  return cmsFetch<PaginatedResponse<SearchResultItem>>(
    `/public/content/search?${params.toString()}`,
    ["search"]
  );
}
