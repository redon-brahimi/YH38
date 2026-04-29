// Admin model for YH38 repair management system
export class Admin {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password; // This will be the hash
    this.role = data.role || 'admin';
    this.created_at = data.created_at;
  }

  // Static method to create table
  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'technician')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }
}