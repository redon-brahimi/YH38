// Supplier model for YH38 repair management system
export class Supplier {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.contact_email = data.contact_email;
    this.contact_phone = data.contact_phone;
    this.address = data.address;
    this.created_at = data.created_at;
  }

  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      )
    `;
  }
}
