// Lightweight persistence that works in the browser (Vite dev) today and can be
// swapped for the Tauri Store plugin later without touching callers.

const PREFIX = "sdumi:";

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota / unavailable */
  }
}
