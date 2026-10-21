// Content keeps dates as "MM/YYYY" (or a bare year); the site shows a month as "Aug’25".
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function month(date: string) {
  const m = /^(\d{1,2})\/(\d{4})$/.exec(date.trim());
  if (!m) return date; // a bare year, or anything else, stays as written
  const name = MONTHS[Number(m[1]) - 1];
  return name ? `${name}’${m[2].slice(2)}` : date;
}

export const range = (start: string, end: string | null) => `${month(start)} – ${end ? month(end) : "now"}`;
