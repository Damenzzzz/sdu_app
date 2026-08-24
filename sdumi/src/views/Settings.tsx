export function Settings({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Account, privacy and preferences</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Privacy & security</div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
            Your my.sdu.edu.kz password is sent <b>only to SDU</b> to sign in and is
            <b> not stored</b> by SDUmi — you enter it each launch. Only your name, points and
            online status are shared for the leaderboard.
          </p>
        </div>

        <div className="card">
          <div className="section-title">Account</div>
          <button className="btn" onClick={onLogout} style={{ color: "var(--red)" }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
