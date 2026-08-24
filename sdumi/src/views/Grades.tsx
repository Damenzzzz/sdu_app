import { useEffect, useState } from "react";
import { isTauri } from "../sdu/tauri";
import { fetchTerms, fetchGrades, fetchGpaTrend, computeGPA, type GradeRow, type TermOption, type TermGPA } from "../sdu/grades";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { GpaChart } from "../components/GpaChart";
import { Icon } from "../components/Icon";

function gradeColor(g: string): string {
  if (/^A/.test(g)) return "var(--green)";
  if (/^B/.test(g)) return "var(--blue)";
  if (/^C/.test(g)) return "var(--amber)";
  if (/^(D|F)/.test(g)) return "var(--red)";
  return "var(--text-dim)"; // IP / W / P
}

export function Grades() {
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [current, setCurrent] = useState("");
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [trend, setTrend] = useState<TermGPA[]>([]);

  useEffect(() => {
    if (!isTauri()) {
      setError("Demo mode — open the SDUmi desktop app for live grades.");
      return;
    }
    setLoading(true);
    fetchTerms()
      .then(({ terms, current }) => {
        setTerms(terms);
        setCurrent(current);
        fetchGpaTrend(terms).then(setTrend).catch(() => {});
        return fetchGrades(current);
      })
      .then((r) => {
        setRows(r);
        setLive(true);
      })
      .catch((e) => setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  const switchTerm = (yt: string) => {
    setCurrent(yt);
    setLoading(true);
    setError("");
    fetchGrades(yt)
      .then((r) => setRows(r))
      .catch((e) => setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e)))
      .finally(() => setLoading(false));
  };

  const { gpa, credits } = computeGPA(rows);
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Grades</div>
          <div className="page-sub">
            {loading ? "Loading from my.sdu.edu.kz…" : live ? "Live from my.sdu.edu.kz ✓" : "Your grades"}
          </div>
        </div>
        {live && terms.length > 0 && (
          <select className="input" style={{ width: 220 }} value={current} onChange={(e) => switchTerm(e.target.value)}>
            {terms.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--amber)", color: "var(--amber)", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="stat-row" style={{ justifyContent: "space-between" }}>
            <span className="stat-label">Term GPA</span>
            <span style={{ color: "var(--accent-2)" }}><Icon name="chart" /></span>
          </div>
          <span className="stat-value">{gpa !== null ? <AnimatedNumber value={gpa} decimals={2} /> : "—"}</span>
          {gpa === null && <span className="faint" style={{ fontSize: 11.5 }}>in progress / no final grades</span>}
        </div>
        <div className="card stat">
          <span className="stat-label">Courses</span>
          <span className="stat-value"><AnimatedNumber value={rows.length} /></span>
        </div>
        <div className="card stat">
          <span className="stat-label">Credits{credits ? " graded" : ""}</span>
          <span className="stat-value"><AnimatedNumber value={credits || totalCredits} /></span>
        </div>
      </div>

      {trend.length >= 2 && (
        <div className="card lift" style={{ marginBottom: 16 }}>
          <div className="section-title">GPA trend</div>
          <GpaChart data={trend} />
        </div>
      )}

      <div className="card">
        {rows.length === 0 && !loading ? (
          <div className="empty">No courses for this term.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((r) => (
              <div className="row-item" key={r.code}>
                <span className="chip" style={{ minWidth: 74, justifyContent: "center" }}>{r.code}</span>
                <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                <span className="faint" style={{ fontSize: 12 }}>{r.credits} cr</span>
                {r.progress && <span className="faint" style={{ fontSize: 12, width: 44, textAlign: "right" }}>{r.progress}</span>}
                <span
                  style={{
                    minWidth: 44,
                    textAlign: "center",
                    fontWeight: 700,
                    color: gradeColor(r.grade),
                  }}
                >
                  {r.grade || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
