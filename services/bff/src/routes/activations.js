const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { withRetry } = require('../utils');
const router = express.Router();

const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

// POST /api/v1/activations - Activate an offer (CUSTOMER only)
// Uses req.customerId (c0000000-... UUID from customer-data-service) so activations
// align with customer profile data and recommendations engine.
router.post('/', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const body = { ...req.body, customerId };
    const response = await withRetry(() =>
      axios.post(`${REDEMPTION_SERVICE}/api/v1/activations`, body, {
        headers: { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' },
      })
    );
    res.status(201).json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/activations - List customer's activations
router.get('/', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const params = { ...req.query, customerId };
    const response = await axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, {
      headers: { 'X-Correlation-Id': req.correlationId },
      params,
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/activations/:id - Get activation detail
router.get('/:id', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.get(`${REDEMPTION_SERVICE}/api/v1/activations/${req.params.id}`, {
      headers: { 'X-Correlation-Id': req.correlationId },
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

module.exports = router;
