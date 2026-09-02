// One-off migration script (build-spec §5.4 gap) — the "Important Articles"
// posts were never part of the original migration export (only the 5 Ninja
// Tables were, same gap as Ape Budu Hamuduruwo — see scrape-ape-budu-
// hamuduruwo.js). They still exist on the live WordPress site as 150
// individual posts spread across 7 pages of an Elementor posts widget
// (query param `e-page-b4fe255`), each with its own real slug — unlike Ape
// Budu Hamuduruwo's numbered-URL pattern. This scrapes them directly via
// raw HTTP + HTML parsing (cheerio), deliberately NOT through any AI/
// summarization step, to guarantee the Sinhala text is preserved
// byte-for-byte. Writes to a JSON file for manual spot-checking; a separate
// script (import-important-articles.js) does the actual DB insert after
// review.
//
// Usage: node scripts/scrape-important-articles.js
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const LISTING_BASE = 'https://dhammahadaya.net/important-articles/';
const LISTING_PARAM = 'e-page-b4fe255';
const DELAY_MS = 350;
const OUT_PATH = path.join(__dirname, 'important-articles-scraped.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DhammahadayaMigration/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Walks the listing pages in display order, collecting each post's URL.
// Stops at the first page with zero post items (confirmed empirically:
// page 7 has 6 items, page 8 has 0).
async function collectListingUrls() {
  const urls = [];
  const seen = new Set();
  for (let page = 1; ; page++) {
    const url = page === 1 ? LISTING_BASE : `${LISTING_BASE}?${LISTING_PARAM}=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const items = $('article.elementor-post');
    if (items.length === 0) break;
    items.each((_, el) => {
      const href = $(el).find('a').first().attr('href');
      if (href && !seen.has(href)) {
        seen.add(href);
        urls.push(href);
      }
    });
    console.log(`[listing page ${page}] ${items.length} items (${urls.length} total so far)`);
    await sleep(DELAY_MS);
  }
  return urls;
}

function cleanBodyHtml($, widget) {
  // Lazy-loaded images store the real URL in data-src, with `src` holding a
  // 1x1 placeholder GIF (no lazy-load JS runs on our site to swap it back
  // on scroll) — promote it before data-* attributes are stripped below,
  // or every such image would render blank.
  widget.find('img[data-src]').each((_, el) => {
    $(el).attr('src', $(el).attr('data-src'));
  });
  // <noscript> holds a duplicate fallback <img> as raw text (cheerio/the
  // browser treats its content as inert markup text, not a real element) —
  // redundant now that the real <img> above has its src fixed, and left in
  // place it would render as literal visible "<img .../>" source text.
  widget.find('noscript').remove();

  widget.find('*').each((_, el) => {
    const attribs = Object.keys(el.attribs || {});
    for (const name of attribs) {
      if (name === 'style' || name === 'class' || name === 'id' || name.startsWith('data-')) {
        $(el).removeAttr(name);
      }
    }
  });
  widget.find('script, style').remove();
  // An element wrapping only an <img> (no caption text) has empty .text()
  // but is real content, not blank filler — don't let the trim below eat a
  // leading/trailing image.
  const isBlank = (el) => {
    if (el.tagName === 'img' || $(el).find('img').length > 0) return false;
    return $(el).text().replace(/ /g, '').trim().length === 0;
  };
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

async function scrapeOne(n, url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().replace(/\s+/g, ' ').trim();

  // Prefer the narrow text-editor widget (matches scrape-ape-budu-
  // hamuduruwo.js) — on Elementor-themed posts, `.entry-content` wraps the
  // *entire* content area including the "Post Navigation" (prev/next)
  // widget below the text, whose raw markup (SVG icons, data-widget_type
  // attributes) would otherwise get scraped straight into the body.
  // `.entry-content` is only used as a fallback for the handful of older,
  // non-Elementor posts that don't have this widget structure at all.
  let widget = $('.elementor-widget-text-editor .elementor-widget-container').first();
  if (widget.length === 0) {
    widget = $('.entry-content').first();
  }
  if (widget.length === 0) {
    return { n, url, error: 'No .elementor-widget-text-editor or .entry-content found', title };
  }
  // Defensive: on the `.entry-content` fallback path, strip any Post
  // Navigation widget that came along with it (confirmed necessary for at
  // least one page — https://dhammahadaya.net/aarya-puggala/ — whose only
  // content is an image, so it has no text-editor widget to match above).
  widget.find('[data-widget_type^="post-navigation"]').remove();

  const bodyHtml = cleanBodyHtml($, widget);
  const plainText = widget.text().replace(/\s+/g, ' ').trim();
  const excerpt = plainText.length > 220 ? plainText.slice(0, 220).trim() + '…' : plainText;

  // No minimum text-length check here (unlike the length guard this
  // replaced) — a handful of genuine posts are image-only (e.g.
  // aarya-puggala, a scanned chart with no text at all), and rejecting
  // those as "too short" would silently drop real content.
  if (!title || !bodyHtml) {
    return { n, url, error: 'Title or body empty', title, bodyLength: bodyHtml ? bodyHtml.length : 0 };
  }

  return { n, url, title, excerpt, body: bodyHtml };
}

async function main() {
  console.log('Collecting listing URLs...');
  const urls = await collectListingUrls();
  console.log(`Found ${urls.length} post URLs in reading order.\n`);

  const results = [];
  const failures = [];

  for (let i = 0; i < urls.length; i++) {
    const n = i + 1;
    const url = urls[i];
    try {
      const result = await scrapeOne(n, url);
      if (result.error) {
        failures.push(result);
        console.error(`[${n}/${urls.length}] FAILED: ${result.error} (${url})`);
      } else {
        results.push(result);
        if (n % 25 === 0 || n === urls.length) console.log(`[${n}/${urls.length}] ok (${results.length} ok, ${failures.length} failed so far)`);
      }
    } catch (err) {
      failures.push({ n, url, error: err.message });
      console.error(`[${n}/${urls.length}] EXCEPTION: ${err.message}`);
    }
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
