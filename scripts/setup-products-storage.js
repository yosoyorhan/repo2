import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oavfxmyejwhnrlpnbdbg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdmZ4bXllandobnJscG5iZGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDM1OTgsImV4cCI6MjA1MjAxOTU5OH0.b6a1R7EDQOYcCW7hBpBVBJc7G0Mtu9rh-dHIojE38xs';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupProductsStorage() {
  console.log('🚀 Setting up products storage and category column...\n');

  try {
    // 1. Add category column to products table
    console.log('📝 Adding category column to products table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
        COMMENT ON COLUMN products.category IS 'Product category for filtering and organization';
      `
    });

    if (alterError && !alterError.message.includes('already exists')) {
      console.log('⚠️  Using direct SQL execution...');
      // Try with direct execution
      const { error: directError } = await supabase
        .from('products')
        .select('category')
        .limit(1);
      
      if (directError && directError.message.includes('column')) {
        console.log('❌ Could not add category column automatically.');
        console.log('\n📋 Please run this SQL in Supabase Dashboard → SQL Editor:\n');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;');
        console.log('COMMENT ON COLUMN products.category IS \'Product category for filtering\';');
      } else {
        console.log('✅ Category column already exists or added successfully');
      }
    } else {
      console.log('✅ Category column added successfully');
    }

    // 2. Check if product-images bucket exists
    console.log('\n📦 Checking product-images storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError.message);
    } else {
      const productImagesBucket = buckets.find(b => b.name === 'product-images');
      
      if (!productImagesBucket) {
        console.log('📦 Creating product-images bucket...');
        const { data, error } = await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
        });

        if (error) {
          console.log('❌ Could not create bucket automatically:', error.message);
          console.log('\n📋 Please create bucket manually in Supabase Dashboard:');
          console.log('   1. Go to Storage → Create new bucket');
          console.log('   2. Name: product-images');
          console.log('   3. Public: Yes');
          console.log('   4. File size limit: 5MB');
        } else {
          console.log('✅ product-images bucket created successfully');
        }
      } else {
        console.log('✅ product-images bucket already exists');
      }
    }

    console.log('\n🎉 Setup completed!');
    console.log('\nNext steps:');
    console.log('1. If category column failed, run the SQL in Supabase Dashboard');
    console.log('2. If bucket creation failed, create it manually in Storage settings');
    console.log('3. Deploy your app: npm run build && git push');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('\n1. Run this SQL in Supabase Dashboard → SQL Editor:');
    console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;');
    console.log('\n2. Create storage bucket in Dashboard → Storage:');
    console.log('   - Name: product-images');
    console.log('   - Public: Yes');
    console.log('   - File size limit: 5MB');
  }
}

setupProductsStorage();
