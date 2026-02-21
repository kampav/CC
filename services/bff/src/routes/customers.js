/**
 * Customer profile proxy routes — forwards to customer-data-service.
 * Adds Redis caching (300s TTL).
 */
const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { cached, TTL } = require('../cache');

const router = express.Router();
const CUSTOMER_SERVICE = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8085';
const TRANSACTION_SERVICE = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:8086';

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId };
}

/**
 * GET /api/v1/customers/:id/profile
 * Customer profile from customer-data-service (cached 300s).
 */
router.get('/:id/profile', requireRole('CUSTOMER', 'COLLEAGUE', 'EXEC', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `customer:profile:${id}`;

    const data = await cached(cacheKey, TTL.CUSTOMER_PROFILE, async () => {
      const resp = await axios.get(`${CUSTOMER_SERVICE}/api/v1/customers/${id}`, {
        headers: headers(req),
        timeout: 3000,
      });
      return resp.data;
    });

    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Customer not found' });
    next(err);
  }
});

/**
 * GET /api/v1/customers/:id/summary
 * Lightweight customer summary (cached 300s).
 */
router.get('/:id/summary', requireRole('CUSTOMER', 'COLLEAGUE', 'EXEC', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `customer:summary:${id}`;

    const data = await cached(cacheKey, TTL.CUSTOMER_PROFILE, async () => {
      const resp = await axios.get(`${CUSTOMER_SERVICE}/api/v1/customers/${id}/summary`, {
        headers: headers(req),
        timeout: 3000,
      });
      return resp.data;
    });

    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Customer not found' });
    next(err);
  }
});

/**
 * GET /api/v1/customers/:id/spending
 * Spending summary from transaction-data-service (cached 900s).
 */
router.get('/:id/spending', requireRole('CUSTOMER', 'COLLEAGUE', 'EXEC', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const months = parseInt(req.query.months) || 3;
    const cacheKey = `customer:spending:${id}:${months}`;

    const data = await cached(cacheKey, TTL.SPENDING_SUMMARY, async () => {
      const resp = await axios.get(`${TRANSACTION_SERVICE}/api/v1/banking-transactions/customer/${id}/spending-summary`, {
        headers: headers(req),
        params: { months },
        timeout: 3000,
      });
      return resp.data;
    });

    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Customer not found' });
    // Return empty array if transaction service is down
    res.json([]);
  }
});

module.exports = router;
