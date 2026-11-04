import { neon } from "@neondatabase/serverless";
import type {
  Status,
  StudyLibrary,
  StudyMap,
  Topic,
  TopicLink,
  TopicPatch,
} from "./types";

// The study maps share the GRE tracker's Neon database. The tables are in schema.sql.
function getSQL() {
  const url = process.env.GRE_DATABASE_URL;
  if (!url) throw new Error("GRE_DATABASE_URL is not set");
  return neon(url);
}

type TopicRow = {
  id: string;
  map_id: string;
  parent_id: string | null;
  title: string;
  status: Status;
  notes: string;
  links: TopicLink[];
};

// Returns null while the database holds no maps yet, so the first visit can fill it.
export async function getLibrary(): Promise<StudyLibrary | null> {
  const sql = getSQL();
  const [mapRows, topicRows] = await Promise.all([
    sql`SELECT id FROM study_maps ORDER BY position`,
    sql`
      SELECT id, map_id, parent_id, title, status, notes, links
      FROM study_topics
      ORDER BY position
    `,
  ]);
  if (mapRows.length === 0) return null;

  const maps = new Map<string, StudyMap>();
  for (const row of mapRows) maps.set(row.id, { id: row.id, topics: [] });
  for (const row of topicRows as TopicRow[]) {
    maps.get(row.map_id)?.topics.push({
      id: row.id,
      parentId: row.parent_id,
      title: row.title,
      status: row.status,
      notes: row.notes,
      links: row.links,
    });
  }
  return { maps: [...maps.values()] };
}

// Writes a whole library, but only into an empty database. Returns what is stored afterwards.
export async function importLibrary(
  library: StudyLibrary,
): Promise<StudyLibrary> {
  const existing = await getLibrary();
  if (existing) return existing;

  const sql = getSQL();
  const topics = library.maps.flatMap((map) =>
    map.topics.map((topic) => ({ ...topic, mapId: map.id })),
  );
  await sql.transaction([
    sql`
      INSERT INTO study_maps (id)
      SELECT value FROM jsonb_array_elements_text(${JSON.stringify(library.maps.map((map) => map.id))}::jsonb)
        WITH ORDINALITY AS m(value, ord)
      ORDER BY ord
      ON CONFLICT (id) DO NOTHING
    `,
    insertTopicsQuery(sql, topics),
  ]);
  return (await getLibrary()) ?? library;
}

export async function insertTopics(mapId: string, topics: Topic[]) {
  const sql = getSQL();
  await insertTopicsQuery(
    sql,
    topics.map((topic) => ({ ...topic, mapId })),
  );
}

// Inserting in array order keeps each topic's position in step with the order on the map.
function insertTopicsQuery(
  sql: ReturnType<typeof getSQL>,
  topics: (Topic & { mapId: string })[],
) {
  return sql`
    INSERT INTO study_topics (id, map_id, parent_id, title, status, notes, links)
    SELECT t->>'id', t->>'mapId', t->>'parentId', t->>'title', t->>'status', t->>'notes', t->'links'
    FROM jsonb_array_elements(${JSON.stringify(topics)}::jsonb) WITH ORDINALITY AS a(t, ord)
    ORDER BY ord
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function updateTopic(id: string, patch: TopicPatch) {
  await getSQL()`
    UPDATE study_topics SET
      title = COALESCE(${patch.title ?? null}, title),
      status = COALESCE(${patch.status ?? null}, status),
      notes = COALESCE(${patch.notes ?? null}, notes),
      links = COALESCE(${patch.links ? JSON.stringify(patch.links) : null}::jsonb, links),
      updated_at = now()
    WHERE id = ${id}
  `;
}

// Its subtopics go with it, through the parent_id cascade.
export async function deleteTopic(id: string) {
  await getSQL()`DELETE FROM study_topics WHERE id = ${id} AND parent_id IS NOT NULL`;
}

export async function createMap(root: Topic) {
  const sql = getSQL();
  await sql.transaction([
    sql`INSERT INTO study_maps (id) VALUES (${root.id}) ON CONFLICT (id) DO NOTHING`,
    insertTopicsQuery(sql, [{ ...root, parentId: null, mapId: root.id }]),
  ]);
}

// The last map always stays, matching the page, which never offers to delete it.
export async function deleteMap(id: string) {
  await getSQL()`
    DELETE FROM study_maps
    WHERE id = ${id} AND (SELECT count(*) FROM study_maps) > 1
  `;
}
