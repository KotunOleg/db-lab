const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all clients (joined with people)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.person_id, c.risk_level,
             p.full_name, p.inn_code, p.birth_date, p.gender
      FROM clients c
      JOIN people p ON c.person_id = p.id
      ORDER BY c.person_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single client
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.person_id, c.risk_level,
             p.full_name, p.inn_code, p.birth_date, p.gender
      FROM clients c
      JOIN people p ON c.person_id = p.id
      WHERE c.person_id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create client
router.post('/', async (req, res) => {
  try {
    const { person_id, risk_level } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (person_id, risk_level) VALUES ($1, $2) RETURNING *',
      [person_id, risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  try {
    const { risk_level } = req.body;
    const result = await pool.query(
      'UPDATE clients SET risk_level=$1 WHERE person_id=$2 RETURNING *',
      [risk_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE person_id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
