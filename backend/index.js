const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const bodyParser = require('body-parser'); // Untuk parsing request body
const cors = require('cors'); // Opsional, untuk mengizinkan permintaan lintas domain
const path = require('path'); // Untuk bekerja dengan path
const router = express.Router();

const app = express();
const PORT = 3000;

// Set view engine menjadi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Opsional jika Anda memerlukan akses lintas domain

// Tambahkan route untuk halaman utama (contoh)
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Route untuk login
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
    const token = jwt.sign({ user_id: user.id, role: user.role }, 'Aidoauwidh-aygsjd10h1', { expiresIn: '1h' });

    // Kirim response dengan token dan data user
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = router;
