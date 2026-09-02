// Site-wide audit fix (user request: "make sure anything else in this app
// is not implemented like that" after the Kathina/Buddha-Puja hotlinked-
// image bug). A full DB scan turned up a second, separate instance of the
// same underlying problem: 23 `entries.body` rows (scraped article HTML)
// contain raw <img src="https://dhammahadaya.net/..."> tags and in-content
// <a href="https://dhammahadaya.net/..."> links — leftover from the
// original WordPress authors linking to their own site's images/other
// posts. Once the live site is taken down, every one of these breaks:
// the images vanish entirely (no hotlink-warning fallback this time, just
// a dead src) and the cross-reference links 404.
//
// Fix, in one pass per affected entry body:
//   1. Every distinct dhammahadaya.net image/PDF URL (found in either
//      src="..." or href="...") is downloaded (plain server-to-server
//      fetch — no cross-origin Referer, so no hotlink-protection issue
//      here) and re-hosted via the app's own storage, same as
//      rehost-hotlinked-images.js.
//   2. Every distinct dhammahadaya.net *page* URL is resolved to this
//      app's own equivalent route where possible:
//        - matches a migrated budu_hamuduruwo/important_article/newsletter
//          entry (via the original scrape JSON's url<->order mapping) ->
//          rewritten to our /<slug>/<id>/ detail route.
//        - matches one of our own static routes (e.g. /buddha-puja/,
//          same path on both sites) -> domain stripped, path kept as-is.
//        - anything else (points to content that was never part of this
//          migration) -> left unchanged and reported; nothing else can be
//          done without the original content.
//   3. A single string-replace pass swaps every resolved URL for its
//      replacement directly in the stored HTML.
//
// Usage: node scripts/fix-in-content-dhammahadaya-links.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const storage = require('../src/storage');

const ENTRY_TYPE_TO_ROUTE_SLUG = {
  budu_hamuduruwo: 'ape-budu-hamuduruwo-all',
  important_article: 'important-articles',
  newsletter: 'post',
};

// Live-site paths that don't map 1:1 onto this app's own route for the
// same page — checked before the identical-path set below.
const RENAMED_STATIC_PATHS = new Map([['/kathina-ceremony/', '/katina-ceremony/']]);

// Any live-site page whose path is identical on this app — a plain
// domain-strip is a correct rewrite for these.
const KNOWN_STATIC_PATHS = new Set([
  '/buddha-puja/',
  '/meditation-programs/',
  '/dhamma-sermon/',
  '/sponsorship/',
  '/contact-us/',
  '/about/',
  '/pdf-books/',
  '/tripitaka/',
  '/tripitaka-catalogs/',
  '/pali-sinhalese-dictionary/',
  '/sinhala-dictionary/',
]);

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DhammahadayaMigration/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function guessMimetype(url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.pdf') return 'application/pdf';
  return 'image/jpeg';
}

async function buildSlugToRouteMap(client) {
  const map = new Map(); // pathname -> internal route
  const scrapeFiles = {
    budu_hamuduruwo: 'ape-budu-hamuduruwo-scraped.json',
    important_article: 'important-articles-scraped.json',
    newsletter: 'posts-scraped.json',
  };
  for (const [type, file] of Object.entries(scrapeFiles)) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  (no scrape file for ${type}, skipping its slug resolution)`);
      continue;
    }
    const { results } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const orderToUrl = new Map(results.map((r) => [r.n, r.url]));
    const dbRows = await client.query('SELECT id, "order" FROM entries WHERE type = $1;', [type]);
    const routeSlug = ENTRY_TYPE_TO_ROUTE_SLUG[type];
    for (const dbRow of dbRows.rows) {
      const url = orderToUrl.get(dbRow.order);
      if (url) map.set(new URL(url).pathname, `/${routeSlug}/${dbRow.id}/`);
    }
  }
  return map;
}

async function main() {
  const client = new Client({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER,
    password: process.env.PGPASSWORD, database: process.env.PGDATABASE,
  });
  await client.connect();

  const rows = await client.query("SELECT id, type, body FROM entries WHERE body LIKE '%dhammahadaya%';");
  console.log(`Found ${rows.rows.length} entries with in-content dhammahadaya.net references.`);

  const urlRe = /(?:src|href)="(https:\/\/dhammahadaya\.net\/[^"]+)"/g;
  const allUrls = new Set();
  for (const row of rows.rows) {
    let m;
    urlRe.lastIndex = 0;
    while ((m = urlRe.exec(row.body))) allUrls.add(m[1]);
  }
  const fileUrls = [...allUrls].filter((u) => /\.(jpe?g|png|gif|webp|pdf)$/i.test(u));
  const pageUrls = [...allUrls].filter((u) => !/\.(jpe?g|png|gif|webp|pdf)$/i.test(u));
  console.log(`Distinct URLs: ${allUrls.size} (${fileUrls.length} files, ${pageUrls.length} pages).\n`);

  // 1. Download + re-host every file URL.
  const replacements = new Map(); // old url -> new url
  let filesDone = 0;
  let filesFailed = 0;
  for (const url of fileUrls) {
    try {
      const buffer = await download(url);
      const originalName = url.split('/').pop();
      const { url: newUrl } = await storage.saveFile(buffer, originalName, guessMimetype(url));
      replacements.set(url, newUrl);
      filesDone++;
    } catch (err) {
      filesFailed++;
      console.error(`  FAILED to download ${url}: ${err.message}`);
    }
  }
  console.log(`Re-hosted ${filesDone}/${fileUrls.length} files (${filesFailed} failed).\n`);

  // 2. Resolve page URLs.
  console.log('Building internal-route slug map from scrape JSON + DB order...');
  const slugToRoute = await buildSlugToRouteMap(client);
  console.log(`Slug map has ${slugToRoute.size} entries.\n`);

  let pagesResolved = 0;
  const unresolvedPages = [];
  for (const url of pageUrls) {
    const pathname = new URL(url).pathname;
    if (slugToRoute.has(pathname)) {
      replacements.set(url, slugToRoute.get(pathname));
      pagesResolved++;
    } else if (RENAMED_STATIC_PATHS.has(pathname)) {
      replacements.set(url, RENAMED_STATIC_PATHS.get(pathname));
      pagesResolved++;
    } else if (KNOWN_STATIC_PATHS.has(pathname)) {
      replacements.set(url, pathname);
      pagesResolved++;
    } else {
      unresolvedPages.push(url);
    }
  }
  console.log(`Resolved ${pagesResolved}/${pageUrls.length} page URLs to internal routes.`);
  if (unresolvedPages.length) {
    console.log(`Left unresolved (no equivalent migrated content found — will remain as dead external links):`);
    console.log(unresolvedPages.map((u) => `  ${u}`).join('\n'));
  }

  // 3. Rewrite each affected entry's body.
  console.log('\nRewriting entry bodies...');
  let entriesUpdated = 0;
  for (const row of rows.rows) {
    let newBody = row.body;
    for (const [oldUrl, newUrl] of replacements) {
      newBody = newBody.split(`"${oldUrl}"`).join(`"${newUrl}"`);
    }
    if (newBody !== row.body) {
      await client.query('UPDATE entries SET body = $1 WHERE id = $2;', [newBody, row.id]);
      entriesUpdated++;
    }
  }
  console.log(`Updated ${entriesUpdated}/${rows.rows.length} entries.`);

  await client.end();
}

main().catch((err) => {
  console.error('Fix failed:', err);
  process.exitCode = 1;
});
