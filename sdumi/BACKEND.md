# Live leaderboard & online presence — Supabase setup

The app ships with a demo leaderboard. To make it **live** (real students,
online status, competition), connect a free Supabase project. ~5 minutes.

## 1. Create a project
- Go to https://supabase.com → New project (free tier is enough).
- Wait for it to provision.

## 2. Create the table
Open **SQL Editor** → New query → paste and run:

```sql
create table if not exists students (
  id text primary key,
  name text not null,
  faculty text default '',
  points int default 0,
  streak int default 0,
  last_seen timestamptz default now()
);

alter table students enable row level security;
create policy "read all"   on students for select using (true);
create policy "insert any" on students for insert with check (true);
create policy "update any" on students for update using (true);
```

> Permissive policies keep the MVP simple. Tighten later (e.g. only allow a row
> to be updated by the matching student) when you add real auth.

## 3. Paste your keys
**Project Settings → API**, copy:
- **Project URL** (e.g. `https://abcd.supabase.co`)
- **anon public** key

Put them in `src/backend/config.ts`:

```ts
export const SUPABASE_URL = "https://abcd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

The anon key is safe to ship — it only grants what the RLS policies above allow.

## 4. Run the app
`npm run tauri dev`. On login the app upserts your row and refreshes presence
every 60 s. The Leaderboard tab shows **"live ✓"**, real online counts, and
everyone ranked by points (completed tasks ×10 + focus sessions ×5).
