const { Pool } = require('pg');

// Buat koneksi ke database PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employeabs',
  password: 'arnoarno',
  port: 5432,
});

const seedSettings = async () => {
  const query = `
    INSERT INTO settings (name, version, status)
    VALUES
      ('MyOffice', '1.0.0', 'Beta On Build');
  `;
  
  try {
    await pool.query(query);
    console.log('Seeder berhasil dijalankan!');
  } catch (err) {
    console.error('Seeder gagal dijalankan: ', err);
  } finally {
    pool.end();
  }
};

seedSettings();
