// Supabase backend config for the live leaderboard + online presence.
//
// Paste your project's values below (Supabase → Project Settings → API).
// The anon key is safe to ship in a desktop app (it's public by design and
// only grants what your Row-Level-Security policies allow).
//
// Leave both empty to keep the app on the built-in demo leaderboard.

export const SUPABASE_URL = "";
export const SUPABASE_ANON_KEY = "";

export function isBackendConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
