import { useState } from "react";
import { signIn, type Session } from "../auth/session";
import { Icon } from "../components/Icon";

export function Login({ onSignedIn }: { onSignedIn: (s: Session) => void }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!id.trim() || !pw.trim()) {
      setErr("Enter your SDU ID and password.");
      return;
    }
    setBusy(true);
    try {
      const s = await signIn(id.trim(), pw);
      onSignedIn(s);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not sign in. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card fade-in">
        <div className="login-brand">
          <div className="brand-logo">S</div>
          <div className="brand-name">SDU<span>mi</span></div>
        </div>
        <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
          Sign in with your my.sdu.edu.kz account
        </p>

        <div className="field">
          <label>Student ID</label>
          <input className="input" placeholder="e.g. 210103001" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {err && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={submit} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="secure-note">
          <span style={{ color: "var(--green)", flexShrink: 0 }}><Icon name="check" size={14} /></span>
          Your password stays on this device (OS secure store) and is never sent to SDUmi
          servers. Data is fetched locally on your behalf.
        </div>
      </div>
    </div>
  );
}
