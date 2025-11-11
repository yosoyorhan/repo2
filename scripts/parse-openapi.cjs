// Parse the saved OpenAPI (Swagger 2.0) JSON from PostgREST and print a concise schema summary
// Usage: node scripts/parse-openapi.cjs schema-openapi.json > schema-summary.md

const fs = require('fs');
const path = require('path');

function fmtProp(name, def) {
  const type = def.type || 'object';
  const format = def.format ? ` (${def.format})` : '';
  const dflt = def.default !== undefined ? `, default: ${def.default}` : '';
  const desc = def.description ? ` — ${def.description.replace(/\n/g, ' ').trim()}` : '';
  return `- ${name}: ${type}${format}${dflt}${desc}`;
}

function main() {
  const file = process.argv[2] || 'schema-openapi.json';
  const json = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));

  const defs = json.definitions || {};
  const tables = Object.keys(defs).sort();

  console.log(`# Database schema summary`);
  console.log();
  console.log(`Tables discovered: ${tables.length}`);
  console.log();

  for (const tbl of tables) {
    const def = defs[tbl] || {};
    const props = def.properties || {};
    const required = new Set(def.required || []);
    console.log(`## ${tbl}`);
    if (Object.keys(props).length === 0) {
      console.log('(no columns found)');
      console.log();
      continue;
    }
    for (const col of Object.keys(props)) {
      const p = props[col];
      const reqMark = required.has(col) ? ' (required)' : '';
      const line = fmtProp(col, p) + reqMark;
      console.log(line);
    }
    console.log();
  }
}

main();
