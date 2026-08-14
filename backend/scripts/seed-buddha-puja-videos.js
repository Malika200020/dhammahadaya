// Seeds the 12 real Buddha Puja videos (build-spec §12) via the actual
// HTTP admin API — same reasoning as the newsletter seed in step 5:
// posting through fetch() keeps Sinhala UTF-8 intact end-to-end, unlike
// piping it through a shell.
//
// Usage: node scripts/seed-buddha-puja-videos.js <admin-email> <admin-password>

const videos = require('../src/content/buddhaPujaSeedVideos.json');

const BASE = process.env.API_BASE || 'http://localhost:4000';

async function login(email, password) {
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  return res.headers.get('set-cookie').split(';')[0];
}

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node scripts/seed-buddha-puja-videos.js <admin-email> <admin-password>');
    process.exit(1);
  }
  const cookie = await login(email, password);

  // Derive video_type from the title text — the source data marks
  // Gilānpasa Pūjā videos with a "- ගිලන්පස" suffix; everything else is
  // the regular full-moon Sambuddha Pūjā.
  for (const v of videos) {
    const videoType = v.title_si.includes('ගිලන්පස') ? 'gilanpasa' : 'full_moon';
    const yearMatch = v.title_si.match(/^(\d{4})/);
    const year = yearMatch ? Number(yearMatch[1]) : null;

    const res = await fetch(`${BASE}/api/admin/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        section: 'buddha_puja',
        title_si: v.title_si,
        youtube_id: v.youtube_id,
        order: v.order,
        year,
        video_type: videoType,
      }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(`create failed for ${v.youtube_id}: ${res.status} ${JSON.stringify(body)}`);
    console.log(`Created: [${videoType}] ${v.title_si} (${v.youtube_id})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
