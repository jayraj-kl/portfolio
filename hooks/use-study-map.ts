"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseOutline } from "@/lib/learn/outline-parser";
import {
  localStudyMapStorage,
  type StudyMapStorage,
} from "@/lib/learn/storage";
import { descendantIds } from "@/lib/learn/tree";
import type { StudyMap, Topic } from "@/lib/learn/types";

export type TopicPatch = Partial<
  Pick<Topic, "title" | "status" | "notes" | "links">
>;

export function useStudyMap(storage: StudyMapStorage = localStudyMapStorage) {
  const [map, setMap] = useState<StudyMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    storage.load().then((loaded) => {
      if (!cancelled) setMap(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const update = useCallback(
    (change: (current: StudyMap) => StudyMap) => {
      setMap((current) => {
        if (!current) return current;
        const next = change(current);
        void storage.save(next);
        return next;
      });
    },
    [storage],
  );

  const actions = useMemo(
    () => ({
      patchTopic(id: string, patch: TopicPatch) {
        update((current) => ({
          ...current,
          topics: current.topics.map((topic) =>
            topic.id === id ? { ...topic, ...patch } : topic,
          ),
        }));
      },

      addTopic(parentId: string, title = "New topic") {
        const id = crypto.randomUUID();
        update((current) => ({
          ...current,
          topics: [
            ...current.topics,
            { id, parentId, title, status: "todo", notes: "", links: [] },
          ],
        }));
        return id;
      },

      addOutline(parentId: string, text: string) {
        const topics = parseOutline(text, parentId);
        if (topics.length > 0) {
          update((current) => ({
            ...current,
            topics: [...current.topics, ...topics],
          }));
        }
        return topics.length;
      },

      removeTopic(id: string) {
        update((current) => {
          const removed = descendantIds(current, id);
          return {
            ...current,
            topics: current.topics.filter((topic) => !removed.has(topic.id)),
          };
        });
      },

      async reset() {
        setMap(await storage.reset());
      },
    }),
    [storage, update],
  );

  return { map, actions };
}

export type StudyMapActions = ReturnType<typeof useStudyMap>["actions"];
