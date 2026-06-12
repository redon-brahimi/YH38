import express from 'express';
import pkg from 'pg';
import logger from '../logger.js';
import { protect } from '../auth.js';
import { dispatchAppointmentConfirmation } from '../services/notificationService.js';

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// POST /api/appointments - Create a new appointment
router.post('/', protect, async (req, res) => {
  const { repair_id, appointment_date, appointment_time, notes } = req.body;
  const clientUser = req.user;

  if (!repair_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ success: false, error: 'Repair ID, date, and time are required.' });
  }

  try {
    // Check if the repair belongs to the authenticated client
    const repairResult = await pool.query('SELECT * FROM repairs WHERE id = $1 AND client_id = $2', [repair_id, clientUser.id]);
    const repair = repairResult.rows[0];

    if (!repair) {
      return res.status(404).json({ success: false, error: 'Repair not found or does not belong to the user.' });
    }

    // Insert the new appointment
    const appointmentResult = await pool.query(
      'INSERT INTO appointments (repair_id, client_id, appointment_date, appointment_time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [repair_id, clientUser.id, appointment_date, appointment_time, notes || null]
    );
    const appointment = appointmentResult.rows[0];

    // Asynchronously send notifications based on user preference.
    dispatchAppointmentConfirmation(clientUser, {
      date: new Date(appointment.appointment_date).toLocaleDateString('fr-FR'),
      time: appointment.appointment_time.substring(0, 5),
      device: repair.device_model,
    });

    res.status(201).json({ success: true, appointment });

  } catch (error) {
    logger.error('Error creating appointment:', { error, body: req.body, user: req.user });
    if (error.code === '23505') { // unique_violation for date/time
        return res.status(409).json({ success: false, error: 'An appointment is already scheduled for this time slot.' });
    }
    res.status(500).json({ success: false, error: 'Server error creating appointment.' });
  }
});

export default router;