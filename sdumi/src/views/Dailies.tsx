import { useState } from "react";
import type { Daily } from "../data/types";
import { courses, courseById } from "../data/mock";
import { Icon } from "../components/Icon";

type DailiesApi = {
  items: Daily[];
  add: (title: string, courseId?: string, priority?: Daily["priority"]) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  doneCount: number;
  total: number;
};

export function Dailies({ dailies }: { dailies: DailiesApi }) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [priority, setPriority] = useState<Daily["priority"]>("med");

  const submit = () => {
    dailies.add(title, courseId || undefined, priority);
    setTitle("");
  };

  const pct = dailies.total ? Math.round((dailies.doneCount / dailies.total) * 100) : 0;
  const pending = dailies.items.filter((d) => !d.done);
  const done = dailies.items.filter((d) => d.done);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Dailies</div>
          <div className="page-sub">Plan your day. Completed tasks earn points on the leaderboard.</div>
        </div>
        <div className="chip" style={{ height: 30 }}>
          <Icon name="flame" size={14} /> {pct}% done today
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            placeholder="Add a task… e.g. Solve Calculus set #5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <select className="input" style={{ width: 160 }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>
          <select className="input" style={{ width: 120 }} value={priority} onChange={(e) => setPriority(e.target.value as Daily["priority"])}>
            <option value="high">High</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn btn-primary" onClick={submit}>
            <Icon name="plus" size={16} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">To do · {pending.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.length === 0 && <div className="empty">Nothing pending. Add a task above ↑</div>}
            {pending.map((d) => (
              <DailyRow key={d.id} d={d} onToggle={dailies.toggle} onRemove={dailies.remove} />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Completed · {done.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.length === 0 && <div className="empty">No completed tasks yet.</div>}
            {done.map((d) => (
              <DailyRow key={d.id} d={d} onToggle={dailies.toggle} onRemove={dailies.remove} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyRow({
  d,
  onToggle,
  onRemove,
}: {
  d: Daily;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`daily ${d.done ? "done" : ""}`}>
      <span className={`prio ${d.priority}`} />
      <button className={`checkbox ${d.done ? "on" : ""}`} onClick={() => onToggle(d.id)}>
        {d.done && <Icon name="check" size={13} />}
      </button>
      <span className="daily-title">{d.title}</span>
      {d.courseId && <span className="chip">{courseById(d.courseId)?.code}</span>}
      <button className="daily-del" onClick={() => onRemove(d.id)}>
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}
