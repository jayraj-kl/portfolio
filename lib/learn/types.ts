export type Status = "todo" | "doing" | "done";

export type TopicLink = { label: string; url: string };

// Topics are stored flat with a parentId so they map one-to-one onto database rows later.
export type Topic = {
  id: string;
  parentId: string | null;
  title: string;
  status: Status;
  notes: string;
  links: TopicLink[];
};

export type StudyMap = {
  id: string;
  topics: Topic[];
};

export type Progress = { done: number; total: number; status: Status };
