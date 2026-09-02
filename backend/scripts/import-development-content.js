// Populates the real content for the Development section's sub-pages
// (https://dhammahadaya.net/development/ and its three children), which
// had only been scaffolded with placeholder/empty data:
//   - special_thanks.donors was seeded empty for all 7 rows (migrate.js
//     deliberately left it that way, before any real scrape had been done).
//   - static_document rows for honorable-tribute and
//     siri-sugatha-sasana-bandumathi held "pending" placeholder text.
//
// Source pages:
//   https://dhammahadaya.net/special-thanks/ — an eael-advance-tabs widget
//     with two tabs (English, Sinhala), each holding the same 6-7 <h3>
//     section headings followed by an <ol><li> donor list. Verified the
//     donor *counts* match 1:1 per section between the two tabs (sections
//     0-5); only the last section ("Guest monks' kuti") exists in the
//     Sinhala tab alone, matching the existing section_en=null row already
//     seeded in migrate.js. So donors are stored as "English | Sinhala"
//     pairs (matching the "section_en | section_si" heading format the
//     frontend already renders), falling back to Sinhala-only for that
//     last row.
//   https://dhammahadaya.net/honorable-tribute/ and
//   https://dhammahadaya.net/siri-sugatha-sasana-bandumathi/ — plain
//     .elementor-widget-text-editor content, cleaned the same way as every
//     other body-HTML scrape in this project (strip style/class/id/data-*
//     so the site's own CSS controls appearance instead of old inline
//     styles).
//
// Usage: node scripts/import-development-content.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const cheerio = require('cheerio');

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DhammahadayaMigration/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function cleanBodyHtml($, widget) {
  widget.find('*').each((_, el) => {
    const attribs = Object.keys(el.attribs || {});
    for (const name of attribs) {
      if (name === 'style' || name === 'class' || name === 'id' || name.startsWith('data-')) {
        $(el).removeAttr(name);
      }
    }
  });
  widget.find('script, style').remove();
  const isBlank = (el) => $(el).text().replace(/ /g, '').trim().length === 0 && !$(el).find('img').length;
  const children = widget.contents().toArray();
  while (children.length && isBlank(children[0])) {
    $(children[0]).remove();
    children.shift();
  }
  while (children.length && isBlank(children[children.length - 1])) {
    $(children[children.length - 1]).remove();
    children.pop();
  }
  return widget.html().trim();
}

// Parses one eael-tab-content-item into an ordered list of
// { heading, donors[] } by walking its direct children and grouping every
// <ol> under the <h3> that precedes it (the widget has no other wrapper
// structure tying a heading to its list).
function parseDonorTab($, contentEl) {
  const sections = [];
  let current = null;
  $(contentEl)
    .contents()
    .each((_, node) => {
      if (node.tagName === 'h3') {
        const text = $(node).text().replace(/\s+/g, ' ').trim();
        if (!text) return;
        current = { heading: text, donors: [] };
        sections.push(current);
      } else if (node.tagName === 'ol' && current) {
        $(node)
          .find('li')
          .each((_, li) => {
            const name = $(li).text().replace(/\s+/g, ' ').trim();
            if (name) current.donors.push(name);
          });
      }
    });
  return sections;
}

async function updateSpecialThanks(client) {
  console.log('Fetching https://dhammahadaya.net/special-thanks/ ...');
  const html = await fetchHtml('https://dhammahadaya.net/special-thanks/');
  const $ = cheerio.load(html);
  const tabsEl = $('.eael-advance-tabs').first();
  if (tabsEl.length === 0) throw new Error('special-thanks: .eael-advance-tabs widget not found');
  const contentItems = tabsEl.find('.eael-tab-content-item');
  const enSections = parseDonorTab($, contentItems.get(0));
  const siSections = parseDonorTab($, contentItems.get(1));

  // The Sinhala tab is the complete one (7 sections); the English tab is
  // missing the last ("Guest monks' kuti") section entirely. Pair by
  // index against the Sinhala tab, which is exactly how the 7 rows were
  // seeded in migrate.js (section_en=null on the 7th row already).
  const combined = siSections.map((si, i) => {
    const en = enSections[i];
    if (en && en.donors.length === si.donors.length) {
      return si.donors.map((siName, j) => `${en.donors[j]} | ${siName}`);
    }
    return si.donors;
  });

  const rows = await client.query('SELECT id, "order" FROM special_thanks ORDER BY "order" ASC;');
  if (rows.rows.length !== combined.length) {
    throw new Error(
      `special_thanks row count (${rows.rows.length}) does not match scraped section count (${combined.length}) — refusing to guess a mapping.`
    );
  }
  for (let i = 0; i < rows.rows.length; i++) {
    await client.query('UPDATE special_thanks SET donors = $1 WHERE id = $2;', [combined[i], rows.rows[i].id]);
  }
  console.log(`Updated donors for ${rows.rows.length} special_thanks sections.`);
}

async function updateStaticDocument(client, slug, url) {
  console.log(`Fetching ${url} ...`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  let widget = $('.elementor-widget-text-editor .elementor-widget-container').first();
  if (widget.length === 0) widget = $('.entry-content').first();
  if (widget.length === 0) throw new Error(`${slug}: no content widget found`);
  const body = cleanBodyHtml($, widget);
  if (!body) throw new Error(`${slug}: cleaned body is empty`);
  await client.query('UPDATE static_document SET body = $1, updated_at = now() WHERE slug = $2;', [body, slug]);
  console.log(`Updated static_document body for "${slug}" (${body.length} chars).`);
}

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  await updateSpecialThanks(client);
  await updateStaticDocument(client, 'honorable-tribute', 'https://dhammahadaya.net/honorable-tribute/');
  await updateStaticDocument(
    client,
    'siri-sugatha-sasana-bandumathi',
    'https://dhammahadaya.net/siri-sugatha-sasana-bandumathi/'
  );

  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exitCode = 1;
});
