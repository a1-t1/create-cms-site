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

const server = new McpServer(
  {
    name: "estation-cms",
    version: "1.2.0",
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

## Important notes

- Always authenticate before attempting write operations (create, update, delete, publish).
- After creating blocks, remember to publish them and add them to a page composition for them to appear on the website.
- The CMS API URL is hardcoded to https://cms-gateway.estation.io/api/v1 — users don't need to configure it.
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
  "List content blocks in the CMS. Filter by tags, search text, or publish status.",
  {
    page: z.number().optional().describe("Page number (default: 1)"),
    size: z.number().optional().describe("Items per page (default: 10)"),
    search: z.string().optional().describe("Search blocks by name"),
    status: z.enum(["published", "unpublished", "all"]).optional().describe("Filter by publish status"),
    tags: z.string().optional().describe("Comma-separated tags to filter by"),
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
  "Create a new content block in the CMS. Use list_sections to see available block types and their expected fields.",
  {
    type: z.string().describe("Block type (e.g. hero, text, features, faq, testimonials, cta, slider, gallery, contact, custom)"),
    name: z.string().describe("Display name for the block"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing and querying the block"),
    content: z.record(z.unknown()).describe("Block content fields — structure depends on block type. Each field should have { fieldType, fieldValue }"),
    metadata: z.record(z.unknown()).optional().describe("Optional metadata"),
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
