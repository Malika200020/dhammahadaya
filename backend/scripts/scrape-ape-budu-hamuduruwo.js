// One-off migration script (build-spec §5.1 gap) — the 426 "Ape Budu
// Hamuduruwo" story posts were never part of the original migration
// export (only the 5 Ninja Tables were). They still exist on the live
// WordPress site, so this scrapes them directly via raw HTTP + HTML
// parsing (cheerio) — deliberately NOT through any AI/summarization step,
// to guarantee the Sinhala text is preserved byte-for-byte. Writes to a
// JSON file for manual spot-checking; a separate script (import-ape-budu-
// hamuduruwo.js) does the actual DB insert after review.
//
// Usage: node scripts/scrape-ape-budu-hamuduruwo.js [startN] [endN]
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const START = Number(process.argv[2] || 1);
const END = Number(process.argv[3] || 426);
const DELAY_MS = 350;
const OUT_PATH = path.join(__dirname, 'ape-budu-hamuduruwo-scraped.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanBodyHtml($, widget) {
  widget.find('*').each((_, el) => {
    $(el).removeAttr('style').removeAttr('class').removeAttr('id');
  });
  widget.find('script, style').remove();
  // Drop leading/trailing paragraphs that are empty or just a stray &nbsp;.
  const isBlank = (el) => $(el).text().replace(/ /g, '').trim().length === 0;
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

async function scrapeOne(n) {
  const url = `https://dhammahadaya.net/ape-budu-hamuduruwo-${n}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DhammahadayaMigration/1.0)' } });
  if (!res.ok) {
    return { n, url, error: `HTTP ${res.status}` };
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  // A handful of posts (confirmed: 164, 292) aren't built with Elementor at
  // all — their content sits directly in .entry-content as plain h3/p
  // children, with no post-navigation markup mixed in (verified by hand),
  // so it's safe to use as-is.
  let widget = $('.elementor-widget-text-editor .elementor-widget-container').first();
  if (widget.length === 0) {
    widget = $('.entry-content').first();
  }
  if (widget.length === 0) {
    return { n, url, error: 'No .elementor-widget-text-editor or .entry-content found' };
  }

  const heading = widget.find('h1,h2,h3,h4').first();
  let title = heading.text().replace(/\s+/g, ' ').trim();
  if (heading.length) heading.remove();
  if (!title) title = `අපේ බුදු හාමුදුරුවෝ ${n}`;

  const bodyHtml = cleanBodyHtml($, widget);
  const plainText = widget.text().replace(/\s+/g, ' ').trim();
  const excerpt = plainText.length > 220 ? plainText.slice(0, 220).trim() + '…' : plainText;

  if (!bodyHtml || plainText.length < 20) {
    return { n, url, error: 'Body suspiciously short/empty', title, bodyLength: bodyHtml.length };
  }

  return { n, url, title, excerpt, body: bodyHtml };
}

async function main() {
  const results = [];
  const failures = [];

  for (let n = START; n <= END; n++) {
    try {
      const result = await scrapeOne(n);
      if (result.error) {
        failures.push(result);
        console.error(`[${n}/${END}] FAILED: ${result.error}`);
      } else {
        results.push(result);
        if (n % 25 === 0 || n === END) console.log(`[${n}/${END}] ok (${results.length} ok, ${failures.length} failed so far)`);
      }
    } catch (err) {
      failures.push({ n, url: `https://dhammahadaya.net/ape-budu-hamuduruwo-${n}/`, error: err.message });
      console.error(`[${n}/${END}] EXCEPTION: ${err.message}`);
    }
    // Write incrementally so a crash/interrupt doesn't lose progress.
    fs.writeFileSync(OUT_PATH, JSON.stringify({ scrapedAt: new Date().toISOString(), results, failures }, null, 2), 'utf8');
    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${results.length} scraped, ${failures.length} failed.`);
  if (failures.length) console.log('Failures:', JSON.stringify(failures.map((f) => f.n)));
}

main().catch((err) => {
  console.error('Scraper crashed:', err);
  process.exitCode = 1;
});
