"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseOutline } from "@/lib/learn/outline-parser";
import {
  localStudyLibraryStorage,
  type StudyLibraryStorage,
} from "@/lib/learn/storage";
import { descendantIds } from "@/lib/learn/tree";
import type { StudyLibrary, StudyMap, Topic } from "@/lib/learn/types";

export type TopicPatch = Partial<
  Pick<Topic, "title" | "status" | "notes" | "links">
>;

export function useStudyLibrary(
  storage: StudyLibraryStorage = localStudyLibraryStorage,
) {
  const [library, setLibrary] = useState<StudyLibrary | null>(null);

  useEffect(() => {
    let cancelled = false;
    storage.load().then((loaded) => {
      if (!cancelled) setLibrary(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const update = useCallback(
    (change: (current: StudyLibrary) => StudyLibrary) => {
      setLibrary((current) => {
        if (!current) return current;
        const next = change(current);
        void storage.save(next);
        return next;
      });
    },
    [storage],
  );

  // Topic ids are unique across maps, so a topic id is enough to find its map.
  const updateMapOf = useCallback(
    (topicId: string, change: (map: StudyMap) => StudyMap) => {
      update((current) => ({
        maps: current.maps.map((map) =>
          map.topics.some((topic) => topic.id === topicId) ? change(map) : map,
        ),
      }));
    },
    [update],
  );

  const actions = useMemo(
    () => ({
      patchTopic(id: string, patch: TopicPatch) {
        updateMapOf(id, (map) => ({
          ...map,
          topics: map.topics.map((topic) =>
            topic.id === id ? { ...topic, ...patch } : topic,
          ),
        }));
      },

      addTopic(parentId: string, title = "New topic") {
        const id = crypto.randomUUID();
        updateMapOf(parentId, (map) => ({
          ...map,
          topics: [
            ...map.topics,
            { id, parentId, title, status: "todo", notes: "", links: [] },
          ],
        }));
        return id;
      },

      addOutline(parentId: string, text: string) {
        const topics = parseOutline(text, parentId);
        if (topics.length > 0) {
          updateMapOf(parentId, (map) => ({
            ...map,
            topics: [...map.topics, ...topics],
          }));
        }
        return topics.length;
      },

      removeTopic(id: string) {
        updateMapOf(id, (map) => {
          const removed = descendantIds(map, id);
          return {
            ...map,
            topics: map.topics.filter((topic) => !removed.has(topic.id)),
          };
        });
      },

      // A new map starts as a single centre topic, whose id doubles as the map id.
      addMap(title = "New map") {
        const id = crypto.randomUUID();
        update((current) => ({
          maps: [
            ...current.maps,
            {
              id,
              topics: [
                {
                  id,
                  parentId: null,
                  title,
                  status: "todo",
                  notes: "",
                  links: [],
                },
              ],
            },
          ],
        }));
        return id;
      },

      removeMap(mapId: string) {
        update((current) =>
          current.maps.length > 1
            ? { maps: current.maps.filter((map) => map.id !== mapId) }
            : current,
        );
      },

      async reset() {
        setLibrary(await storage.reset());
      },
    }),
    [storage, update, updateMapOf],
  );

  return { library, actions };
}

export type StudyLibraryActions = ReturnType<typeof useStudyLibrary>["actions"];
