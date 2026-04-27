// Appointment model for YH38 repair management system
export class Appointment {
  constructor(data) {
    this.id = data.id;
    this.repair_id = data.repair_id;
    this.client_id = data.client_id;
    this.appointment_date = data.appointment_date;
    this.appointment_time = data.appointment_time;
    this.duration_minutes = data.duration_minutes || 60;
    this.status = data.status; // scheduled, confirmed, completed, cancelled
    this.notes = data.notes;
    this.created_at = data.created_at;
  }

  // Static method to create table
  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        repair_id INTEGER REFERENCES repairs(id),
        client_id INTEGER REFERENCES clients(id),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  // Get status in French
  get statusInFrench() {
    const statusMap = {
      'scheduled': 'Programmé',
      'confirmed': 'Confirmé',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusMap[this.status] || this.status;
  }

  // Get formatted date and time
  get formattedDateTime() {
    const date = new Date(`${this.appointment_date}T${this.appointment_time}`);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('fr-FR')
    };
  }

  // Check if appointment is in the future
  get isUpcoming() {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointment_date}T${this.appointment_time}`);
    return appointmentDateTime > now;
  }

  // Validate appointment data
  static validate(data) {
    const errors = [];

    if (!data.appointment_date) {
      errors.push('La date du rendez-vous est requise');
    } else {
      const appointmentDate = new Date(data.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        errors.push('La date du rendez-vous ne peut pas être dans le passé');
      }
    }

    if (!data.appointment_time) {
      errors.push('L\'heure du rendez-vous est requise');
    }

    if (data.duration_minutes && (data.duration_minutes < 15 || data.duration_minutes > 480)) {
      errors.push('La durée doit être entre 15 et 480 minutes');
    }

    return errors;
  }
}