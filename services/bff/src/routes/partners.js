const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

const PARTNER_SERVICE = process.env.PARTNER_SERVICE_URL || 'http://localhost:8082';

// GET /api/v1/partners/health
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${PARTNER_SERVICE}/api/v1/partners/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ service: 'partner-service', status: 'DOWN' });
  }
});

// GET /api/v1/partners - List partners
router.get('/', async (req, res, next) => {
  try {
    const response = await axios.get(`${PARTNER_SERVICE}/api/v1/partners`, {
      headers: { 'X-Correlation-Id': req.correlationId },
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// GET /api/v1/partners/:id - Partner detail
router.get('/:id', async (req, res, next) => {
  try {
    const response = await axios.get(`${PARTNER_SERVICE}/api/v1/partners/${req.params.id}`, {
      headers: { 'X-Correlation-Id': req.correlationId },
    });
    res.json(response.data);
  } catch (error) {
    next(error.response ? { status: error.response.status, message: error.response.data } : error);
  }
});

// POST /api/v1/partners - Register a new partner
router.post('/', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.post(`${PARTNER_SERVICE}/api/v1/partners`, req.body, {
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

// PUT /api/v1/partners/:id - Update partner
router.put('/:id', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.put(`${PARTNER_SERVICE}/api/v1/partners/${req.params.id}`, req.body, {
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

// PATCH /api/v1/partners/:id/status - Change partner status
router.patch('/:id/status', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const response = await axios.patch(`${PARTNER_SERVICE}/api/v1/partners/${req.params.id}/status`, req.body, {
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
