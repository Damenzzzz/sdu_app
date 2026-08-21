import { useState } from "react";
import { signIn, completeOtp, type Session } from "../auth/session";
import type { OtpChallenge } from "../sdu/otp";
import { Icon } from "../components/Icon";

export function Login({ onSignedIn }: { onSignedIn: (s: Session) => void }) {
  const [step, setStep] = useState<"creds" | "otp">("creds");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submitCreds = async () => {
    setErr("");
    if (!id.trim() || !pw.trim()) {
      setErr("Enter your SDU ID and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await signIn(id.trim(), pw);
      if (res.kind === "ok") {
        onSignedIn(res.session);
      } else {
        setChallenge(res.challenge);
        setStep("otp");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    setErr("");
    if (!code.trim() || !challenge) {
      setErr("Enter the code from your email.");
      return;
    }
    setBusy(true);
    try {
      const session = await completeOtp(challenge, code.trim());
      onSignedIn(session);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed.");
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

        {step === "creds" ? (
          <>
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
                onKeyDown={(e) => e.key === "Enter" && submitCreds()}
              />
            </div>
            {err && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={submitCreds} disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </>
        ) : (
          <>
            <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
              Enter the 6-digit code sent to your SDU email
            </p>
            <div className="field">
              <label>Verification code</label>
              <input
                className="input"
                inputMode="numeric"
                autoFocus
                placeholder="______"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                onKeyDown={(e) => e.key === "Enter" && submitCode()}
                style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: 18 }}
              />
            </div>
            {err && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={submitCode} disabled={busy}>
              {busy ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => { setStep("creds"); setErr(""); setCode(""); }}
              disabled={busy}
            >
              Back
            </button>
          </>
        )}

        <div className="secure-note">
          <span style={{ color: "var(--green)", flexShrink: 0 }}><Icon name="check" size={14} /></span>
          Your password stays on this device and is sent only to SDU. It is never
          stored by SDUmi or sent to our servers.
        </div>
      </div>
    </div>
  );
}
