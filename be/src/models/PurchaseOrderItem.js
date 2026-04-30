// Purchase order item model for YH38 repair management system
export class PurchaseOrderItem {
  constructor(data) {
    this.id = data.id;
    this.purchase_order_id = data.purchase_order_id;
    this.part_id = data.part_id;
    this.quantity = data.quantity;
    this.unit_price = data.unit_price;
    this.note = data.note;
    this.created_at = data.created_at;
  }

  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
        part_id INTEGER REFERENCES parts(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(10,2) DEFAULT 0 CHECK (unit_price >= 0),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }
}
