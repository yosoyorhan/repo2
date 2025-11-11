import fetch from 'node-fetch';

const supabaseUrl = 'https://wdgfgogscivdpefuqnol.supabase.co';
const serviceRoleKey = 'sbp_c8fa1dad142881399b30cd8a1075280f06dbf8f5';

console.log('🚀 Starting Supabase setup...\n');

// 1. Create storage bucket
async function createBucket() {
  console.log('📦 Creating product-images bucket...');
  
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      id: 'product-images',
      name: 'product-images',
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    })
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log('✅ Bucket created successfully!\n');
    return true;
  } else if (result.error === 'Bucket already exists') {
    console.log('✅ Bucket already exists\n');
    return true;
  } else {
    console.log('❌ Failed:', result);
    return false;
  }
}

// 2. Add category column
async function addCategoryColumn() {
  console.log('📊 Adding category column to products table...');
  
  const sql = 'ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;';
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify({ query: sql })
  });

  if (response.ok || response.status === 204) {
    console.log('✅ Column added successfully!\n');
    return true;
  } else {
    const result = await response.text();
    console.log('⚠️  Response:', response.status, result);
    console.log('\n💡 Please run this SQL manually in Supabase Dashboard:');
    console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;\n');
    return false;
  }
}

// Run setup
async function setup() {
  const bucketOk = await createBucket();
  const columnOk = await addCategoryColumn();
  
  console.log('==================================================');
  console.log('📋 Setup Summary:');
  console.log(`   Storage Bucket: ${bucketOk ? '✅' : '❌'}`);
  console.log(`   Category Column: ${columnOk ? '✅' : '❌'}`);
  console.log('==================================================');
}

setup().catch(console.error);
