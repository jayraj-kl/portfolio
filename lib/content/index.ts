import { ACTIVE_PROFILE } from "./config";
import { RESEARCH } from "./research";
import { SDE } from "./sde";
import { SHARED, logoFor } from "./shared";
import type { ContentSet, Profile } from "./types";

export { ACTIVE_PROFILE, SHARED, logoFor };
export type * from "./types";

const SETS: Record<Profile, ContentSet> = { sde: SDE, research: RESEARCH };

export const PROFILES = Object.keys(SETS) as Profile[];

export const isProfile = (s: string): s is Profile => s in SETS;

// "/" follows config.ts; /sde and /research show either set.
export function getContent(profile: Profile = ACTIVE_PROFILE) {
  return { content: SETS[profile], shared: SHARED };
}
