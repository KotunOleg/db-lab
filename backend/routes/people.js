const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all people (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM people ORDER BY id';
    let params = [];
    if (search) {
      query = 'SELECT * FROM people WHERE full_name ILIKE $1 OR inn_code ILIKE $1 ORDER BY id';
      params = [`%${search}%`];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single person by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM people WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Person not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create person
router.post('/', async (req, res) => {
  try {
    const { inn_code, full_name, birth_date, gender } = req.body;
    const result = await pool.query(
      'INSERT INTO people (inn_code, full_name, birth_date, gender) VALUES ($1, $2, $3, $4) RETURNING *',
      [inn_code, full_name, birth_date || null, gender || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update person
router.put('/:id', async (req, res) => {
  try {
    const { inn_code, full_name, birth_date, gender } = req.body;
    const result = await pool.query(
      'UPDATE people SET inn_code=$1, full_name=$2, birth_date=$3, gender=$4 WHERE id=$5 RETURNING *',
      [inn_code, full_name, birth_date || null, gender || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Person not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE person
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM people WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Person not found' });
    res.json({ message: 'Deleted', person: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
