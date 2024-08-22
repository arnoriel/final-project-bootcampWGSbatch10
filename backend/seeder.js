const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const seedUsers = async () => {
  try {
    // Membersihkan tabel users
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: bcrypt.hashSync('superadmin123', 10),
        role: 'superadmin',
        divisi: 'Management',
        phone: '081234567890',
        image: 'default.jpg'
      },
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        divisi: 'HR',
        phone: '081234567891',
        image: 'default.jpg'
      },
      {
        name: 'User',
        email: 'user@example.com',
        password: bcrypt.hashSync('user123', 10),
        role: 'user',
        divisi: 'Sales',
        phone: '081234567892',
        image: 'default.jpg'
      }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password, role, divisi, phone, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.name, user.email, user.password, user.role, user.divisi, user.phone, user.image]
      );
    }

    console.log('Seeding users completed.');
  } catch (error) {
    console.error('Error seeding users:', error.message);
  } finally {
    // Tutup koneksi database setelah seeding selesai
    await pool.end();
    process.exit();
  }
};

seedUsers();
