import type { Daily } from "../data/types";
import { leaderboard } from "../data/mock";
import { useSchedule } from "../sdu/useSchedule";
import { Icon } from "../components/Icon";
import type { ViewKey } from "../components/Sidebar";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function todayIndex() {
  const d = new Date().getDay(); // 0 Sun .. 6 Sat
  return d === 0 || d === 6 ? 0 : d - 1;
}

export function Dashboard({
  dailies,
  studentName,
  onNavigate,
}: {
  dailies: { items: Daily[]; doneCount: number; total: number };
  studentName: string;
  onNavigate: (v: ViewKey) => void;
}) {
  const { entries, courses } = useSchedule();
  const courseById = (id?: string) => courses.find((c) => c.id === id);
  const ti = todayIndex();
  const todays = entries
    .filter((s) => s.day === ti)
    .sort((a, b) => a.start.localeCompare(b.start));
  const me = leaderboard.find((r) => r.isMe);
  const myRank = leaderboard
    .slice()
    .sort((a, b) => b.points - a.points)
    .findIndex((r) => r.isMe) + 1;
  const pct = dailies.total ? Math.round((dailies.doneCount / dailies.total) * 100) : 0;
  const pending = dailies.items.filter((d) => !d.done);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Welcome back, {studentName.split(" ")[0]} 👋</div>
          <div className="page-sub">Here's your {dayNames[ti]} at a glance</div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <StatTile label="Today's classes" value={String(todays.length)} icon="calendar" />
        <StatTile label="Tasks done" value={`${dailies.doneCount}/${dailies.total}`} icon="check" />
        <StatTile label="Streak" value={`${me?.streak ?? 0} days`} icon="flame" tint="var(--amber)" />
        <StatTile label="Rank" value={`#${myRank}`} icon="trophy" tint="var(--accent-2)" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="stat-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>Today's schedule</div>
            <button className="btn btn-ghost" onClick={() => onNavigate("schedule")} style={{ height: 28, fontSize: 12 }}>
              View all
            </button>
          </div>
          {todays.length === 0 ? (
            <div className="empty">No classes today 🎉</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todays.map((s) => {
                const c = courseById(s.courseId)!;
                return (
                  <div className="lesson" key={s.id} style={{ borderLeftColor: c.color }}>
                    <div className="lesson-time">{s.start} – {s.end}</div>
                    <div className="lesson-title">{c.title}</div>
                    <div className="lesson-meta">{c.code} · {s.room} · {s.type}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="stat-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>Today's dailies</div>
            <button className="btn btn-ghost" onClick={() => onNavigate("dailies")} style={{ height: 28, fontSize: 12 }}>
              Open
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="stat-row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <span className="muted" style={{ fontSize: 12.5 }}>Progress</span>
              <span style={{ fontWeight: 600, fontSize: 12.5 }}>{pct}%</span>
            </div>
            <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          </div>
          {pending.length === 0 ? (
            <div className="empty">All done for today ✨</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pending.slice(0, 4).map((d) => (
                <div className="row-item" key={d.id} style={{ padding: "8px 4px" }}>
                  <span className={`prio ${d.priority}`} style={{ height: 18 }} />
                  <span style={{ fontSize: 13.5 }}>{d.title}</span>
                  {d.courseId && (
                    <span className="chip" style={{ marginLeft: "auto" }}>{courseById(d.courseId)?.code}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon, tint }: { label: string; value: string; icon: any; tint?: string }) {
  return (
    <div className="card stat">
      <div className="stat-row" style={{ justifyContent: "space-between" }}>
        <span className="stat-label">{label}</span>
        <span style={{ color: tint ?? "var(--accent)" }}><Icon name={icon} size={18} /></span>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}
