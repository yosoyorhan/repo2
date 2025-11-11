
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:djxukpbhlbomtvxejxtl@db.djxukpbhlbomtvxejxtl.supabase.co:5432/postgres'
});

async function inspectSchema() {
  await client.connect();

  const tables = ['sales', 'products', 'profiles'];

  for (const table of tables) {
    console.log(`\n--- Schema for table: ${table} ---`);
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${table}';
    `);
    console.table(res.rows);
  }

  await client.end();
}

inspectSchema();
