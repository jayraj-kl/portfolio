import type { Phase, ScheduleBlock } from "@/lib/gre/types";

/**
 * Targets Q169 + V161 = 330 from a 317 baseline (Q164 / V153).
 *
 * Invariants held across all 53 days, agreed up front:
 * - 12.5h/day, except the five taper days at ~4.5h
 * - Vocab 2h morning (new) + 1h night (retention). Never moves.
 * - Error log 0.5h from day one, not from some later phase.
 * - Zero quant Sep 5-18. From Sep 26 onward, 90 min/day without exception.
 * - No mock before Sep 26.
 * - New words stop Oct 13; the morning block then becomes a second
 *   retention pass, so vocab still totals 3h.
 *
 * Fixed daily anchors: lunch 2:00-2:45 PM, dinner 9:00-9:45 PM, sleep ~1 AM.
 * The retention block sits straight after dinner so it is the last study of
 * the day. Taper and test days deliberately pull sleep earlier.
 */

/** Anything before the campaign opens. Day zero is real work, not waiting. */
export const SETUP_DAY: ScheduleBlock[] = [
  {
    start: 480,
    activity:
      "Book BOTH test slots — Oct 3 and Oct 27. Highest-leverage hour of the whole campaign.",
    emphasis: true,
  },
  {
    start: 570,
    activity:
      "Source or build the vocab deck — the repo has none, and Sep 5 opens with 36 new words",
    emphasis: true,
  },
  { start: 690, activity: "Break" },
  {
    start: 705,
    activity:
      "Download and launch PowerPrep 1 and 2 — verify they run before you need them",
    emphasis: true,
  },
  { start: 780, activity: "Break" },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity:
      "Build the error-log template: content gap / careless / timing / vocab / no-strategy",
    emphasis: true,
  },
  { start: 975, activity: "Break" },
  {
    start: 990,
    activity: "Skim one TC/SE module to warm up. Nothing heavy.",
    emphasis: true,
  },
  { start: 1050, activity: "Off. Tomorrow the 12.5h days start." },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep — the 7:00 AM start begins tomorrow" },
];

/** Sep 5-18. RC and TC/SE only. No quant at all, by explicit decision. */
export const CONTENT_DAY: ScheduleBlock[] = [
  {
    start: 420,
    activity: "Vocab — 36 new words, encoded in sentence context",
    emphasis: true,
  },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "RC / TC-SE lectures — course content",
    emphasis: true,
  },
  { start: 735, activity: "Break" },
  {
    start: 750,
    activity:
      "RC practice — timed passages, full reasoning review on every answer",
    emphasis: true,
  },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "RC practice — second set, same review discipline",
    emphasis: true,
  },
  { start: 975, activity: "Break" },
  {
    start: 990,
    activity:
      "TC/SE practice — untimed reasoning first, then the same set timed",
    emphasis: true,
  },
  { start: 1170, activity: "Break" },
  {
    start: 1200,
    activity: "Error log — categorize the day's misses",
    emphasis: true,
  },
  { start: 1230, activity: "Free / wind-down" },
  { start: 1260, activity: "Dinner" },
  {
    start: 1305,
    activity: "Vocab retention — gap-to-word direction + spaced review",
    emphasis: true,
  },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** Sep 19-25. Vocab holds its 3h so the spaced-repetition chain never breaks. */
export const QUANT_DAY: ScheduleBlock[] = [
  {
    start: 420,
    activity: "Vocab — 36 new words (the chain does not break for quant week)",
    emphasis: true,
  },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "Quant — content sweep, weakest topics first",
    emphasis: true,
  },
  { start: 735, activity: "Break" },
  {
    start: 750,
    activity: "Quant — timed sets at test pacing",
    emphasis: true,
  },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "Quant — mixed review, weakest topics again",
    emphasis: true,
  },
  { start: 1065, activity: "Break" },
  {
    start: 1080,
    activity: "Quant — DI speed, probability and combinatorics",
    emphasis: true,
  },
  { start: 1170, activity: "Break" },
  {
    start: 1200,
    activity: "Careless-error log — the main mechanism for Q164 to Q169",
    emphasis: true,
  },
  { start: 1230, activity: "Free / wind-down" },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** Mock days: Sep 26, Sep 29, Oct 11, Oct 18. Vocab and quant both still hold. */
export const MOCK_DAY: ScheduleBlock[] = [
  { start: 420, activity: "Vocab — 36 new words", emphasis: true },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "FULL-LENGTH MOCK — real conditions, no pausing, no lookups",
    emphasis: true,
  },
  { start: 735, activity: "Decompress — do NOT start reviewing yet" },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity:
      "Error autopsy — every miss categorized. Review costs as long as the test.",
    emphasis: true,
  },
  { start: 1065, activity: "Break" },
  { start: 1080, activity: "Redo every missed question cold", emphasis: true },
  {
    start: 1170,
    activity: "Quant — 90 min timed sets + careless-error log",
    emphasis: true,
  },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  {
    start: 1365,
    activity: "Error log — set the next days' focus from the miss tally",
    emphasis: true,
  },
  { start: 1395, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** Sep 27-28. The days between the two mocks. */
export const REPAIR_DAY: ScheduleBlock[] = [
  { start: 420, activity: "Vocab — 36 new words", emphasis: true },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "Mock autopsy — work the miss tally, hardest category first",
    emphasis: true,
  },
  { start: 735, activity: "Break" },
  {
    start: 750,
    activity: "Weak-spot drilling on what the mock exposed",
    emphasis: true,
  },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "Weak-spot drilling — second set",
    emphasis: true,
  },
  { start: 975, activity: "Break" },
  { start: 990, activity: "RC + TC/SE practice, timed", emphasis: true },
  { start: 1080, activity: "Break" },
  {
    start: 1095,
    activity: "Quant — 90 min timed sets + careless-error log",
    emphasis: true,
  },
  { start: 1185, activity: "Break" },
  { start: 1200, activity: "Error log", emphasis: true },
  { start: 1230, activity: "Free / wind-down" },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** Sep 30. Mock 2 review, deliberately lighter — attempt #1 is 3 days out. */
export const AUTOPSY_DAY: ScheduleBlock[] = [
  {
    start: 420,
    activity: "Vocab retention — no new words between here and the test",
    emphasis: true,
  },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "Mock 2 autopsy — every miss categorized",
    emphasis: true,
  },
  { start: 735, activity: "Break" },
  { start: 750, activity: "Redo missed questions cold", emphasis: true },
  { start: 810, activity: "Break" },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "Quant — 90 min timed sets + careless-error log",
    emphasis: true,
  },
  { start: 975, activity: "Done early. Rest. Attempt #1 is in 3 days." },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1440, activity: "Sleep — start shifting to test-day timing" },
];

/** Oct 1-2 and Oct 24-26. ~4.5h, and sleep pulled forward for test day. */
export const TAPER_DAY: ScheduleBlock[] = [
  {
    start: 480,
    activity: "Vocab retention — familiar words only, build confidence",
    emphasis: true,
  },
  { start: 570, activity: "Break" },
  {
    start: 585,
    activity: "One easy timed quant set — rhythm, not difficulty",
    emphasis: true,
  },
  { start: 645, activity: "Break" },
  { start: 660, activity: "Light TC/SE set — no new vocab", emphasis: true },
  { start: 720, activity: "Rest" },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "Error-log skim — no new material",
    emphasis: true,
  },
  {
    start: 945,
    activity:
      "Stop. Rest, walk, sleep. Nothing after this point raises the score.",
  },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Wind down — screens off" },
  { start: 1320, activity: "Sleep — early, at your test-day target time" },
];

export const TEST_DAY: ScheduleBlock[] = [
  { start: 360, activity: "Wake, real breakfast, no screens" },
  {
    start: 420,
    activity: "10 easy TC/SE — warm up the machine, nothing new",
    emphasis: true,
  },
  { start: 480, activity: "Travel to the centre. Early." },
  { start: 600, activity: "THE TEST", emphasis: true },
  {
    start: 840,
    activity:
      "Unofficial Q/V shows on screen at the end — log both immediately",
  },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Free — you have earned it" },
  { start: 1440, activity: "Sleep" },
];

/** Oct 4-5. Attempt #1 is the best diagnostic available; mine it. */
export const RECOVER_DAY: ScheduleBlock[] = [
  { start: 480, activity: "Sleep in. You just sat the real thing." },
  { start: 600, activity: "Vocab — 36 new words", emphasis: true },
  { start: 720, activity: "Break" },
  {
    start: 750,
    activity: "Log the unofficial Q/V and every question you remember missing",
    emphasis: true,
  },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity:
      "Rebuild the plan — attempt #1 just told you exactly what is left",
    emphasis: true,
  },
  { start: 975, activity: "Break" },
  {
    start: 990,
    activity: "Quant — 90 min timed sets + careless-error log",
    emphasis: true,
  },
  { start: 1080, activity: "Off. Genuinely off." },
  { start: 1200, activity: "Error log", emphasis: true },
  { start: 1230, activity: "Free / wind-down" },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** Oct 6-23. New words stop Oct 13; the morning block flips to retention. */
export const SURGICAL_DAY: ScheduleBlock[] = [
  {
    start: 420,
    activity: "Vocab — new words through Oct 13, then a second retention pass",
    emphasis: true,
  },
  { start: 540, activity: "Break" },
  {
    start: 555,
    activity: "Weak-spot work drawn straight off the attempt #1 tally",
    emphasis: true,
  },
  { start: 735, activity: "Break" },
  { start: 750, activity: "TC/SE — timed, mixed difficulty", emphasis: true },
  { start: 840, activity: "Lunch" },
  {
    start: 885,
    activity: "TC/SE — second set, harder difficulty",
    emphasis: true,
  },
  { start: 975, activity: "Break" },
  {
    start: 990,
    activity: "RC — timed triage: bank the easy ones, abandon the killer",
    emphasis: true,
  },
  { start: 1080, activity: "Break" },
  {
    start: 1095,
    activity: "Quant — 90 min timed sets + careless-error log",
    emphasis: true,
  },
  { start: 1185, activity: "Break" },
  { start: 1200, activity: "Error log", emphasis: true },
  { start: 1230, activity: "Free / wind-down" },
  { start: 1260, activity: "Dinner" },
  { start: 1305, activity: "Vocab retention — gap-to-word", emphasis: true },
  { start: 1365, activity: "Free / wind-down" },
  { start: 1500, activity: "Sleep" },
];

/** After Oct 27. Nothing left to schedule. */
export const DONE_DAY: ScheduleBlock[] = [
  {
    start: 600,
    activity:
      "Both attempts done. Official scores arrive 8-10 days after each.",
  },
  {
    start: 720,
    activity: "Send the better score. ScoreSelect lets you choose.",
  },
];

export const PHASES: Phase[] = [
  {
    id: "setup",
    name: "Setup",
    start: "2000-01-01",
    end: "2026-09-04",
    focus:
      "Day zero. Book both slots and build the vocab deck — Sep 5 opens with 36 new words.",
    blocks: SETUP_DAY,
  },
  {
    id: "content",
    name: "RC + TC/SE content",
    start: "2026-09-05",
    end: "2026-09-18",
    focus:
      "3h lecture / 6h practice / 3h vocab / 0.5h error log. No quant for 14 days.",
    blocks: CONTENT_DAY,
  },
  {
    id: "quant",
    name: "Quant intensive",
    start: "2026-09-19",
    end: "2026-09-25",
    focus:
      "9h quant / 3h vocab / 0.5h error log. The vocab chain does not break here.",
    blocks: QUANT_DAY,
  },
  {
    id: "mocks",
    name: "Mocks + repair",
    start: "2026-09-26",
    end: "2026-09-29",
    focus:
      "First objective read on your level. Quant maintenance starts today and never stops.",
    blocks: REPAIR_DAY,
  },
  {
    id: "autopsy",
    name: "Mock 2 autopsy",
    start: "2026-09-30",
    end: "2026-09-30",
    focus: "Lighter by design. Attempt #1 is 3 days out.",
    blocks: AUTOPSY_DAY,
  },
  {
    id: "taper",
    name: "Taper",
    start: "2026-10-01",
    end: "2026-10-02",
    focus: "~4.5h. Arrive sharp. No new material.",
    blocks: TAPER_DAY,
  },
  {
    id: "test",
    name: "Attempt #1",
    start: "2026-10-03",
    end: "2026-10-03",
    focus:
      "A real attempt, fully tapered. ScoreSelect means a weak day costs nothing.",
    blocks: TEST_DAY,
  },
  {
    id: "recover",
    name: "Recalibrate",
    start: "2026-10-04",
    end: "2026-10-05",
    focus: "Attempt #1 is the best diagnostic you will ever get. Mine it.",
    blocks: RECOVER_DAY,
  },
  {
    id: "surgical",
    name: "Surgical",
    start: "2026-10-06",
    end: "2026-10-23",
    focus: "Attack only what attempt #1 exposed. New vocab stops Oct 13.",
    blocks: SURGICAL_DAY,
  },
  {
    id: "taper",
    name: "Taper",
    start: "2026-10-24",
    end: "2026-10-26",
    focus: "Last 3 days. Sleep is worth more than any drill now.",
    blocks: TAPER_DAY,
  },
  {
    id: "test",
    name: "Attempt #2",
    start: "2026-10-27",
    end: "2026-10-27",
    focus:
      "21-day rule satisfied (Oct 3 + 21 = Oct 24). Send whichever score is better.",
    blocks: TEST_DAY,
  },
];

/** Mock days override the phase template. ETS verbal scoring is the only accurate one. */
export const MOCK_DAYS: Record<string, string> = {
  "2026-09-26":
    "PowerPrep 1 (ETS, free) — your first objective read since the 317",
  "2026-09-29": "PowerPrep 2 (ETS, free) — 4 days out from attempt #1",
  "2026-10-11": "PowerPrep Plus 1 (ETS, paid)",
  "2026-10-18": "PowerPrep Plus 2 (ETS, paid) — 9 days out from attempt #2",
};

export const TEST_DATES = ["2026-10-03", "2026-10-27"];

/** The campaign opens here; anything earlier resolves to the Setup phase. */
export const CAMPAIGN_START = "2026-09-05";
