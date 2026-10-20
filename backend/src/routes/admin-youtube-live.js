const express = require('express');
const { pool } = require('../db');
const { parseYoutubeVideoId } = require('../youtubeUrl');

const router = express.Router();

// Content-tier (requireAdminAuth only, mounted in app.js) — both admin
// roles can set the live link, per the client's spec.

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT url FROM youtube_live_setting WHERE id = 1;');
    const url = result.rows[0]?.url || null;
    res.json({ url, videoId: url ? parseYoutubeVideoId(url) : null });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });
    const videoId = parseYoutubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not find a YouTube video ID in that URL. Paste a youtube.com/watch, youtu.be, or youtube.com/live link.' });
    }
    await pool.query(
      `INSERT INTO youtube_live_setting (id, url, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, updated_at = now();`,
      [url]
    );
    res.json({ url, videoId });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await pool.query(
      `INSERT INTO youtube_live_setting (id, url, updated_at) VALUES (1, NULL, now())
       ON CONFLICT (id) DO UPDATE SET url = NULL, updated_at = now();`
    );
    res.json({ url: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
