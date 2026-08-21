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

export async function sduLogin(username: string, password: string): Promise<boolean> {
  const invoke = await getInvoke();
  return invoke<boolean>("sdu_login", { username, password });
}

export async function sduFetch(module: string): Promise<string> {
  const invoke = await getInvoke();
  return invoke<string>("sdu_fetch", { module });
}

export async function sduIsLoggedIn(): Promise<boolean> {
  const invoke = await getInvoke();
  return invoke<boolean>("sdu_is_logged_in");
}

export async function sduLogout(): Promise<void> {
  const invoke = await getInvoke();
  await invoke("sdu_logout");
}
