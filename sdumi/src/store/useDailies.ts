import { useCallback, useEffect, useState } from "react";
import type { Daily } from "../data/types";
import { loadJSON, saveJSON } from "./persist";

const KEY = "dailies";

const seed: Daily[] = [
  { id: "d1", title: "Solve Calculus problem set #4", courseId: "c1", done: false, createdAt: Date.now(), priority: "high" },
  { id: "d2", title: "Read Linear Algebra ch. 3", courseId: "c2", done: false, createdAt: Date.now(), priority: "med" },
  { id: "d3", title: "Finish CS lab report", courseId: "c3", done: true, createdAt: Date.now(), completedAt: Date.now(), priority: "med" },
];

export function useDailies() {
  const [items, setItems] = useState<Daily[]>(() => loadJSON<Daily[]>(KEY, seed));

  useEffect(() => {
    saveJSON(KEY, items);
  }, [items]);

  const add = useCallback((title: string, courseId?: string, priority: Daily["priority"] = "med") => {
    if (!title.trim()) return;
    setItems((prev) => [
      { id: crypto.randomUUID(), title: title.trim(), courseId, done: false, createdAt: Date.now(), priority },
      ...prev,
    ]);
  }, []);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, done: !d.done, completedAt: !d.done ? Date.now() : undefined }
          : d
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const doneCount = items.filter((d) => d.done).length;
  const total = items.length;

  return { items, add, toggle, remove, doneCount, total };
}
