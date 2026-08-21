// Auth/session handling.
//
// SAFE-BY-DESIGN: the my.sdu.edu.kz password never leaves this device and is
// never sent to SDUmi servers. In the packaged Tauri app it is stored in the
// OS secure store via the Stronghold plugin; the scraper runs locally, logs in
// on the user's behalf, and persists only the resulting data.
//
// During browser dev we only keep a lightweight "signed in" flag + display name.

import { loadJSON, saveJSON } from "../store/persist";

export interface Session {
  studentId: string;
  studentName: string;
}

const KEY = "session";

export function getSession(): Session | null {
  return loadJSON<Session | null>(KEY, null);
}

// Placeholder auth. Real implementation: invoke a Rust command that stores the
// password in Stronghold and runs the scraper login against my.sdu.edu.kz.
export async function signIn(studentId: string, _password: string): Promise<Session> {
  // Derive a friendly display name from the ID for the demo.
  const session: Session = {
    studentId,
    studentName: "Student " + studentId.slice(-4),
  };
  saveJSON(KEY, session);
  return session;
}

export function signOut() {
  saveJSON<Session | null>(KEY, null);
}
