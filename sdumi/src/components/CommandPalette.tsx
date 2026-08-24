import { useEffect, useMemo, useRef, useState } from "react";
import type { ViewKey } from "./Sidebar";
import type { ScrapedSchedule } from "../sdu/schedule";
import type { Daily } from "../data/types";
import { listBooks } from "../books/store";
import { loadJSON } from "../store/persist";
import { Icon, type IconName } from "./Icon";

interface Item {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  view: ViewKey;
}

const PAGES: Item[] = [
  { id: "p-dashboard", title: "Dashboard", subtitle: "Page", icon: "dashboard", view: "dashboard" },
  { id: "p-schedule", title: "Schedule", subtitle: "Page", icon: "calendar", view: "schedule" },
  { id: "p-syllabus", title: "My Courses", subtitle: "Page", icon: "book", view: "syllabus" },
  { id: "p-grades", title: "Grades", subtitle: "Page", icon: "chart", view: "grades" },
  { id: "p-books", title: "Books", subtitle: "Page", icon: "library", view: "books" },
  { id: "p-dailies", title: "Dailies", subtitle: "Page", icon: "check", view: "dailies" },
  { id: "p-focus", title: "Focus", subtitle: "Page", icon: "clock", view: "focus" },
  { id: "p-leaderboard", title: "Leaderboard", subtitle: "Page", icon: "trophy", view: "leaderboard" },
  { id: "p-profile", title: "Profile", subtitle: "Page", icon: "settings", view: "profile" },
];

function buildIndex(): Item[] {
  const items = [...PAGES];
  const sched = loadJSON<ScrapedSchedule | null>("cache:schedule", null);
  sched?.courses.forEach((c) =>
    items.push({ id: "c-" + c.id, title: c.code, subtitle: c.title || "Course", icon: "book", view: "syllabus" })
  );
  listBooks().forEach((b) =>
    items.push({ id: "b-" + b.id, title: b.name, subtitle: "Book · " + b.section, icon: "library", view: "books" })
  );
  loadJSON<Daily[]>("dailies", []).forEach((d) =>
    items.push({ id: "d-" + d.id, title: d.title, subtitle: "Task", icon: "check", view: "dailies" })
  );
  return items;
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (v: ViewKey) => void;
}) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => (open ? buildIndex() : []), [open]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index
      .filter((i) => (i.title + " " + i.subtitle).toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, index]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setSel(0), [query]);

  if (!open) return null;

  const activate = (item?: Item) => {
    const target = item ?? results[sel];
    if (target) {
      onNavigate(target.view);
      onClose();
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); activate(); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: "flex-start", paddingTop: "12vh" }}>
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 92vw)", padding: 0, overflow: "hidden", animation: "popIn 0.2s var(--ease)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border-soft)" }}>
          <span className="faint"><Icon name="sparkles" size={16} /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search courses, books, tasks, pages…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15 }}
          />
          <span className="chip" style={{ height: 22, fontSize: 11 }}>Esc</span>
        </div>
        <div style={{ maxHeight: "50vh", overflowY: "auto", padding: 8 }}>
          {results.length === 0 ? (
            <div className="empty">No matches</div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                className={`nav-item ${i === sel ? "active" : ""}`}
                style={{ height: "auto", padding: "10px 12px" }}
                onMouseEnter={() => setSel(i)}
                onClick={() => activate(item)}
              >
                <Icon name={item.icon} size={16} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                <span className="faint" style={{ marginLeft: "auto", fontSize: 11.5, flexShrink: 0 }}>{item.subtitle}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
