import { cp, readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { generateSecret } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATE_DIR = join(__dirname, "..", "..", "template");

export interface ScaffoldOptions {
  project_name: string;
  destination: string;
  cms_api_url: string;
  cms_api_token: string;
  site_url?: string;
  site_name?: string;
  install_deps?: boolean;
}

export async function scaffoldProject(options: ScaffoldOptions): Promise<string> {
  const {
    project_name,
    destination,
    cms_api_url,
    cms_api_token,
    site_url,
    site_name,
    install_deps = false,
  } = options;

  // Validate destination exists
  try {
    const destStat = await stat(destination);
    if (!destStat.isDirectory()) {
      throw new Error(`Destination "${destination}" is not a directory`);
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw new Error(`Destination directory "${destination}" does not exist`);
    }
    throw err;
  }

  const projectDir = join(destination, project_name);

  // Check project dir doesn't exist
  try {
    await stat(projectDir);
    throw new Error(`Directory "${projectDir}" already exists`);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  // Copy template
  await cp(TEMPLATE_DIR, projectDir, {
    recursive: true,
    filter: (src) => {
      const name = src.split("/").pop() || "";
      return name !== "node_modules" && name !== ".next" && name !== "package-lock.json";
    },
  });

  // Write .env.local
  const revalidateSecret = generateSecret();
  const envContent = [
    "# CMS API",
    `CMS_API_URL=${cms_api_url}`,
    `CMS_API_TOKEN=${cms_api_token}`,
    "",
    "# On-demand ISR revalidation",
    `REVALIDATE_SECRET=${revalidateSecret}`,
    "",
    "# Public site URL (used for sitemap generation)",
    `NEXT_PUBLIC_SITE_URL=${site_url || "http://localhost:3000"}`,
  ].join("\n");

  await writeFile(join(projectDir, ".env.local"), envContent + "\n");

  // Patch package.json name
  const pkgPath = join(projectDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  pkg.name = project_name;
  delete pkg.private;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Patch layout.tsx metadata if site_name provided
  if (site_name) {
    const layoutPath = join(projectDir, "src", "app", "layout.tsx");
    let layout = await readFile(layoutPath, "utf-8");
    layout = layout.replace(
      /title:\s*["'].*?["']/,
      `title: "${site_name}"`
    );
    layout = layout.replace(
      /description:\s*["'].*?["']/,
      `description: "${site_name} - Powered by eSTATION CMS"`
    );
    await writeFile(layoutPath, layout);
  }

  // Optionally install dependencies
  if (install_deps) {
    execSync("npm install", { cwd: projectDir, stdio: "pipe" });
  }

  const steps = [
    `Project created at ${projectDir}`,
    `.env.local configured with CMS API credentials`,
    `package.json name set to "${project_name}"`,
  ];
  if (site_name) steps.push(`Layout metadata updated with site name "${site_name}"`);
  if (install_deps) steps.push("Dependencies installed");

  steps.push("");
  steps.push("Next steps:");
  if (!install_deps) steps.push("  cd " + projectDir + " && npm install");
  steps.push("  npm run dev");

  return steps.join("\n");
}
