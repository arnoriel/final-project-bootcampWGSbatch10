const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const seedUsers = async () => {
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: bcrypt.hashSync('superadmin123', 10),
      role: 'superadmin',
      divisi: 'Management',
      phone: '081234567890',
    },
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      divisi: 'HR',
      phone: '081234567891',
    },
    {
      name: 'User',
      email: 'user@example.com',
      password: bcrypt.hashSync('user123', 10),
      role: 'user',
      divisi: 'Sales',
      phone: '081234567892',
    }
  ];

  for (const user of users) {
    await pool.query(
      'INSERT INTO users (name, email, password, role, divisi, phone) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.name, user.email, user.password, user.role, user.divisi, user.phone]
    );
  }

  console.log('Seeding users completed.');
  process.exit();
};

seedUsers();
