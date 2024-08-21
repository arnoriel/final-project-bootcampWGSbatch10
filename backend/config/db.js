const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'attendance_db',
  password: 'arnoarno',
  port: 5432
});

module.exports = pool;
