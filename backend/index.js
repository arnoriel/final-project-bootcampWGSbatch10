const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Set view engine menjadi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Konfigurasi session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Route utama untuk mengecek apakah user sudah login atau belum
app.get('/', (req, res) => {
  if (!req.session.user) {
    // Render halaman login tanpa mengubah URL
    return res.render('login', { title: 'Login' });
  }

  // Jika pengguna sudah login, arahkan sesuai role
  if (req.session.user.role === 'superadmin') {
    return res.redirect('/superadmin');
  } else if (req.session.user.role === 'admin') {
    return res.redirect('/admin');
  } else if (req.session.user.role === 'user') {
    return res.redirect('/user');
  }
});

// Route untuk halaman login
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Route untuk memproses login
app.post('/login', async (req, res) => {
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
    const token = jwt.sign({ user_id: user.id, role: user.role }, 'AsdgaSdagstdw-1h012hdsak', { expiresIn: '1h' });

    // Simpan token dan data user di session
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

// Route untuk dashboard superadmin
app.get('/superadmin', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'superadmin') {
    return res.redirect('/login');
  }
  res.render('index', { title: 'Super Admin Dashboard' });
});

// Route untuk dashboard admin
app.get('/admin', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  res.render('admin', { title: 'Admin Dashboard' });
});

// Route untuk dashboard user
app.get('/user', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/login');
  }
  res.render('user', { title: 'User Dashboard' });
});

// Route untuk logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/login');
  });
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
