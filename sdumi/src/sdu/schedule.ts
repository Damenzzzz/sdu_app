// Parse the my.sdu.edu.kz schedule page (table.clTbl) into typed entries.
//
// Cell format observed on the live SIS:
//   time column: "08:3009:20"  -> start "08:30", end "09:20"
//   lesson cell: "CSS 222  [02-N]" + ": E221"  (code + section, then room)
// Days run Пн..Сб (Mon..Sat), so day index is 0..5.

import type { Course, ScheduleEntry } from "../data/types";

const palette = [
  "#7c6cff", "#33d6c0", "#5aa9ff", "#f5b544", "#f26d6d",
  "#a78bfa", "#4ade80", "#fb923c", "#38bdf8", "#e879f9",
];

export interface ScrapedSchedule {
  courses: Course[];
  entries: ScheduleEntry[];
}

// textContent is reliable on a detached DOMParser document (innerText is not).
function text(el: Element | null): string {
  return (el?.textContent ?? "").replace(/ /g, " ").trim();
}

export function parseScheduleHtml(html: string): ScrapedSchedule {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table.clTbl");
  if (!table) return { courses: [], entries: [] };

  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length < 2) return { courses: [], entries: [] };

  const entries: ScheduleEntry[] = [];
  const courseMap = new Map<string, Course>();
  let colorIdx = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = Array.from(rows[r].children);
    if (cells.length < 2) continue;

    const time = text(cells[0]).replace(/\s+/g, ""); // "08:3009:20"
    const start = time.slice(0, 5);
    const end = time.slice(5, 10);
    if (!/^\d{1,2}:\d{2}$/.test(start)) continue;

    for (let c = 1; c < cells.length && c <= 6; c++) {
      const day = c - 1; // 0 = Mon .. 5 = Sat
      const cellText = text(cells[c]);
      if (cellText.length < 3) continue;

      const codeMatch = cellText.match(/[A-Z]{2,4}\s?\d{3}/);
      const code = codeMatch ? codeMatch[0].replace(/\s+/g, " ") : cellText.slice(0, 12).trim();
      const sectionMatch = cellText.match(/\[([^\]]+)\]/);
      const section = sectionMatch ? sectionMatch[1] : "";
      const roomMatch = cellText.match(/:\s*([A-Za-z]?-?\d{2,4}[A-Za-z]?)/);
      const room = roomMatch ? roomMatch[1] : "";

      const type: ScheduleEntry["type"] = /P/i.test(section)
        ? "Lab"
        : /S/i.test(section)
        ? "Seminar"
        : "Lecture";

      if (!courseMap.has(code)) {
        courseMap.set(code, {
          id: code,
          code,
          title: code, // real title can be enriched from course_reg later
          instructor: "",
          credits: 0,
          color: palette[colorIdx % palette.length],
        });
        colorIdx++;
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
