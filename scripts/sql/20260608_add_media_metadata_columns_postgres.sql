-- Media metadata columns for Phase B gray rollout (PostgreSQL)
-- Safe to run multiple times because of IF NOT EXISTS guards.

ALTER TABLE IF EXISTS media
  ADD COLUMN IF NOT EXISTS storage_env TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id TEXT,
  ADD COLUMN IF NOT EXISTS storage_version INTEGER,
  ADD COLUMN IF NOT EXISTS storage_key_original TEXT,
  ADD COLUMN IF NOT EXISTS storage_key_thumb TEXT,
  ADD COLUMN IF NOT EXISTS storage_key_card TEXT,
  ADD COLUMN IF NOT EXISTS storage_key_hero TEXT;

ALTER TABLE IF EXISTS media
  ALTER COLUMN storage_version SET DEFAULT 2;

CREATE INDEX IF NOT EXISTS media_entity_type_idx ON media (entity_type);
CREATE INDEX IF NOT EXISTS media_entity_id_idx ON media (entity_id);
CREATE INDEX IF NOT EXISTS media_storage_env_idx ON media (storage_env);
