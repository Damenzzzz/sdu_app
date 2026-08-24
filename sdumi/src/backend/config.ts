// Supabase backend config for the live leaderboard + online presence.
//
// Paste your project's values below (Supabase → Project Settings → API).
// The anon key is safe to ship in a desktop app (it's public by design and
// only grants what your Row-Level-Security policies allow).
//
// Leave both empty to keep the app on the built-in demo leaderboard.

export const SUPABASE_URL = "https://lvufrkovvllquntcjcty.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dWZya292dmxscXVudGNqY3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MDA2NzQsImV4cCI6MjEwMzE3NjY3NH0.7V17NX07lAeroz1a00cSbYCOios_loOZbVxmEMcxePs";

export function isBackendConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
