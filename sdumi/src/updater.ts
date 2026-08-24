// Auto-update on launch (Windows). Checks GitHub Releases via the Tauri updater;
// if a newer signed version exists, downloads, installs and relaunches.
import { isTauri } from "./sdu/tauri";

export async function runUpdateCheck(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (update?.available) {
      await update.downloadAndInstall();
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    }
  } catch {
    // offline, no update, or updater not available — ignore silently
  }
}
