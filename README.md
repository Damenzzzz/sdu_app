# SDUmi

Desktop app (Windows + macOS) for SDU students. It pulls your data from
[my.sdu.edu.kz](https://my.sdu.edu.kz/) — schedule, syllabus topics — and adds
daily task planning, online presence, and a leaderboard so students can compete
on completed tasks. Dark, modern UI. Optional local AI assistant.

> Status: early development. UI shell + all main views work on mock data and
> run today. Real SDU login/scraper and the social backend are next.

## Features

- **Dashboard** — today's classes, task progress, streak, rank at a glance
- **Schedule** — weekly timetable (from my.sdu.edu.kz)
- **Syllabus** — course topics with progress tracking
- **Dailies** — plan your day; completed tasks earn leaderboard points
- **Leaderboard** — ranked by completed tasks, with live online presence
- **AI Assistant** — local model via Ollama (hybrid cloud fallback): turn a
  syllabus into tasks, plan your day, explain topics
- **Settings** — privacy, AI provider, account

## Tech stack

- **Shell:** [Tauri v2](https://tauri.app) (Rust backend, tiny secure binaries)
- **UI:** React 19 + TypeScript + Vite
- **Local storage:** browser storage now; Tauri Store (data) + Stronghold
  (secrets) in the packaged app
- **Backend (planned):** Supabase (Postgres + Realtime) for leaderboard/presence
- **AI (planned):** local Ollama, cloud fallback

## Security model (important)

Your my.sdu.edu.kz **password never leaves your device**. In the packaged app it
is stored in the OS secure store via Tauri Stronghold; the scraper logs in
locally and saves only the resulting data. Only your nickname, points, and
online status are shared for the leaderboard — never credentials.

## Project layout

```
sdumi/                 # the Tauri app
  src/                 # React frontend
    components/        # Sidebar, Icon
    views/             # Dashboard, Schedule, Syllabus, Dailies, Leaderboard, AI, Settings, Login
    data/              # types + mock data (stands in for scraped data)
    store/             # local persistence + hooks
    auth/              # session handling (Stronghold-backed later)
    ai/                # AI provider abstraction (Ollama + fallback)
    styles/            # dark design system
  src-tauri/           # Rust backend + Tauri config
```

## Development

Prerequisites: Node 18+, Rust (stable), and on Windows the **Microsoft C++
Build Tools** (Tauri needs the MSVC linker). WebView2 ships with Windows 11.

```sh
cd sdumi
npm install

# Frontend only (opens in the browser, no Rust needed) — fastest preview:
npm run dev            # http://localhost:1420

# Native desktop window (needs Rust + C++ Build Tools):
npm run tauri dev
```

## Roadmap

- [x] UI shell + all views on mock data
- [ ] Native Tauri window (Rust toolchain)
- [ ] Real my.sdu.edu.kz login + local scraper
- [ ] Stronghold-backed credential storage
- [ ] Supabase backend: leaderboard + online presence
- [ ] Local AI (Ollama) wired end-to-end
- [ ] Packaging + code signing (Windows .exe, macOS .dmg)
