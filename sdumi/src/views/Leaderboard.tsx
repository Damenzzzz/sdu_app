import { useState } from "react";
import { leaderboard } from "../data/mock";
import { Icon } from "../components/Icon";

export function Leaderboard() {
  const [scope, setScope] = useState<"all" | "faculty">("all");
  const me = leaderboard.find((r) => r.isMe);
  const rows = leaderboard
    .filter((r) => (scope === "faculty" && me ? r.faculty === me.faculty : true))
    .sort((a, b) => b.points - a.points);
  const onlineCount = leaderboard.filter((r) => r.online).length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Leaderboard</div>
          <div className="page-sub">
            <span className="dot" style={{ background: "var(--green)", marginRight: 6 }} />
            {onlineCount} students online now · ranked by completed tasks
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`btn ${scope === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setScope("all")}>
            All SDU
          </button>
          <button className={`btn ${scope === "faculty" ? "btn-primary" : "btn-ghost"}`} onClick={() => setScope("faculty")}>
            My faculty
          </button>
        </div>
      </div>

      <div className="card">
        {rows.map((r, i) => {
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
