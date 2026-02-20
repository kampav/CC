const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';

// GET /api/v1/offers/health
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${OFFER_SERVICE}/api/v1/offers/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ service: 'offer-service', status: 'DOWN' });
  }
});

// GET /api/v1/offers - List all offers (public - customer-facing feed)
router.get('/', async (req, res, next) => {
  try {
    const response = await axios.get(`${OFFER_SERVICE}/api/v1/offers`, {
      headers: { 'X-Correlation-Id': req.correlationId },
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/offers/:id - Offer detail (public)
router.get('/:id', async (req, res, next) => {
  try {
    const response = await axios.get(`${OFFER_SERVICE}/api/v1/offers/${req.params.id}`, {
      headers: { 'X-Correlation-Id': req.correlationId },
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// POST /api/v1/offers - Create offer (MERCHANT or ADMIN only)
router.post('/', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.post(`${OFFER_SERVICE}/api/v1/offers`, req.body, {
      headers: {
        'X-Correlation-Id': req.correlationId,
        'Content-Type': 'application/json',
      },
    });
    res.status(201).json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// PUT /api/v1/offers/:id - Update offer (MERCHANT or ADMIN only)
router.put('/:id', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.put(`${OFFER_SERVICE}/api/v1/offers/${req.params.id}`, req.body, {
      headers: {
        'X-Correlation-Id': req.correlationId,
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// PATCH /api/v1/offers/:id/status - Change offer status (MERCHANT or ADMIN only)
router.patch('/:id/status', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.patch(`${OFFER_SERVICE}/api/v1/offers/${req.params.id}/status`, req.body, {
      headers: {
        'X-Correlation-Id': req.correlationId,
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

module.exports = router;
