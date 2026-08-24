import { useEffect } from "react";
import { isTauri } from "./tauri";
import type { ScrapedSchedule } from "./schedule";
import { loadJSON } from "../store/persist";

// Fires a desktop notification ~15 minutes before each of today's classes.
// Reads the cached schedule (populated by useSchedule) so it needs no fetch.
export function useClassReminders(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !isTauri()) return;
    const notified = new Set<string>();

    const check = async () => {
      const cache = loadJSON<ScrapedSchedule | null>("cache:schedule", null);
      if (!cache || !cache.entries.length) return;

      const notif = await import("@tauri-apps/plugin-notification");
      let granted = await notif.isPermissionGranted();
      if (!granted) granted = (await notif.requestPermission()) === "granted";
      if (!granted) return;

      const now = new Date();
      const dow = now.getDay();
      const ti = dow === 0 || dow === 6 ? -1 : dow - 1; // 0=Mon..5=Sat
      for (const e of cache.entries.filter((x) => x.day === ti)) {
        const [h, m] = e.start.split(":").map(Number);
        if (Number.isNaN(h)) continue;
        const classTime = new Date(now);
        classTime.setHours(h, m, 0, 0);
        const diffMin = (classTime.getTime() - now.getTime()) / 60000;
        if (diffMin > 14 && diffMin <= 15 && !notified.has(e.id)) {
          notified.add(e.id);
          const c = cache.courses.find((x) => x.id === e.courseId);
          notif.sendNotification({
            title: "Class in 15 minutes ⏰",
            body: `${c?.code ?? e.courseId}${e.room ? " · " + e.room : ""} · ${e.start}`,
          });
        }
      }
    };

    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [enabled]);
}
