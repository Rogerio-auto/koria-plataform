-- KorIA Analytics System — Migration
-- Creates tables for analytics users, invites, objections, and assistant

-- Enums
DO $$ BEGIN
  CREATE TYPE core.user_role AS ENUM ('admin', 'manager', 'sdr', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE core.user_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Users
CREATE TABLE IF NOT EXISTS core.analytics_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role core.user_role NOT NULL DEFAULT 'viewer',
  status core.user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_analytics_users_tenant ON core.analytics_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_users_email ON core.analytics_users(email);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION core.trg_analytics_users_updated()
RETURNS trigger AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analytics_users_updated ON core.analytics_users;
CREATE TRIGGER trg_analytics_users_updated BEFORE UPDATE ON core.analytics_users
  FOR EACH ROW EXECUTE FUNCTION core.trg_analytics_users_updated();

-- Invite Tokens
CREATE TABLE IF NOT EXISTS core.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),
  role core.user_role NOT NULL DEFAULT 'viewer',
  created_by UUID REFERENCES core.analytics_users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES core.analytics_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON core.invite_tokens(token);

-- Objections
CREATE TABLE IF NOT EXISTS core.objections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  lead_id UUID NOT NULL REFERENCES core.leads(id),
  conversation_id UUID,
  category VARCHAR(100) NOT NULL,
  original_text TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  was_overcome BOOLEAN NOT NULL DEFAULT false,
  overcome_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_objections_tenant_cat ON core.objections(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_objections_lead ON core.objections(lead_id);

-- Objection Categories
CREATE TABLE IF NOT EXISTS core.objection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  keywords TEXT[],
  suggested_response TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_objection_categories_slug ON core.objection_categories(tenant_id, slug);

-- Assistant Conversations
CREATE TABLE IF NOT EXISTS core.assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  user_id UUID NOT NULL REFERENCES core.analytics_users(id),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_conv_user ON core.assistant_conversations(user_id);

CREATE OR REPLACE FUNCTION core.trg_assistant_conversations_updated()
RETURNS trigger AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assistant_conversations_updated ON core.assistant_conversations;
CREATE TRIGGER trg_assistant_conversations_updated BEFORE UPDATE ON core.assistant_conversations
  FOR EACH ROW EXECUTE FUNCTION core.trg_assistant_conversations_updated();

-- Assistant Action Logs
CREATE TABLE IF NOT EXISTS core.assistant_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id),
  user_id UUID NOT NULL REFERENCES core.analytics_users(id),
  conversation_id UUID REFERENCES core.assistant_conversations(id),
  action_type VARCHAR(100) NOT NULL,
  action_input JSONB,
  action_output JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_conv ON core.assistant_action_logs(conversation_id);

-- Seed default objection categories for KorIA tenant
INSERT INTO core.objection_categories (tenant_id, slug, name, description, keywords, suggested_response, display_order)
VALUES
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'preco', 'Preço alto', 'Cliente acha o serviço caro', ARRAY['caro','preço','valor','custo','investimento','barato','desconto'], 'Nossos vídeos com IA geram um ROI significativo em lançamentos imobiliários. Posso mostrar casos reais de clientes que recuperaram o investimento nas primeiras semanas.', 10),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'prazo', 'Prazo apertado', 'Cliente precisa urgência ou acha prazo longo', ARRAY['prazo','urgente','rápido','demora','quando','tempo','entrega'], 'Nosso processo otimizado com IA permite entregas em prazos competitivos. Vamos alinhar o cronograma ideal para o seu lançamento.', 20),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'fornecedor', 'Já tem fornecedor', 'Cliente já trabalha com outra produtora', ARRAY['fornecedor','parceiro','produtora','outro','empresa','concorrente'], 'Entendo! Nossa proposta é complementar — vídeos com IA oferecem um resultado diferenciado que pode agregar ao que vocês já fazem.', 30),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'prioridade', 'Não é prioridade', 'Cliente diz que não precisa agora', ARRAY['prioridade','depois','agora não','futuro','mais tarde','momento'], 'Perfeitamente! Posso te enviar um material mostrando como produtoras imobiliárias de sucesso usam vídeo com IA. Quando for o momento certo, estarei aqui.', 40),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'consultar_socio', 'Precisa consultar sócio', 'Decisão depende de outra pessoa', ARRAY['sócio','parceiro','consultar','conversar','decidir','aprovação','diretoria'], 'Claro! Posso preparar uma apresentação resumida que facilite a conversa com seu sócio. Quer que eu envie?', 50),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'qualidade', 'Dúvida sobre qualidade', 'Cliente questiona qualidade do resultado com IA', ARRAY['qualidade','resultado','IA','artificial','real','profissional','amador'], 'Nossos vídeos com IA passam por curadoria humana e pós-produção profissional. O resultado é indistinguível de produções tradicionais. Posso enviar exemplos do nosso portfólio.', 60),
  ('a9081890-d60f-4d91-ab05-c1407302a4c9', 'outro', 'Outra objeção', 'Objeção não categorizada', ARRAY[]::TEXT[], NULL, 99)
ON CONFLICT DO NOTHING;
