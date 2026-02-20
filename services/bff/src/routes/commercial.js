/**
 * Commercial customer onboarding — COLLEAGUE/EXEC role
 * GET    /api/v1/commercial
 * POST   /api/v1/commercial
 * PATCH  /api/v1/commercial/:id/status
 */
const express = require('express');
const pool    = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/commercial  — list all commercial customers
router.get('/', requireRole('COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = `SELECT * FROM partners.commercial_customers ORDER BY created_at DESC`;
    const params = [];
    if (status) {
      query = `SELECT * FROM partners.commercial_customers WHERE status = $1 ORDER BY created_at DESC`;
      params.push(status.toUpperCase());
    }
    const { rows } = await pool.query(query, params);
    res.json({ commercialCustomers: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/commercial  — create commercial customer
router.post('/', requireRole('COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { companyName, crn, contactName, contactEmail, industry, annualSpendGbp, notes } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: 'companyName is required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO partners.commercial_customers
         (company_name, crn, contact_name, contact_email, industry, annual_spend_gbp, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [companyName, crn || null, contactName || null, contactEmail || null,
       industry || null, annualSpendGbp || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/commercial/:id/status  — approve / reject / progress KYB
router.patch('/:id/status', requireRole('COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const allowed = ['PENDING_ONBOARDING', 'KYB_IN_PROGRESS', 'APPROVED', 'REJECTED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }
    const { rows } = await pool.query(
      `UPDATE partners.commercial_customers
       SET status = $1,
           notes  = COALESCE($2, notes),
           onboarded_by  = CASE WHEN $1 = 'APPROVED' THEN $3::uuid ELSE onboarded_by END,
           onboarded_at  = CASE WHEN $1 = 'APPROVED' THEN NOW()    ELSE onboarded_at  END
       WHERE id = $4
       RETURNING *`,
      [status, notes || null, req.userId, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Commercial customer not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
