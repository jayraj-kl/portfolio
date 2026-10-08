import { createSeedMap } from "./seed";
import type { StudyMap } from "./types";

// The app only talks to this interface, so a database-backed implementation can replace it.
export interface StudyMapStorage {
  load(): Promise<StudyMap>;
  save(map: StudyMap): Promise<void>;
  reset(): Promise<StudyMap>;
}

const STORAGE_KEY = "study-map:v1";

function isStudyMap(value: unknown): value is StudyMap {
  if (typeof value !== "object" || value === null) return false;
  const topics = (value as StudyMap).topics;
  return (
    Array.isArray(topics) && topics.some((topic) => topic?.parentId === null)
  );
}

export const localStudyMapStorage: StudyMapStorage = {
  async load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStudyMap(parsed)) return parsed;
      }
    } catch {
      // Unreadable or blocked storage falls back to the sample map.
    }
    return createSeedMap();
  },

  async save(map) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Storage can be full or disabled; the map still works for this visit.
    }
  },

  async reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    return createSeedMap();
  },
};
