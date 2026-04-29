import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import { protect } from '../auth.js'; // Import the protect middleware

const router = express.Router();

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// POST /api/repairs - Create a new repair ticket
router.post('/', protect, async (req, res) => { // Add protect middleware
  try {
    const clientId = req.user.id; // Get client_id from authenticated user
    const userType = req.user.type;

    if (userType !== 'client') {
        return res.status(403).json({ success: false, error: 'Only clients can create repair tickets.' });
    }

    const {
      device_type,
      device_model,
      issue_description,
      priority = 'normal'
    } = req.body;

    // Validate required fields
    if (!device_type || !device_model || !issue_description) {
      return res.status(400).json({
        success: false,
        error: 'Le type d\'appareil, le modèle et la description du problème sont requis.'
      });
    }

    // Create repair
    const repairResult = await pool.query(
      'INSERT INTO repairs (client_id, device_type, device_model, issue_description, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clientId, device_type, device_model, issue_description, priority]
    );

    const repair = repairResult.rows[0];
    const trackingCode = `YH38-${repair.id.toString().padStart(6, '0')}`;

    res.status(201).json({
      success: true,
      repair: {
        id: repair.id,
        tracking_code: trackingCode,
        status: repair.status,
        device_type: repair.device_type,
        device_model: repair.device_model,
        priority: repair.priority,
        created_at: repair.created_at
      },
      message: `Ticket de réparation créé avec succès. Code de suivi: ${trackingCode}`
    });
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du ticket de réparation'
    });
  }
});

// GET /api/repairs/client - Get all repairs for the authenticated client
router.get('/client', protect, async (req, res) => {
  try {
    const clientId = req.user.id;
    const userType = req.user.type;

    if (userType !== 'client') {
      return res.status(403).json({ success: false, error: 'Access denied. Only clients can view their repairs.' });
    }

    const result = await pool.query(`
      SELECT r.*, c.name as client_name, c.email, c.phone,
             a.appointment_date, a.appointment_time, a.status as appointment_status,
             a.notes as appointment_notes
      FROM repairs r
      JOIN clients c ON r.client_id = c.id
      LEFT JOIN appointments a ON r.id = a.repair_id
      WHERE r.client_id = $1
      ORDER BY r.created_at DESC
    `, [clientId]);

    const repairs = result.rows.map(repair => {
      const statusMap = {
        'pending': 'En attente',
        'in_progress': 'En cours de réparation',
        'fixed': 'Réparé',
        'ready_for_pickup': 'Prêt pour récupération'
      };
      return {
        id: repair.id,
        tracking_code: `YH38-${repair.id.toString().padStart(6, '0')}`,
        status: repair.status,
        status_french: statusMap[repair.status] || repair.status,
        device_type: repair.device_type,
        device_model: repair.device_model,
        issue_description: repair.issue_description,
        priority: repair.priority,
        estimated_cost: repair.estimated_cost,
        actual_cost: repair.actual_cost,
        created_at: repair.created_at,
        updated_at: repair.updated_at,
        client: {
          name: repair.client_name,
          email: repair.email,
          phone: repair.phone
        },
        appointment: repair.appointment_date ? {
          date: repair.appointment_date,
          time: repair.appointment_time,
          status: repair.appointment_status,
          notes: repair.appointment_notes
        } : null
      };
    });

    res.json({ success: true, repairs });
  } catch (error) {
    console.error('Error fetching client repairs:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des réparations du client.' });
  }
});

// GET /api/repairs/:trackingCode - Get repair status by tracking code
router.get('/:trackingCode', async (req, res) => {
  try {
    const trackingCode = req.params.trackingCode;

    // Validate tracking code format
    if (!trackingCode.startsWith('YH38-')) {
      return res.status(400).json({
        success: false,
        error: 'Format de code de suivi invalide. Utilisez le format YH38-XXXXXX'
      });
    }

    const repairId = parseInt(trackingCode.replace('YH38-', ''));

    if (isNaN(repairId)) {
      return res.status(400).json({
        success: false,
        error: 'Code de suivi invalide'
      });
    }

    const result = await pool.query(`
      SELECT r.*, c.name as client_name, c.email, c.phone,
             a.appointment_date, a.appointment_time, a.status as appointment_status,
             a.notes as appointment_notes
      FROM repairs r
      JOIN clients c ON r.client_id = c.id
      LEFT JOIN appointments a ON r.id = a.repair_id
      WHERE r.id = $1
    `, [repairId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket de réparation non trouvé'
      });
    }

    const repair = result.rows[0];

    // Status mapping to French
    const statusMap = {
      'pending': 'En attente',
      'in_progress': 'En cours de réparation',
      'fixed': 'Réparé',
      'ready_for_pickup': 'Prêt pour récupération'
    };

    res.json({
      success: true,
      repair: {
        id: repair.id,
        tracking_code: `YH38-${repair.id.toString().padStart(6, '0')}`,
        status: repair.status,
        status_french: statusMap[repair.status] || repair.status,
        device_type: repair.device_type,
        device_model: repair.device_model,
        issue_description: repair.issue_description,
        priority: repair.priority,
        estimated_cost: repair.estimated_cost,
        actual_cost: repair.actual_cost,
        created_at: repair.created_at,
        updated_at: repair.updated_at,
        client: {
          name: repair.client_name,
          email: repair.email,
          phone: repair.phone
        },
        appointment: repair.appointment_date ? {
          date: repair.appointment_date,
          time: repair.appointment_time,
          status: repair.appointment_status,
          notes: repair.appointment_notes
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching repair:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du statut de réparation'
    });
  }
});

export default router;