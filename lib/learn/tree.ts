import type { Progress, Status, StudyMap, Topic } from "./types";

export type ChildIndex = Map<string | null, Topic[]>;

export function indexChildren(map: StudyMap): ChildIndex {
  const index: ChildIndex = new Map();
  for (const topic of map.topics) {
    const siblings = index.get(topic.parentId);
    if (siblings) siblings.push(topic);
    else index.set(topic.parentId, [topic]);
  }
  return index;
}

export function getRoot(map: StudyMap): Topic {
  const root = map.topics.find((topic) => topic.parentId === null);
  if (!root) throw new Error("Study map has no root topic");
  return root;
}

// A topic with subtopics takes its status from them, so the two can never disagree.
export function computeProgress(map: StudyMap): Map<string, Progress> {
  const children = indexChildren(map);
  const result = new Map<string, Progress>();

  const visit = (topic: Topic): Progress => {
    const kids = children.get(topic.id) ?? [];
    let progress: Progress;
    if (kids.length === 0) {
      progress = {
        done: topic.status === "done" ? 1 : 0,
        total: 1,
        status: topic.status,
      };
    } else {
      let done = 0;
      let total = 0;
      let started = false;
      for (const kid of kids) {
        const p = visit(kid);
        done += p.done;
        total += p.total;
        if (p.status !== "todo") started = true;
      }
      const status: Status =
        done === total ? "done" : started ? "doing" : "todo";
      progress = { done, total, status };
    }
    result.set(topic.id, progress);
    return progress;
  };

  visit(getRoot(map));
  return result;
}

export function depthOf(map: StudyMap): Map<string, number> {
  const children = indexChildren(map);
  const depths = new Map<string, number>();
  const visit = (topic: Topic, depth: number) => {
    depths.set(topic.id, depth);
    for (const kid of children.get(topic.id) ?? []) visit(kid, depth + 1);
  };
  visit(getRoot(map), 0);
  return depths;
}

export function descendantIds(map: StudyMap, id: string): Set<string> {
  const children = indexChildren(map);
  const ids = new Set<string>();
  const visit = (topicId: string) => {
    ids.add(topicId);
    for (const kid of children.get(topicId) ?? []) visit(kid.id);
  };
  visit(id);
  return ids;
}

// Branches deeper than the second ring start closed so the map stays readable.
export function defaultCollapsed(map: StudyMap): Set<string> {
  const children = indexChildren(map);
  const depths = depthOf(map);
  const collapsed = new Set<string>();
  for (const topic of map.topics) {
    if ((depths.get(topic.id) ?? 0) >= 2 && children.has(topic.id)) {
      collapsed.add(topic.id);
    }
  }
  return collapsed;
}

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To study",
  doing: "In progress",
  done: "Studied",
};

export const STATUS_ORDER: Status[] = ["todo", "doing", "done"];

export function nextStatus(status: Status): Status {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
}
