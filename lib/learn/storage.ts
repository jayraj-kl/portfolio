import { createSeedLibrary } from "./seed";
import type { StudyLibrary } from "./types";

// The app only talks to this interface, so a database-backed implementation can replace it.
export interface StudyLibraryStorage {
  load(): Promise<StudyLibrary>;
  save(library: StudyLibrary): Promise<void>;
  reset(): Promise<StudyLibrary>;
}

const STORAGE_KEY = "study-maps:v4";

function isStudyLibrary(value: unknown): value is StudyLibrary {
  if (typeof value !== "object" || value === null) return false;
  const maps = (value as StudyLibrary).maps;
  return (
    Array.isArray(maps) &&
    maps.length > 0 &&
    maps.every(
      (map) =>
        Array.isArray(map?.topics) &&
        map.topics.some((topic) => topic?.parentId === null),
    )
  );
}

export const localStudyLibraryStorage: StudyLibraryStorage = {
  async load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStudyLibrary(parsed)) return parsed;
      }
    } catch {
      // Unreadable or blocked storage falls back to the sample maps.
    }
    return createSeedLibrary();
  },

  async save(library) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch {
      // Storage can be full or disabled; the maps still work for this visit.
    }
  },

  async reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    return createSeedLibrary();
  },
};
