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

// Generate random password
const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 10; i++) { // Panjang password 10 karakter
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Register user with image upload
app.post('/api/register', upload.single('image'), async (req, res) => {
    const { name, email, phone, division, role } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const userRole = role || 'employee';
    const password = generateRandomPassword();

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, email, password, phone, division, images, role, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
            [name, email, hashedPassword, phone, division, imagePath, userRole]
        );

        console.log(`Admin created with email: ${email}, password: ${password}`);

        res.status(201).json({ message: 'Admin registered successfully' });
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

        // Cek apakah sudah ada sesi aktif untuk Superadmin atau pengguna lain
        const activeSession = await pool.query('SELECT * FROM active_sessions WHERE user_id = $1 AND is_active = true', [user.rows[0].id]);

        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'You have no Permission' });
        }

        // Buat token baru dan simpan dalam sesi aktif
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        await pool.query('INSERT INTO active_sessions (user_id, token) VALUES ($1, $2)', [user.rows[0].id, token]);

        res.json({ message: 'Login successful', token, role: user.rows[0].role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to verify active session
const verifyActiveSession = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'You have no Permission' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const session = await pool.query('SELECT * FROM active_sessions WHERE user_id = $1 AND token = $2 AND is_active = true', [decoded.id, token]);

        if (session.rows.length === 0) {
            return res.status(403).json({ message: 'You have no Permission' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Logout user
app.post('/api/logout', verifyActiveSession, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    
    try {
        await pool.query('UPDATE active_sessions SET is_active = false WHERE token = $1', [token]);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/admins', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const totalAdmins = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        const admins = await pool.query(
            "SELECT * FROM users WHERE role = 'admin' ORDER BY updated_at DESC LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        res.status(200).json({
            total: totalAdmins.rows[0].count,
            admins: admins.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/admins/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, division } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const admin = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Use existing image if no new file is uploaded
        if (!imagePath) {
            imagePath = admin.rows[0].images;
        }

        await pool.query(
            `UPDATE users SET name = $1, email = $2, phone = $3, division = $4, images = $5, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $6`,
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

// Endpoint untuk search user
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    try {
        const searchQuery = `
            SELECT * FROM users
            WHERE role = 'admin'
            AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR division ILIKE $1)
            ORDER BY updated_at DESC
        `;
        const result = await pool.query(searchQuery, [`%${query}%`]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Cek apakah email terdaftar
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate password baru
        const newPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
            [hashedPassword, email]
        );

        console.log(`Password reset for ${email}: ${newPassword}`);
        
        res.status(200).json({ message: 'Your password has reset, ask Admin/Operator for the Password' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
