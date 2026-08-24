// Live leaderboard + presence via Supabase's REST (PostgREST) API.
// No SDK dependency — plain fetch with the public anon key.
//
// Required table (run in Supabase SQL editor):
//
//   create table if not exists students (
//     id text primary key,
//     name text not null,
//     faculty text default '',
//     points int default 0,
//     streak int default 0,
//     last_seen timestamptz default now()
//   );
//   alter table students enable row level security;
//   create policy "read all"   on students for select using (true);
//   create policy "insert any" on students for insert with check (true);
//   create policy "update any" on students for update using (true);
//
// (Permissive policies keep the MVP simple; tighten later if needed.)

import { SUPABASE_URL, SUPABASE_ANON_KEY, isBackendConfigured } from "./config";
import type { LeaderboardRow } from "../data/types";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

interface StudentRow {
  id: string;
  name: string;
  faculty: string;
  points: number;
  streak: number;
  last_seen: string;
}

// Upsert the signed-in student's row + refresh presence (call on login and on a
// heartbeat interval).
export async function pushPresence(student: {
  id: string;
  name: string;
  faculty?: string;
  points: number;
  streak: number;
}): Promise<void> {
  if (!isBackendConfigured()) return;
  await fetch(`${SUPABASE_URL}/rest/v1/students`, {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify({
      id: student.id,
      name: student.name,
      faculty: student.faculty ?? "",
      points: student.points,
      streak: student.streak,
      last_seen: new Date().toISOString(),
    }),
  });
}

export async function fetchLeaderboard(myId?: string): Promise<LeaderboardRow[]> {
  if (!isBackendConfigured()) return [];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/students?select=*&order=points.desc&limit=100`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`leaderboard ${res.status}`);
  const rows = (await res.json()) as StudentRow[];
  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    faculty: r.faculty || "—",
    points: r.points,
    streak: r.streak,
    online: now - new Date(r.last_seen).getTime() < ONLINE_WINDOW_MS,
    isMe: myId ? r.id === myId : false,
  }));
}

// A simple, transparent score from local activity.
export function computeScore(completedTasks: number, focusSessions: number): number {
  return completedTasks * 10 + focusSessions * 5;
}
