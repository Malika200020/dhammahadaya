const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/galleries/:gallery?key=... — e.g. /api/galleries/buddha-puja,
// later /api/galleries/katina?key=2025. Generic across every admin-uploaded
// photo gallery in the app (build-spec §11 Katina, §12 Buddha Puja, §14 About)
// — not specific to any one of them.
router.get('/:gallery', async (req, res, next) => {
  try {
    const { gallery } = req.params;
    const key = typeof req.query.key === 'string' ? req.query.key : null;
    const result = await pool.query(
      key
        ? `SELECT id, image_url, image_date, caption FROM gallery_images
           WHERE gallery = $1 AND gallery_key = $2 ORDER BY "order" ASC, id ASC;`
        : `SELECT id, image_url, image_date, caption FROM gallery_images
           WHERE gallery = $1 AND gallery_key IS NULL ORDER BY "order" ASC, id ASC;`,
      key ? [gallery, key] : [gallery]
    );
    res.json({ gallery, key, images: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
