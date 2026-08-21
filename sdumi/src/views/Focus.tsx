import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { loadJSON, saveJSON } from "../store/persist";

type Mode = "focus" | "short" | "long";

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const LABELS: Record<Mode, string> = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

const KEY = "focusSessions";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function Focus() {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<number>(() => loadJSON<number>(KEY, 0));
  const tick = useRef<number | null>(null);

  // Reset the clock whenever the mode changes.
  useEffect(() => {
    setRunning(false);
    setRemaining(DURATIONS[mode]);
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Session finished.
          window.clearInterval(tick.current!);
          setRunning(false);
          if (mode === "focus") {
            setSessions((n) => {
              const next = n + 1;
              saveJSON(KEY, next);
              return next;
            });
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running, mode]);

  const total = DURATIONS[mode];
  const progress = ((total - remaining) / total) * 100;
  // SVG ring geometry.
  const R = 120;
  const C = 2 * Math.PI * R;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Focus</div>
          <div className="page-sub">Pomodoro timer — study in focused sprints</div>
        </div>
        <div className="chip" style={{ height: 30 }}>
          <Icon name="flame" size={14} /> {sessions} focus sessions today
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 32 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(DURATIONS) as Mode[]).map((m) => (
            <button
              key={m}
              className={`btn ${mode === m ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setMode(m)}
            >
              {LABELS[m]}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: 280, height: 280 }}>
          <svg width="280" height="280" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="140" cy="140" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="14" />
            <circle
              cx="140"
              cy="140"
              r={R}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (progress / 100) * C}
              style={{ transition: "stroke-dashoffset 0.3s linear" }}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {fmt(remaining)}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>{LABELS[mode]}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" style={{ width: 120 }} onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
          </button>
          <button
            className="btn"
            onClick={() => {
              setRunning(false);
              setRemaining(DURATIONS[mode]);
            }}
          >
            Reset
          </button>
        </div>

        <div className="faint" style={{ fontSize: 12.5, textAlign: "center", maxWidth: 360 }}>
          Tip: one focus sprint ≈ one daily. Finish sprints to build your streak and climb the leaderboard.
        </div>
      </div>
    </div>
  );
}
