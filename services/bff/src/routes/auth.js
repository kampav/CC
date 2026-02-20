/**
 * Auth routes: POST /login, GET /me, POST /register
 */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cc-dev-secret-change-in-prod';
const JWT_EXPIRES = '8h';

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, role, first_name, last_name, partner_id, customer_id, status
       FROM identity.users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      partnerId: user.partner_id,
      customerId: user.customer_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        partnerId: user.partner_id,
        customerId: user.customer_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { rows } = await pool.query(
      `SELECT id, email, role, first_name, last_name, partner_id, customer_id, status, created_at
       FROM identity.users WHERE id = $1`,
      [req.userId]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      role: u.role,
      firstName: u.first_name,
      lastName: u.last_name,
      partnerId: u.partner_id,
      customerId: u.customer_id,
      status: u.status,
      createdAt: u.created_at,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/register  — COLLEAGUE or EXEC only
router.post('/register', requireRole('COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, partnerId, customerId } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, and role are required' });
    }
    const allowed = ['CUSTOMER', 'MERCHANT', 'COLLEAGUE', 'EXEC'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${allowed.join(', ')}` });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO identity.users (email, password_hash, role, first_name, last_name, partner_id, customer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role, first_name, last_name`,
      [email.toLowerCase().trim(), hash, role, firstName || null, lastName || null, partnerId || null, customerId || null]
    );

    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
});

module.exports = router;
