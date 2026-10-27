import { neon } from "@neondatabase/serverless";
import type { ProgressData } from "./types";

// The tracker's own Neon database, carried over from when it was a separate app.
function getSQL() {
  const url = process.env.GRE_DATABASE_URL;
  if (!url) throw new Error("GRE_DATABASE_URL is not set");
  return neon(url);
}

export async function getProgress(): Promise<ProgressData> {
  const sql = getSQL();
  const [verbalRows, quantRows] = await Promise.all([
    sql`SELECT date, word_ids FROM verbal_progress ORDER BY date`,
    sql`SELECT date, practiced FROM quant_progress ORDER BY date`,
  ]);

  const verbal: ProgressData["verbal"] = {};
  for (const row of verbalRows)
    verbal[toKey(row.date)] = row.word_ids as string[];

  const quant: ProgressData["quant"] = {};
  for (const row of quantRows)
    quant[toKey(row.date)] = row.practiced as boolean;

  return { verbal, quant };
}

export async function saveVerbalDay(date: string, wordIds: string[]) {
  await getSQL()`
    INSERT INTO verbal_progress (date, word_ids)
    VALUES (${date}, ${wordIds})
    ON CONFLICT (date) DO UPDATE SET word_ids = EXCLUDED.word_ids
  `;
}

export async function saveQuantDay(date: string, practiced: boolean) {
  await getSQL()`
    INSERT INTO quant_progress (date, practiced)
    VALUES (${date}, ${practiced})
    ON CONFLICT (date) DO UPDATE SET practiced = EXCLUDED.practiced
  `;
}

// Postgres DATE columns can arrive as a Date or as a string.
function toKey(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).slice(0, 10);
}
