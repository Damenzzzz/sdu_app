// Auth/session handling.
//
// SAFE-BY-DESIGN: inside the Tauri app the my.sdu.edu.kz password and 2FA code
// are sent only to SDU's own endpoints by the local Rust scraper — never to
// SDUmi servers, and they are not persisted (you re-enter each launch). In a
// plain browser (Vite preview) there is no backend, so we run a demo mode.

import { loadJSON, saveJSON } from "../store/persist";
import { isTauri, sduLogin, sduPost, sduFetch, sduLogout } from "../sdu/tauri";
import { parseStudentName } from "../sdu/schedule";
import { parseOtpForm, type OtpChallenge } from "../sdu/otp";

export interface Session {
  studentId: string;
  studentName: string;
  real: boolean; // true = authenticated against SDU; false = browser demo
}

export type SignInResult =
  | { kind: "ok"; session: Session }
  | { kind: "otp"; challenge: OtpChallenge };

const KEY = "session";

export function getSession(): Session | null {
  return loadJSON<Session | null>(KEY, null);
}

async function buildSession(studentId: string): Promise<Session> {
  let studentName = "Student " + studentId.slice(-4);
  try {
    const home = await sduFetch("");
    const parsed = parseStudentName(home);
    if (parsed) studentName = parsed;
  } catch {
    /* keep fallback name */
  }
  const session: Session = { studentId, studentName, real: true };
  saveJSON(KEY, session);
  return session;
}

// Step 1: credentials. Returns a completed session, or a 2FA challenge.
export async function signIn(studentId: string, password: string): Promise<SignInResult> {
  if (isTauri()) {
    const res = await sduLogin(studentId, password);
    if (res.status === "ok") {
      return { kind: "ok", session: await buildSession(studentId) };
    }
    if (res.status === "otp") {
      const challenge = parseOtpForm(res.html, studentId);
      if (!challenge) {
        throw new Error("2FA is required but the code form couldn't be read.");
      }
      return { kind: "otp", challenge };
    }
    throw new Error("Invalid SDU ID or password.");
  }

  // Browser demo fallback — no real network, just let the UI run on mock data.
  const session: Session = {
    studentId,
    studentName: "Student " + studentId.slice(-4),
    real: false,
  };
  saveJSON(KEY, session);
  return { kind: "ok", session };
}

// Step 2: submit the emailed 2FA code.
export async function completeOtp(challenge: OtpChallenge, code: string): Promise<Session> {
  const fields: [string, string][] = [...challenge.fields, [challenge.codeField, code.trim()]];
  const res = await sduPost(challenge.action, fields);
  if (!res.authenticated) {
    throw new Error("Incorrect or expired code — try again.");
  }
  return buildSession(challenge.studentId);
}

export async function signOut(): Promise<void> {
  if (isTauri()) {
    try {
      await sduLogout();
    } catch {
      /* ignore */
    }
  }
  saveJSON<Session | null>(KEY, null);
}
