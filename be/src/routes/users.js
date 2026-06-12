import express from 'express';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import { protect } from '../auth.js';
import logger from '../logger.js';

const { Pool } = pkg;
const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// All routes in this file are protected
router.use(protect);

// GET /api/users/me - Get current user's profile
router.get('/me', async (req, res) => {
  // req.user is attached by the 'protect' middleware
  // We just need to remove sensitive data before sending
  const { password, reset_password_token, reset_password_expires, ...userProfile } = req.user;
  res.json({ success: true, user: userProfile });
});

// PUT /api/users/me - Update current user's profile
router.put('/me', async (req, res) => {
  const { name, phone, notification_preference } = req.body;
  const { id, type } = req.user;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required.' });
  }
  if (notification_preference && !['email'].includes(notification_preference)) {
    return res.status(400).json({ success: false, error: 'Invalid notification preference. Must be "email".' });
  }

  const tableName = type === 'client' ? 'clients' : 'admins';

  try {
    let query;
    let queryParams;

    if (type === 'client') {
      query = `UPDATE clients SET name = $1, phone = $2, notification_preference = $3 WHERE id = $4 RETURNING id, name, email, phone, notification_preference`;
      queryParams = [name, phone || null, notification_preference || req.user.notification_preference, id];
    } else { // admin
      query = `UPDATE admins SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone, role`;
      queryParams = [name, phone || null, id];
    }

    const result = await pool.query(
      query,
      queryParams
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // We need to add the 'type' back to the user object for the frontend context
    const updatedUser = { ...result.rows[0], type };

    res.json({ success: true, user: updatedUser, message: 'Profile updated successfully.' });
  } catch (error) {
    logger.error('Update profile error:', { error, body: req.body, user: req.user });
    res.status(500).json({ success: false, error: 'Server error updating profile.' });
  }
});

// PUT /api/users/change-password - Change current user's password
router.put('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id, type } = req.user;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  const tableName = type === 'client' ? 'clients' : 'admins';

  try {
    const userResult = await pool.query(`SELECT password FROM ${tableName} WHERE id = $1`, [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(`UPDATE ${tableName} SET password = $1 WHERE id = $2`, [hashedPassword, id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    logger.error('Change password error:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error changing password.' });
  }
});

export default router;