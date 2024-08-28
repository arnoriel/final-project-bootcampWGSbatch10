const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 5000;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employeabs',
    password: 'arnoarno',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
    }
});

const upload = multer({ storage: storage });

// Register user with image upload
app.post('/api/register', upload.single('image'), async (req, res) => {
    const { name, email, password, phone, division, role } = req.body; // Tambahkan 'role'
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const userRole = role || 'employee'; // Default role ke 'employee' jika tidak ada input role

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (name, email, password, phone, division, images, role) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, email, hashedPassword, phone, division, imagePath, userRole]
        );        

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, role: user.rows[0].role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/admins', async (req, res) => {
    try {
        const admins = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        res.status(200).json(admins.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/admins/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, division } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const admin = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await pool.query(
            'UPDATE users SET name = $1, email = $2, phone = $3, division = $4, images = $5 WHERE id = $6',
            [name, email, phone, division, imagePath, id]
        );

        res.status(200).json({ message: 'Admin updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/admins/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
