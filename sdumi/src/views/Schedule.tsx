import { useSchedule } from "../sdu/useSchedule";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Schedule() {
  const { entries, courses, live, loading, error } = useSchedule();
  const courseById = (id: string) => courses.find((c) => c.id === id);
  const days = live ? dayLabels : dayLabels.slice(0, 5);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Schedule</div>
          <div className="page-sub">
            {loading
              ? "Loading from my.sdu.edu.kz…"
              : live
              ? "Live from my.sdu.edu.kz ✓"
              : "Your weekly timetable"}
          </div>
        </div>
        {live && (
          <span className="chip" style={{ height: 30 }}>
            <span className="dot" style={{ background: "var(--green)" }} /> Live data
          </span>
        )}
      </div>

      {error && !live && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--amber)", color: "var(--amber)", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="card">
        <div className="sched" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((d) => (
            <div key={d} className="sched-col-head">{d}</div>
          ))}
          {days.map((_, di) => {
            const items = entries
              .filter((s) => s.day === di)
              .sort((a, b) => a.start.localeCompare(b.start));
            return (
              <div key={di} className="sched-col">
                {items.length === 0 && (
                  <div className="faint" style={{ textAlign: "center", fontSize: 12, paddingTop: 8 }}>—</div>
                )}
                {items.map((s) => {
                  const c = courseById(s.courseId);
                  return (
                    <div className="lesson" key={s.id} style={{ borderLeftColor: c?.color ?? "var(--accent)" }}>
                      <div className="lesson-time">{s.start}{s.end ? ` – ${s.end}` : ""}</div>
                      <div className="lesson-title">{c?.code ?? s.courseId}</div>
                      <div className="lesson-meta">{[s.room, s.type].filter(Boolean).join(" · ")}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
