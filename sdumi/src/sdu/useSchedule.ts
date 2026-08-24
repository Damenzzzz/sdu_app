import { useEffect, useState } from "react";
import { isTauri } from "./tauri";
import { fetchLiveSchedule, type ScrapedSchedule } from "./schedule";
import { schedule as mockSchedule, courses as mockCourses } from "../data/mock";
import { loadJSON, saveJSON } from "../store/persist";

// Two-layer cache for instant loads:
//  - disk (localStorage): survives restarts → shows last schedule immediately
//  - mem: this session's fresh fetch → avoids refetching on every view switch
const DISK_KEY = "cache:schedule";
let mem: ScrapedSchedule | null = null;
let inflight: Promise<ScrapedSchedule> | null = null;

const fallback: ScrapedSchedule = { entries: mockSchedule, courses: mockCourses };

export interface ScheduleState extends ScrapedSchedule {
  live: boolean;
  loading: boolean;
  error: string;
}

export function useSchedule(): ScheduleState {
  const disk = loadJSON<ScrapedSchedule | null>(DISK_KEY, null);
  const seed = mem ?? disk;
  const [data, setData] = useState<ScrapedSchedule>(seed ?? fallback);
  const [live, setLive] = useState(!!seed && seed.entries.length > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isTauri()) return; // browser preview keeps mock
    if (mem) {
      setData(mem);
      setLive(true);
      return; // already refreshed this session
    }
    // Refresh in the background; only block-with-spinner if we have nothing cached.
    setLoading(!disk);
    (inflight ??= fetchLiveSchedule())
      .then((res) => {
        if (res.entries.length) {
          mem = res;
          saveJSON(DISK_KEY, res);
          setData(res);
          setLive(true);
          setError("");
        } else if (!disk) {
          setError(`No lessons parsed (term ${res.term ?? "?"}).`);
        }
      })
      .catch((e) => {
        if (!disk) setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e));
      })
      .finally(() => {
        setLoading(false);
        inflight = null;
      });
  }, []);

  return { ...data, live, loading, error };
}
