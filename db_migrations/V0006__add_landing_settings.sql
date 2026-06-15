CREATE TABLE t_p8923173_afisha_light_app.landing_settings (
  id              SERIAL PRIMARY KEY,
  vk_group_id     INTEGER NOT NULL UNIQUE,
  site_title      TEXT NOT NULL DEFAULT '',
  site_desc       TEXT NOT NULL DEFAULT '',
  accent_color    TEXT NOT NULL DEFAULT '#7C3AED',
  bg_color        TEXT NOT NULL DEFAULT '#F5F5F7',
  logo_url        TEXT NOT NULL DEFAULT '',
  show_past       BOOLEAN NOT NULL DEFAULT FALSE,
  show_price      BOOLEAN NOT NULL DEFAULT TRUE,
  show_vk_button  BOOLEAN NOT NULL DEFAULT TRUE,
  vk_button_text  TEXT NOT NULL DEFAULT 'Открыть в VK',
  events_count    INTEGER NOT NULL DEFAULT 10,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
