const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employeabs',
    password: 'arnoarno',
    port: 5432,
});

// Default users to seed
const users = [
    {
        name: 'Superadmin User',
        email: 'superadmin@example.com',
        password: 'superadmin123',
        phone: '081234567890',
        division: 'Management',
        role: 'superadmin',
        department: 'Administrator',
        images: path.join('/uploads', 'superadmin.jpg')
    },
];

// Function to seed users
const seedUsers = async () => {
    try {
        for (const user of users) {
            // Check if the user already exists
            const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
            if (existingUser.rows.length > 0) {
                console.log(`User with email ${user.email} already exists, skipping...`);
                continue;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insert the new user with current timestamp for updated_at
            await pool.query(
                `INSERT INTO users (name, email, password, phone, division, role, images, department, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                [user.name, user.email, hashedPassword, user.phone, user.division, user.role, user.images, user.department]
            );

            console.log(`User ${user.email} seeded successfully!`);
        }
    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        pool.end();
    }
};

// Run the seeding function
seedUsers();
