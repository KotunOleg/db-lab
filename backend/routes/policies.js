const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all policies (full join)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ip.policy_code, ip.insurance_sum, ip.issue_date, ip.expiry_date,
             ip.agent_id, ip.client_id, ip.vehicle_vin,
             pc.full_name AS client_name,
             pa.full_name AS agent_name,
             v.plate_number, v.car_type
      FROM insurance_policies ip
      JOIN clients c ON ip.client_id = c.person_id
      JOIN people pc ON c.person_id = pc.id
      LEFT JOIN agents a ON ip.agent_id = a.person_id
      LEFT JOIN people pa ON a.person_id = pa.id
      JOIN vehicles v ON ip.vehicle_vin = v.vin_code
      ORDER BY ip.policy_code
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET risks for a policy
router.get('/:code/risks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.risk_type
      FROM policy_risks pr
      JOIN risks r ON pr.risk_id = r.id
      WHERE pr.policy_code = $1
      ORDER BY r.id
    `, [req.params.code]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST add risk to policy
router.post('/:code/risks', async (req, res) => {
  try {
    const { risk_id } = req.body;
    const result = await pool.query(
      'INSERT INTO policy_risks (policy_code, risk_id) VALUES ($1, $2) RETURNING *',
      [req.params.code, risk_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE risk from policy
router.delete('/:code/risks/:risk_id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM policy_risks WHERE policy_code=$1 AND risk_id=$2 RETURNING *',
      [req.params.code, req.params.risk_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Policy risk not found' });
    res.json({ message: 'Risk removed from policy' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single policy
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ip.policy_code, ip.insurance_sum, ip.issue_date, ip.expiry_date,
             ip.agent_id, ip.client_id, ip.vehicle_vin,
             pc.full_name AS client_name,
             pa.full_name AS agent_name,
             v.plate_number, v.car_type
      FROM insurance_policies ip
      JOIN clients c ON ip.client_id = c.person_id
      JOIN people pc ON c.person_id = pc.id
      LEFT JOIN agents a ON ip.agent_id = a.person_id
      LEFT JOIN people pa ON a.person_id = pa.id
      JOIN vehicles v ON ip.vehicle_vin = v.vin_code
      WHERE ip.policy_code = $1
    `, [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create policy
router.post('/', async (req, res) => {
  try {
    const { policy_code, insurance_sum, issue_date, expiry_date, agent_id, client_id, vehicle_vin } = req.body;
    const result = await pool.query(
      `INSERT INTO insurance_policies (policy_code, insurance_sum, issue_date, expiry_date, agent_id, client_id, vehicle_vin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [policy_code, insurance_sum, issue_date, expiry_date, agent_id || null, client_id, vehicle_vin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update policy
router.put('/:code', async (req, res) => {
  try {
    const { insurance_sum, issue_date, expiry_date, agent_id, client_id, vehicle_vin } = req.body;
    const result = await pool.query(
      `UPDATE insurance_policies
       SET insurance_sum=$1, issue_date=$2, expiry_date=$3, agent_id=$4, client_id=$5, vehicle_vin=$6
       WHERE policy_code=$7 RETURNING *`,
      [insurance_sum, issue_date, expiry_date, agent_id || null, client_id, vehicle_vin, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE policy
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM insurance_policies WHERE policy_code=$1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
