const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all agents (joined with people)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.person_id, a.license_number, a.start_date,
             p.full_name, p.inn_code, p.birth_date, p.gender
      FROM agents a
      JOIN people p ON a.person_id = p.id
      ORDER BY a.person_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single agent
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.person_id, a.license_number, a.start_date,
             p.full_name, p.inn_code, p.birth_date, p.gender
      FROM agents a
      JOIN people p ON a.person_id = p.id
      WHERE a.person_id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create agent
router.post('/', async (req, res) => {
  try {
    const { person_id, license_number, start_date } = req.body;
    const result = await pool.query(
      'INSERT INTO agents (person_id, license_number, start_date) VALUES ($1, $2, $3) RETURNING *',
      [person_id, license_number, start_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update agent
router.put('/:id', async (req, res) => {
  try {
    const { license_number, start_date } = req.body;
    const result = await pool.query(
      'UPDATE agents SET license_number=$1, start_date=$2 WHERE person_id=$3 RETURNING *',
      [license_number, start_date || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE agent
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM agents WHERE person_id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
