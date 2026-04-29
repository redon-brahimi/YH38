// Device model for YH38 repair management system
export class Device {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.created_at = data.created_at;
  }

  // Static method to create table
  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('phone', 'pc')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }
}