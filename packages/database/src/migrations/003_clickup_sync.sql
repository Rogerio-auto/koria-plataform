-- KorIA ClickUp Sync — Migration
-- Creates the clickup_sync table for bidirectional pipeline-ClickUp mapping

CREATE TABLE IF NOT EXISTS core.clickup_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  pipeline_id UUID NOT NULL UNIQUE REFERENCES core.pipelines(id) ON DELETE CASCADE,
  clickup_type TEXT NOT NULL DEFAULT 'space',
  clickup_entity_id TEXT NOT NULL,
  clickup_team_id TEXT,
  clickup_webhook_id TEXT,
  status_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clickup_sync_tenant ON core.clickup_sync(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_pipeline ON core.clickup_sync(pipeline_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION core.trg_clickup_sync_updated()
RETURNS trigger AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clickup_sync_updated ON core.clickup_sync;
CREATE TRIGGER trg_clickup_sync_updated BEFORE UPDATE ON core.clickup_sync
  FOR EACH ROW EXECUTE FUNCTION core.trg_clickup_sync_updated();
