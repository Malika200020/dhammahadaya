// Retries a specific list of post numbers that failed the main scrape
// (network blip, or the .entry-content fallback added afterward) and
// merges successes into the existing JSON rather than overwriting it.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const OUT_PATH = path.join(__dirname, 'ape-budu-hamuduruwo-scraped.json');
const NUMBERS = process.argv.slice(2).map(Number);

function cleanBodyHtml($, widget) {
  widget.find('*').each((_, el) => {
    $(el).removeAttr('style').removeAttr('class').removeAttr('id');
  });
  widget.find('script, style').remove();
  const isBlank = (el) => $(el).text().replace(/ /g, '').trim().length === 0;
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
  if (!res.ok) return { n, url, error: `HTTP ${res.status}` };
  const html = await res.text();
  const $ = cheerio.load(html);

  let widget = $('.elementor-widget-text-editor .elementor-widget-container').first();
  if (widget.length === 0) widget = $('.entry-content').first();
  if (widget.length === 0) return { n, url, error: 'No content container found' };

  const heading = widget.find('h1,h2,h3,h4').first();
  let title = heading.text().replace(/\s+/g, ' ').trim();
  if (heading.length) heading.remove();
  if (!title) title = `අපේ බුදු හාමුදුරුවෝ ${n}`;

  const bodyHtml = cleanBodyHtml($, widget);
  const plainText = widget.text().replace(/\s+/g, ' ').trim();
  const excerpt = plainText.length > 220 ? plainText.slice(0, 220).trim() + '…' : plainText;

  if (!bodyHtml) return { n, url, error: 'Body empty', title };
  return { n, url, title, excerpt, body: bodyHtml };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
  const resultsByN = new Map(data.results.map((r) => [r.n, r]));
  const stillFailed = [];

  for (const n of NUMBERS) {
    const r = await scrapeOne(n);
    if (r.error) {
      console.error(`[${n}] still failed: ${r.error}`);
      stillFailed.push(r);
    } else {
      console.log(`[${n}] ok — title: ${r.title}`);
      resultsByN.set(n, r);
    }
    await new Promise((res) => setTimeout(res, 400));
  }

  data.results = [...resultsByN.values()].sort((a, b) => a.n - b.n);
  data.failures = stillFailed;
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nMerged. Total ok: ${data.results.length}. Still failed: ${stillFailed.map((f) => f.n).join(', ') || 'none'}`);
}

main().catch((err) => {
  console.error('Retry crashed:', err);
  process.exitCode = 1;
});
