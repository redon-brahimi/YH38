// Part model for YH38 repair management system
export class Part {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.device_id = data.device_id;
    this.stock_quantity = data.stock_quantity;
    this.created_at = data.created_at;
  }

  // Static method to create table
  static get createTableQuery() {
    return `
      CREATE TABLE IF NOT EXISTS parts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
        stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, device_id)
      )
    `;
  }

  // Static method to safely decrement stock
  static async decrementStock(client, partId) {
    const query = `
      UPDATE parts 
      SET stock_quantity = stock_quantity - 1 
      WHERE id = $1 AND stock_quantity > 0
      RETURNING *;
    `;
    const res = await client.query(query, [partId]);
    if (res.rowCount === 0) {
      throw new Error("Stock insuffisant ou pièce introuvable.");
    }
    return res.rows[0];
  }
}