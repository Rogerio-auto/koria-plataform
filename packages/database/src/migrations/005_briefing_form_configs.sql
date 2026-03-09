-- KorIA Briefing Form Configs — Migration
-- Dynamic briefing form configurations per tenant.

-- 1. Enum type for form config status
DO $$ BEGIN
  CREATE TYPE core.briefing_form_config_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create the briefing_form_configs table
CREATE TABLE IF NOT EXISTS core.briefing_form_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  version INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Briefing Padrão',
  is_active BOOLEAN NOT NULL DEFAULT false,
  status core.briefing_form_config_status NOT NULL DEFAULT 'draft',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 3. Add custom_fields and form_config_id to lead_qualification (if not exist)
ALTER TABLE core.lead_qualification
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

ALTER TABLE core.lead_qualification
  ADD COLUMN IF NOT EXISTS form_config_id UUID;

-- 4. Add form_config_id to work_orders (if not exist)
ALTER TABLE core.work_orders
  ADD COLUMN IF NOT EXISTS form_config_id UUID;
