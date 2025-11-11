import fetch from 'node-fetch';

const supabaseUrl = 'https://wdgfgogscivdpefuqnol.supabase.co';
const serviceRoleKey = 'sbp_c8fa1dad142881399b30cd8a1075280f06dbf8f5';

async function runSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql })
  });

  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text };
}

console.log('🚀 Running database migrations...\n');

// 1. Add full_name column
console.log('1️⃣ Adding full_name column to profiles...');
const sql1 = `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;`;
const result1 = await runSQL(sql1);
console.log(`   Status: ${result1.status}`, result1.ok ? '✅' : '❌');
if (!result1.ok) console.log('   Response:', result1.body);

// 2. Update existing profiles
console.log('\n2️⃣ Updating existing profiles with username as full_name...');
const sql2 = `UPDATE profiles SET full_name = username WHERE full_name IS NULL;`;
const result2 = await runSQL(sql2);
console.log(`   Status: ${result2.status}`, result2.ok ? '✅' : '❌');
if (!result2.ok) console.log('   Response:', result2.body);

// 3. Storage policies - Users can upload
console.log('\n3️⃣ Creating storage policy: Users can upload product images...');
const sql3 = `
CREATE POLICY IF NOT EXISTS "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
`;
const result3 = await runSQL(sql3);
console.log(`   Status: ${result3.status}`, result3.ok ? '✅' : '❌');
if (!result3.ok) console.log('   Response:', result3.body);

// 4. Storage policies - Public read
console.log('\n4️⃣ Creating storage policy: Public can view product images...');
const sql4 = `
CREATE POLICY IF NOT EXISTS "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
`;
const result4 = await runSQL(sql4);
console.log(`   Status: ${result4.status}`, result4.ok ? '✅' : '❌');
if (!result4.ok) console.log('   Response:', result4.body);

// 5. Storage policies - Users can update
console.log('\n5️⃣ Creating storage policy: Users can update their product images...');
const sql5 = `
CREATE POLICY IF NOT EXISTS "Users can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
`;
const result5 = await runSQL(sql5);
console.log(`   Status: ${result5.status}`, result5.ok ? '✅' : '❌');
if (!result5.ok) console.log('   Response:', result5.body);

// 6. Storage policies - Users can delete
console.log('\n6️⃣ Creating storage policy: Users can delete their product images...');
const sql6 = `
CREATE POLICY IF NOT EXISTS "Users can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
`;
const result6 = await runSQL(sql6);
console.log(`   Status: ${result6.status}`, result6.ok ? '✅' : '❌');
if (!result6.ok) console.log('   Response:', result6.body);

console.log('\n✨ Migration complete!');
