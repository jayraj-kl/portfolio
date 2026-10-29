"use server";

import { saveQuantDay, saveVerbalDay } from "@/lib/gre/db";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function assertDay(date: string) {
  if (!DAY.test(date)) throw new Error("Not a day");
}

export async function setReviewedWords(date: string, wordIds: string[]) {
  assertDay(date);
  if (
    !Array.isArray(wordIds) ||
    !wordIds.every((id) => typeof id === "string")
  ) {
    throw new Error("Not a word list");
  }
  await saveVerbalDay(date, wordIds);
}

export async function setQuantPracticed(date: string, practiced: boolean) {
  assertDay(date);
  await saveQuantDay(date, practiced === true);
}
