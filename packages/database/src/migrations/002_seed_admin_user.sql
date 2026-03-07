-- KorIA Analytics — Seed initial admin user
-- Run this AFTER 001_analytics_system.sql
-- 
-- DEFAULT PASSWORD: KorIA@2024! (CHANGE IMMEDIATELY after first login)
-- Password hash generated with Node.js crypto.scrypt (salt:hash)
--
-- To generate a new hash, run:
--   node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');c.scrypt('YOUR_PASSWORD',s,64,(e,k)=>console.log(s+':'+k.toString('hex')))"

INSERT INTO core.analytics_users (tenant_id, email, password_hash, full_name, role, status)
VALUES (
  'a9081890-d60f-4d91-ab05-c1407302a4c9',
  'admin@koriastudio.com',
  -- This is a placeholder hash. Generate a real one before deploying!
  -- Use the Node.js command above or the seed script at scripts/seed-admin.sh
  'REPLACE_WITH_REAL_HASH',
  'Admin KorIA',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;
