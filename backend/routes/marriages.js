const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all marriages (joined with people for names)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.husband_id, m.wife_id, m.marriage_date,
             ph.full_name AS husband_name,
             pw.full_name AS wife_name
      FROM marriages m
      JOIN clients ch ON m.husband_id = ch.person_id
      JOIN people ph ON ch.person_id = ph.id
      JOIN clients cw ON m.wife_id = cw.person_id
      JOIN people pw ON cw.person_id = pw.id
      ORDER BY m.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single marriage
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.husband_id, m.wife_id, m.marriage_date,
             ph.full_name AS husband_name,
             pw.full_name AS wife_name
      FROM marriages m
      JOIN clients ch ON m.husband_id = ch.person_id
      JOIN people ph ON ch.person_id = ph.id
      JOIN clients cw ON m.wife_id = cw.person_id
      JOIN people pw ON cw.person_id = pw.id
      WHERE m.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marriage not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create marriage
router.post('/', async (req, res) => {
  try {
    const { husband_id, wife_id, marriage_date } = req.body;
    const result = await pool.query(
      'INSERT INTO marriages (husband_id, wife_id, marriage_date) VALUES ($1, $2, $3) RETURNING *',
      [husband_id, wife_id, marriage_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update marriage
router.put('/:id', async (req, res) => {
  try {
    const { husband_id, wife_id, marriage_date } = req.body;
    const result = await pool.query(
      'UPDATE marriages SET husband_id=$1, wife_id=$2, marriage_date=$3 WHERE id=$4 RETURNING *',
      [husband_id, wife_id, marriage_date || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marriage not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE marriage
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM marriages WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marriage not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
