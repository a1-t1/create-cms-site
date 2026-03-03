import { login, setApiToken, getAuthState } from "../utils/api-client.js";

export async function handleLogin(email: string, password: string): Promise<string> {
  await login(email, password);
  return "Logged in successfully. You can now use all CMS management tools.";
}

export function handleSetApiToken(token: string): string {
  setApiToken(token);
  return "API token set. You can now read public CMS content. For write operations, use the login tool.";
}

export function handleAuthStatus(): string {
  const state = getAuthState();
  if (!state.authenticated) {
    return "Not authenticated. Use the login tool (email + password) for full access, or set_api_token for read-only public access.";
  }
  return `Authenticated via ${state.method === "jwt" ? "email/password (full access)" : "API token (public read-only)"}`;
}
