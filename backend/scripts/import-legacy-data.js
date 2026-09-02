// Imports the five Ninja Tables exports (four dictionaries + the Tripitaka
// catalogue) from backend/previous_system_files/*.json into Postgres.
//
// Gotchas this script exists to handle (see docs/data-notes.md for detail):
//   - The real data is in `original_rows[].value`, not the top-level `rows`
//     array (which is an empty Ninja Tables cache in every export).
//   - Source column keys differ per table and are pulled from each file's own
//     `columns` metadata (by key, not by hand-typed Sinhala strings) so an
//     invisible-character mismatch can't silently drop a column.
//   - Every string field is NFC-normalized on the way in.
//
// Usage: npm run import:legacy   (reads connection info from backend/.env)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATA_DIR = path.join(__dirname, '..', 'previous_system_files');
const BATCH_SIZE = 500;

// Expected row counts, as established by the earlier inspection + spike
// (docs/data-notes.md). The script fails loudly if the real import doesn't
// reconcile against these instead of silently accepting a partial import.
const TABLES = [
  {
    jsonFile: 'සරල-සිංහල-ශබ්දකෝෂය.json',
    tableName: 'sinhala_dictionary',
    destColumns: ['word', 'meaning'],
    trgmColumns: ['word', 'meaning'],
    expectedRows: 46026,
  },
  {
    jsonFile: 'පාළි-සිංහල-ශබ්දකෝෂය.json',
    tableName: 'pali_sinhala_dictionary',
    destColumns: ['pali_word', 'sinhala_translation'],
    trgmColumns: ['pali_word', 'sinhala_translation'],
    expectedRows: 44339,
  },
  {
    jsonFile: 'akshara_vinyasa-json-imported-from-table-press.json',
    tableName: 'akshara_vinyasa',
    destColumns: ['term', 'definition'],
    trgmColumns: ['term', 'definition'],
    expectedRows: 9203,
  },
  {
    jsonFile: 'සංක්ෂිප්ත-සිංහල-ශබ්දකෝෂ.json',
    tableName: 'sinhala_dictionary_concise',
    destColumns: ['word', 'meaning'],
    trgmColumns: ['word', 'meaning'],
    expectedRows: 1431,
  },
  {
    jsonFile: 'ත්_රිපිටක-නාමාවලිය.json',
    tableName: 'tripitaka_catalogue',
    // Order must match the source file's `columns` array order — see
    // build-spec §6, which lists these same 11 columns in this order.
    destColumns: [
      'sutta_name', 'pitaka', 'nikaya', 'vagga', 'printed_page_no',
      'pdf_page_no', 'pdf_pali_atthakatha', 'sinhala_atthakatha',
      'pdf_sinhala_atthakatha', 'pdf_pali_tika', 'pali_sinhala_tika',
    ],
    // sutta_name is the primary search target; nikaya/vagga are worth
    // indexing too (7 / 27 distinct values, meaningful categorical text).
    // pitaka is excluded — only 1 distinct value across all 268 rows, so
    // it has no discriminating power as a search column.
    trgmColumns: ['sutta_name', 'nikaya', 'vagga'],
    expectedRows: 268,
    // Unlike the four dictionaries below (read-only — no admin CRUD writes
    // to them anywhere in the app), the Tripitaka Catalogue now has admin
    // CRUD (build-spec §6, "under ongoing proofreading"). `guarded: true`
    // makes importTable() refuse to touch this table at all if any
    // source='admin' row exists, instead of the plain DROP+CREATE the
    // other tables use — see the `guarded` branch below. The table's
    // schema itself is owned by scripts/migrate.js, not this script.
    guarded: true,
  },
];

function loadOriginalRows(jsonFile) {
  const full = path.join(DATA_DIR, jsonFile);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!Array.isArray(data.columns)) throw new Error(`${jsonFile}: no columns metadata`);
  if (!Array.isArray(data.original_rows)) throw new Error(`${jsonFile}: no original_rows`);
  const sourceKeys = data.columns.map((c) => c.key);
  return { sourceKeys, rows: data.original_rows };
}

async function importTable(client, table) {
  const { jsonFile, tableName, destColumns, trgmColumns, expectedRows, guarded } = table;
  const { sourceKeys, rows } = loadOriginalRows(jsonFile);

  if (sourceKeys.length !== destColumns.length) {
    throw new Error(
      `${tableName}: source has ${sourceKeys.length} columns (${sourceKeys.join(', ')}) `
      + `but destColumns has ${destColumns.length} — mapping is out of sync, fix before importing.`
    );
  }

  if (guarded) {
    // This table's schema is owned by scripts/migrate.js (run that first),
    // and it may already hold admin-added/edited rows this script must not
    // touch — refuse outright rather than risk silently overwriting them.
    const adminRows = await client.query(`SELECT count(*) FROM ${tableName} WHERE source = 'admin';`);
    const adminRowCount = Number(adminRows.rows[0].count);
    if (adminRowCount > 0) {
      return {
        tableName,
        importedRows: null,
        expectedRows,
        matches: null,
        normalizedFieldCount: 0,
        skipped: true,
        skipReason: `${adminRowCount} admin-added/edited row(s) present (source='admin') — refusing to overwrite.`,
      };
    }
    await client.query(`DELETE FROM ${tableName} WHERE source = 'legacy_import';`);
  } else {
    const columnDefs = destColumns.map((c) => `${c} TEXT`).join(',\n      ');
    await client.query(`DROP TABLE IF EXISTS ${tableName};`);
    await client.query(`
      CREATE TABLE ${tableName} (
        id SERIAL PRIMARY KEY,
        ${columnDefs}
      );
    `);
  }

  let normalizedFieldCount = 0;
  const colList = guarded ? [...destColumns, 'source'].join(', ') : destColumns.join(', ');

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const params = [];
    const valueRows = [];
    for (const row of batch) {
      const rowValues = sourceKeys.map((key) => {
        const raw = row.value?.[key] ?? null;
        if (typeof raw !== 'string') return raw;
        const normalized = raw.normalize('NFC');
        if (normalized !== raw) normalizedFieldCount++;
        return normalized;
      });
      if (guarded) rowValues.push('legacy_import');
      const placeholders = rowValues.map((_, idx) => `$${params.length + idx + 1}`);
      valueRows.push(`(${placeholders.join(', ')})`);
      params.push(...rowValues);
    }
    await client.query(
      `INSERT INTO ${tableName} (${colList}) VALUES ${valueRows.join(', ')};`,
      params
    );
  }

  if (!guarded) {
    for (const col of trgmColumns) {
      await client.query(
        `CREATE INDEX idx_${tableName}_${col}_trgm ON ${tableName} USING GIN (${col} gin_trgm_ops);`
      );
    }
  }
  await client.query(`ANALYZE ${tableName};`);

  const countRes = await client.query(
    guarded ? `SELECT count(*) FROM ${tableName} WHERE source = 'legacy_import';` : `SELECT count(*) FROM ${tableName};`
  );
  const importedRows = Number(countRes.rows[0].count);

  return {
    tableName,
    importedRows,
    expectedRows,
    matches: importedRows === expectedRows,
    normalizedFieldCount,
  };
}

async function main() {
  // DATABASE_URL (Neon/hosted Postgres) takes priority; falls back to the
  // discrete PG* vars for local dev — same rule as backend/src/db.js.
  const client = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Client({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      });
  await client.connect();

  const results = [];
  for (const table of TABLES) {
    console.log(`Importing ${table.tableName} from ${table.jsonFile} ...`);
    const result = await importTable(client, table);
    results.push(result);
  }

  await client.end();

  console.log('\n=== Import reconciliation report ===');
  console.log(
    'table'.padEnd(28)
    + 'imported'.padStart(10)
    + 'expected'.padStart(10)
    + 'match'.padStart(8)
    + 'normalized_fields'.padStart(20)
  );
  let allMatch = true;
  let anySkipped = false;
  for (const r of results) {
    if (r.skipped) {
      anySkipped = true;
      console.log(`${r.tableName.padEnd(28)}${'SKIPPED'.padStart(10)} — ${r.skipReason}`);
      continue;
    }
    if (!r.matches) allMatch = false;
    console.log(
      r.tableName.padEnd(28)
      + String(r.importedRows).padStart(10)
      + String(r.expectedRows).padStart(10)
      + (r.matches ? 'OK' : 'MISMATCH').padStart(8)
      + String(r.normalizedFieldCount).padStart(20)
    );
  }
  console.log(allMatch ? '\nAll imported tables reconcile against expected counts.' : '\nMISMATCH — do not build on top of this until resolved.');
  if (anySkipped) console.log('One or more tables were left untouched — see SKIPPED reason(s) above.');
  if (!allMatch) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
