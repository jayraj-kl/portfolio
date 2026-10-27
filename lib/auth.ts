import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// One owner, one passphrase. The session cookie is an expiry signed with the
// passphrase, so changing OWNER_PASSPHRASE signs every session out.
const COOKIE = "owner-session";
const MAX_AGE = 60 * 60 * 24 * 90;

function passphrase(): string | null {
  return process.env.OWNER_PASSPHRASE || null;
}

function sign(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

function sameText(a: string, b: string): boolean {
  // Hashing first gives equal lengths, which timingSafeEqual needs.
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

export function checkPassphrase(input: string): boolean {
  const key = passphrase();
  return key !== null && sameText(input, key);
}

export async function isOwner(): Promise<boolean> {
  const key = passphrase();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!key || !token) return false;
  const [expires, mac] = token.split(".");
  return (
    Number(expires) > Date.now() && !!mac && sameText(mac, sign(expires, key))
  );
}

export async function startOwnerSession() {
  const key = passphrase();
  if (!key) throw new Error("OWNER_PASSPHRASE is not set");
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endOwnerSession() {
  (await cookies()).delete(COOKIE);
}
