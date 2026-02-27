const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { withRetry } = require('../utils');
const router = express.Router();

const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

// POST /api/v1/transactions/simulate - Simulate a card transaction (for demo)
router.post('/simulate', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const body = { ...req.body, customerId };
    const response = await withRetry(() =>
      axios.post(`${REDEMPTION_SERVICE}/api/v1/transactions/simulate`, body, {
        headers: { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' },
      })
    );
    res.status(201).json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/transactions - List transactions
router.get('/', requireRole('CUSTOMER', 'MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const params = { ...req.query };
    if (req.userRole === 'CUSTOMER') {
      params.customerId = req.customerId || req.userId;
    }
    const response = await axios.get(`${REDEMPTION_SERVICE}/api/v1/transactions`, {
      headers: { 'X-Correlation-Id': req.correlationId },
      params,
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/transactions/cashback - Get cashback summary
router.get('/cashback', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const params = { ...req.query, customerId };
    const response = await axios.get(`${REDEMPTION_SERVICE}/api/v1/transactions/cashback`, {
      headers: { 'X-Correlation-Id': req.correlationId },
      params,
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

module.exports = router;
