// Repair model for YH38 repair management system
export class Repair {
  constructor(data) {
    this.id = data.id;
    this.client_id = data.client_id;
    this.device_type = data.device_type; // 'phone' or 'pc'
    this.device_model = data.device_model;
    this.issue_description = data.issue_description;
    this.status = data.status; // pending, in_progress, fixed, ready_for_pickup
    this.priority = data.priority; // low, normal, high, urgent
    this.estimated_cost = data.estimated_cost;
    this.actual_cost = data.actual_cost;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Static method to create table
  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS repairs (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        device_type VARCHAR(100) NOT NULL,
        device_model VARCHAR(255) NOT NULL,
        issue_description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'normal',
        estimated_cost DECIMAL(10,2),
        actual_cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  // Get status in French
  get statusInFrench() {
    const statusMap = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'fixed': 'Réparé',
      'ready_for_pickup': 'Prêt pour récupération'
    };
    return statusMap[this.status] || this.status;
  }

  // Get priority in French
  get priorityInFrench() {
    const priorityMap = {
      'low': 'Faible',
      'normal': 'Normal',
      'high': 'Élevé',
      'urgent': 'Urgent'
    };
    return priorityMap[this.priority] || this.priority;
  }

  // Generate tracking code
  get trackingCode() {
    return `YH38-${this.id.toString().padStart(6, '0')}`;
  }

  // Validate repair data
  static validate(data) {
    const errors = [];

    if (!data.device_type || !['phone', 'pc'].includes(data.device_type)) {
      errors.push('Le type d\'appareil doit être "phone" ou "pc"');
    }

    if (!data.device_model || data.device_model.trim().length < 2) {
      errors.push('Le modèle d\'appareil doit contenir au moins 2 caractères');
    }

    if (!data.issue_description || data.issue_description.trim().length < 10) {
      errors.push('La description du problème doit contenir au moins 10 caractères');
    }

    if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
      errors.push('La priorité doit être "low", "normal", "high" ou "urgent"');
    }

    return errors;
  }
}