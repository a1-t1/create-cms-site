const CMS_BASE_URL = "https://cms-gateway.estation.io/api/v1";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface AuthState {
  jwt?: string;
  apiToken?: string;
}

const auth: AuthState = {};

export function setJwt(token: string) {
  auth.jwt = token;
}

export function setApiToken(token: string) {
  auth.apiToken = token;
}

export function getAuthState(): { authenticated: boolean; method?: string } {
  if (auth.jwt) return { authenticated: true, method: "jwt" };
  if (auth.apiToken) return { authenticated: true, method: "api_token" };
  return { authenticated: false };
}

function buildHeaders(usePublic: boolean): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (usePublic && auth.apiToken) {
    headers["X-API-TOKEN"] = auth.apiToken;
  } else if (auth.jwt) {
    headers["Authorization"] = `Bearer ${auth.jwt}`;
  } else if (auth.apiToken) {
    headers["X-API-TOKEN"] = auth.apiToken;
  }
  return headers;
}

export async function cmsRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  usePublic = false,
): Promise<T> {
  const url = `${CMS_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(usePublic),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`CMS API ${res.status}: ${res.statusText}${text ? ` — ${text}` : ""}`);
    }

    const json = await res.json();
    // Backend may return wrapped { status, message, data } or unwrapped response directly
    if (json && typeof json === "object" && "data" in json && "status" in json) {
      return json.data as T;
    }
    return json as T;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error(`CMS API request timed out: ${method} ${path}`);
    }
    throw err;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (auth.jwt) {
    headers["Authorization"] = `Bearer ${auth.jwt}`;
  } else if (auth.apiToken) {
    headers["X-API-TOKEN"] = auth.apiToken;
  }
  return headers;
}

export async function login(email: string, password: string): Promise<string> {
  const url = `${CMS_BASE_URL}/public/users/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const token = json.data?.token || json.token;
  if (!token) throw new Error("Login response did not contain a token");

  auth.jwt = token;
  return token;
}
