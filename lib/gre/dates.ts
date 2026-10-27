// Days are YYYY-MM-DD keys in the browser's local time, the way they are stored.
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

// Arithmetic on keys runs in UTC so a countdown never drifts with the timezone.
function parseKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseKey(to) - parseKey(from)) / 86_400_000);
}

export function addDays(key: string, days: number): string {
  return new Date(parseKey(key) + days * 86_400_000).toISOString().slice(0, 10);
}

export function formatDayLabel(key: string): string {
  return new Date(parseKey(key)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
