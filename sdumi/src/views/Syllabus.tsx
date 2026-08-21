import { useState } from "react";
import { courses, syllabi } from "../data/mock";
import { Icon } from "../components/Icon";

export function Syllabus() {
  const [active, setActive] = useState(courses[0].id);
  const syl = syllabi.find((s) => s.courseId === active);
  const course = courses.find((c) => c.id === active)!;
  const done = syl?.weeks.filter((w) => w.done).length ?? 0;
  const total = syl?.weeks.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Syllabus</div>
          <div className="page-sub">Course topics and your progress through them</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "220px 1fr" }}>
        <div className="card" style={{ padding: 10, height: "fit-content" }}>
          {courses.map((c) => (
            <button
              key={c.id}
              className={`nav-item ${active === c.id ? "active" : ""}`}
              onClick={() => setActive(c.id)}
            >
              <span className="dot" style={{ background: c.color }} />
              {c.code}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="stat-row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{course.title}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {course.code} · {course.instructor} · {course.credits} credits
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{pct}%</div>
              <div className="faint" style={{ fontSize: 11.5 }}>{done}/{total} topics</div>
            </div>
          </div>
          <div className="progress" style={{ margin: "12px 0 18px" }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {syl?.weeks.map((w) => (
              <div className="daily" key={w.week}>
                <div className={`checkbox ${w.done ? "on" : ""}`}>
                  {w.done && <Icon name="check" size={13} />}
                </div>
                <span className="chip">Week {w.week}</span>
                <span className={w.done ? "faint" : ""} style={{ fontSize: 14 }}>{w.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
