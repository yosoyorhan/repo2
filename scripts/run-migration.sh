#!/bin/bash

SUPABASE_URL="https://wdgfgogscivdpefuqnol.supabase.co"
SERVICE_KEY="sbp_c8fa1dad142881399b30cd8a1075280f06dbf8f5"

echo "🚀 Running database migrations via REST API..."
echo ""

# 1. Add full_name column
echo "1️⃣ Adding full_name column to profiles..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"sql": "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;"}' \
  2>/dev/null
echo ""

# 2. Update existing profiles  
echo "2️⃣ Updating existing profiles..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"sql": "UPDATE profiles SET full_name = username WHERE full_name IS NULL;"}' \
  2>/dev/null
echo ""

echo ""
echo "✨ Migration attempt complete!"
echo ""
echo "⚠️  If you see errors, please run these SQL commands manually in Supabase Dashboard:"
echo ""
echo "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;"
echo "UPDATE profiles SET full_name = username WHERE full_name IS NULL;"
