const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all risks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create risk
router.post('/', async (req, res) => {
  try {
    const { risk_type } = req.body;
    const result = await pool.query(
      'INSERT INTO risks (risk_type) VALUES ($1) RETURNING *',
      [risk_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update risk
router.put('/:id', async (req, res) => {
  try {
    const { risk_type } = req.body;
    const result = await pool.query(
      'UPDATE risks SET risk_type=$1 WHERE id=$2 RETURNING *',
      [risk_type, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE risk
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM risks WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
