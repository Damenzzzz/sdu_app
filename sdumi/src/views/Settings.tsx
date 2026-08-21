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
            Your my.sdu.edu.kz password is stored <b>only on this device</b> in the OS secure
            store (Windows Credential Manager / macOS Keychain, via Tauri Stronghold). It is
            never sent to SDUmi servers. Only your nickname, points and online status are shared
            for the leaderboard.
          </p>
        </div>

        <div className="card">
          <div className="section-title">AI provider</div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            Local model runs on your machine via Ollama (private, offline). If unavailable,
            SDUmi can fall back to a cloud model.
          </p>
          <div className="chip">Local: Ollama · not detected</div>
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
