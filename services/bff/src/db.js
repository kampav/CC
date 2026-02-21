/**
 * PostgreSQL connection pool for BFF-managed identity schema.
 * On GCP Cloud Run: uses DB_HOST (Unix socket path), DB_NAME, DB_USER, DB_PASS.
 * Locally: uses DATABASE_URL or falls back to localhost:5432.
 */
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host:     process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'connected_commerce',
        user:     process.env.DB_USER || 'commerce',
        password: process.env.DB_PASS || 'commerce_dev',
        port:     process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        max:      3,   // keep low — db-f1-micro has only 25 max_connections
        idleTimeoutMillis:    30000,
        connectionTimeoutMillis: 5000,
      }
);

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

module.exports = pool;
