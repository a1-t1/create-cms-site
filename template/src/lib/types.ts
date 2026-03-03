export interface ContentField {
  fieldType: string;
  fieldValue: string | ListItem[];
}

/** Safely extract a string value from a content field. */
export function str(field: ContentField | undefined, fallback = ""): string {
  if (!field || typeof field.fieldValue !== "string") return fallback;
  return field.fieldValue || fallback;
}

/** Safely extract a list value from a content field. */
export function list(field: any, fallback: any[] = []): any[] {
  if (!field?.fieldValue) return fallback;

  return field.fieldValue.map((item: any) => {
    const flattened: Record<string, any> = {};

    Object.entries(item).forEach(([key, value]: any) => {
      if (key === "id") return;
      flattened[key] = value?.fieldValue ?? value;
    });

    return flattened;
  });
}

export interface ListItem {
  id: string;
  [fieldName: string]: ContentField | string;
}

export interface ContentBlock {
  uuid: string;
  tenant_uuid: string;
  type: string;
  name: string;
  tags: string[];
  content: Record<string, ContentField>;
  metadata: Record<string, unknown>;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface PageWithBlocksResponse {
  page: PageComposition;
  blocks: Record<string, ContentBlock>;
}

export interface SectionProps {
  block: ContentBlock;
  className?: string;
}

export interface CMSPreviewMessage {
  type: "cms-preview-update";
  blockTag: string;
  fieldName: string;
  fieldType: string;
  value: string;
}

export interface CMSPreviewHighlightMessage {
  type: "cms-preview-highlight";
  blockTag: string;
  fieldName: string;
  active: boolean;
}

export interface CMSPreviewElementClickMessage {
  type: "cms-preview-element-click";
  blockTag: string;
  fieldName: string;
}

export interface PaginatedResponse<T> {
  page: number;
  size: number;
  total: number;
  total_pages: number;
  data: T[];
}

export interface Collection {
  uuid: string;
  name: string;
  query: string;
  order_by: string;
  order_dir: string;
  limit: number;
}

export interface SearchResultItem {
  type: "block" | "page";
  block?: ContentBlock;
  page?: PageComposition;
}
