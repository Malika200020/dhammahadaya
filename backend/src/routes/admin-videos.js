const express = require('express');
const { pool } = require('../db');
const { extractYoutubeId } = require('../youtubeId');

const router = express.Router();

const VIDEO_TYPES = new Set(['full_moon', 'gilanpasa']);

function validatePayload(body) {
  const { section, series_slug, title_si, youtube_id, video_type } = body || {};
  if (section !== 'dhamma_sermon' && section !== 'buddha_puja') {
    return 'section must be "dhamma_sermon" or "buddha_puja"';
  }
  if (section === 'dhamma_sermon' && !series_slug) {
    return 'series_slug is required for dhamma_sermon videos';
  }
  if (section === 'buddha_puja' && series_slug) {
    return 'series_slug must not be set for buddha_puja videos';
  }
  if (!title_si) return 'title_si is required';
  if (!youtube_id) return 'youtube_id is required';
  if (video_type && !VIDEO_TYPES.has(video_type)) {
    return `video_type must be one of: ${[...VIDEO_TYPES].join(', ')}`;
  }
  return null;
}

// GET /api/admin/videos?section=dhamma_sermon&seriesSlug=... or ?section=buddha_puja
router.get('/', async (req, res, next) => {
  try {
    const { section, seriesSlug } = req.query;
    if (section !== 'dhamma_sermon' && section !== 'buddha_puja') {
      return res.status(400).json({ error: 'section must be "dhamma_sermon" or "buddha_puja"' });
    }
    if (section === 'dhamma_sermon' && !seriesSlug) {
      return res.status(400).json({ error: 'seriesSlug is required when section=dhamma_sermon' });
    }
    const result = await pool.query(
      section === 'dhamma_sermon'
        ? `SELECT * FROM videos WHERE section = $1 AND series_slug = $2 ORDER BY "order" ASC, id ASC;`
        : `SELECT * FROM videos WHERE section = $1 ORDER BY "order" ASC, id ASC;`,
      section === 'dhamma_sermon' ? [section, seriesSlug] : [section]
    );
    res.json({ videos: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ video: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const { section, series_slug, title_si, title_en, youtube_id, order, year, speaker, video_type } = req.body;
    const result = await pool.query(
      `INSERT INTO videos (section, series_slug, title_si, title_en, youtube_id, "order", year, speaker, video_type)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0), $7, $8, $9)
       RETURNING *;`,
      [
        section,
        section === 'dhamma_sermon' ? series_slug : null,
        title_si,
        title_en || null,
        extractYoutubeId(youtube_id),
        order ?? null,
        year || null,
        section === 'dhamma_sermon' ? speaker || null : null,
        section === 'buddha_puja' ? video_type || null : null,
      ]
    );
    res.status(201).json({ video: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Unknown series_slug' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const { section, series_slug, title_si, title_en, youtube_id, order, year, speaker, video_type } = req.body;
    const result = await pool.query(
      `UPDATE videos SET
         section = $1, series_slug = $2, title_si = $3, title_en = $4, youtube_id = $5,
         "order" = COALESCE($6, "order"), year = $7, speaker = $8, video_type = $9
       WHERE id = $10
       RETURNING *;`,
      [
        section,
        section === 'dhamma_sermon' ? series_slug : null,
        title_si,
        title_en || null,
        extractYoutubeId(youtube_id),
        order ?? null,
        year || null,
        section === 'dhamma_sermon' ? speaker || null : null,
        section === 'buddha_puja' ? video_type || null : null,
        req.params.id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ video: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Unknown series_slug' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
