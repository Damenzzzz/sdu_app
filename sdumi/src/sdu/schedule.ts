// Fetch + parse the my.sdu.edu.kz schedule.
//
// The schedule grid is NOT in the page HTML — the page ships a term selector and
// JavaScript that POSTs to index.php (action=showSchedule) and injects the
// returned table.clTbl. We replicate that POST, then parse the grid.
//
// Real cell format (textContent), e.g.:
//   "CSS 222 Алгоритмы 1 (2+2+0) [4cr / 5ECTS] [02-N] Маматнабиев : E221"
//    code    title       hours   credits       section instructor  room
// Days run Пн..Сб (Mon..Sat) → day index 0..5.

import type { Course, ScheduleEntry } from "../data/types";
import { sduFetch, sduPost } from "./tauri";

const palette = [
  "#7c6cff", "#33d6c0", "#5aa9ff", "#f5b544", "#f26d6d",
  "#a78bfa", "#4ade80", "#fb923c", "#38bdf8", "#e879f9",
];

export interface ScrapedSchedule {
  courses: Course[];
  entries: ScheduleEntry[];
  term?: string;
}

function text(el: Element | null): string {
  return (el?.textContent ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

// Full live flow: read the term, POST for the grid, parse it.
export async function fetchLiveSchedule(): Promise<ScrapedSchedule> {
  const page = await sduFetch("schedule");
  const { year, term } = parseSelectedTerm(page);
  const res = await sduPost("index.php", [
    ["mod", "schedule"],
    ["ajx", "1"],
    ["action", "showSchedule"],
    ["year", year],
    ["term", term],
    ["type", "I"],
    ["details", "0"],
  ]);
  const parsed = parseScheduleHtml(res.html);
  parsed.term = `${year}-${term}`;
  return parsed;
}

// The term <select> options look like value="2026#1" (year#term); the selected
// one (or the first) is the current term.
function parseSelectedTerm(html: string): { year: string; term: string } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const sel of Array.from(doc.querySelectorAll("select"))) {
    const opts = Array.from(sel.querySelectorAll("option"));
    const isTerm = (o: HTMLOptionElement) => /^\d{4}#\d$/.test(o.value);
    const chosen = opts.find((o) => o.selected && isTerm(o)) || opts.find(isTerm);
    if (chosen) {
      const [year, term] = chosen.value.split("#");
      return { year, term };
    }
  }
  const m = html.match(/(\d{4})#(\d)/);
  return m ? { year: m[1], term: m[2] } : { year: String(new Date().getFullYear()), term: "1" };
}

export function parseScheduleHtml(html: string): ScrapedSchedule {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table =
    doc.querySelector("table.clTbl") ||
    Array.from(doc.querySelectorAll("table")).find((t) => t.textContent?.includes("Day/Hour")) ||
    null;
  if (!table) return { courses: [], entries: [] };

  const rows = Array.from((table as HTMLTableElement).rows);
  if (rows.length < 2) return { courses: [], entries: [] };

  const entries: ScheduleEntry[] = [];
  const courseMap = new Map<string, Course>();
  let colorIdx = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = Array.from(rows[r].cells);
    if (cells.length < 2) continue;

    const time = text(cells[0]).replace(/\s+/g, ""); // "08:3009:20"
    const start = time.slice(0, 5);
    const end = time.slice(5, 10);
    if (!/^\d{1,2}:\d{2}$/.test(start)) continue;

    for (let c = 1; c < cells.length && c <= 6; c++) {
      const day = c - 1; // 0 = Mon .. 5 = Sat
      const raw = text(cells[c]);
      if (raw.length < 3) continue;

      const codeMatch = raw.match(/[A-Z]{2,4}\s?\d{3}/);
      if (!codeMatch) continue;
      const code = codeMatch[0].replace(/\s+/g, " ");

      // Title: between the code and the first "(" (credits block).
      const titleMatch = raw.match(/\d{3}\s+([^(\[]+?)\s*[([]/);
      const title = titleMatch ? titleMatch[1].trim() : code;

      // Section: the bracket shaped like "02-N" (avoid the "[4cr / 5ECTS]" one).
      const sectionMatch = raw.match(/\[(\d{1,2}-[A-Za-z]{1,2})\]/);
      const section = sectionMatch ? sectionMatch[1] : "";

      // Instructor: word(s) after the section bracket, before the room colon.
      const instrMatch = raw.match(/\[\d{1,2}-[A-Za-z]{1,2}\]\s*([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё .'-]+?)\s*:/);
      const instructor = instrMatch ? instrMatch[1].trim() : "";

      // Room: after a ":" — e.g. "E221", "F-201", "G301".
      const roomMatch = raw.match(/:\s*([A-Za-z]?-?\d{2,4}[A-Za-z]?)\b/);
      const room = roomMatch ? roomMatch[1] : "";

      const suffix = section.split("-")[1] || "";
      const type: ScheduleEntry["type"] = /P|L/i.test(suffix)
        ? "Lab"
        : /S/i.test(suffix)
        ? "Seminar"
        : "Lecture";

      if (!courseMap.has(code)) {
        courseMap.set(code, {
          id: code,
          code,
          title,
          instructor,
          credits: 0,
          color: palette[colorIdx % palette.length],
        });
        colorIdx++;
      } else if (instructor && !courseMap.get(code)!.instructor) {
        courseMap.get(code)!.instructor = instructor;
      }

      const dup = entries.find(
        (e) => e.day === day && e.start === start && e.courseId === code && e.room === room
      );
      if (dup) continue;

      entries.push({
        id: `${day}-${start}-${code}-${room}`,
        courseId: code,
        day,
        start,
        end: /^\d{1,2}:\d{2}$/.test(end) ? end : start,
        room,
        type,
      });
    }
  }

  return { courses: Array.from(courseMap.values()), entries };
}

// Pull the student's display name from the SIS home page banner.
export function parseStudentName(homeHtml: string): string | null {
  const doc = new DOMParser().parseFromString(homeHtml, "text/html");
  const body = (doc.body?.textContent ?? "").replace(/\s+/g, " ");
  const m = body.match(/Name Surname\s*:\s*(.+?)\s*(?:Advisor|Major|Last Login|System Date|$)/);
  return m ? m[1].trim() : null;
}
