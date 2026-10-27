import type { Tab, TextCompletionCategory, VerbalTab } from "./types";

export const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "verbal", label: "Verbal" },
  { id: "quant", label: "Quant" },
];

export const VERBAL_TABS: { id: VerbalTab; label: string }[] = [
  { id: "text-completion", label: "Text Completion" },
  { id: "sentence-equivalence", label: "Sentence Equivalence" },
];

export const TC_CATEGORIES: { key: TextCompletionCategory; label: string }[] = [
  { key: "supportWords", label: "Support Words" },
  { key: "supportPunctuation", label: "Support Punctuation" },
  { key: "contrastWords", label: "Contrast Words" },
  { key: "supportPhrases", label: "Support Phrases" },
  { key: "contrastPhrases", label: "Contrast Phrases" },
  { key: "lessObviousSupportWords", label: "Less Obvious Support" },
  { key: "lessObviousContrastWords", label: "Less Obvious Contrast" },
  { key: "noLogicChange", label: "Words that DON'T change the logic" },
  { key: "negationWords", label: "Words that mean 'not' or 'no'" },
];

// Heatmap rows run Sunday to Saturday; every other row is labelled.
export const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
