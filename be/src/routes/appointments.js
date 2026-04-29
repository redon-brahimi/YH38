import express from 'express';
import pkg from 'pg';
import { protect } from '../auth.js';

const { Pool } = pkg;
const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/appointments - Create a new appointment
router.post('/', protect, async (req, res) => {
  const { repair_id, appointment_date, appointment_time, notes } = req.body;
  const client_id = req.user.id; // from token

  if (!repair_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ success: false, error: 'Repair ID, date, and time are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO appointments (repair_id, client_id, appointment_date, appointment_time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [repair_id, client_id, appointment_date, appointment_time, notes]
    );
    res.status(201).json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'This time slot is already booked. Please choose another.' });
    }
    res.status(500).json({ success: false, error: 'Server error during appointment creation.' });
  }
});

// GET /api/appointments/booked-slots/:date - Get all booked time slots for a given date
router.get('/booked-slots/:date', async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required.' });
  }

  try {
    const result = await pool.query(
      'SELECT appointment_time FROM appointments WHERE appointment_date = $1 AND status != \'cancelled\'',
      [date]
    );
    const bookedTimes = result.rows.map(row => row.appointment_time);
    res.json({ success: true, bookedTimes });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ success: false, error: 'Server error fetching booked slots.' });
  }
});

export default router;