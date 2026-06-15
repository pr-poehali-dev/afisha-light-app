CREATE TABLE t_p8923173_afisha_light_app.subscribers (
  id           SERIAL PRIMARY KEY,
  vk_group_id  INTEGER NOT NULL DEFAULT 0,
  vk_user_id   BIGINT NOT NULL,
  first_name   TEXT NOT NULL DEFAULT '',
  last_name    TEXT NOT NULL DEFAULT '',
  screen_name  TEXT NOT NULL DEFAULT '',
  photo_url    TEXT NOT NULL DEFAULT '',
  can_write    BOOLEAN NOT NULL DEFAULT TRUE,
  source       TEXT NOT NULL DEFAULT 'scan',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vk_group_id, vk_user_id)
);

CREATE TABLE t_p8923173_afisha_light_app.mailings (
  id           SERIAL PRIMARY KEY,
  vk_group_id  INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft',
  sent_count   INTEGER NOT NULL DEFAULT 0,
  error_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at      TIMESTAMPTZ NULL
);
