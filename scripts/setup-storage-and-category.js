import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wdgfgogscivdpefuqnol.supabase.co';
const supabaseServiceKey = 'sbp_bab1828332f3363201a03b1834b295a9521d6c9b'; // Admin token

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🗄️  Setting up product-images bucket...\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets.some(b => b.name === 'product-images');

    if (bucketExists) {
      console.log('✅ Bucket "product-images" already exists');
      return true;
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return false;
    }

    console.log('✅ Bucket "product-images" created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function addCategoryColumn() {
  console.log('\n📊 Adding category column to products table...\n');

  try {
    // Add category column using SQL
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS category TEXT;
      `
    }).catch(async () => {
      // Fallback: try direct SQL execution via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return { data: null, error: null };
    });

    if (error) {
      console.error('❌ Error adding category column:', error);
      
      console.log('\n💡 Manual SQL required:');
      console.log('   Run this in Supabase SQL Editor:');
      console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;');
      return false;
    }

    console.log('✅ Category column added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    console.log('\n💡 Manual SQL required:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run: ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup...\n');
  console.log('=' . repeat(50));

  const storageSuccess = await setupStorage();
  const categorySuccess = await addCategoryColumn();

  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Setup Summary:');
  console.log(`   Storage Bucket: ${storageSuccess ? '✅' : '❌'}`);
  console.log(`   Category Column: ${categorySuccess ? '✅' : '❌'}`);

  if (storageSuccess && categorySuccess) {
    console.log('\n🎉 All setup completed successfully!');
    console.log('   You can now add products with images and categories.');
  } else {
    console.log('\n⚠️  Some steps failed. Check the logs above.');
  }
}

main();
