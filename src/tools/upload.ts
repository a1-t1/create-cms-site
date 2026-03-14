import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { getAuthHeaders } from "../utils/api-client.js";

const CMS_BASE_URL = "https://cms-gateway.estation.io/api/v1";

export async function uploadFile(filePath: string): Promise<string> {
  const headers = getAuthHeaders();
  if (!headers["Authorization"] && !headers["X-API-TOKEN"]) {
    throw new Error("Not authenticated. Use login or set_api_token first.");
  }

  const fileBuffer = await readFile(filePath);
  const fileName = basename(filePath);

  // Build multipart form data manually using Blob API (Node 18+)
  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append("files", blob, fileName);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${CMS_BASE_URL}/uploads`, {
      method: "POST",
      headers, // no Content-Type — fetch sets multipart boundary automatically
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    // Handle both wrapped and unwrapped responses
    const data = json && "data" in json && "status" in json ? json.data : json;
    const url = data?.url || data;

    return `File uploaded successfully.\nURL: ${url}`;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Upload timed out after 30 seconds");
    }
    throw err;
  }
}

export async function uploadFromUrl(sourceUrl: string, fileName?: string): Promise<string> {
  const headers = getAuthHeaders();
  if (!headers["Authorization"] && !headers["X-API-TOKEN"]) {
    throw new Error("Not authenticated. Use login or set_api_token first.");
  }

  // Fetch the file from the URL
  const fetchRes = await fetch(sourceUrl);
  if (!fetchRes.ok) {
    throw new Error(`Failed to fetch file from URL (${fetchRes.status}): ${sourceUrl}`);
  }

  const buffer = await fetchRes.arrayBuffer();
  const name = fileName || sourceUrl.split("/").pop()?.split("?")[0] || "upload";

  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append("files", blob, name);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${CMS_BASE_URL}/uploads`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    const data = json && "data" in json && "status" in json ? json.data : json;
    const url = data?.url || data;

    return `File uploaded successfully.\nURL: ${url}`;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Upload timed out after 30 seconds");
    }
    throw err;
  }
}
