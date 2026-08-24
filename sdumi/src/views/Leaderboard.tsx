import { useEffect, useState } from "react";
import { leaderboard as mockLeaderboard } from "../data/mock";
import type { LeaderboardRow } from "../data/types";
import { isBackendConfigured, } from "../backend/config";
import { fetchLeaderboard } from "../backend/leaderboard";
import { getSession } from "../auth/session";
import { Icon } from "../components/Icon";

export function Leaderboard() {
  const [scope, setScope] = useState<"all" | "faculty">("all");
  const [rows, setRows] = useState<LeaderboardRow[]>(mockLeaderboard);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isBackendConfigured()) return; // demo data
    const myId = getSession()?.studentId;
    fetchLeaderboard(myId)
      .then((r) => {
        if (r.length) {
          setRows(r);
          setLive(true);
        }
      })
      .catch((e) => setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e)));
  }, []);

  const me = rows.find((r) => r.isMe);
  const visible = rows
    .filter((r) => (scope === "faculty" && me ? r.faculty === me.faculty : true))
    .sort((a, b) => b.points - a.points);
  const onlineCount = rows.filter((r) => r.online).length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Leaderboard</div>
          <div className="page-sub">
            <span className="dot" style={{ background: "var(--green)", marginRight: 6 }} />
            {onlineCount} online now · ranked by completed tasks {live ? "· live ✓" : "· demo"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`btn ${scope === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setScope("all")}>
            All SDU
          </button>
          <button className={`btn ${scope === "faculty" ? "btn-primary" : "btn-ghost"}`} onClick={() => setScope("faculty")}>
            My group
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--amber)", color: "var(--amber)", fontSize: 13 }}>
          Leaderboard offline: {error}
        </div>
      )}

      <div className="card">
        {visible.map((r, i) => {
          const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
          return (
            <div className={`row-item ${r.isMe ? "me-row" : ""}`} key={r.id}>
              <span className={`rank ${rankClass}`}>{i + 1}</span>
              <div className="avatar" style={{ width: 34, height: 34 }}>
                {r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {r.name}
                  {r.online && <span className="dot" style={{ background: "var(--green)", marginLeft: 8 }} />}
                </div>
                <div className="faint" style={{ fontSize: 12 }}>{r.faculty}</div>
              </div>
              <span className="chip"><Icon name="flame" size={13} /> {r.streak}</span>
              <div style={{ width: 90, textAlign: "right", fontWeight: 700 }}>
                {r.points.toLocaleString()}
                <span className="faint" style={{ fontWeight: 400, fontSize: 11 }}> pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
