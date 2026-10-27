"use server";

import { redirect } from "next/navigation";
import {
  checkPassphrase,
  endOwnerSession,
  isOwner,
  startOwnerSession,
} from "@/lib/auth";
import { saveQuantDay, saveVerbalDay } from "@/lib/gre/db";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

async function assertOwner(date: string) {
  if (!(await isOwner())) throw new Error("Not signed in");
  if (!DAY.test(date)) throw new Error("Not a day");
}

export async function setReviewedWords(date: string, wordIds: string[]) {
  await assertOwner(date);
  if (
    !Array.isArray(wordIds) ||
    !wordIds.every((id) => typeof id === "string")
  ) {
    throw new Error("Not a word list");
  }
  await saveVerbalDay(date, wordIds);
}

export async function setQuantPracticed(date: string, practiced: boolean) {
  await assertOwner(date);
  await saveQuantDay(date, practiced === true);
}

export async function signIn(_previous: string | null, form: FormData) {
  const input = form.get("passphrase");
  if (typeof input !== "string" || !checkPassphrase(input)) {
    // A pause on every miss makes guessing slow.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return "That passphrase is not right.";
  }
  await startOwnerSession();
  redirect("/gre");
}

export async function signOut() {
  await endOwnerSession();
  redirect("/");
}
