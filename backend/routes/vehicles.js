const express = require('express');
const router = express.Router();
const pool = require('../db');

// DELETE vehicle assignment (must come before /:vin to avoid route conflict)
router.delete('/assign/:client_id/:vehicle_vin', async (req, res) => {
  try {
    const { client_id, vehicle_vin } = req.params;
    const result = await pool.query(
      'DELETE FROM client_vehicles WHERE client_id=$1 AND vehicle_vin=$2 RETURNING *',
      [client_id, vehicle_vin]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST assign vehicle to client
router.post('/assign', async (req, res) => {
  try {
    const { client_id, vehicle_vin } = req.body;
    const result = await pool.query(
      'INSERT INTO client_vehicles (client_id, vehicle_vin) VALUES ($1, $2) RETURNING *',
      [client_id, vehicle_vin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY vin_code');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET clients for a vehicle
router.get('/:vin/clients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.person_id, p.full_name, p.inn_code, c.risk_level
      FROM client_vehicles cv
      JOIN clients c ON cv.client_id = c.person_id
      JOIN people p ON c.person_id = p.id
      WHERE cv.vehicle_vin = $1
    `, [req.params.vin]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single vehicle
router.get('/:vin', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE vin_code=$1', [req.params.vin]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create vehicle
router.post('/', async (req, res) => {
  try {
    const { vin_code, plate_number, manufacture_year, car_type } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (vin_code, plate_number, manufacture_year, car_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [vin_code, plate_number, manufacture_year || null, car_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle
router.put('/:vin', async (req, res) => {
  try {
    const { plate_number, manufacture_year, car_type } = req.body;
    const result = await pool.query(
      'UPDATE vehicles SET plate_number=$1, manufacture_year=$2, car_type=$3 WHERE vin_code=$4 RETURNING *',
      [plate_number, manufacture_year || null, car_type, req.params.vin]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE vehicle
router.delete('/:vin', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE vin_code=$1 RETURNING *', [req.params.vin]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
