const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' };
}

// POST /api/v1/campaigns
router.post('/', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.post(`${OFFER_SERVICE}/api/v1/campaigns`, req.body, { headers: headers(req) });
    res.status(201).json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Campaign create error' } : err);
  }
});

// GET /api/v1/campaigns
router.get('/', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/campaigns`, { headers: headers(req), params: req.query });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Campaign list error' } : err);
  }
});

// GET /api/v1/campaigns/:id
router.get('/:id', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/campaigns/${req.params.id}`, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Campaign get error' } : err);
  }
});

// PUT /api/v1/campaigns/:id
router.put('/:id', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.put(`${OFFER_SERVICE}/api/v1/campaigns/${req.params.id}`, req.body, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Campaign update error' } : err);
  }
});

// PATCH /api/v1/campaigns/:id/status
router.patch('/:id/status', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.patch(`${OFFER_SERVICE}/api/v1/campaigns/${req.params.id}/status`, req.body, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Campaign status error' } : err);
  }
});

// POST /api/v1/campaigns/:id/offers
router.post('/:id/offers', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.post(`${OFFER_SERVICE}/api/v1/campaigns/${req.params.id}/offers`, req.body, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Add offers error' } : err);
  }
});

// DELETE /api/v1/campaigns/:id/offers/:offerId
router.delete('/:id/offers/:offerId', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.delete(`${OFFER_SERVICE}/api/v1/campaigns/${req.params.id}/offers/${req.params.offerId}`, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Remove offer error' } : err);
  }
});

module.exports = router;
