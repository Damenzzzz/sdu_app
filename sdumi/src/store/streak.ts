// Daily-completion streak: consecutive days on which the student completed at
// least one task. Backs the Dashboard streak tile and the leaderboard score.

import { loadJSON, saveJSON } from "./persist";

const KEY = "completionDates";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function recordCompletionToday(): void {
  const set = new Set(loadJSON<string[]>(KEY, []));
  set.add(dayKey(new Date()));
  saveJSON(KEY, [...set]);
}

// Consecutive days ending today (today itself is optional — the streak is still
// "alive" until the day ends even if no task is done yet).
export function currentStreak(): number {
  const set = new Set(loadJSON<string[]>(KEY, []));
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 3650; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    if (set.has(dayKey(d))) {
      streak++;
    } else if (i === 0) {
      continue; // today not done yet — don't break the streak
    } else {
      break;
    }
  }
  return streak;
}
