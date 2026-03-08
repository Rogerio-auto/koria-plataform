-- KorIA Integration Tokens — Migration
-- Persists OAuth tokens for external integrations (ClickUp, etc.)

CREATE TABLE IF NOT EXISTS core.integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION core.trg_integration_tokens_updated()
RETURNS trigger AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_integration_tokens_updated ON core.integration_tokens;
CREATE TRIGGER trg_integration_tokens_updated BEFORE UPDATE ON core.integration_tokens
  FOR EACH ROW EXECUTE FUNCTION core.trg_integration_tokens_updated();
