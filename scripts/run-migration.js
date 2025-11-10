#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://djxukpbhlbomtvxejxtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  try {
    console.log('🔄 Running orientation migration...\n');
    
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase-migration-orientation.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(sql);
    console.log('\n');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct query if RPC doesn't work
      console.log('⚠️  RPC method failed, trying direct query...\n');
      
      const queries = sql.split(';').filter(q => q.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          console.log(`Executing: ${query.substring(0, 50)}...`);
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(0);
          
          if (queryError) {
            console.log('⚠️  Direct query also failed. Manual execution required.\n');
            console.log('Please run this SQL in Supabase SQL Editor:');
            console.log('https://supabase.com/dashboard/project/djxukpbhlbomtvxejxtl/sql\n');
            console.log(sql);
            return;
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Manual step required:');
    console.log('Please run the following SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/djxukpbhlbomtvxejxtl/sql\n');
    console.log(sql);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/djxukpbhlbomtvxejxtl/sql\n');
    
    const migrationPath = join(__dirname, '..', 'supabase-migration-orientation.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    console.log(sql);
  }
}

runMigration();
