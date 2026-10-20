const express = require('express');
const { pool } = require('../db');
const { parseYoutubeVideoId } = require('../youtubeUrl');

const router = express.Router();

// GET /api/youtube-live — public. { url: null } when nothing is set (the
// Home page's YouTube Live section renders nothing at all in that case,
// not an empty placeholder), otherwise { url, videoId }.
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT url FROM youtube_live_setting WHERE id = 1;');
    const url = result.rows[0]?.url || null;
    if (!url) return res.json({ url: null });
    res.json({ url, videoId: parseYoutubeVideoId(url) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
