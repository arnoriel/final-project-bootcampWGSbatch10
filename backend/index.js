const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
  secret: 'AsdgaSdagstdw-1h012hdsak',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userRole = req.session.user.role;
  if (userRole === 'superadmin') {
    return res.redirect('/superadmin');
  } else if (userRole === 'admin') {
    return res.redirect('/admin');
  } else if (userRole === 'user') {
    return res.redirect('/user');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login' });
});

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

    return res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/superadmin', checkLogin, (req, res) => {
  if (req.session.user.role !== 'superadmin') {
    return res.redirect('/login');
  }
  res.render('index', { title: 'Super Admin Dashboard' });
});

app.get('/admin', checkLogin, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  res.render('admin', { title: 'Admin Dashboard' });
});

app.get('/user', checkLogin, (req, res) => {
  if (req.session.user.role !== 'user') {
    return res.redirect('/login');
  }
  res.render('user', { title: 'User Dashboard' });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

app.get('/users', checkLogin, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }

  try {
    const usersResult = await pool.query(`
      SELECT id, name, email, divisi, phone, image 
      FROM users 
      WHERE role NOT IN ('admin', 'superadmin') 
      ORDER BY updated_at DESC
    `);
    
    const users = usersResult.rows;
    res.render('users/index', { title: 'User Management', users, errors: [] });
  } catch (error) {
    console.error('Error fetching users', error.stack);
    res.status(500).send('Server Error');
  }
});

app.post('/users/add', 
  checkLogin, 
  upload.single('image'), 
  [
    body('email')
      .isEmail()
      .withMessage('Email tidak valid')
      .matches(/^[\w.+\-]+@gmail\.com$/)
      .withMessage('Email harus menggunakan domain gmail.com'),
    body('phone')
      .matches(/^(\+62|0)[0-9]{9,}$/)
      .withMessage('Nomor telepon tidak valid, harus +62 atau 0')
  ], 
  async (req, res) => {

  if (req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('users/index', { 
      title: 'User Management', 
      users: [], 
      errors: errors.array(), 
      data: {
        name: req.body.name,
        email: req.body.email,
        divisi: req.body.divisi,
        phone: req.body.phone,
      },
      showModal: true // Flag to show the modal
    });
  }

  const { name, email, divisi, phone } = req.body;
  const image = req.file ? req.file.filename : 'default.jpg';

  const generatedPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, divisi, phone, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, email, hashedPassword, 'user', divisi, phone, image]
    );

    console.log(`Rows inserted: ${result.rowCount}`);
    console.log(`User created with password: ${generatedPassword}`);

    res.redirect('/users');
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).render('users/index', { 
      title: 'User Management', 
      users: [], 
      errors: [{ msg: 'Terjadi kesalahan pada server. Silakan coba lagi.' }],
      data: {
        name,
        email,
        divisi,
        phone,
      },
      showModal: true // Flag to show the modal
    });
  }
});


app.post('/users/edit/:id', 
  checkLogin, 
  upload.single('image'), 
  [
    body('email')
      .isEmail()
      .withMessage('Email tidak valid')
      .matches(/^[\w.+\-]+@gmail\.com$/)
      .withMessage('Email harus menggunakan domain gmail.com'),
    body('phone')
      .matches(/^(\+62|0)[0-9]{9,}$/)
      .withMessage('Nomor telepon tidak valid, harus +62 atau 0')
  ],
  async (req, res) => {
  const { id } = req.params;
  const { name, email, password, divisi, phone } = req.body;
  const image = req.file ? req.file.filename : undefined;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('users/index', { 
      title: 'User Management', 
      users: [], 
      errors: errors.array() 
    });
  }

  try {
    let updateQuery;
    let queryParams;

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updateQuery = `
        UPDATE users SET 
        name = $1, 
        email = $2, 
        password = $3, 
        divisi = $4, 
        phone = $5, 
        image = COALESCE($6, image),
        updated_at = NOW()
        WHERE id = $7
      `;
      queryParams = [name, email, hashedPassword, divisi, phone, image, id];
    } else {
      updateQuery = `
        UPDATE users SET 
        name = $1, 
        email = $2, 
        divisi = $3, 
        phone = $4, 
        image = COALESCE($5, image),
        updated_at = NOW()
        WHERE id = $6
      `;
      queryParams = [name, email, divisi, phone, image, id];
    }

    await pool.query(updateQuery, queryParams);
    res.redirect('/users');
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/delete/:id', checkLogin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
