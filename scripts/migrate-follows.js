import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running follows table migration...\n');

    const sqlFile = path.join(__dirname, '..', 'supabase-migration-follows.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL file loaded. Executing...\n');

    // Since Supabase client doesn't support direct SQL execution,
    // we need to use the service role key with REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      console.error('❌ Migration failed:', await response.text());
      console.log('\n💡 Manual migration required:');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the contents of supabase-migration-follows.sql');
      console.log('   4. Run the SQL');
      return;
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n🎉 Follows system is ready!');
    console.log('\nYou can now:');
    console.log('   • Follow/unfollow users');
    console.log('   • Get follower/following counts');
    console.log('   • Check follow status between users');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Please run the migration manually:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Run: supabase-migration-follows.sql');
  }
}

runMigration();
