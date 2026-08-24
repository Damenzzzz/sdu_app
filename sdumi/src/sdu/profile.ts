// Student profile from the SIS home banner + the session-protected photo.

import { sduFetch, sduFetchB64 } from "./tauri";
import { loadJSON, saveJSON } from "../store/persist";

export interface Profile {
  name: string;
  studentId: string;
  major: string;
  advisor: string;
  photo?: string; // data: URL
}

const CACHE_KEY = "cache:profile";

export function cachedProfile(): Profile | null {
  return loadJSON<Profile | null>(CACHE_KEY, null);
}

export async function fetchProfile(studentId: string): Promise<Profile> {
  const html = await sduFetch(""); // home page carries the banner + photo <img>
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = (doc.body?.textContent ?? "").replace(/\s+/g, " ");

  const grab = (label: string, stop: string) => {
    const m = body.match(new RegExp(`${label}\\s*:\\s*(.+?)\\s*(?:${stop})`));
    return m ? m[1].trim() : "";
  };
  const name = grab("Name Surname", "Advisor|Major|Last Login|System Date|$");
  const advisor = grab("Advisor", "Major|Last Login|System Date|Name Surname|$");
  const major = grab("Major Program", "Last Login|System Date|Advisor|$");

  let photo: string | undefined;
  const img = Array.from(doc.querySelectorAll("img")).find((i) =>
    /stud_photo|photo|foto/i.test(i.getAttribute("src") || "")
  );
  const src = img?.getAttribute("src");
  if (src) {
    try {
      photo = await sduFetchB64(src);
    } catch {
      /* photo optional */
    }
  }

  const profile: Profile = { name: name || "Student", studentId, major, advisor, photo };
  saveJSON(CACHE_KEY, profile);
  return profile;
}
