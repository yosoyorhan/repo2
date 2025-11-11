#!/usr/bin/env node

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase Management API
const SUPABASE_ACCESS_TOKEN = 'sbp_bab1828332f3363201a03b1834b295a9521d6c9b';
const PROJECT_REF = 'djxukpbhlbomtvxejxtl';

async function runMigration() {
  try {
    console.log('🔄 Running database migrations via Supabase Management API...\n');
    
    // Migration files to run
    const migrations = [
      'supabase-migration-orientation.sql',
      'supabase-migration-profile-enhancements.sql',
      'supabase-migration-storage-avatars.sql',
      'supabase-migration-products.sql',
      'supabase-migration-auction.sql'
    ];
    
    for (const migrationFile of migrations) {
      console.log(`\n📄 Running: ${migrationFile}`);
      console.log('─'.repeat(60));
      
      const migrationPath = join(__dirname, '..', migrationFile);
      const sql = readFileSync(migrationPath, 'utf8');
      
      console.log(sql.substring(0, 200) + '...\n');
      console.log('🚀 Executing...\n');
      
      // Execute SQL via Management API
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: sql
          })
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error(`❌ Migration ${migrationFile} failed:`, result);
        console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
        console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql\n`);
        console.log(sql);
        continue;
      }
      
      console.log(`✅ ${migrationFile} completed successfully!`);
    }
    
    console.log('\n🎉 All migrations completed!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runMigration();
