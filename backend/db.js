const { Pool } = require('pg');
const { record } = require('./queryLogger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'insurance_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secret',
});

const _query = pool.query.bind(pool);
pool.query = function (text, params) {
  record(text, params);
  return _query(text, params);
};

module.exports = pool;
