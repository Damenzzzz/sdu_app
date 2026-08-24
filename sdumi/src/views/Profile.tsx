import { useEffect, useState } from "react";
import { isTauri } from "../sdu/tauri";
import { fetchProfile, cachedProfile, type Profile as P } from "../sdu/profile";
import { currentStreak } from "../store/streak";

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export function Profile({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [profile, setProfile] = useState<P | null>(() => cachedProfile());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isTauri()) return;
    setLoading(true);
    fetchProfile(studentId)
      .then(setProfile)
      .catch((e) => setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [studentId]);

  const name = profile?.name || studentName;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-sub">{loading ? "Loading from my.sdu.edu.kz…" : "Your SDU account"}</div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--amber)", color: "var(--amber)", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: "260px 1fr" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 26 }}>
          {profile?.photo ? (
            <img
              src={profile.photo}
              alt={name}
              style={{ width: 150, height: 190, objectFit: "cover", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}
            />
          ) : (
            <div
              style={{
                width: 150, height: 190, borderRadius: "var(--radius)",
                background: "var(--grad-accent)", display: "grid", placeItems: "center",
                fontSize: 46, fontWeight: 800, color: "#fff",
              }}
            >
              {initials(name)}
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
            <div className="faint" style={{ fontSize: 12.5 }}>ID {studentId}</div>
          </div>
          <div className="chip" style={{ height: 28 }}>🔥 {currentStreak()} day streak</div>
        </div>

        <div className="card" style={{ height: "fit-content" }}>
          <div className="section-title">Details</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row label="Full name" value={name} />
            <Row label="Student ID" value={studentId} />
            <Row label="Major program" value={profile?.major || "—"} />
            <Row label="Advisor" value={profile?.advisor || "—"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 2px",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
