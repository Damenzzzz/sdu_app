import { useState } from "react";
import { useSchedule } from "../sdu/useSchedule";
import type { ScheduleEntry } from "../data/types";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Syllabus() {
  const { entries, courses, live } = useSchedule();
  const [active, setActive] = useState<string | null>(null);

  const selected = active ?? courses[0]?.id ?? null;
  const course = courses.find((c) => c.id === selected);
  const sessions: ScheduleEntry[] = entries
    .filter((e) => e.courseId === selected)
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">My Courses</div>
          <div className="page-sub">
            {live ? "Your enrolled courses · live from my.sdu.edu.kz ✓" : "Your enrolled courses"}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "240px 1fr" }}>
        <div className="card" style={{ padding: 10, height: "fit-content" }}>
          {courses.map((c) => (
            <button
              key={c.id}
              className={`nav-item ${selected === c.id ? "active" : ""}`}
              onClick={() => setActive(c.id)}
              style={{ height: "auto", padding: "9px 12px" }}
            >
              <span className="dot" style={{ background: c.color, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.code}
              </span>
            </button>
          ))}
        </div>

        <div className="card">
          {!course ? (
            <div className="empty">No courses found.</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span className="dot" style={{ background: course.color, width: 12, height: 12 }} />
                <div style={{ fontWeight: 700, fontSize: 18 }}>{course.title || course.code}</div>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 18 }}>
                {course.code}
                {course.instructor ? ` · ${course.instructor}` : ""}
              </div>

              <div className="section-title">Weekly sessions</div>
              {sessions.length === 0 ? (
                <div className="empty">No scheduled sessions.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sessions.map((s) => (
                    <div className="daily" key={s.id}>
                      <span className="chip" style={{ minWidth: 48, justifyContent: "center" }}>
                        {dayNames[s.day] ?? "?"}
                      </span>
                      <span style={{ fontSize: 13.5 }}>
                        {s.start}{s.end ? ` – ${s.end}` : ""}
                      </span>
                      <span className="muted" style={{ marginLeft: "auto", fontSize: 12.5 }}>
                        {[s.room, s.type].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
