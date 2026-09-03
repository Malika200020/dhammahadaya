const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT year, organizers FROM katina_year ORDER BY year DESC;",
    );
    res.json({ years: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:year", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT year, organizers FROM katina_year WHERE year = $1;",
      [req.params.year],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ year: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { year, organizers } = req.body || {};
    if (!Number.isInteger(Number(year)))
      return res.status(400).json({ error: "A valid year is required" });
    const result = await pool.query(
      `INSERT INTO katina_year (year, organizers) VALUES ($1, $2) RETURNING *;`,
      [Number(year), Array.isArray(organizers) ? organizers : []],
    );
    res.status(201).json({ year: result.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "That year already exists" });
    next(err);
  }
});

router.put("/:year", async (req, res, next) => {
  try {
    const { organizers } = req.body || {};
    const result = await pool.query(
      `UPDATE katina_year SET organizers = $1 WHERE year = $2 RETURNING *;`,
      [Array.isArray(organizers) ? organizers : [], req.params.year],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ year: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Also removes that year's photo gallery — otherwise the images would be
// orphaned under a gallery_key with no katina_year row left to own them.
router.delete("/:year", async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM gallery_images WHERE gallery = 'katina' AND gallery_key = $1;`,
      [req.params.year],
    );
    const result = await client.query(
      "DELETE FROM katina_year WHERE year = $1 RETURNING year;",
      [req.params.year],
    );
    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }
    await client.query("COMMIT");
    res.status(204).end();
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
