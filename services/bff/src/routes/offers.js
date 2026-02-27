const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { withRetry } = require('../utils');
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
  const postHeaders = { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' };
  async function attempt(retries) {
    try {
      const response = await axios.post(`${OFFER_SERVICE}/api/v1/offers`, req.body, { headers: postHeaders });
      res.status(201).json(response.data);
    } catch (error) {
      const status = error.response?.status;
      if (retries > 0 && (status === 502 || status === 503 || !error.response)) {
        await new Promise(r => setTimeout(r, 8000));
        return attempt(retries - 1);
      }
      next(error.response ? { status, message: error.response.data?.message || error.response.data || 'Create offer failed' } : error);
    }
  }
  attempt(2);
});

// PUT /api/v1/offers/:id - Update offer (MERCHANT or ADMIN only)
router.put('/:id', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await withRetry(() =>
      axios.put(`${OFFER_SERVICE}/api/v1/offers/${req.params.id}`, req.body, {
        headers: { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' },
      })
    );
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// PATCH /api/v1/offers/:id/status - Change offer status
// MERCHANT and ADMIN: create/manage their own offers
// COLLEAGUE and EXEC: approve/reject offers in the review workflow
router.patch('/:id/status', requireRole('MERCHANT', 'ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const response = await withRetry(() =>
      axios.patch(`${OFFER_SERVICE}/api/v1/offers/${req.params.id}/status`, req.body, {
        headers: { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' },
      })
    );
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

module.exports = router;
