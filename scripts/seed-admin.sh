#!/bin/bash
# KorIA — Seed admin user
# Creates the initial admin user for the analytics dashboard.
# Run AFTER the database migration (001_analytics_system.sql).
#
# Usage: ./scripts/seed-admin.sh [email] [password]
# If no arguments, uses defaults.

set -e

EMAIL="${1:-admin@koriastudio.com}"
PASSWORD="${2:-$(openssl rand -base64 16)}"
TENANT_ID="a9081890-d60f-4d91-ab05-c1407302a4c9"

echo "🔐 KorIA — Seed Admin User"
echo "==========================="
echo "Email:    $EMAIL"

# Generate password hash (same algorithm as auth.service.ts: scrypt salt:key)
# Try node first, fallback to python3
if command -v node &>/dev/null; then
  HASH=$(node -e "
const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
crypto.scrypt('$PASSWORD', salt, 64, (err, key) => {
  if (err) { process.exit(1); }
  console.log(salt + ':' + key.toString('hex'));
});
")
elif command -v python3 &>/dev/null; then
  HASH=$(python3 -c "
import hashlib, os
salt = os.urandom(16).hex()
key = hashlib.scrypt(b'$PASSWORD', salt=bytes.fromhex(salt), n=16384, r=8, p=1, dklen=64).hex()
print(salt + ':' + key)
")
else
  echo '❌ Requires node or python3 to generate password hash'
  exit 1
fi

if [ -z "$HASH" ]; then
  echo "❌ Failed to generate password hash"
  exit 1
fi

# Load DATABASE_URL from .env
if [ -f .env ]; then
  export $(grep -E '^DATABASE_URL=' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set. Set it in .env or environment."
  exit 1
fi

# Insert admin user
psql "$DATABASE_URL" -c "
INSERT INTO core.analytics_users (tenant_id, email, password_hash, full_name, role, status)
VALUES ('$TENANT_ID', '$EMAIL', '$HASH', 'Admin KorIA', 'admin', 'active')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
"

echo ""
echo "✅ Admin user created!"
echo "Email:    $EMAIL"
echo "Password: $PASSWORD"
echo ""
echo "⚠️  Save the password — it won't be shown again!"
echo "⚠️  Change it after first login via Settings > Alterar Senha"
