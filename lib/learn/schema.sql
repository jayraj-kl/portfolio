-- Study maps for /learn. They live in the same Neon database as /gre (GRE_DATABASE_URL).
-- Safe to run again: every statement is a no-op once the tables exist.

CREATE TABLE IF NOT EXISTS study_maps (
  id text PRIMARY KEY,
  -- Keeps the maps in the order they were added.
  position bigint GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A map's centre topic shares the map's id.
CREATE TABLE IF NOT EXISTS study_topics (
  id text PRIMARY KEY,
  map_id text NOT NULL REFERENCES study_maps (id) ON DELETE CASCADE,
  -- Deleting a topic deletes its whole branch.
  parent_id text REFERENCES study_topics (id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  notes text NOT NULL DEFAULT '',
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Keeps siblings in the order they were added, which the layout relies on.
  position bigint GENERATED ALWAYS AS IDENTITY,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_topics_map_id_idx ON study_topics (map_id);
