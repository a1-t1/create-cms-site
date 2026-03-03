import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  env: Record<string, string>;
}

export async function validateConfig(projectPath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const env: Record<string, string> = {};

  // Read .env.local
  const envPath = join(projectPath, ".env.local");
  let envContent: string;
  try {
    envContent = await readFile(envPath, "utf-8");
  } catch {
    return {
      valid: false,
      errors: [`.env.local not found at ${envPath}`],
      warnings: [],
      env: {},
    };
  }

  // Parse env vars
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }

  // Check required vars
  const required = ["CMS_API_URL", "CMS_API_TOKEN", "REVALIDATE_SECRET"];
  for (const key of required) {
    if (!env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  if (!env["NEXT_PUBLIC_SITE_URL"]) {
    warnings.push("NEXT_PUBLIC_SITE_URL is not set — sitemap generation will use a placeholder");
  }

  // Test CMS API connectivity
  if (env["CMS_API_URL"] && env["CMS_API_TOKEN"]) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${env["CMS_API_URL"]}/public/content/pages`, {
        headers: { "X-API-TOKEN": env["CMS_API_TOKEN"] },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        errors.push(`CMS API returned ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`CMS API unreachable: ${message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    env: {
      CMS_API_URL: env["CMS_API_URL"] || "",
      NEXT_PUBLIC_SITE_URL: env["NEXT_PUBLIC_SITE_URL"] || "",
    },
  };
}
