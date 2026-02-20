/**
 * Identity schema initialisation — runs once on BFF startup.
 * Creates the identity.users table and seeds 5 demo users if not present.
 */
const bcrypt = require('bcrypt');
const pool = require('./db');

const DEMO_PASSWORD = 'demo1234';
const SALT_ROUNDS = 10;

const DEMO_USERS = [
  {
    email: 'customer@demo.com',
    role: 'CUSTOMER',
    first_name: 'Alex',
    last_name: 'Demo',
    customer_id: '00000000-0000-0000-0000-000000000002',
    partner_id: null,
  },
  {
    email: 'customer2@demo.com',
    role: 'CUSTOMER',
    first_name: 'Jordan',
    last_name: 'Demo',
    customer_id: 'c0000000-0000-0000-0000-000000000005', // Alice persona
    partner_id: null,
  },
  {
    email: 'merchant@demo.com',
    role: 'MERCHANT',
    first_name: 'Merchant',
    last_name: 'Demo',
    customer_id: null,
    partner_id: null, // Will be set after partner lookup
  },
  {
    email: 'colleague@demo.com',
    role: 'COLLEAGUE',
    first_name: 'Colleague',
    last_name: 'Demo',
    customer_id: null,
    partner_id: null,
  },
  {
    email: 'exec@demo.com',
    role: 'EXEC',
    first_name: 'Executive',
    last_name: 'Demo',
    customer_id: null,
    partner_id: null,
  },
];

async function initIdentitySchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create schema and table
    await client.query(`CREATE SCHEMA IF NOT EXISTS identity`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS identity.users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role          VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER','MERCHANT','COLLEAGUE','EXEC')),
        first_name    VARCHAR(100),
        last_name     VARCHAR(100),
        partner_id    UUID,
        customer_id   UUID,
        status        VARCHAR(20) DEFAULT 'ACTIVE',
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed demo users (idempotent — skip if email already exists)
    const hash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    for (const u of DEMO_USERS) {
      await client.query(
        `INSERT INTO identity.users
           (email, password_hash, role, first_name, last_name, partner_id, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [u.email, hash, u.role, u.first_name, u.last_name, u.partner_id, u.customer_id]
      );
    }

    await client.query('COMMIT');
    console.log('[identity] Schema initialised, demo users seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[identity] Init error:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { initIdentitySchema };
