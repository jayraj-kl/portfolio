import type { StudyLibrary } from "./types";

// Where the maps lived before the database. It is only read once, to carry them into an empty database,
// and is left in place as a backup.
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

export function readBrowserLibrary(): StudyLibrary | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStudyLibrary(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
