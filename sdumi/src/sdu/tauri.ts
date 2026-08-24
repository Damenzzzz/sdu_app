// Thin bridge to the Rust scraper commands.
//
// Works only inside the Tauri desktop app. In a plain browser (Vite preview)
// isTauri() is false and callers fall back to mock data, so the UI still runs.

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

// Lazy import so the browser build never pulls the Tauri runtime eagerly.
async function getInvoke(): Promise<InvokeFn> {
  const core = await import("@tauri-apps/api/core");
  return core.invoke as InvokeFn;
}

export interface LoginResult {
  status: "ok" | "otp" | "invalid";
  html: string; // 2FA page HTML when status === "otp"
}

export interface PostResult {
  html: string;
  authenticated: boolean;
}

export async function sduLogin(username: string, password: string): Promise<LoginResult> {
  const invoke = await getInvoke();
  return invoke<LoginResult>("sdu_login", { username, password });
}

// Generic authenticated POST (drives 2FA code submit, term selection, etc.).
export async function sduPost(url: string, fields: [string, string][]): Promise<PostResult> {
  const invoke = await getInvoke();
  return invoke<PostResult>("sdu_post", { url, fields });
}

export async function sduFetch(module: string): Promise<string> {
  const invoke = await getInvoke();
  return invoke<string>("sdu_fetch", { module });
}

// Fetch a binary resource behind the session (e.g. student photo) as a data URL.
export async function sduFetchB64(path: string): Promise<string> {
  const invoke = await getInvoke();
  return invoke<string>("sdu_fetch_b64", { path });
}

export async function sduIsLoggedIn(): Promise<boolean> {
  const invoke = await getInvoke();
  return invoke<boolean>("sdu_is_logged_in");
}

export async function sduLogout(): Promise<void> {
  const invoke = await getInvoke();
  await invoke("sdu_logout");
}
