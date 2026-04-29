import express from 'express';
import pkg from 'pg';
import { protect, authorize } from '../auth.js';
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to protect and authorize admin routes
router.use(protect, authorize('admin', 'technician'));

// ================================================
// APPOINTMENTS MANAGEMENT
// ================================================

// GET /api/admin/appointments - Get all upcoming appointments
router.get('/appointments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.repair_id,
        a.appointment_date,
        a.appointment_time,
        a.notes,
        a.status as appointment_status,
        r.device_type,
        r.device_model,
        r.issue_description,
        r.status as repair_status,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM appointments a
      JOIN repairs r ON a.repair_id = r.id
      JOIN clients c ON a.client_id = c.id
      WHERE a.appointment_date >= CURRENT_DATE AND a.status = 'scheduled'
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `);

    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ success: false, error: 'Server error fetching appointments.' });
  }
});

// ================================================
// REPAIR MANAGEMENT
// ================================================

// PUT /api/admin/repairs/:id/status - Update repair status
router.put('/repairs/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the incoming status
  if (!status || !['pending', 'in_progress', 'fixed', 'ready_for_pickup'].includes(status)) {
    return res.status(400).json({ success: false, error: 'A valid status is required (pending, in_progress, fixed, ready_for_pickup).' });
  }

  try {
    const result = await pool.query(
      'UPDATE repairs SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Repair not found.' });
    }

    res.json({ success: true, repair: result.rows[0], message: 'Repair status updated successfully.' });
  } catch (error) {
    console.error('Error updating repair status:', error);
    res.status(500).json({ success: false, error: 'Server error updating repair status.' });
  }
});


// ================================================
// DEVICE MANAGEMENT
// ================================================

// POST /api/admin/devices - Add a new device model
router.post('/devices', async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'Device name and type are required.' });
  }
  if (!['phone', 'pc'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Device type must be "phone" or "pc".' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO devices (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    res.status(201).json({ success: true, device: result.rows[0] });
  } catch (error) {
    console.error('Error adding device:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Device with this name already exists.' });
    }
    res.status(500).json({ success: false, error: 'Server error adding device.' });
  }
});

// GET /api/admin/devices - Get all device models
router.get('/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices ORDER BY name ASC');
    res.json({ success: true, devices: result.rows });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: 'Server error fetching devices.' });
  }
});

// ================================================
// PARTS MANAGEMENT (Stock)
// ================================================

// POST /api/admin/parts - Add a new part
router.post('/parts', async (req, res) => {
  const { name, device_id, stock_quantity = 0 } = req.body;

  if (!name || !device_id) {
    return res.status(400).json({ success: false, error: 'Part name and device ID are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO parts (name, device_id, stock_quantity) VALUES ($1, $2, $3) RETURNING *',
      [name, device_id, stock_quantity]
    );
    res.status(201).json({ success: true, part: result.rows[0] });
  } catch (error) {
    console.error('Error adding part:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ success: false, error: 'Device not found.' });
    }
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Part with this name already exists for this device.' });
    }
    res.status(500).json({ success: false, error: 'Server error adding part.' });
  }
});

// GET /api/admin/parts - Get all parts (with device name)
router.get('/parts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, d.name as device_name, d.type as device_type
      FROM parts p
      JOIN devices d ON p.device_id = d.id
      ORDER BY d.name ASC, p.name ASC
    `);
    res.json({ success: true, parts: result.rows });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ success: false, error: 'Server error fetching parts.' });
  }
});

// PUT /api/admin/parts/:id/stock - Update stock quantity for a part
router.put('/parts/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined || stock_quantity < 0) {
    return res.status(400).json({ success: false, error: 'Valid stock quantity is required.' });
  }

  try {
    const result = await pool.query(
      'UPDATE parts SET stock_quantity = $1 WHERE id = $2 RETURNING *',
      [stock_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Part not found.' });
    }

    res.json({ success: true, part: result.rows[0] });
  } catch (error) {
    console.error('Error updating part stock:', error);
    res.status(500).json({ success: false, error: 'Server error updating part stock.' });
  }
});

// DELETE /api/admin/parts/:id - Delete a part
router.delete('/parts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM parts WHERE id = $1 RETURNING id');

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Part not found.' });
    }

    res.json({ success: true, message: 'Part deleted successfully.' });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ success: false, error: 'Server error deleting part.' });
  }
});

export default router;