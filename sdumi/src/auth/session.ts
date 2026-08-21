// Auth/session handling.
//
// SAFE-BY-DESIGN: inside the Tauri app the my.sdu.edu.kz password is sent only
// to SDU's own login endpoint by the local Rust scraper — never to SDUmi
// servers, and it is not persisted (you re-enter it each launch). In a plain
// browser (Vite preview) there is no backend, so we run a lightweight demo mode.

import { loadJSON, saveJSON } from "../store/persist";
import { isTauri, sduLogin, sduFetch, sduLogout } from "../sdu/tauri";
import { parseStudentName } from "../sdu/schedule";

export interface Session {
  studentId: string;
  studentName: string;
  real: boolean; // true = authenticated against SDU; false = browser demo
}

const KEY = "session";

export function getSession(): Session | null {
  return loadJSON<Session | null>(KEY, null);
}

export async function signIn(studentId: string, password: string): Promise<Session> {
  if (isTauri()) {
    const ok = await sduLogin(studentId, password);
    if (!ok) throw new Error("Invalid SDU ID or password.");

    let studentName = "Student " + studentId.slice(-4);
    try {
      const home = await sduFetch("");
      const parsed = parseStudentName(home);
      if (parsed) studentName = parsed;
    } catch {
      /* keep the fallback name */
    }

    const session: Session = { studentId, studentName, real: true };
    saveJSON(KEY, session);
    return session;
  }

  // Browser demo fallback — no real network, just let the UI run on mock data.
  const session: Session = {
    studentId,
    studentName: "Student " + studentId.slice(-4),
    real: false,
  };
  saveJSON(KEY, session);
  return session;
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
