// One-off migration script (build-spec §9 gap) — the 6 Dhamma Sermons
// series (video_series rows already seeded by migrate.js) never had their
// actual episodes migrated; only 6 empty series + 12 unrelated Buddha Puja
// sample rows existed in `videos`.
//
// Unlike the text-based migrations (Ape Budu Hamuduruwo, Important
// Articles, Posts), this CANNOT be done with a plain HTTP fetch + cheerio:
// the live site's video grid (YotuWP plugin) renders nothing in the raw
// HTML — the initial page load literally has an empty <code> placeholder,
// and the video list plus every subsequent page of results are injected by
// client-side JS after the page loads. So this uses a real headless
// browser (puppeteer-core + local Chrome) to render each series page and
// walk its pagination.
//
// Also works around an unrelated live-site bug found while investigating:
// the site's LiteSpeed cache is currently serving 404s for its combined
// CSS/JS bundle on every page, which breaks the pagination click handler.
// Appending `?LSCWP_CTRL=before_optm` (a standard LiteSpeed Cache query
// param) tells it to skip serving the broken optimized bundle and load the
// original unbundled assets instead, which are unaffected by that bug.
//
// Usage: node scripts/scrape-dhamma-sermons.js
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_PATH = path.join(__dirname, 'dhamma-sermons-scraped.json');

const SLUGS = [
  'australia-dhamma-sermons',
  'calgary-dhamma-sermons',
  'katina-pinkam-dhamma-sermons',
  'london-dhamma-sermons',
  'sadaham-sakmana-dhamma-sermons',
  'the-buddhist-tv-dhamma-sermon',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readItems(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.yotu-video')).map((el) => ({
      youtube_id: el.dataset.videoid,
      title_si: el.dataset.title || el.querySelector('.yotu-video-title')?.textContent?.trim() || '',
    }))
  );
}

async function scrapeSeries(page, slug) {
  const url = `https://dhammahadaya.net/${slug}/?LSCWP_CTRL=before_optm`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1500);

  const h1 = await page.$eval('h1', (el) => el.textContent.trim()).catch(() => null);

  const paginationText = await page
    .$eval('.yotu-pagination', (el) => el.textContent.replace(/\s+/g, ' ').trim())
    .catch(() => null);
  const match = paginationText ? paginationText.match(/(\d+)\s+of\s+(\d+)/) : null;
  const totalPages = match ? Number(match[2]) : 1;

  const allVideos = [];
  allVideos.push(...(await readItems(page)));
  console.log(`  [${slug}] page 1/${totalPages}: ${allVideos.length} videos (h1: "${h1}")`);

  for (let p = 2; p <= totalPages; p++) {
    const nextBtn = await page.$('.yotu-pagination-next');
    if (!nextBtn) {
      console.log(`  [${slug}] WARNING: no next button found before page ${p}, stopping early`);
      break;
    }
    try {
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('admin-ajax'), { timeout: 15000 }),
        page.evaluate(() =>
          document.querySelector('.yotu-pagination-next').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        ),
      ]);
    } catch (err) {
      console.log(`  [${slug}] WARNING: pagination ajax wait failed at page ${p}: ${err.message}`);
    }
    await sleep(1200);
    const items = await readItems(page);
    console.log(`  [${slug}] page ${p}/${totalPages}: ${items.length} videos`);
    allVideos.push(...items);
    await sleep(400);
  }

  return { slug, h1, totalPages, videos: allVideos };
}

async function main() {
  // puppeteer-core ships as an ESM-only package; a dynamic import keeps
  // this script itself as plain CommonJS like the other scripts here.
  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const results = [];
  for (const slug of SLUGS) {
    console.log(`Scraping ${slug}...`);
    try {
      results.push(await scrapeSeries(page, slug));
    } catch (err) {
      console.error(`FAILED for ${slug}: ${err.message}`);
      results.push({ slug, error: err.message, videos: [] });
    }
    fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf8');
  }

  console.log('\nDone. Summary:');
  for (const r of results) {
    console.log(`  ${r.slug}: ${r.videos.length} videos${r.error ? ` (ERROR: ${r.error})` : ''}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Scraper crashed:', err);
  process.exitCode = 1;
});
