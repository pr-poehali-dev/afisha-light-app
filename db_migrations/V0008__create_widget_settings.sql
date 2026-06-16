CREATE TABLE IF NOT EXISTS t_p8923173_afisha_light_app.widget_settings (
    id SERIAL PRIMARY KEY,
    vk_group_id BIGINT NOT NULL UNIQUE,
    visibility VARCHAR(20) NOT NULL DEFAULT 'all'
        CHECK (visibility IN ('all', 'members', 'admin')),
    updated_at TIMESTAMP DEFAULT NOW()
);