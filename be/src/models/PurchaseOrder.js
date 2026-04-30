// Purchase order model for YH38 repair management system
export class PurchaseOrder {
  constructor(data) {
    this.id = data.id;
    this.supplier_id = data.supplier_id;
    this.status = data.status;
    this.total_cost = data.total_cost;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
        total_cost DECIMAL(10,2) DEFAULT 0 CHECK (total_cost >= 0),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }
}
