const express = require('express');
const router = express.Router();
const pool = require('../db');

// Q1: Clients whose policies have insurance_sum > X
router.get('/q1', async (req, res) => {
  try {
    const { min_sum = 0 } = req.query;
    const result = await pool.query(`
      SELECT DISTINCT p.full_name, p.inn_code, c.risk_level, ip.policy_code, ip.insurance_sum
      FROM clients c
      JOIN people p ON c.person_id = p.id
      JOIN insurance_policies ip ON ip.client_id = c.person_id
      WHERE ip.insurance_sum > $1
      ORDER BY ip.insurance_sum DESC
    `, [min_sum]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q2: Vehicles older than X years with their active policies count
router.get('/q2', async (req, res) => {
  try {
    const { max_year = 2020 } = req.query;
    const result = await pool.query(`
      SELECT v.vin_code, v.plate_number, v.manufacture_year, v.car_type,
             p.full_name AS owner_name,
             COUNT(ip.policy_code) AS active_policies_count
      FROM vehicles v
      JOIN client_vehicles cv ON cv.vehicle_vin = v.vin_code
      JOIN clients c ON c.person_id = cv.client_id
      JOIN people p ON p.id = c.person_id
      LEFT JOIN insurance_policies ip ON ip.vehicle_vin = v.vin_code
        AND ip.expiry_date >= CURRENT_DATE
      WHERE v.manufacture_year < $1
      GROUP BY v.vin_code, v.plate_number, v.manufacture_year, v.car_type, p.full_name
      ORDER BY v.manufacture_year ASC
    `, [max_year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q3: Agents who concluded more than X policies
router.get('/q3', async (req, res) => {
  try {
    const { min_count = 0 } = req.query;
    const result = await pool.query(`
      SELECT p.full_name, a.license_number, a.start_date,
             COUNT(ip.policy_code) AS policies_count,
             SUM(ip.insurance_sum) AS total_sum
      FROM agents a
      JOIN people p ON a.person_id = p.id
      LEFT JOIN insurance_policies ip ON ip.agent_id = a.person_id
      GROUP BY p.full_name, a.license_number, a.start_date
      HAVING COUNT(ip.policy_code) > $1
      ORDER BY policies_count DESC
    `, [min_count]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q4: Active policies (not expired) for clients with given risk level
router.get('/q4', async (req, res) => {
  try {
    const { risk_level = 'Low' } = req.query;
    const result = await pool.query(`
      SELECT p.full_name AS client_name, c.risk_level, ip.policy_code,
             ip.insurance_sum, ip.issue_date, ip.expiry_date,
             v.plate_number, v.car_type
      FROM clients c
      JOIN people p ON c.person_id = p.id
      JOIN insurance_policies ip ON ip.client_id = c.person_id
      JOIN vehicles v ON v.vin_code = ip.vehicle_vin
      WHERE c.risk_level = $1
        AND ip.expiry_date >= CURRENT_DATE
      ORDER BY ip.insurance_sum DESC
    `, [risk_level]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q5: Clients who have a policy covering risk type X
router.get('/q5', async (req, res) => {
  try {
    const { risk_type = 'ДТП' } = req.query;
    const result = await pool.query(`
      SELECT DISTINCT p.full_name, p.inn_code, c.risk_level,
             ip.policy_code, ip.insurance_sum, r.risk_type
      FROM clients c
      JOIN people p ON c.person_id = p.id
      JOIN insurance_policies ip ON ip.client_id = c.person_id
      JOIN policy_risks pr ON pr.policy_code = ip.policy_code
      JOIN risks r ON r.id = pr.risk_id
      WHERE r.risk_type = $1
      ORDER BY p.full_name
    `, [risk_type]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q6: Clients with EXACTLY the same set of risk types as client X (relational division)
router.get('/q6', async (req, res) => {
  try {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });
    const result = await pool.query(`
      SELECT DISTINCT p.full_name, p.inn_code, c.person_id
      FROM clients c
      JOIN people p ON c.person_id = p.id
      WHERE c.person_id != $1
      AND NOT EXISTS (
        SELECT pr.risk_id
        FROM insurance_policies ip
        JOIN policy_risks pr ON ip.policy_code = pr.policy_code
        WHERE ip.client_id = $1
        EXCEPT
        SELECT pr2.risk_id
        FROM insurance_policies ip2
        JOIN policy_risks pr2 ON ip2.policy_code = pr2.policy_code
        WHERE ip2.client_id = c.person_id
      )
      AND NOT EXISTS (
        SELECT pr.risk_id
        FROM insurance_policies ip
        JOIN policy_risks pr ON ip.policy_code = pr.policy_code
        WHERE ip.client_id = c.person_id
        EXCEPT
        SELECT pr2.risk_id
        FROM insurance_policies ip2
        JOIN policy_risks pr2 ON ip2.policy_code = pr2.policy_code
        WHERE ip2.client_id = $1
      )
      ORDER BY p.full_name
    `, [client_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Q7: Clients whose policies cover ALL existing risk types (relational division)
router.get('/q7', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT p.full_name, p.inn_code, c.risk_level
      FROM clients c
      JOIN people p ON c.person_id = p.id
      WHERE NOT EXISTS (
        SELECT r.id FROM risks r
        EXCEPT
        SELECT pr.risk_id
        FROM insurance_policies ip
        JOIN policy_risks pr ON ip.policy_code = pr.policy_code
        WHERE ip.client_id = c.person_id
      )
      ORDER BY p.full_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
