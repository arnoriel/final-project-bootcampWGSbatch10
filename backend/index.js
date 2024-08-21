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
  secret: 'AsdgaSdagstdw-1h012hdsak',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Route utama untuk mengecek apakah user sudah login atau belum
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.render('login', { title: 'Login' });
  }

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
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.render('login', { title: 'Login', error: 'Email/Password salah' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.render('login', { title: 'Login', error: 'Email/Password salah' });
    }

    const token = jwt.sign({ user_id: user.id, role: user.role }, 'AsdgaSdagstdw-1h012hdsak', { expiresIn: '1h' });

    req.session.token = token;
    req.session.user = user;

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
    res.redirect('/');
  });
});

// Route untuk halaman users (hanya diakses oleh admin)
app.get('/users', async (req, res) => {
    try {
      const usersResult = await pool.query('SELECT id, name, email, divisi, phone FROM users');
      const users = usersResult.rows.map(user => ({
        ...user,
        generatedPassword: 'password_placeholder' // Ganti dengan logika untuk mendapatkan password asli
      }));
      res.render('users/index', { users });
    } catch (error) {
      console.error('Error fetching users', error.stack);
      res.status(500).send('Server Error');
    }
  });
  

// Route untuk menambahkan user dengan password yang di-generate otomatis
app.post('/users/add', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/login');
    }
  
    const { name, email, divisi, phone } = req.body;
  
    // Generate password secara otomatis
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
  
    try {
      // Query untuk menambahkan user ke database
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role, divisi, phone) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, email, hashedPassword, 'user', divisi, phone]
      );
  
      console.log(`Rows inserted: ${result.rowCount}`);
      console.log(`User created with password: ${generatedPassword}`);
      
      res.redirect('/users');
    } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).json({ error: error.message });
    }
  });
  
  

// Route untuk mengedit user
app.post('/users/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, divisi, phone } = req.body;

  try {
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;
    const updateQuery = `UPDATE users SET 
      name = $1, 
      email = $2, 
      ${hashedPassword ? 'password = $3,' : ''} 
      divisi = $4, 
      phone = $5 
      WHERE id = $6`;

    const queryParams = hashedPassword
      ? [name, email, hashedPassword, divisi, phone, id]
      : [name, email, divisi, phone, id];

    await pool.query(updateQuery, queryParams);
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route untuk menghapus user
app.post('/users/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
