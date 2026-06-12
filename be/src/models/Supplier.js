import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class Supplier {
  /**
   * Finds a supplier by its ID.
   * @param {number} id - The ID of the supplier.
   * @param {object} [client] - Optional database client for transactions.
   * @returns {Promise<object|null>} The supplier object or null if not found.
   */
  static async findById(id, client) {
    const dbClient = client || pool;
    const result = await dbClient.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Finds an existing supplier by name or creates a new one.
   * Requires a transaction client.
   * @param {object} client - The database client from a transaction.
   * @param {object} supplierData - Data for the supplier.
   * @param {string} supplierData.name - The name of the supplier.
   * @param {string} [supplierData.contact_email] - The supplier's email.
   * @param {string} [supplierData.contact_phone] - The supplier's phone.
   * @returns {Promise<object|null>} The created or found supplier object.
   */
  static async findOrCreate(client, { name, contact_email, contact_phone }) {
    if (!name) return null;

    if (!client) {
        throw new Error('A database client is required for findOrCreate to ensure transactional integrity.');
    }

    const existing = await client.query('SELECT * FROM suppliers WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const insert = await client.query(
      'INSERT INTO suppliers (name, contact_email, contact_phone) VALUES ($1, $2, $3) RETURNING *',
      [name, contact_email || null, contact_phone || null]
    );
    return insert.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    return result.rows;
  }
}