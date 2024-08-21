const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Pastikan path-nya sesuai
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah user ada
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Bandingkan password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      'your_secret_key', // Gantilah dengan secret key yang aman
      { expiresIn: '1h' }
    );

    // Simpan token dan data user di session atau cookie (opsional)
    req.session.token = token;
    req.session.user = user;

    // Redirect berdasarkan role
    if (user.role === 'superadmin') {
      return res.redirect('/superadmin');
    } else if (user.role === 'admin') {
      return res.redirect('/admin');
    } else if (user.role === 'user') {
      return res.redirect('/user');
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
