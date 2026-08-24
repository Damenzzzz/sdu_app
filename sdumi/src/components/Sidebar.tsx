import { Icon, type IconName } from "./Icon";

export type ViewKey =
  | "dashboard"
  | "schedule"
  | "syllabus"
  | "grades"
  | "dailies"
  | "focus"
  | "leaderboard"
  | "ai"
  | "settings";

const nav: { key: ViewKey; label: string; icon: IconName }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "schedule", label: "Schedule", icon: "calendar" },
  { key: "syllabus", label: "Syllabus", icon: "book" },
  { key: "grades", label: "Grades", icon: "chart" },
  { key: "dailies", label: "Dailies", icon: "check" },
  { key: "focus", label: "Focus", icon: "clock" },
  { key: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { key: "ai", label: "AI Assistant", icon: "sparkles" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export function Sidebar({
  active,
  onNavigate,
  dailyBadge,
  studentName,
}: {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
  dailyBadge?: number;
  studentName: string;
}) {
  const initials = studentName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">S</div>
        <div className="brand-name">
          SDU<span>mi</span>
        </div>
      </div>

      <nav className="nav">
        {nav.map((n) => (
          <button
            key={n.key}
            className={`nav-item ${active === n.key ? "active" : ""}`}
            onClick={() => onNavigate(n.key)}
          >
            <Icon name={n.icon} />
            {n.label}
            {n.key === "dailies" && dailyBadge ? (
              <span className="badge">{dailyBadge}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{studentName}</div>
            <div className="faint" style={{ fontSize: 11.5 }}>
              <span className="dot" style={{ background: "var(--green)", marginRight: 5 }} />
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
