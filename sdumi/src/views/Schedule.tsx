import { schedule, courseById } from "../data/mock";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function Schedule() {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Schedule</div>
          <div className="page-sub">Your weekly timetable · synced from my.sdu.edu.kz</div>
        </div>
      </div>

      <div className="card">
        <div className="sched">
          {days.map((d) => (
            <div key={d} className="sched-col-head">{d}</div>
          ))}
          {days.map((_, di) => {
            const items = schedule
              .filter((s) => s.day === di)
              .sort((a, b) => a.start.localeCompare(b.start));
            return (
              <div key={di} className="sched-col">
                {items.length === 0 && <div className="faint" style={{ textAlign: "center", fontSize: 12, paddingTop: 8 }}>—</div>}
                {items.map((s) => {
                  const c = courseById(s.courseId)!;
                  return (
                    <div className="lesson" key={s.id} style={{ borderLeftColor: c.color }}>
                      <div className="lesson-time">{s.start} – {s.end}</div>
                      <div className="lesson-title">{c.code}</div>
                      <div className="lesson-meta">{s.room} · {s.type}</div>
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
