import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class Part {
  /**
   * Decrements the stock for a given part within a transaction.
   * @param {object} client - The database client from a transaction.
   * @param {number} partId - The ID of the part to decrement.
   */
  static async decrementStock(client, partId) {
    if (!client) {
      throw new Error('A database client is required for decrementStock to ensure transactional integrity.');
    }
    if (!partId) {
      throw new Error('Part ID is required to decrement stock.');
    }

    const partResult = await client.query('SELECT stock_quantity FROM parts WHERE id = $1 FOR UPDATE', [partId]);
    if (partResult.rows.length === 0) {
      throw new Error('Part not found.');
    }

    const currentStock = partResult.rows[0].stock_quantity;
    if (currentStock < 1) {
      throw new Error('Cannot decrement stock. Part is already out of stock.');
    }

    await client.query('UPDATE parts SET stock_quantity = stock_quantity - 1 WHERE id = $1', [partId]);
  }
}