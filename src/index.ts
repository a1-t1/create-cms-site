#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scaffoldProject } from "./tools/scaffold-project.js";
import { SECTIONS } from "./tools/list-sections.js";
import { validateConfig } from "./tools/validate-config.js";
import { handleLogin, handleSetApiToken, handleAuthStatus } from "./tools/auth.js";
import { listBlocks, getBlock, createBlock, updateBlock, deleteBlock, publishBlock, duplicateBlock } from "./tools/blocks.js";
import { listPages, getPage, getPageBySlug, createPage, updatePage, deletePage, publishPage, duplicatePage } from "./tools/pages.js";
import { listCollections, getCollection, createCollection, updateCollection, deleteCollection, executeCollection } from "./tools/collections.js";
import { searchContent } from "./tools/search.js";
import { uploadFile, uploadFromUrl } from "./tools/upload.js";

const server = new McpServer(
  {
    name: "estation-cms",
    version: "1.5.0",
  },
  {
    instructions: `You are connected to the eSTATION CMS — a headless content management system at cms-gateway.estation.io.

## First-time setup

When the user wants to work with the CMS for the first time, walk them through this flow:

1. **Ask if they have an eSTATION account.** If not, they can sign up at https://cms.estation.io
2. **Authenticate.** Ask for their email and password, then use the \`login\` tool. This gives full read/write access. Alternatively, if they only need to read public content, ask for their API token (found in CMS dashboard > Settings > API Keys) and use \`set_api_token\`.
3. **Ask what they want to do:**
   - **"Build a new website"** → Ask for a project name, where to create it, and their API token. Then use \`scaffold_project\` to create a Next.js site from the template. After scaffolding, offer to install dependencies and explain how to run the dev server.
   - **"Manage my content"** → Use \`list_pages\` and \`list_blocks\` to show them what they have, then help them create, edit, or publish content.
   - **"Create content for my site"** → Use \`list_sections\` to understand available section types, then help them create blocks with the right field structure and assemble them into pages.

## How eSTATION CMS works

- **Content blocks** are individual pieces of content (hero banners, FAQ sections, feature grids, etc.). Each block has a type, name, tags, and a \`content\` object with typed fields.
- **Page compositions** define URL routes (via slug) and contain an ordered list of content block UUIDs. When the website renders a page, it fetches the page by slug and renders each block using the matching section component.
- **Collections** are saved queries that dynamically group blocks by tags or types.
- The website template has 10 section components (hero, text, features, faq, testimonials, cta, slider, gallery, contact, generic). Each renders a specific block tag. Use \`list_sections\` to see the exact field schemas.

## Content types (Blogs, News, Events, etc.)

The CMS supports dynamic content types using content blocks. Each content item (blog post, news article, event, etc.) is stored as its **own individual content block** — NOT as items in a list field.

### How it works

- Use the block \`type\` field to identify the content type: \`"blog"\`, \`"news"\`, \`"event"\`, etc.
- Use \`tags\` to categorize and filter: e.g. \`["blog", "tech"]\` or \`["news", "featured"]\`.
- Each block's \`content\` holds the item's fields using the standard \`{ fieldType, fieldValue }\` structure.

### Creating a blog post

Use \`create_block\` with type \`"blog"\` and a tag like \`"blog"\`:
\`\`\`json
{
  "type": "blog",
  "name": "My First Blog Post",
  "tags": ["blog"],
  "content": {
    "title": { "fieldType": "text", "fieldValue": "My First Blog Post" },
    "slug": { "fieldType": "text", "fieldValue": "my-first-blog-post" },
    "author": { "fieldType": "text", "fieldValue": "John Doe" },
    "excerpt": { "fieldType": "textarea", "fieldValue": "A short summary..." },
    "body": { "fieldType": "richtext", "fieldValue": "<p>Full article content...</p>" },
    "featuredImage": { "fieldType": "image", "fieldValue": "https://..." },
    "publishDate": { "fieldType": "text", "fieldValue": "2026-03-14" },
    "status": { "fieldType": "text", "fieldValue": "published" }
  }
}
\`\`\`

Then \`publish_block\` to make it visible via public API.

### Fetching content (public API)

- **List all blog posts (paginated):** \`list_blocks\` with \`tags: "blog"\` — returns paginated results
- **Get a single post:** \`get_block\` with the post's UUID
- **Public endpoints (for websites):**
  - \`GET /public/content/blocks/by-tags?tags=blog&page=1&size=10\` — paginated list
  - \`GET /public/content/blocks/{uuid}\` — single item

### Response format for create_block

When creating a block, the API returns the full block object:
\`\`\`json
{
  "uuid": "550e8400-...",
  "tenant_uuid": "123e4567-...",
  "type": "blog",
  "name": "My First Blog Post",
  "tags": ["blog"],
  "locale": "en",
  "content": { ... },
  "version": 1,
  "is_published": false,
  "created_at": "2026-03-14T...",
  "updated_at": "2026-03-14T..."
}
\`\`\`

This pattern works for any content type — blogs, news, events, products, team members, etc. Just change the \`type\` and \`tags\` accordingly.

## Content field structure

Block content fields follow this pattern:
\`\`\`json
{
  "fieldName": {
    "fieldType": "text",
    "fieldValue": "The actual value"
  }
}
\`\`\`
For list fields (like FAQ items or feature cards):
\`\`\`json
{
  "items": {
    "fieldType": "list",
    "fieldValue": [
      { "id": "1", "question": { "fieldType": "text", "fieldValue": "What is...?" }, "answer": { "fieldType": "text", "fieldValue": "It is..." } }
    ]
  }
}
\`\`\`

## Live preview

The website template includes a built-in live preview system. When the CMS admin embeds the site in an iframe, content editors see changes instantly as they type — no page reload needed.

### Prerequisites for live preview to work

All three of these must be true, or preview features (highlight, scroll, auto-update) will silently fail:

1. **\`website_url\` must be configured in CMS Settings.** Go to CMS Dashboard → Settings → Site Settings and set the Website URL (e.g. \`http://localhost:3000\` for local dev, or the production URL). Without this, the admin renders a structured preview instead of an iframe — no postMessage is ever sent.
2. **The website must be running.** The iframe loads from the \`website_url\`, so the dev server (\`npm run dev\`) or production server must be up.
3. **Block tags must match.** The CMS admin sends postMessage for **all tags** on a block. The website's \`data-cms-block\` attribute value must match **any one** of the block's tags. For example, if a block has tags \`["home", "hero"]\`, the admin sends messages for both — the website can use \`data-cms-block="hero"\` and it will work. When creating blocks, use a descriptive section tag (e.g. \`"hero"\`, \`"services"\`) that matches the \`data-cms-block\` attribute, plus optional grouping tags (e.g. \`"home"\`).

### Iframe embedding headers

The website's \`next.config\` must allow iframe embedding from the CMS domain. Add these headers so browsers don't block the iframe:
\`\`\`js
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'ALLOWALL' },
      { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
    ],
  }];
}
\`\`\`
The scaffolded template includes this by default. When migrating an existing site, you MUST add these headers to \`next.config\`.

### How it works

This works via \`postMessage\` between the CMS admin and the website's \`CMSPreviewListener\` component (already in the root layout). The system is **two-way**:

**Admin → Website (one-way updates):**
The CMS admin sends \`cms-preview-update\` and \`cms-preview-highlight\` messages to the iframe. The website uses two HTML data attributes to receive them:
- \`data-cms-block="{tag}"\` on the wrapping \`<section>\` (added automatically by SectionRenderer)
- \`data-cms-field="{fieldName}"\` on each element that displays a CMS field value

**Website → Admin (click-to-edit):**
When the website is inside an iframe, clicking any \`[data-cms-field]\` element sends a \`cms-preview-element-click\` message back to the parent. The CMS admin receives this and automatically expands the corresponding block, scrolls to the field, and flash-highlights it. Hovering over \`[data-cms-field]\` elements shows a dashed blue outline (only when in iframe, not on the live site).

**When helping users create custom section components**, always add \`data-cms-field\` attributes to every element that renders a CMS field. This ensures both live preview AND click-to-edit work automatically. Example:
\`\`\`tsx
<h2 data-cms-field="title">{str(c.title)}</h2>
<p data-cms-field="description">{str(c.description)}</p>
<div data-cms-field="body" dangerouslySetInnerHTML={{ __html: str(c.body) }} />
<img data-cms-field="heroImage" src={str(c.heroImage)} alt="" />
\`\`\`

Field type rules for live preview:
- \`text\` → use on any element (\`<h1>\`, \`<p>\`, \`<span>\`), updated via \`textContent\`
- \`richtext\` → use \`dangerouslySetInnerHTML\`, updated via \`innerHTML\`
- \`image\` → must be on an \`<img>\` element, updated via \`.src\`
- \`list\` → wrap items in a container element, updated by replacing inner HTML

### Troubleshooting live preview

If preview doesn't work (no highlight, no scroll, no auto-update):
1. Check that \`website_url\` is set in CMS Dashboard → Settings → Site Settings
2. Check that the website is running at that URL
3. Check that \`data-cms-block\` values match at least one of the block's tags — e.g. if the website has \`data-cms-block="hero"\`, the CMS block must have \`"hero"\` somewhere in its tags array
4. Check that \`CMSPreviewListener\` is rendered in the root layout (it's a client component)
5. Check browser console for cross-origin or iframe-related errors
6. Ensure the website's \`next.config\` has iframe-allowing headers (\`frame-ancestors *\`)

## Adding, removing, and reordering sections on a page

A page's \`blocks\` field is an ordered array of content block UUIDs. The website renders them in that order. To manage sections on a page:

**Add a section to a page:**
1. \`create_block\` with the right type, tags, and content fields → returns the new block UUID
2. \`publish_block\` to make it visible on the website
3. \`get_page\` to get the current blocks array
4. \`update_page\` with the new UUID appended to (or inserted at any position in) the blocks array

**Remove a section from a page:**
1. \`get_page\` to get the current blocks array
2. \`update_page\` with the blocks array minus the UUID to remove
3. Optionally \`delete_block\` if the block should be removed from the CMS entirely (not just the page)

**Reorder sections:**
1. \`get_page\` to get the current blocks array
2. \`update_page\` with the blocks array in the desired new order

When users say things like "add a hero to my homepage" or "remove the FAQ section", follow these workflows. Always use \`list_sections\` to get the correct field structure for the block type being created.

## Localization (i18n)

The CMS supports per-locale content blocks. Each block has a \`locale\` field (e.g. "en", "ar", "fr"). Supported locales: en, es, fr, de, zh, ja, ko, pt, ar, ku. Arabic and Kurdish use RTL text direction.

**How it works:**
- When creating a block, set \`locale\` to the target language (defaults to "en" if omitted).
- To serve content in multiple languages, create separate blocks per locale with the same tags. For example, a hero block tagged \`["hero"]\` in English and another hero block tagged \`["hero"]\` in Arabic.
- Pages store block UUIDs for ALL locales. When the website requests a page with \`?locale=en\`, only English blocks are returned.
- **Locale fallback:** If a block doesn't exist in the requested locale, the API automatically falls back to the default (non-locale-filtered) version. This means you don't need to translate every block — untranslated blocks will show the default language content.
- Use \`list_blocks\` with \`locale\` filter to see blocks for a specific language.

**Website template i18n features:**
- **Locale routing:** Uses \`[locale]/\` route segments (e.g. \`/en/about-us\`, \`/ar/about-us\`). The root \`/\` auto-redirects based on the browser's \`Accept-Language\` header.
- **RTL support:** RTL locales (ar, ku) automatically set \`dir="rtl"\` on the \`<html>\` element. Use Tailwind's \`rtl:\` and \`ltr:\` utilities for directional styles (e.g. \`ltr:ml-4 rtl:mr-4\`, \`ltr:text-left rtl:text-right\`).
- **Language switcher:** The \`LanguageSwitcher\` component (client component) renders locale links that preserve the current page path. It's included in the Navigation by default.
- **SEO hreflang tags:** The \`HreflangTags\` component automatically adds \`<link rel="alternate" hreflang="..."\` tags for all supported locales, improving multilingual SEO.

**Workflow for multi-language content:**
1. Create blocks in the default language (en) with appropriate tags
2. For each additional language, create new blocks with the same tags but different \`locale\`
3. Add all block UUIDs (all locales) to the page's \`blocks\` array
4. The website filters by locale at request time — missing translations gracefully fall back to the default language

**RTL styling guide:**
When building components for RTL support, use these Tailwind patterns:
- Margins/padding: \`ltr:ml-4 rtl:mr-4\` (or use logical properties: \`ms-4\` for margin-inline-start)
- Text alignment: \`ltr:text-left rtl:text-right\` (or use \`text-start\`/\`text-end\`)
- Flexbox direction: \`ltr:flex-row rtl:flex-row-reverse\`
- Border radius: \`ltr:rounded-l-lg rtl:rounded-r-lg\` (or use \`rounded-s-lg\`/\`rounded-e-lg\`)
- Icons/arrows: flip directional icons with \`rtl:rotate-180\`

## Page slug conventions

The website template uses these reserved slugs:
- \`index\` → homepage (rendered by \`/{locale}\`, e.g. \`/en\`)
- All other slugs render at \`/{locale}/{slug}\` (e.g. \`about-us\` → \`/en/about-us\`)
- The root \`/\` redirects to \`/en\` (or the user's preferred locale via Accept-Language)

When a user says "homepage" or "main page", they mean the page with slug \`index\`. When creating a new site, the first page should always have slug \`index\`.

## CRITICAL: CMS API integration rules

When helping users write code that calls the CMS API (e.g. migrating an existing site), you MUST follow these rules exactly. Getting any of them wrong will break the integration.

### Authentication
- **Public endpoints** use the \`X-API-TOKEN\` header (NOT \`Authorization: Bearer\`). Bearer tokens are only for JWT login sessions.
- The env var MUST be named \`CMS_API_TOKEN\` (not \`ESTATION_API_TOKEN\` or anything else).
- Example: \`headers: { "X-API-TOKEN": process.env.CMS_API_TOKEN }\`

### API paths
All public content endpoints are under \`/public/content/\`. Never omit this prefix.
- Pages by slug: \`GET /public/content/pages/slug/{slug}\` — returns \`{ page, blocks }\`
- Blocks by tags: \`GET /public/content/blocks/by-tags?tags={comma-separated}\`
- Single block: \`GET /public/content/blocks/{uuid}\`
- All pages: \`GET /public/content/pages\`
- Collections: \`GET /public/content/collections/{uuid}/blocks\`
- Search: \`GET /public/content/search?q={query}\`

### Response format
All API responses are wrapped: \`{ status: string, message: string, data: T }\`. You must unwrap: \`const json = await res.json(); return json.data;\`

### Data model — blocks
\`\`\`typescript
interface ContentBlock {
  uuid: string;
  tenant_uuid: string;
  type: string;
  name: string;
  tags: string[];        // ARRAY of strings, NOT a comma-separated string
  locale: string;        // Language code (e.g. "en", "ar", "fr"). Defaults to "en".
  content: Record<string, { fieldType: string; fieldValue: string | ListItem[] }>;
  metadata: Record<string, unknown>;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
\`\`\`

### Data model — pages
The page-with-blocks endpoint returns:
\`\`\`typescript
interface PageWithBlocks {
  page: {
    uuid: string;
    slug: string;
    title: string;
    description: string;
    blocks: string[];    // Array of block UUIDs (NOT block objects)
    layout: string;
    tags: string[];
    is_published: boolean;
  };
  blocks: Record<string, ContentBlock>;  // Map of UUID → block
}
\`\`\`
To render blocks in order: \`page.blocks.map(uuid => blocks[uuid]).filter(Boolean)\`

### Finding blocks by tag
Tags is an array: \`block.tags.includes("hero")\`, NOT \`block.tag.split(",").includes("hero")\`.

### CMSPreviewListener
When creating a preview listener component, it MUST:
1. Check \`msg.type === "cms-preview-update"\` before processing (other postMessages exist)
2. Handle \`cms-preview-highlight\` messages for field focus/blur visual feedback
3. Handle click-to-edit: when inside an iframe, delegate clicks on \`[data-cms-field]\` elements, call \`preventDefault()\` + \`stopPropagation()\` to block link navigation, and send \`cms-preview-element-click\` messages to \`window.parent\` with \`{ blockTag, fieldName }\`
4. Add hover styles (\`outline: 1px dashed\`) on \`[data-cms-field]\` elements — only when inside an iframe
5. Use \`msg.value\` (not \`msg.fieldValue\`) for the updated value — matches the protocol
6. The complete listener code is in the template at \`template/src/components/cms-preview-listener.tsx\` — prefer copying it verbatim rather than rewriting it

### .env.local
Only these vars are needed:
\`\`\`
CMS_API_TOKEN=your-token-here
REVALIDATE_SECRET=generated-secret
NEXT_PUBLIC_SITE_URL=https://your-site.com
\`\`\`
Do NOT add \`CMS_API_URL\` — it is hardcoded in the code.

## Migrating an existing site to eSTATION CMS

When a user wants to integrate CMS into an existing Next.js site (not scaffolded from the template), follow these steps:

1. **Copy reference files verbatim** from the template — do NOT rewrite from scratch:
   - \`template/src/lib/cms-api.ts\` → the canonical CMS client (auth header, API paths, response unwrapping, types)
   - \`template/src/components/cms-preview-listener.tsx\` → the canonical preview listener
   - \`template/src/lib/types.ts\` → shared types and helpers (\`str()\`, \`list()\`, \`ContentField\`, \`ContentBlock\`, etc.)
2. **Add iframe headers** to \`next.config\` (see Live Preview section above)
3. **Add \`CMSPreviewListener\`** to the root layout (must be a client component)
4. **Add \`data-cms-block\` and \`data-cms-field\` attributes** to every component that renders CMS content
5. **Set up \`.env.local\`** with \`CMS_API_TOKEN\`, \`REVALIDATE_SECRET\`, and \`NEXT_PUBLIC_SITE_URL\`
6. **Remind the user** to set \`website_url\` in CMS Dashboard → Settings → Site Settings

The template's \`cms-api.ts\` uses helper functions \`fieldText()\`, \`fieldList()\`, and \`itemText()\` to safely extract values from CMS content fields. Always use these instead of accessing \`block.content.fieldName.fieldValue\` directly.

## Other notes

- Always authenticate before attempting write operations (create, update, delete, publish).
- After creating blocks, remember to publish them and add them to a page composition for them to appear on the website.
- When scaffolding a new project, the user needs their API token (not email/password). They can find it in the CMS dashboard under Settings > API Keys.`,
  },
);

// Helper to wrap tool handlers with error handling
function wrap(fn: (params: any) => Promise<string> | string) {
  return async (params: any) => {
    try {
      const result = await fn(params);
      return { content: [{ type: "text" as const, text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
    }
  };
}

// ── Authentication ──────────────────────────────────────────────────

server.tool(
  "login",
  "Log in to eSTATION CMS with email and password. Required for write operations (create, update, delete, publish). The CMS API is at cms.estation.io.",
  {
    email: z.string().describe("Your eSTATION CMS email"),
    password: z.string().describe("Your eSTATION CMS password"),
  },
  wrap(({ email, password }) => handleLogin(email, password)),
);

server.tool(
  "set_api_token",
  "Set an API token for read-only public access to eSTATION CMS content. Get your token from the CMS dashboard under Settings > API Keys.",
  {
    token: z.string().describe("The tenant API token"),
  },
  wrap(({ token }) => handleSetApiToken(token)),
);

server.tool(
  "auth_status",
  "Check current authentication status with eSTATION CMS.",
  {},
  wrap(() => handleAuthStatus()),
);

// ── Content Blocks ──────────────────────────────────────────────────

server.tool(
  "list_blocks",
  "List content blocks in the CMS. Filter by tags, search text, publish status, or locale.",
  {
    page: z.number().optional().describe("Page number (default: 1)"),
    size: z.number().optional().describe("Items per page (default: 10)"),
    search: z.string().optional().describe("Search blocks by name"),
    status: z.enum(["published", "unpublished", "all"]).optional().describe("Filter by publish status"),
    tags: z.string().optional().describe("Comma-separated tags to filter by"),
    locale: z.string().optional().describe("Filter by locale (e.g. 'en', 'ar', 'fr'). Omit to return all locales."),
  },
  wrap(listBlocks),
);

server.tool(
  "get_block",
  "Get a content block by UUID with all its fields and content.",
  {
    uuid: z.string().describe("Block UUID"),
  },
  wrap(({ uuid }) => getBlock(uuid)),
);

server.tool(
  "create_block",
  "Create a new content block in the CMS. Use list_sections to see available section types. For content types (blog posts, news articles, events), use the content type as the block type (e.g. type: 'blog') with appropriate tags.",
  {
    type: z.string().describe("Block type — section types: hero, text, features, faq, testimonials, cta, slider, gallery, contact, custom. Content types: blog, news, event, or any custom type."),
    name: z.string().describe("Display name for the block"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing and querying the block"),
    content: z.record(z.unknown()).describe("Block content fields — structure depends on block type. Each field should have { fieldType, fieldValue }"),
    metadata: z.record(z.unknown()).optional().describe("Optional metadata"),
    locale: z.string().optional().describe("Locale for this block (e.g. 'en', 'ar', 'fr'). Defaults to 'en' if not specified."),
  },
  wrap(createBlock),
);

server.tool(
  "update_block",
  "Update an existing content block. Only provided fields are changed.",
  {
    uuid: z.string().describe("Block UUID to update"),
    name: z.string().optional().describe("New display name"),
    tags: z.array(z.string()).optional().describe("New tags"),
    content: z.record(z.unknown()).optional().describe("Updated content fields"),
    metadata: z.record(z.unknown()).optional().describe("Updated metadata"),
    locale: z.string().optional().describe("Change the block's locale (e.g. 'en', 'ar', 'fr')"),
  },
  wrap(({ uuid, ...data }) => updateBlock(uuid, data)),
);

server.tool(
  "delete_block",
  "Delete a content block from the CMS.",
  {
    uuid: z.string().describe("Block UUID to delete"),
  },
  wrap(({ uuid }) => deleteBlock(uuid)),
);

server.tool(
  "publish_block",
  "Publish or unpublish a content block. Published blocks are visible on the public website.",
  {
    uuid: z.string().describe("Block UUID"),
    publish: z.boolean().describe("true to publish, false to unpublish"),
  },
  wrap(({ uuid, publish }) => publishBlock(uuid, publish)),
);

server.tool(
  "duplicate_block",
  "Create a copy of an existing content block.",
  {
    uuid: z.string().describe("Block UUID to duplicate"),
  },
  wrap(({ uuid }) => duplicateBlock(uuid)),
);

// ── Pages ───────────────────────────────────────────────────────────

server.tool(
  "list_pages",
  "List page compositions in the CMS. Pages define URL routes and contain ordered lists of content blocks.",
  {
    page: z.number().optional().describe("Page number (default: 1)"),
    size: z.number().optional().describe("Items per page (default: 10)"),
    search: z.string().optional().describe("Search pages by title"),
    status: z.enum(["published", "unpublished", "all"]).optional().describe("Filter by publish status"),
  },
  wrap(listPages),
);

server.tool(
  "get_page",
  "Get a page composition by UUID, including all its content blocks.",
  {
    uuid: z.string().describe("Page UUID"),
  },
  wrap(({ uuid }) => getPage(uuid)),
);

server.tool(
  "get_page_by_slug",
  "Get a published page by its URL slug (e.g. 'about-us', 'home'). Returns the page with all its content blocks.",
  {
    slug: z.string().describe("Page URL slug"),
  },
  wrap(({ slug }) => getPageBySlug(slug)),
);

server.tool(
  "create_page",
  "Create a new page composition. A page has a URL slug and contains an ordered list of content block UUIDs.",
  {
    slug: z.string().describe("URL slug (e.g. 'about-us')"),
    title: z.string().describe("Page title for metadata"),
    description: z.string().optional().describe("Page description for SEO"),
    blocks: z.array(z.string()).optional().describe("Ordered array of content block UUIDs"),
    layout: z.string().optional().describe("Layout template name"),
    tags: z.array(z.string()).optional().describe("Page tags"),
    metadata: z.record(z.unknown()).optional().describe("Optional metadata"),
  },
  wrap(createPage),
);

server.tool(
  "update_page",
  "Update an existing page composition. Only provided fields are changed.",
  {
    uuid: z.string().describe("Page UUID to update"),
    slug: z.string().optional().describe("New URL slug"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    blocks: z.array(z.string()).optional().describe("New ordered array of block UUIDs"),
    layout: z.string().optional().describe("New layout template"),
    tags: z.array(z.string()).optional().describe("New tags"),
    metadata: z.record(z.unknown()).optional().describe("Updated metadata"),
  },
  wrap(({ uuid, ...data }) => updatePage(uuid, data)),
);

server.tool(
  "delete_page",
  "Delete a page composition from the CMS.",
  {
    uuid: z.string().describe("Page UUID to delete"),
  },
  wrap(({ uuid }) => deletePage(uuid)),
);

server.tool(
  "publish_page",
  "Publish or unpublish a page. Published pages are accessible on the public website.",
  {
    uuid: z.string().describe("Page UUID"),
    publish: z.boolean().describe("true to publish, false to unpublish"),
  },
  wrap(({ uuid, publish }) => publishPage(uuid, publish)),
);

server.tool(
  "duplicate_page",
  "Create a copy of an existing page composition.",
  {
    uuid: z.string().describe("Page UUID to duplicate"),
  },
  wrap(({ uuid }) => duplicatePage(uuid)),
);

// ── Collections ─────────────────────────────────────────────────────

server.tool(
  "list_collections",
  "List content collections. Collections are saved queries that dynamically group content blocks by tags, types, or filters.",
  {
    page: z.number().optional().describe("Page number"),
    size: z.number().optional().describe("Items per page"),
  },
  wrap(listCollections),
);

server.tool(
  "get_collection",
  "Get a collection's configuration by UUID.",
  {
    uuid: z.string().describe("Collection UUID"),
  },
  wrap(({ uuid }) => getCollection(uuid)),
);

server.tool(
  "create_collection",
  "Create a new collection — a saved query that dynamically groups content blocks.",
  {
    name: z.string().describe("Collection name"),
    query: z.record(z.unknown()).describe("Query filter: { tags?: string[], block_types?: string[], exclude_tags?: string[] }"),
    order_by: z.string().optional().describe("Sort field (default: created_at)"),
    order_dir: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
    limit: z.number().optional().describe("Max results"),
  },
  wrap(createCollection),
);

server.tool(
  "update_collection",
  "Update a collection's query, ordering, or limit.",
  {
    uuid: z.string().describe("Collection UUID"),
    name: z.string().optional().describe("New name"),
    query: z.record(z.unknown()).optional().describe("Updated query filter"),
    order_by: z.string().optional().describe("New sort field"),
    order_dir: z.enum(["asc", "desc"]).optional().describe("New sort direction"),
    limit: z.number().optional().describe("New max results"),
  },
  wrap(({ uuid, ...data }) => updateCollection(uuid, data)),
);

server.tool(
  "delete_collection",
  "Delete a collection from the CMS.",
  {
    uuid: z.string().describe("Collection UUID to delete"),
  },
  wrap(({ uuid }) => deleteCollection(uuid)),
);

server.tool(
  "execute_collection",
  "Execute a collection's query and return all matching content blocks.",
  {
    uuid: z.string().describe("Collection UUID to execute"),
  },
  wrap(({ uuid }) => executeCollection(uuid)),
);

// ── Search ──────────────────────────────────────────────────────────

server.tool(
  "search_content",
  "Search across all CMS content (blocks and pages) by keyword.",
  {
    query: z.string().describe("Search query"),
    type: z.enum(["all", "blocks", "pages"]).optional().describe("Limit search to blocks or pages (default: all)"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Results per page"),
  },
  wrap(searchContent),
);

// ── File Upload ──────────────────────────────────────────────────────

server.tool(
  "upload_file",
  "Upload a local file to the CMS storage (Cloudflare R2). Returns a public URL. Requires authentication.",
  {
    file_path: z.string().describe("Absolute path to the file to upload"),
  },
  wrap(({ file_path }) => uploadFile(file_path)),
);

server.tool(
  "upload_from_url",
  "Download a file from a URL and upload it to the CMS storage (Cloudflare R2). Returns a public URL. Useful for migrating images from other sources.",
  {
    url: z.string().describe("URL of the file to download and upload"),
    file_name: z.string().optional().describe("Override the filename (e.g. 'logo.svg'). If omitted, extracted from URL."),
  },
  wrap(({ url, file_name }) => uploadFromUrl(url, file_name)),
);

// ── Website Template ────────────────────────────────────────────────

server.tool(
  "scaffold_project",
  "Scaffold a new Next.js website powered by eSTATION CMS. Copies the template, configures .env.local with CMS credentials, and optionally installs dependencies.",
  {
    project_name: z.string().describe("Directory name and package.json name for the new project"),
    destination: z.string().describe("Parent directory where the project will be created"),
    cms_api_token: z.string().describe("Tenant API token from the CMS dashboard"),
    site_url: z.string().optional().describe("Public URL for sitemap generation"),
    site_name: z.string().optional().describe("Display name used in page metadata"),
    install_deps: z.boolean().optional().describe("Run npm install after scaffolding (default: false)"),
  },
  wrap(scaffoldProject),
);

server.tool(
  "list_sections",
  "List all available section components in the website template with their tags, descriptions, and expected CMS content fields. Use this to understand how to structure content blocks.",
  {},
  async () => {
    const output = SECTIONS.map((s) => {
      const lines = [
        `## ${s.component} (tag: "${s.tag}"${s.aliases.length ? `, aliases: ${s.aliases.map((a) => `"${a}"`).join(", ")}` : ""})`,
        s.description,
        "",
        "Fields:",
      ];

      if (s.fields.length === 0) {
        lines.push("  (dynamic — renders any CMS fields based on fieldType)");
      } else {
        for (const f of s.fields) {
          lines.push(`  - ${f.name} (${f.type}): ${f.description}`);
          if (f.subFields) {
            for (const sf of f.subFields) {
              lines.push(`    - ${sf.name} (${sf.type}): ${sf.description}`);
            }
          }
        }
      }

      return lines.join("\n");
    }).join("\n\n");

    return { content: [{ type: "text" as const, text: output }] };
  },
);

server.tool(
  "validate_config",
  "Validate CMS configuration for an existing website project. Checks .env.local for required variables and tests CMS API connectivity.",
  {
    project_path: z.string().describe("Path to the project directory to validate"),
  },
  wrap(({ project_path }) => validateConfig(project_path).then((r) => {
    const lines: string[] = [];
    lines.push(r.valid ? "Configuration is valid." : "Configuration has errors.");
    lines.push("");
    if (r.errors.length) { lines.push("Errors:"); for (const e of r.errors) lines.push(`  - ${e}`); lines.push(""); }
    if (r.warnings.length) { lines.push("Warnings:"); for (const w of r.warnings) lines.push(`  - ${w}`); lines.push(""); }
    if (r.env.CMS_API_URL) lines.push(`CMS API URL: ${r.env.CMS_API_URL}`);
    if (r.env.NEXT_PUBLIC_SITE_URL) lines.push(`Site URL: ${r.env.NEXT_PUBLIC_SITE_URL}`);
    return lines.join("\n");
  })),
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
