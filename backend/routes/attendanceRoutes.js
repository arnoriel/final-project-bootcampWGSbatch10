const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middlewares/auth');  // Middleware untuk autentikasi JWT

router.post('/attendance/start', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    try {
      await pool.query('INSERT INTO attendance (user_id, start_time) VALUES ($1, NOW())', [user_id]);
      res.status(200).json({ message: 'Attendance started' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/attendance/end', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    try {
      await pool.query('UPDATE attendance SET end_time = NOW() WHERE user_id = $1 AND end_time IS NULL', [user_id]);
      res.status(200).json({ message: 'Attendance ended' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
