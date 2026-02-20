/**
 * PostgreSQL connection pool for BFF-managed identity schema.
 * Connects to the same cc-postgres Docker container used by Java services.
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://commerce:commerce_dev@localhost:5432/connected_commerce',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

module.exports = pool;
