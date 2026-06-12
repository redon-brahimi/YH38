import express from 'express';
import pkg from 'pg';
import logger from '../logger.js';
import { protect } from '../auth.js';
const { Pool } = pkg;
import { dispatchRepairStatusUpdate } from '../services/notificationService.js';

const router = express.Router();

import { Part } from '../models/Part.js';
import { Supplier } from '../models/Supplier.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { PurchaseOrderItem } from '../models/PurchaseOrderItem.js';
import { getRepairDetailsById } from './repairs.js'; // Import the helper function
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to authorize admin roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};

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
    logger.error('Error fetching all appointments:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching appointments.' });
  }
});

// GET /api/admin/dashboard/summary - Get dashboard summary metrics
router.get('/dashboard/summary', async (req, res) => {
  try {
    const [appointmentsResult, openRepairsResult, repairsStatusResult, lowStockResult, totalPartsResult, lowStockListResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM appointments WHERE appointment_date >= CURRENT_DATE AND status = 'scheduled'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM repairs WHERE status IN ('pending','in_progress')`),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM repairs GROUP BY status`),
      pool.query(`SELECT COUNT(*)::int AS count FROM parts WHERE stock_quantity < 5`),
      pool.query(`SELECT COUNT(*)::int AS count FROM parts`),
      pool.query(`
        SELECT p.id, p.name, p.stock_quantity, d.name as device_name, p.stock_quantity < 3 AS critical
        FROM parts p
        JOIN devices d ON p.device_id = d.id
        WHERE p.stock_quantity < 5
        ORDER BY p.stock_quantity ASC, d.name ASC, p.name ASC
        LIMIT 6
      `),
    ]);

    const repairsByStatus = repairsStatusResult.rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    res.json({
      success: true,
      summary: {
        upcomingAppointments: appointmentsResult.rows[0]?.count ?? 0,
        openRepairs: openRepairsResult.rows[0]?.count ?? 0,
        lowStockParts: lowStockResult.rows[0]?.count ?? 0,
        totalParts: totalPartsResult.rows[0]?.count ?? 0,
        repairsByStatus,
      },
      lowStockParts: lowStockListResult.rows,
    });
  } catch (error) {
    logger.error('Error fetching dashboard summary:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching dashboard summary.' });
  }
});

// ================================================
// REPAIR MANAGEMENT
// ================================================

// GET /api/admin/repairs - Get all repair tickets
router.get('/repairs', async (req, res) => {
  try {
    // This query is more efficient than fetching IDs and then looping.
    // It gets all repair data, including the latest appointment for each, in one go.
    const result = await pool.query(`
      SELECT
        r.id, r.client_id, r.device_type, r.device_model, r.issue_type, r.issue_description,
        r.status, r.priority, r.estimated_cost, r.actual_cost, r.created_at, r.updated_at,
        c.name as client_name, c.email as client_email, c.phone as client_phone,
        d.id as device_id,
        app.appointment_date, app.appointment_time, app.status as appointment_status, app.notes as appointment_notes
      FROM repairs r
      JOIN clients c ON r.client_id = c.id
      LEFT JOIN devices d ON d.name = r.device_model AND d.type = r.device_type
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY repair_id ORDER BY appointment_date DESC, appointment_time DESC) as rn
        FROM appointments
      ) app ON r.id = app.repair_id AND app.rn = 1
      ORDER BY r.created_at DESC
    `);

    const statusMap = {
      'pending': 'En attente',
      'in_progress': 'En cours de réparation',
      'fixed': 'Réparé',
      'ready_for_pickup': 'Prêt pour récupération'
    };

    const repairs = result.rows.map(repair => ({
      id: repair.id,
      tracking_code: `YH38-${repair.id.toString().padStart(6, '0')}`,
      status: repair.status,
      status_french: statusMap[repair.status] || repair.status,
      device_type: repair.device_type,
      device_model: repair.device_model,
      device_id: repair.device_id,
      issue_type: repair.issue_type,
      issue_description: repair.issue_description,
      priority: repair.priority,
      estimated_cost: repair.estimated_cost,
      actual_cost: repair.actual_cost,
      created_at: repair.created_at,
      updated_at: repair.updated_at,
      client: { name: repair.client_name, email: repair.client_email, phone: repair.client_phone },
      appointment: repair.appointment_date ? { date: repair.appointment_date, time: repair.appointment_time, status: repair.appointment_status, notes: repair.appointment_notes } : null
    }));

    res.json({ success: true, repairs });
  } catch (error) {
    logger.error('Error fetching all repairs for admin:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching all repairs.' });
  }
});

// PUT /api/admin/repairs/:id - Update repair details (status, costs, etc.)
router.put('/repairs/:id', async (req, res) => {
  const { id } = req.params;
  const { status, part_id } = req.body; // Destructure status and part_id from req.body
  let client; // Declare client here so it's accessible in finally

  try {
    client = await pool.connect(); // Connect inside the try block
    await client.query('BEGIN');

    if (status) {
      if (!['pending', 'in_progress', 'fixed', 'ready_for_pickup'].includes(status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Invalid status provided.' });
      }
      await client.query('UPDATE repairs SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]); // Perform the update
    }

    if (status === 'fixed' && part_id) {
      try {
        await Part.decrementStock(client, part_id);
      } catch (stockError) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: stockError.message });
      }
    }

    // After all updates, fetch the complete, correctly-structured repair details to return to the frontend
    const detailedResult = await client.query(`
      SELECT r.id, r.client_id, 
             c.name as client_name, c.email as client_email, c.phone as client_phone, c.notification_preference,
             r.device_type, r.device_model, r.issue_type, r.issue_description,
             r.status, r.priority, r.estimated_cost, r.actual_cost,
             r.created_at, r.updated_at,
             a.appointment_date, a.appointment_time, a.status as appointment_status,
             a.notes as appointment_notes,
             (SELECT id FROM devices WHERE name = r.device_model AND type = r.device_type) as device_id
      FROM repairs r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN appointments a ON r.id = a.repair_id
      WHERE r.id = $1
    `, [id]);

    if (detailedResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Repair not found after update.' });
    }

    const updatedRepairData = detailedResult.rows[0];

    // Re-shape the data to match the GET endpoint's structure (with a nested client object)
    const statusMap = { 'pending': 'En attente', 'in_progress': 'En cours de réparation', 'fixed': 'Réparé', 'ready_for_pickup': 'Prêt pour récupération' };
    const responseRepair = {
      ...updatedRepairData,
      tracking_code: `YH38-${updatedRepairData.id.toString().padStart(6, '0')}`,
      status_french: statusMap[updatedRepairData.status] || updatedRepairData.status,
      client: {
        // This is the user object for the notification service
        id: updatedRepairData.client_id, // This is the client's ID
        name: updatedRepairData.client_name,
        email: updatedRepairData.client_email,
        phone: updatedRepairData.client_phone,
        notification_preference: updatedRepairData.notification_preference,
      },
      appointment: updatedRepairData.appointment_date ? { date: updatedRepairData.appointment_date, time: updatedRepairData.appointment_time, status: updatedRepairData.appointment_status, notes: updatedRepairData.appointment_notes } : null
    };
    // Clean up the top-level object to avoid redundant client data in the final JSON response
    delete responseRepair.client_name;
    delete responseRepair.client_email;
    delete responseRepair.client_phone;
    delete responseRepair.client_id;
    delete responseRepair.notification_preference;

    await client.query('COMMIT');

    // Asynchronously send notifications if the status was updated
    if (status) {
      dispatchRepairStatusUpdate(responseRepair.client, {
        trackingCode: responseRepair.tracking_code,
        status: responseRepair.status_french,
        deviceModel: responseRepair.device_model,
      });
    }

    res.json({ success: true, repair: responseRepair, message: 'Repair updated successfully.' });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    logger.error('Error updating repair:', { error, body: req.body, user: req.user, repairId: id });
    res.status(500).json({ success: false, error: 'Server error during repair update.' });
  } finally {
    if (client) { // Ensure client exists before releasing
      client.release();
    }
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
    logger.error('Error adding device:', { error, body: req.body, user: req.user });
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
    logger.error('Error fetching devices:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching devices.' });
  }
});

// ================================================
// PARTS MANAGEMENT (Stock)
// ================================================

// POST /api/admin/parts - Add a new part
router.post('/parts', async (req, res) => {
  const { name, device_id, stock_quantity = 0, price = 0 } = req.body;

  if (!name || !device_id) {
    return res.status(400).json({ success: false, error: 'Part name and device ID are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO parts (name, device_id, stock_quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, device_id, stock_quantity, price]
    );
    res.status(201).json({ success: true, part: result.rows[0] });
  } catch (error) {
    logger.error('Error adding part:', { error, body: req.body, user: req.user });
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
    logger.error('Error fetching parts:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching parts.' });
  }
});

// GET /api/admin/parts/by-device/:device_id - Get parts for a specific device
router.get('/parts/by-device/:device_id', async (req, res) => {
  const { device_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, stock_quantity FROM parts WHERE device_id = $1 AND stock_quantity > 0 ORDER BY name ASC',
      [device_id]
    );
    res.json({ success: true, parts: result.rows });
  } catch (error) {
    logger.error('Error fetching parts by device:', { error, deviceId: req.params.device_id, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching parts by device.' });
  }
});

// POST /api/admin/parts/check-availability - Check if a part for a repair is in stock
router.post('/parts/check-availability', async (req, res) => {
  const { device_model, issue_type } = req.body;

  if (!device_model || !issue_type) {
    return res.status(400).json({ success: false, error: 'Device model and issue type are required.' });
  }

  // A mapping from the frontend issue_type to a search term for the database.
  const partTypeMapping = {
    'ecran': 'Écran',
    'batterie': 'Batterie',
    'flash': 'Flash',
    'connecteur': 'Connecteur',
    'boutons': 'Bouton', // Will match "Bouton Power", "Bouton Volume"
    'camera_avant': 'Caméra Avant',
    'camera_arriere': 'Caméra Arrière',
    'micro': 'Micro',
    'arriere': 'Arrière', // Matches "Vitre arrière"
    'ecouteur_interne': 'Écouteur interne',
    'haut_parleur': 'Haut-parleur',
    'lecteur_sim': 'Lecteur SIM',
    'capteur_proximite': 'Capteur de proximité',
  };

  const searchTerm = partTypeMapping[issue_type];

  if (!searchTerm) {
    return res.json({ success: true, available: null, message: 'Le type de pièce n\'est pas standard, la disponibilité ne peut être vérifiée automatiquement.' });
  }

  try {
    const deviceResult = await pool.query('SELECT id FROM devices WHERE name = $1', [device_model]);
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Appareil non trouvé dans la base de données.' });
    }
    const deviceId = deviceResult.rows[0].id;

    const partResult = await pool.query('SELECT name, stock_quantity FROM parts WHERE device_id = $1 AND name ILIKE $2', [deviceId, `%${searchTerm}%`]);

    if (partResult.rows.length > 0 && partResult.rows[0].stock_quantity > 0) {
      const part = partResult.rows[0];
      res.json({ success: true, available: true, message: `Pièce disponible (${part.name}). Stock: ${part.stock_quantity}` });
    } else {
      res.json({ success: true, available: false, message: 'Pièce non disponible ou hors stock. Commande spéciale peut être nécessaire.' });
    }
  } catch (error) {
    logger.error('Error checking part availability:', { error, body: req.body });
    res.status(500).json({ success: false, error: 'Server error checking part availability.' });
  }
});

// GET /api/admin/suppliers - Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json({ success: true, suppliers });
  } catch (error) {
    logger.error('Error fetching suppliers:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching suppliers.' });
  }
});

// GET /api/admin/reorders/low-stock - Get all low stock parts for reorder
router.get('/reorders/low-stock', async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;

  try {
    const result = await pool.query(`
      SELECT p.*, d.name as device_name, d.type as device_type
      FROM parts p
      JOIN devices d ON p.device_id = d.id
      WHERE p.stock_quantity < $1
      ORDER BY d.name ASC, p.name ASC
    `, [threshold]);
    res.json({ success: true, parts: result.rows });
  } catch (error) {
    logger.error('Error fetching low stock parts:', { error, threshold, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching low stock parts.' });
  }
});

// POST /api/admin/reorders - Create a new purchase order
router.post('/reorders', async (req, res) => {
  const { supplier_id, supplier_name, contact_email, contact_phone, notes, items = [] } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Au moins un article est requis pour créer une commande.' });
  }

  let client = null;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    let supplier = null;
    if (supplier_id) {
      supplier = await Supplier.findById(supplier_id, client);
      if (!supplier) {
        throw new Error('Fournisseur introuvable.');
      }
    } else if (supplier_name) {
      supplier = await Supplier.findOrCreate(client, { name: supplier_name, contact_email, contact_phone });
    }

    const orderResult = await client.query(
      'INSERT INTO purchase_orders (supplier_id, status, notes, total_cost) VALUES ($1, $2, $3, $4) RETURNING *',
      [supplier ? supplier.id : null, 'ordered', notes || null, 0]
    );
    const purchaseOrder = orderResult.rows[0];

    let totalCost = 0;
    for (const item of items) {
      const quantity = Number(item.quantity);
      const unit_price = Number(item.unit_price || 0);
      if (!item.part_id || quantity <= 0) {
        throw new Error('Chaque article doit avoir une pièce valide et une quantité supérieure à zéro.');
      }

      totalCost += quantity * unit_price;
      await client.query(
        'INSERT INTO purchase_order_items (purchase_order_id, part_id, quantity, unit_price, note) VALUES ($1, $2, $3, $4, $5)',
        [purchaseOrder.id, item.part_id, quantity, unit_price, item.note || null]
      );
    }

    await client.query('UPDATE purchase_orders SET total_cost = $1 WHERE id = $2', [totalCost, purchaseOrder.id]);

    const detailedResult = await client.query(`
      SELECT po.*, s.name as supplier_name, s.contact_email, s.contact_phone
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1
    `, [purchaseOrder.id]);

    const itemsResult = await client.query(`
      SELECT poi.*, p.name as part_name, p.device_id, d.name as device_name
      FROM purchase_order_items poi
      LEFT JOIN parts p ON poi.part_id = p.id
      LEFT JOIN devices d ON p.device_id = d.id
      WHERE poi.purchase_order_id = $1
    `, [purchaseOrder.id]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      order: {
        ...detailedResult.rows[0],
        items: itemsResult.rows,
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    logger.error('Error creating purchase order:', { error, body: req.body, user: req.user });
    res.status(500).json({ success: false, error: error.message || 'Server error creating purchase order.' });
  } finally {
    if (client) client.release();
  }
});

// GET /api/admin/reorders - List purchase orders
router.get('/reorders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.contact_email, s.contact_phone,
        (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as item_count
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
    `);
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    logger.error('Error fetching purchase orders:', { error, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching purchase orders.' });
  }
});

// GET /api/admin/reorders/:id - Get a purchase order detail
router.get('/reorders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.contact_email, s.contact_phone
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Commande introuvable.' });
    }

    const itemsResult = await pool.query(`
      SELECT poi.*, p.name as part_name, p.device_id, d.name as device_name
      FROM purchase_order_items poi
      LEFT JOIN parts p ON poi.part_id = p.id
      LEFT JOIN devices d ON p.device_id = d.id
      WHERE poi.purchase_order_id = $1
    `, [id]);

    res.json({ success: true, order: { ...result.rows[0], items: itemsResult.rows } });
  } catch (error) {
    logger.error('Error fetching purchase order:', { error, orderId: id, user: req.user });
    res.status(500).json({ success: false, error: 'Server error fetching purchase order.' });
  }
});

// PUT /api/admin/reorders/:id - Update purchase order status
router.put('/reorders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['draft', 'ordered', 'received', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Status invalide.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the current order to check its status before updating
    const currentOrderResult = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
    if (currentOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Commande introuvable.' });
    }
    const currentOrder = currentOrderResult.rows[0];

    // If the status is changing to 'received' and it wasn't 'received' before, update stock
    if (status === 'received' && currentOrder.status !== 'received') {
      const itemsResult = await client.query('SELECT * FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
      const items = itemsResult.rows;

      // Use Promise.all to update all parts stock concurrently
      await Promise.all(items.map(item => {
        if (item.part_id && item.quantity > 0) {
          return client.query(
            'UPDATE parts SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.quantity, item.part_id]
          );
        }
        return Promise.resolve(); // If no part_id or quantity, do nothing
      }));
    }

    // Now, update the order status
    const result = await client.query(
      'UPDATE purchase_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    await client.query('COMMIT');

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    logger.error('Error updating purchase order:', { error, body: req.body, orderId: id, user: req.user });
    res.status(500).json({ success: false, error: 'Server error updating purchase order.' });
  } finally {
    if (client) client.release();
  }
});

// PUT /api/admin/parts/:id/stock - Update stock quantity for a part
router.put('/parts/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { quantity_change } = req.body; // Expecting a change amount, not absolute quantity

  if (quantity_change === undefined || !Number.isInteger(quantity_change)) {
    return res.status(400).json({ success: false, error: 'A valid integer quantity_change is required.' });
  }

  try {
    // First, get the current stock to validate against negative results
    const currentStockResult = await pool.query('SELECT stock_quantity FROM parts WHERE id = $1', [id]);
    if (currentStockResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Part not found.' });
    }
    const currentStock = currentStockResult.rows[0].stock_quantity;
    const newCalculatedStock = currentStock + quantity_change;

    if (newCalculatedStock < 0) {
      return res.status(400).json({ success: false, error: 'Stock cannot go below zero.' });
    }

    const result = await pool.query(
      'UPDATE parts SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *',
      [quantity_change, id]
    );

    res.json({ success: true, part: result.rows[0] });
  } catch (error) {
    logger.error('Error updating part stock:', { error, body: req.body, partId: id, user: req.user });
    res.status(500).json({ success: false, error: 'Server error updating part stock.' });
  }
});

// DELETE /api/admin/parts/:id - Delete a part
router.delete('/parts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM parts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Part not found.' });
    }

    res.json({ success: true, message: 'Part deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting part:', { error, partId: id, user: req.user });
    res.status(500).json({ success: false, error: 'Server error deleting part.' });
  }
});

export default router;
