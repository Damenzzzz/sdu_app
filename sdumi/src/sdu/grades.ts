// Fetch + parse my.sdu.edu.kz grades.
//
// Like the schedule, grades load via an AJAX POST — but the response is JSON:
//   { "CODE": "1", "DATA": "<html with the grade tables>" }
// Each grade row is: № · code · name · credits · ECTS · progress% · … · grade/status
// The current term's rows show "IP" (in progress) until finals are graded.

import { sduFetch, sduPost } from "./tauri";

export interface GradeRow {
  code: string;
  name: string;
  credits: number;
  ects: string;
  progress: string;
  grade: string; // "A", "B+", "IP", "F", …
}

export interface TermOption {
  value: string; // "2026#1" (year#term)
  label: string;
}

// GPA points on SDU's 4.0 scale.
const POINTS: Record<string, number> = {
  A: 4, "A-": 3.67, "B+": 3.33, B: 3, "B-": 2.67,
  "C+": 2.33, C: 2, "C-": 1.67, "D+": 1.33, D: 1, F: 0,
};

export async function fetchTerms(): Promise<{ terms: TermOption[]; current: string }> {
  const page = await sduFetch("grades");
  const doc = new DOMParser().parseFromString(page, "text/html");
  const sel = Array.from(doc.querySelectorAll("select")).find((s) =>
    Array.from(s.options).some((o) => /^\d{4}#\d$/.test(o.value))
  );
  const opts = sel ? Array.from(sel.options).filter((o) => /^\d{4}#\d$/.test(o.value)) : [];
  const terms: TermOption[] = opts.map((o) => ({
    value: o.value,
    label: (o.textContent || o.value).trim(),
  }));
  const current =
    opts.find((o) => o.selected)?.value || terms[0]?.value || "";
  return { terms, current };
}

export async function fetchGrades(yt: string): Promise<GradeRow[]> {
  const res = await sduPost("index.php", [
    ["ajx", "1"],
    ["mod", "grades"],
    ["action", "GetGrades"],
    ["yt", yt],
  ]);
  let data = res.html;
  try {
    data = JSON.parse(res.html).DATA ?? res.html;
  } catch {
    /* not JSON — use as-is */
  }
  return parseGradeRows(data);
}

function parseGradeRows(dataHtml: string): GradeRow[] {
  const doc = new DOMParser().parseFromString(dataHtml, "text/html");
  const out: GradeRow[] = [];
  const seen = new Set<string>();

  for (const tr of Array.from(doc.querySelectorAll("tr"))) {
    const cells = Array.from((tr as HTMLTableRowElement).cells).map((c) =>
      (c.textContent || "").replace(/\s+/g, " ").trim()
    );
    const ci = cells.findIndex((c) => /^[A-Z]{2,4}\s?\d{3}$/.test(c));
    if (ci < 0) continue;

    const code = cells[ci].replace(/\s+/g, " ");
    if (seen.has(code)) continue;
    seen.add(code);

    const name = cells[ci + 1] || "";
    const credits = parseInt(cells[ci + 2] || "0", 10) || 0;
    const ects = cells[ci + 3] || "";
    const progress = cells.find((c) => /%$/.test(c)) || "";
    const grade =
      cells.slice(ci + 4).find((c) => /^([A-F][+-]?|IP|W|P|AU|I)$/.test(c)) || "";

    out.push({ code, name, credits, ects, progress, grade });
  }
  return out;
}

export interface TermGPA {
  term: string;
  label: string;
  gpa: number;
}

// GPA for every past term that has final grades (for the trend chart).
export async function fetchGpaTrend(terms: TermOption[]): Promise<TermGPA[]> {
  const out: TermGPA[] = [];
  for (const t of terms) {
    try {
      const rows = await fetchGrades(t.value);
      const { gpa } = computeGPA(rows);
      if (gpa !== null) out.push({ term: t.value, label: t.label, gpa });
    } catch {
      /* skip term on error */
    }
  }
  return out.sort((a, b) => a.term.localeCompare(b.term));
}

// Weighted GPA from rows that have a real letter grade.
export function computeGPA(rows: GradeRow[]): { gpa: number | null; credits: number } {
  let points = 0;
  let credits = 0;
  for (const r of rows) {
    const p = POINTS[r.grade];
    if (p === undefined || !r.credits) continue;
    points += p * r.credits;
    credits += r.credits;
  }
  return { gpa: credits ? points / credits : null, credits };
}
