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
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();
const cron = require('node-cron');

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
const generateReadablePassword = () => {
    const words = ['Blue', 'Sky', 'Green', 'Leaf', 'Bright', 'Star'];
    const symbols = '!@#$%^&*';
    let password = `${words[Math.floor(Math.random() * words.length)]}${Math.floor(1000 + Math.random() * 9000)}${symbols[Math.floor(Math.random() * symbols.length)]}`;
    return password;
};

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});

// Middleware untuk autentikasi
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Periksa apakah authorization header ada
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Ekstrak token dari header
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;

        // Cek apakah sesi masih aktif di active_sessions
        const session = await pool.query(
            'SELECT * FROM active_sessions WHERE user_id = $1 AND session_token = $2',
            [userId, token]
        );

        if (session.rows.length === 0) {
            return res.status(403).json({ message: 'Session expired or not active' });
        }

        // Jika valid, tambahkan data user ke request untuk digunakan di endpoint lain
        req.user = decoded; // decoded akan berisi id, email, role
        next();
    } catch (error) {
        // Jika token tidak valid atau expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Authentication error:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

//Middleware error log
const logErrorToDatabase = async (errorMessage, stackTrace) => {
    try {
        await pool.query(
            'INSERT INTO error_logs (message, stack_trace, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [errorMessage, stackTrace]
        );
    } catch (error) {
        console.error('Failed to log error to the database:', error);
    }
};

// Fungsi untuk memindahkan data attendance berdasarkan periode waktu
const updateAttendancePeriod = async () => {
    try {
        // Kosongkan kolom period dengan 'yesterday' untuk sementara
        await pool.query(`
            UPDATE attendance 
            SET period = NULL 
            WHERE period = 'yesterday'
        `);

        // Pindahkan data dari hari ini ke 'yesterday' hanya jika sudah lewat dari pukul 00.00 (hari berikutnya)
        await pool.query(`
            UPDATE attendance 
            SET period = 'yesterday'
            WHERE login_at::date = current_date - interval '1 day'
        `);

        // Pindahkan data dari minggu lalu ke 'last week'
        await pool.query(`
            UPDATE attendance 
            SET period = 'last_week'
            WHERE login_at::date < current_date - interval '1 day'
            AND login_at::date >= current_date - interval '7 days'
        `);

        // Pindahkan data dari bulan lalu ke 'last month'
        await pool.query(`
            UPDATE attendance 
            SET period = 'last_month'
            WHERE login_at::date < current_date - interval '7 days'
            AND login_at::date >= current_date - interval '1 month'
        `);

        // Pindahkan data dari tahun lalu ke 'last year'
        await pool.query(`
            UPDATE attendance 
            SET period = 'last_year'
            WHERE login_at::date < current_date - interval '1 month'
            AND login_at::date >= current_date - interval '1 year'
        `);
    } catch (error) {
        console.error('Error updating attendance period', error);
    }
};

// Cron job untuk menjalankan fungsi setiap hari pukul 00.00
cron.schedule('0 0 * * *', () => {
    updateAttendancePeriod();
    console.log('Attendance data updated at midnight');
});

// Error logging middleware
app.use(async (err, req, res, next) => {
    console.error(err.stack);

    // Simpan error ke dalam database
    try {
        await pool.query(
            'INSERT INTO error_logs (error_message, endpoint, stack_trace) VALUES ($1, $2, $3)',
            [err.message, req.originalUrl, err.stack]
        );
    } catch (dbError) {
        console.error('Failed to log error to database:', dbError);
    }

    // Kembalikan response error ke client
    res.status(500).json({ message: 'Internal server error' });
});

// Register user with image upload
app.post('/api/register', upload.single('image'), async (req, res) => {
    const { name, email, phone, division, department, role } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const link = 'http://10.10.101.43:3000';
    const userRole = role || 'employee';
    const password = generateReadablePassword();
    const text = `Dear ${name},

    Thanks for submitting your information to our number, here's your User Information for MyOffice App Account.

    your email: ${email}
    your phone: ${phone}
    your department: ${department}
    your division: ${division}

    your password: ${password}

    Please keep this information privately because it's your personal account information, do not send it to others.
    Open MyOffice app: ${link}`;

    const mailOptions = {
        from: 'no_reply@gmail.com',
        to: email,
        subject: 'New MyOffice account',
        text
    };

    try {
        // Perbaikan pengecekan duplikat email atau phone
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (existingUser.rows.length > 0) {
            const duplicateUser = existingUser.rows[0];
            if (duplicateUser.email === email) {
                return res.status(400).json({ message: 'Email already exists' });
            } else if (duplicateUser.phone === phone) {
                return res.status(400).json({ message: 'Phone number already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, email, password, phone, division, department, images, role, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
            [name, email, hashedPassword, phone, division, department, imagePath, userRole]
        );

        transport.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log({ error: error.message });
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        console.log(`User created with email: ${email}, password: ${password}`);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Check duplicate users
app.post('/api/check-duplicate', async (req, res) => {
    const { email, phone } = req.body;
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (existingUser.rows.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking duplicate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST Leave Request (New Leave Request Submission)
app.post('/api/leave-request', async (req, res) => {
    const { name, email, leave_type, reason, status, superior_name, superior_email } = req.body; // Include superior

    try {
        const result = await pool.query(
            "INSERT INTO leave_requests (name, email, leave_type, reason, status, superior_name, superior_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [name, email, leave_type, reason, status, superior_name, superior_email] // Include superior
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Get Leave Request
app.get('/api/leave-requests', async (req, res) => {
    const { role, superior_name } = req.query; // Tambahkan query superior_name

    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    try {
        const leaveRequests = await pool.query(
            "SELECT * FROM leave_requests WHERE status = 'Pending' AND superior_name = $1", 
            [superior_name] // Filter leave request berdasarkan superior_name
        );
        res.status(200).json(leaveRequests.rows);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Leave History
app.get('/api/leave-history', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching leave history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });  

// UPDATE Leave Request Status
app.put('/api/leave-requests/:id', async (req, res) => {
    const { role } = req.query; // Get the user role from the query parameter
    const { id } = req.params;
    const { status } = req.body;

    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (!['Approved', 'Declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Update status leave request
        const result = await pool.query(
            "UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const leaveRequest = result.rows[0];

        // Format status approval
        const statusMessage = status === 'Approved' ? 'approved' : 'declined';

        // Persiapkan email untuk user
        const mailOptions = {
            from: 'no_reply@gmail.com',
            to: leaveRequest.email, // Email user yang meminta cuti
            subject: `Leave Request ${statusMessage}`,
            text: `
                Dear ${leaveRequest.name},

                Your leave request has been ${statusMessage} by ${leaveRequest.superior_name}.
                
                Leave Type: ${leaveRequest.leave_type}
                Reason: ${leaveRequest.reason}

                Regards,
                MyOffice Team
            `
        };

        // Kirim email
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error.message);
            } else {
                console.log('Leave request status email sent:', info.response);
            }
        });

        // Berikan respon berhasil
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
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

        const activeSession = await pool.query('SELECT * FROM active_sessions WHERE user_id = $1', [user.rows[0].id]);
        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'You are not allowed' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
            'your_jwt_secret'
        );

        await pool.query(
            'INSERT INTO active_sessions (user_id, session_token, signin_at) VALUES ($1, $2, NOW())',
            [user.rows[0].id, token]
        );

        // Insert login record into the attendance table
        await pool.query(
            'INSERT INTO attendance (user_id, login_at) VALUES ($1, NOW())',
            [user.rows[0].id]
        );

        res.json({ message: 'Login successful', token, role: user.rows[0].role });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Endpoint untuk mendapatkan Attendance
app.get('/api/attendance', async (req, res) => {
    const { period, search = '', page = 1, limit = 10 } = req.query; // Default page 1 and limit 10
    let dateCondition = '';
    const offset = (page - 1) * limit;  // Calculate offset for pagination

    // Tentukan kondisi tanggal berdasarkan periode
    switch (period) {
        case 'yesterday':
            dateCondition = `a.login_at::date = current_date - interval '1 day'`;
            break;
        case 'last_week':
            dateCondition = `a.login_at >= current_date - interval '7 days'`;
            break;
        case 'last_month':
            dateCondition = `a.login_at >= current_date - interval '1 month'`;
            break;
        case 'last_year':
            dateCondition = `a.login_at >= current_date - interval '1 year'`;
            break;
        case 'today':
        default:
            dateCondition = `a.login_at::date = current_date`;
            break;
    }

    try {
        // Buat query SQL
        const attendanceQuery = `
            SELECT 
                u.id as user_id, 
                u.name,
                u.role, 
                to_char(a.login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as login_at, 
                to_char(a.logout_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as logout_at,
                CASE 
                    WHEN a.logout_at IS NOT NULL THEN 
                        to_char(a.logout_at - a.login_at, 'HH24:MI:SS')
                    ELSE 
                        NULL
                END as total_work_time
            FROM users u 
            INNER JOIN attendance a ON u.id = a.user_id
            WHERE ${dateCondition}
            AND u.name ILIKE '%' || $1 || '%'  -- Parameter pencarian nama
            ORDER BY a.login_at DESC
            LIMIT $2 OFFSET $3;  -- Parameter paginasi
        `;

        // Eksekusi query untuk mendapatkan data attendance
        const attendanceData = await pool.query(attendanceQuery, [search, limit, offset]);

        // Query untuk mendapatkan total record tanpa limit dan offset (untuk paginasi)
        const totalQuery = `
            SELECT COUNT(*) FROM users u 
            INNER JOIN attendance a ON u.id = a.user_id
            WHERE ${dateCondition}
            AND u.name ILIKE '%' || $1 || '%';
        `;
        const totalRecords = await pool.query(totalQuery, [search]);

        // Kirim respons dengan data attendance, total records, page, dan limit
        res.status(200).json({ 
            attendance: attendanceData.rows,
            total: totalRecords.rows[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Failed to fetch attendance data' });
    }
});

// Logout user
app.post('/api/logout', async (req, res) => {
    const token = req.body.token;

    try {
        // Get the user_id associated with this session
        const session = await pool.query('SELECT user_id FROM active_sessions WHERE session_token = $1', [token]);
        const userId = session.rows[0]?.user_id;

        if (!userId) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Update the logout time in the attendance table
        await pool.query(
            'UPDATE attendance SET logout_at = NOW() WHERE user_id = $1 AND logout_at IS NULL',
            [userId]
        );

        // Update logout_at time for the session in active_sessions
        await pool.query(
            'UPDATE active_sessions SET logout_at = NOW() WHERE session_token = $1',
            [token]
        );

        // Delete the session after updating the logout time
        await pool.query('DELETE FROM active_sessions WHERE session_token = $1', [token]);

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Cek apakah email terdaftar
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate password baru
        const newPassword = generateReadablePassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
            [hashedPassword, email]
        );

        // Kirim email reset password
        const resetMailOptions = {
            from: 'no_reply@gmail.com',
            to: email,
            subject: 'Password Reset for MyOffice',
            text: `
                Dear User,

                Your password has been reset. Please use the following new password to log in:

                New Password: ${newPassword}

                Make sure to change this password immediately after logging in.

                Regards,
                MyOffice Team
            `
        };

        transport.sendMail(resetMailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error.message);
            } else {
                console.log('Password reset email sent:', info.response);
            }
        });

        console.log(`Password reset for ${email}: ${newPassword}`);

        res.status(200).json({ message: 'Password reset successfully. Please check your email for the new password.' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to check if session is still active
app.use('/api/protected-route', async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const session = await pool.query('SELECT * FROM active_sessions WHERE session_token = $1', [token]);
        if (session.rows.length === 0) {
            return res.status(403).json({ message: 'Session expired or not active' });
        }
        next();
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint untuk mendapatkan data pengguna saat ini
app.get('/api/user', authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
  
      // Cek apakah role pengguna sesuai
      if (userRole !== 'admin' && userRole !== 'employee' && userRole !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      const user = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ name: user.rows[0].name });
    } catch (error) {
      console.error(error);
      await logErrorToDatabase(error.message, error.stack);
      res.status(500).json({ message: 'Internal server error' });
    }
  });  

//Get Users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get active status of users
app.get('/api/users/status', async (req, res) => {
    try {
        const users = await pool.query(
            `SELECT u.id, u.name, u.email, 
                    CASE 
                        WHEN a.session_token IS NOT NULL THEN 'online' 
                        ELSE 'offline' 
                    END AS status
             FROM users u
             LEFT JOIN active_sessions a ON u.id = a.user_id`
        );

        res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// CRUD untuk Admin

// GET Admins
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
            admins: admins.rows.map(admin => ({
                ...admin,
                department: admin.department  // Tambahkan department ke response
            }))
        });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Admin
app.put('/api/admins/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, division, department } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Cek apakah admin sedang online
        const activeSession = await pool.query(
            'SELECT * FROM active_sessions WHERE user_id = $1',
            [id]
        );

        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'Cannot edit admin while online' });
        }

        const admin = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Use existing image if no new file is uploaded
        if (!imagePath) {
            imagePath = admin.rows[0].images;
        }

        await pool.query(
            `UPDATE users SET name = $1, email = $2, phone = $3, division = $4, department = $5, images = $6, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $7`,
            [name, email, phone, division, department, imagePath, id]
        );

        res.status(200).json({ message: 'Admin updated successfully' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Delete admin
app.delete('/api/admins/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Cek apakah admin sedang online
        const activeSession = await pool.query(
            'SELECT * FROM active_sessions WHERE user_id = $1',
            [id]
        );

        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'Cannot delete admin while online' });
        }

        const admin = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// CRUD untuk Employee

// GET Employees
app.get('/api/employees', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const totalEmployees = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'employee'");
        const employees = await pool.query(
            "SELECT * FROM users WHERE role = 'employee' ORDER BY updated_at DESC LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        res.status(200).json({
            total: totalEmployees.rows[0].count,
            employees: employees.rows.map(employee => ({
                ...employee,
                department: employee.department  // Tambahkan department ke response
            }))
        });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT Employee
app.put('/api/employees/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, division, department } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Cek apakah employee sedang online
        const activeSession = await pool.query(
            'SELECT * FROM active_sessions WHERE user_id = $1',
            [id]
        );

        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'Cannot edit employee while online' });
        }

        const employee = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'employee']);
        if (employee.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Use existing image if no new file is uploaded
        if (!imagePath) {
            imagePath = employee.rows[0].images;
        }

        await pool.query(
            `UPDATE users SET name = $1, email = $2, phone = $3, division = $4, department = $5, images = $6, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $7`,
            [name, email, phone, division, department, imagePath, id]
        );

        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE Employee
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Cek apakah user employee sedang online
        const activeSession = await pool.query(
            'SELECT * FROM active_sessions WHERE user_id = $1',
            [id]
        );

        if (activeSession.rows.length > 0) {
            return res.status(403).json({ message: 'Cannot delete user while online' });
        }

        const employee = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'employee']);
        if (employee.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Search Endpoint
app.get('/api/search', async (req, res) => {
    const { query, role } = req.query;

    if (!query || !role) {
        return res.status(400).json({ message: 'Query and role parameters are required' });
    }

    try {
        const searchQuery = `
            SELECT * FROM users
            WHERE role = $1
            AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2 OR division ILIKE $2 OR department ILIKE $2)
            ORDER BY updated_at DESC
        `;
        const result = await pool.query(searchQuery, [role, `%${query}%`]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        await logErrorToDatabase(error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Error Logs
app.get('/api/error-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM error_logs ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch error logs' });
    }
});

// Mendapatkan semua data dari tabel settings
app.get('/api/settings', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM settings'); // Mengambil semua entri
      res.json(result.rows); // Mengembalikan seluruh array rows
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  // Mendapatkan satu setting berdasarkan id
app.get('/settings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM settings WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

  // Mengupdate setting
app.put('/settings/:id', async (req, res) => {
    const { id } = req.params;
    const { name, version, status } = req.body;
  
    try {
      const query = `
        UPDATE settings
        SET name = $1, version = $2, status = $3
        WHERE id = $4
        RETURNING *;
      `;
      const values = [name, version, status, id];
      const result = await pool.query(query, values);
  
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Setting not found' });
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});  

//Port
app.listen(port, () => {
    console.log(`Server running on http://10.10.101.34:${port}`);
});