"use server";

import {
  createMap,
  deleteMap,
  deleteTopic,
  importLibrary,
  insertTopics,
  updateTopic,
} from "@/lib/learn/db";
import { createSeedLibrary } from "@/lib/learn/seed";
import type {
  StudyLibrary,
  StudyMap,
  Topic,
  TopicLink,
  TopicPatch,
} from "@/lib/learn/types";

// Anyone with the address can edit, so every write checks the shape of what it is given.
const STATUSES = new Set(["todo", "doing", "done"]);

const isText = (value: unknown): value is string => typeof value === "string";

function isLinks(value: unknown): value is TopicLink[] {
  return (
    Array.isArray(value) &&
    value.every((link) => isText(link?.label) && isText(link?.url))
  );
}

function isTopic(value: unknown): value is Topic {
  const topic = value as Topic;
  return (
    typeof value === "object" &&
    value !== null &&
    isText(topic.id) &&
    topic.id.length > 0 &&
    (topic.parentId === null || isText(topic.parentId)) &&
    isText(topic.title) &&
    STATUSES.has(topic.status) &&
    isText(topic.notes) &&
    isLinks(topic.links)
  );
}

// Keeps only the fields a topic has, so nothing extra reaches the database.
const cleanTopic = (topic: Topic): Topic => ({
  id: topic.id,
  parentId: topic.parentId,
  title: topic.title,
  status: topic.status,
  notes: topic.notes,
  links: topic.links.map(({ label, url }) => ({ label, url })),
});

function assertId(id: unknown): asserts id is string {
  if (!isText(id) || id.length === 0) throw new Error("Not an id");
}

function assertTopics(topics: unknown): asserts topics is Topic[] {
  if (!Array.isArray(topics) || !topics.every(isTopic)) {
    throw new Error("Not a topic list");
  }
}

function isMap(value: unknown): value is StudyMap {
  const map = value as StudyMap;
  return (
    typeof value === "object" &&
    value !== null &&
    isText(map.id) &&
    Array.isArray(map.topics) &&
    map.topics.every(isTopic) &&
    map.topics.some((topic) => topic.id === map.id && topic.parentId === null)
  );
}

// Fills an empty database with the maps kept in this browser, or the sample maps when there are none.
export async function importStudyLibrary(
  fromBrowser: StudyLibrary | null,
): Promise<StudyLibrary> {
  const usable =
    fromBrowser !== null &&
    Array.isArray(fromBrowser.maps) &&
    fromBrowser.maps.length > 0 &&
    fromBrowser.maps.every(isMap);
  const library = usable ? fromBrowser : createSeedLibrary();
  return importLibrary({
    maps: library.maps.map((map) => ({
      id: map.id,
      topics: map.topics.map(cleanTopic),
    })),
  });
}

export async function addTopics(mapId: string, topics: Topic[]) {
  assertId(mapId);
  assertTopics(topics);
  if (topics.some((topic) => topic.parentId === null)) {
    throw new Error("A new topic needs a parent");
  }
  await insertTopics(mapId, topics.map(cleanTopic));
}

export async function patchTopic(id: string, patch: TopicPatch) {
  assertId(id);
  const clean: TopicPatch = {};
  if (patch.title !== undefined) {
    if (!isText(patch.title)) throw new Error("Not a title");
    clean.title = patch.title;
  }
  if (patch.status !== undefined) {
    if (!STATUSES.has(patch.status)) throw new Error("Not a status");
    clean.status = patch.status;
  }
  if (patch.notes !== undefined) {
    if (!isText(patch.notes)) throw new Error("Not notes");
    clean.notes = patch.notes;
  }
  if (patch.links !== undefined) {
    if (!isLinks(patch.links)) throw new Error("Not a link list");
    clean.links = patch.links.map(({ label, url }) => ({ label, url }));
  }
  await updateTopic(id, clean);
}

export async function removeTopic(id: string) {
  assertId(id);
  await deleteTopic(id);
}

export async function addMap(root: Topic) {
  if (!isTopic(root) || root.parentId !== null) throw new Error("Not a map");
  await createMap(cleanTopic(root));
}

export async function removeMap(id: string) {
  assertId(id);
  await deleteMap(id);
}
