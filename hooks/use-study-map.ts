"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as server from "@/app/learn/actions";
import { parseOutline } from "@/lib/learn/outline-parser";
import { readBrowserLibrary } from "@/lib/learn/storage";
import { descendantIds } from "@/lib/learn/tree";
import type {
  StudyLibrary,
  StudyMap,
  Topic,
  TopicPatch,
} from "@/lib/learn/types";

export type { TopicPatch };

// Typing in a title or notes is saved once the typing pauses.
const TYPING_DELAY = 600;

// Edits show at once and are saved to the database in the order they were made.
export function useStudyLibrary(initial: StudyLibrary | null) {
  const [library, setLibrary] = useState<StudyLibrary | null>(initial);
  const [saveFailed, setSaveFailed] = useState(false);
  const current = useRef(initial);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef(new Map<string, TopicPatch>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const enqueue = useCallback((write: () => Promise<unknown>) => {
    queue.current = queue.current.then(write).catch((error: unknown) => {
      console.error("Could not save the study maps", error);
      setSaveFailed(true);
    });
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    for (const [id, patch] of pending.current) {
      enqueue(() => server.patchTopic(id, patch));
    }
    pending.current.clear();
  }, [enqueue]);

  // A structural change waits for any typing before it, so writes keep their order.
  const write = useCallback(
    (run: () => Promise<unknown>) => {
      flush();
      enqueue(run);
    },
    [enqueue, flush],
  );

  // An empty database is filled once, from this browser's old maps or the samples.
  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    server
      .importStudyLibrary(readBrowserLibrary())
      .then((loaded) => {
        if (cancelled) return;
        current.current = loaded;
        setLibrary(loaded);
      })
      .catch((error: unknown) => {
        console.error("Could not load the study maps", error);
        setSaveFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  // Save unsent typing when the tab is hidden or closed, and when leaving the page.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  const apply = useCallback(
    (change: (library: StudyLibrary) => StudyLibrary) => {
      if (!current.current) return;
      current.current = change(current.current);
      setLibrary(current.current);
    },
    [],
  );

  // Topic ids are unique across maps, so a topic id is enough to find its map.
  const mapOf = useCallback(
    (topicId: string): StudyMap | undefined =>
      current.current?.maps.find((map) =>
        map.topics.some((topic) => topic.id === topicId),
      ),
    [],
  );

  const changeMap = useCallback(
    (mapId: string, change: (map: StudyMap) => StudyMap) => {
      apply((library) => ({
        maps: library.maps.map((map) => (map.id === mapId ? change(map) : map)),
      }));
    },
    [apply],
  );

  const addTopics = useCallback(
    (parentId: string, topics: Topic[]) => {
      const map = mapOf(parentId);
      if (!map) return;
      changeMap(map.id, (map) => ({
        ...map,
        topics: [...map.topics, ...topics],
      }));
      write(() => server.addTopics(map.id, topics));
    },
    [changeMap, mapOf, write],
  );

  const actions = useMemo(
    () => ({
      patchTopic(id: string, patch: TopicPatch) {
        const map = mapOf(id);
        if (!map) return;
        changeMap(map.id, (map) => ({
          ...map,
          topics: map.topics.map((topic) =>
            topic.id === id ? { ...topic, ...patch } : topic,
          ),
        }));
        pending.current.set(id, { ...pending.current.get(id), ...patch });
        clearTimeout(timer.current);
        const typing = patch.title !== undefined || patch.notes !== undefined;
        if (typing) timer.current = setTimeout(flush, TYPING_DELAY);
        else flush();
      },

      addTopic(parentId: string, title = "New topic") {
        const topic: Topic = {
          id: crypto.randomUUID(),
          parentId,
          title,
          status: "todo",
          notes: "",
          links: [],
        };
        addTopics(parentId, [topic]);
        return topic.id;
      },

      addOutline(parentId: string, text: string) {
        const topics = parseOutline(text, parentId);
        if (topics.length > 0) addTopics(parentId, topics);
        return topics.length;
      },

      removeTopic(id: string) {
        const map = mapOf(id);
        if (!map) return;
        const removed = descendantIds(map, id);
        for (const topicId of removed) pending.current.delete(topicId);
        changeMap(map.id, (map) => ({
          ...map,
          topics: map.topics.filter((topic) => !removed.has(topic.id)),
        }));
        write(() => server.removeTopic(id));
      },

      // A new map starts as a single centre topic, whose id doubles as the map id.
      addMap(title = "New map") {
        const id = crypto.randomUUID();
        const root: Topic = {
          id,
          parentId: null,
          title,
          status: "todo",
          notes: "",
          links: [],
        };
        apply((library) => ({
          maps: [...library.maps, { id, topics: [root] }],
        }));
        write(() => server.addMap(root));
        return id;
      },

      removeMap(mapId: string) {
        const library = current.current;
        if (!library || library.maps.length <= 1) return;
        const map = library.maps.find((map) => map.id === mapId);
        for (const topic of map?.topics ?? []) {
          pending.current.delete(topic.id);
        }
        apply((library) => ({
          maps: library.maps.filter((map) => map.id !== mapId),
        }));
        write(() => server.removeMap(mapId));
      },
    }),
    [addTopics, apply, changeMap, flush, mapOf, write],
  );

  return { library, actions, saveFailed };
}

export type StudyLibraryActions = ReturnType<typeof useStudyLibrary>["actions"];
