const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

function pagingParams(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE)
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

// GET /api/videos/dhamma-sermon/series — the index page's list of series.
router.get('/dhamma-sermon/series', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT slug, name_si, name_en FROM video_series ORDER BY "order" ASC;`
    );
    res.json({ series: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/videos/dhamma-sermon/:seriesSlug — paginated videos in one series.
router.get('/dhamma-sermon/:seriesSlug', async (req, res, next) => {
  try {
    const seriesResult = await pool.query(
      `SELECT slug, name_si, name_en FROM video_series WHERE slug = $1;`,
      [req.params.seriesSlug]
    );
    const series = seriesResult.rows[0];
    if (!series) return res.status(404).json({ error: `Unknown series "${req.params.seriesSlug}"` });

    const { page, pageSize, offset } = pagingParams(req);
    const [countResult, videosResult] = await Promise.all([
      pool.query(`SELECT count(*) FROM videos WHERE section = 'dhamma_sermon' AND series_slug = $1;`, [series.slug]),
      pool.query(
        `SELECT id, title_si, title_en, youtube_id, year, speaker
         FROM videos WHERE section = 'dhamma_sermon' AND series_slug = $1
         ORDER BY "order" ASC, id ASC LIMIT $2 OFFSET $3;`,
        [series.slug, pageSize, offset]
      ),
    ]);
    const totalRows = Number(countResult.rows[0].count);

    res.json({
      series,
      page,
      pageSize,
      totalRows,
      totalPages: Math.max(1, Math.ceil(totalRows / pageSize)),
      videos: videosResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/videos/buddha-puja — paginated Buddha Puja videos (no series).
router.get('/buddha-puja', async (req, res, next) => {
  try {
    const { page, pageSize, offset } = pagingParams(req);
    const [countResult, videosResult] = await Promise.all([
      pool.query(`SELECT count(*) FROM videos WHERE section = 'buddha_puja';`),
      pool.query(
        `SELECT id, title_si, title_en, youtube_id, year, video_type
         FROM videos WHERE section = 'buddha_puja'
         ORDER BY "order" ASC, id ASC LIMIT $1 OFFSET $2;`,
        [pageSize, offset]
      ),
    ]);
    const totalRows = Number(countResult.rows[0].count);

    res.json({
      page,
      pageSize,
      totalRows,
      totalPages: Math.max(1, Math.ceil(totalRows / pageSize)),
      videos: videosResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
