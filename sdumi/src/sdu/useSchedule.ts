import { useEffect, useState } from "react";
import { isTauri } from "./tauri";
import { fetchLiveSchedule, type ScrapedSchedule } from "./schedule";
import { schedule as mockSchedule, courses as mockCourses } from "../data/mock";

// Module-level cache so Dashboard and Schedule share a single live fetch.
let cache: ScrapedSchedule | null = null;
let inflight: Promise<ScrapedSchedule> | null = null;

const fallback: ScrapedSchedule = { entries: mockSchedule, courses: mockCourses };

export interface ScheduleState extends ScrapedSchedule {
  live: boolean;
  loading: boolean;
  error: string;
}

export function useSchedule(): ScheduleState {
  const [data, setData] = useState<ScrapedSchedule>(cache ?? fallback);
  const [live, setLive] = useState(!!cache && cache.entries.length > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isTauri()) return; // browser preview keeps mock
    if (cache) {
      setData(cache);
      setLive(cache.entries.length > 0);
      return;
    }
    setLoading(true);
    (inflight ??= fetchLiveSchedule())
      .then((res) => {
        if (res.entries.length) {
          cache = res;
          setData(res);
          setLive(true);
        } else {
          setError(`No lessons parsed (term ${res.term ?? "?"}).`);
        }
      })
      .catch((e) => setError(typeof e === "string" ? e : (e as Error)?.message ?? String(e)))
      .finally(() => {
        setLoading(false);
        inflight = null;
      });
  }, []);

  return { ...data, live, loading, error };
}
