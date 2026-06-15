
CREATE TABLE t_p8923173_afisha_light_app.events (
  id          SERIAL PRIMARY KEY,
  vk_group_id INTEGER NOT NULL DEFAULT 0,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Концерт',
  description TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT '',
  address     TEXT NOT NULL DEFAULT '',
  place       TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  age         TEXT NOT NULL DEFAULT '0+',
  is_free     BOOLEAN NOT NULL DEFAULT false,
  price       INTEGER NOT NULL DEFAULT 0,
  online      BOOLEAN NOT NULL DEFAULT false,
  is_past     BOOLEAN NOT NULL DEFAULT false,
  private     SMALLINT NOT NULL DEFAULT 0,
  dates       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON t_p8923173_afisha_light_app.events (vk_group_id, is_past);
