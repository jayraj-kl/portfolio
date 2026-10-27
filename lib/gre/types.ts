export interface Word {
  id: string;
  word: string;
  sentence: string;
  // The two clauses the transition word links, underlined in the sentence.
  idea1: string;
  idea2: string;
}

export type TextCompletionCategory =
  | "supportWords"
  | "supportPunctuation"
  | "contrastWords"
  | "supportPhrases"
  | "contrastPhrases"
  | "lessObviousSupportWords"
  | "lessObviousContrastWords"
  | "noLogicChange"
  | "negationWords";

export interface VerbalData {
  textCompletion: Record<TextCompletionCategory, Word[]>;
}

export interface ProgressData {
  // YYYY-MM-DD → the IDs of the words reviewed that day.
  verbal: Record<string, string[]>;
  // YYYY-MM-DD → whether quant was practised that day.
  quant: Record<string, boolean>;
}

export type Tab = "dashboard" | "verbal" | "quant";

export type VerbalTab = "text-completion" | "sentence-equivalence";

export interface ScheduleBlock {
  // Minutes since midnight when the block begins.
  start: number;
  activity: string;
  // True for blocks that are actual study time.
  emphasis?: boolean;
}

export type PhaseId =
  | "setup"
  | "content"
  | "quant"
  | "mocks"
  | "autopsy"
  | "recover"
  | "surgical"
  | "taper"
  | "test";

// A date-ranged stretch of the campaign with its own daily template.
export interface Phase {
  id: PhaseId;
  name: string;
  // Inclusive YYYY-MM-DD.
  start: string;
  // Inclusive YYYY-MM-DD.
  end: string;
  focus: string;
  blocks: ScheduleBlock[];
}
