const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all relatives (with optional client_id filter)
router.get('/', async (req, res) => {
  try {
    const { client_id } = req.query;
    let query = `
      SELECT r.client_id, r.full_name, r.relationship_type,
             p.full_name AS client_name
      FROM relatives r
      JOIN clients c ON r.client_id = c.person_id
      JOIN people p ON c.person_id = p.id
      ORDER BY r.client_id, r.full_name
    `;
    let params = [];
    if (client_id) {
      query = `
        SELECT r.client_id, r.full_name, r.relationship_type,
               p.full_name AS client_name
        FROM relatives r
        JOIN clients c ON r.client_id = c.person_id
        JOIN people p ON c.person_id = p.id
        WHERE r.client_id = $1
        ORDER BY r.full_name
      `;
      params = [client_id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create relative
router.post('/', async (req, res) => {
  try {
    const { client_id, full_name, relationship_type } = req.body;
    const result = await pool.query(
      'INSERT INTO relatives (client_id, full_name, relationship_type) VALUES ($1, $2, $3) RETURNING *',
      [client_id, full_name, relationship_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE relative by client_id and full_name (URL encoded)
router.delete('/:client_id/:full_name', async (req, res) => {
  try {
    const { client_id, full_name } = req.params;
    const decodedName = decodeURIComponent(full_name);
    const result = await pool.query(
      'DELETE FROM relatives WHERE client_id=$1 AND full_name=$2 RETURNING *',
      [client_id, decodedName]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Relative not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
