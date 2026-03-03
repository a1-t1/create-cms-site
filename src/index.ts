#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scaffoldProject } from "./tools/scaffold-project.js";
import { SECTIONS } from "./tools/list-sections.js";
import { validateConfig } from "./tools/validate-config.js";

const server = new McpServer({
  name: "create-cms-site",
  version: "1.0.0",
});

// Tool 1: scaffold_project
server.tool(
  "scaffold_project",
  "Scaffold a new Next.js site powered by eSTATION CMS. Copies the template, configures environment variables, and optionally installs dependencies.",
  {
    project_name: z.string().describe("Directory name and package.json name for the new project"),
    destination: z.string().describe("Parent directory where the project will be created"),
    cms_api_url: z.string().describe("CMS API base URL (e.g. https://cms-gateway.estation.io/api/v1)"),
    cms_api_token: z.string().describe("Tenant API token for CMS authentication"),
    site_url: z.string().optional().describe("Public URL for sitemap generation"),
    site_name: z.string().optional().describe("Display name used in page metadata"),
    install_deps: z.boolean().optional().describe("Run npm install after scaffolding (default: false)"),
  },
  async (params) => {
    try {
      const result = await scaffoldProject(params);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

// Tool 2: list_sections
server.tool(
  "list_sections",
  "List all available section components in the CMS website template with their tags, descriptions, and expected CMS fields.",
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

    return { content: [{ type: "text", text: output }] };
  }
);

// Tool 3: validate_config
server.tool(
  "validate_config",
  "Validate CMS configuration for an existing project. Checks .env.local for required variables and tests CMS API connectivity.",
  {
    project_path: z.string().describe("Path to the project directory to validate"),
  },
  async ({ project_path }) => {
    const result = await validateConfig(project_path);

    const lines: string[] = [];
    lines.push(result.valid ? "Configuration is valid." : "Configuration has errors.");
    lines.push("");

    if (result.errors.length) {
      lines.push("Errors:");
      for (const e of result.errors) lines.push(`  - ${e}`);
      lines.push("");
    }

    if (result.warnings.length) {
      lines.push("Warnings:");
      for (const w of result.warnings) lines.push(`  - ${w}`);
      lines.push("");
    }

    if (result.env.CMS_API_URL) {
      lines.push(`CMS API URL: ${result.env.CMS_API_URL}`);
    }
    if (result.env.NEXT_PUBLIC_SITE_URL) {
      lines.push(`Site URL: ${result.env.NEXT_PUBLIC_SITE_URL}`);
    }

    return {
      content: [{ type: "text", text: lines.join("\n") }],
      isError: !result.valid,
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
