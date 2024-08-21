const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

router.post('/user', async (req, res) => {
  const { name, email, password, role, division, phone } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    await pool.query('INSERT INTO users (name, email, password, role, division, phone) VALUES ($1, $2, $3, $4, $5, $6)', 
      [name, email, hashedPassword, role, division, phone]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
