import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import crypto from 'crypto'; // For generating secure tokens
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateToken = (user, userType) => {
  // The payload now includes the user's role.
  // For clients, user.role will be undefined and will be omitted from the token.
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    type: userType,
    role: user.role,
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Client Signup
router.post('/client/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
  }

  try {
    const existingClient = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existingClient.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newClient = await pool.query(
      'INSERT INTO clients (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, phone, hashedPassword]
    );

    const client = newClient.rows[0];
    const token = generateToken(client, 'client');

    res.status(201).json({ success: true, token, user: { id: client.id, name: client.name, email: client.email, type: 'client' } });
  } catch (error) {
    console.error('Client signup error:', error);
    res.status(500).json({ success: false, error: 'Server error during client signup.' });
  }
});

// Client Login
router.post('/client/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password.' });
  }

  try {
    const result = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    const client = result.rows[0];

    if (!client) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = generateToken(client, 'client');
    res.json({ success: true, token, user: { id: client.id, name: client.name, email: client.email, type: 'client' } });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ success: false, error: 'Server error during client login.' });
  }
});

// Admin Signup (NOTE: In a real app, this should be a protected route or a seed script)
router.post('/admin/signup', async (req, res) => {
    const { name, email, password, role = 'admin' } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }
  
    try {
      const existingAdmin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (existingAdmin.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'An admin with this email already exists.' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newAdmin = await pool.query(
        'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, role]
      );
  
      const admin = newAdmin.rows[0];
      const token = generateToken(admin, 'admin');
  
      res.status(201).json({ success: true, token, user: { id: admin.id, name: admin.name, email: admin.email, type: 'admin', role: admin.role } });
    } catch (error) {
      console.error('Admin signup error:', error);
      res.status(500).json({ success: false, error: 'Server error during admin signup.' });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }
  
    try {
      const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      const admin = result.rows[0];
  
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }
  
      const token = generateToken(admin, 'admin');
      res.json({ success: true, token, user: { id: admin.id, name: admin.name, email: admin.email, type: 'admin', role: admin.role } });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, error: 'Server error during admin login.' });
    }
});


// Forgot Password Request
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Please provide an email address.' });
  }

  try {
    // Check clients table
    let userResult = await pool.query('SELECT id, name, email FROM clients WHERE email = $1', [email]);
    let userType = 'client';

    if (userResult.rows.length === 0) {
      // Check admins table if not found in clients
      userResult = await pool.query('SELECT id, name, email FROM admins WHERE email = $1', [email]);
      userType = 'admin';
    }

    const user = userResult.rows[0];

    if (!user) {
      // Send a generic success message even if user not found to prevent email enumeration
      return res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token and expiry in the database
    const updateQuery = userType === 'client'
      ? 'UPDATE clients SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3'
      : 'UPDATE admins SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3';

    await pool.query(updateQuery, [resetToken, resetTokenExpires, user.id]);

    // In a real application, you would send an email here.
    // For now, we'll log the reset URL.
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType}`;
    console.log(`Password Reset URL for ${user.email}: ${resetURL}`);

    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error during password reset request.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword, userType } = req.body;

  if (!token || !newPassword || !userType) {
    return res.status(400).json({ success: false, error: 'Token, new password, and user type are required.' });
  }

  try {
    const tableName = userType === 'client' ? 'clients' : 'admins';
    const result = await pool.query(
      `SELECT id FROM ${tableName} WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, error: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE ${tableName} SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error during password reset.' });
  }
});

export default router;