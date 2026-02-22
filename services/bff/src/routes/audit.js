const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId };
}

// GET /api/v1/audit/offers
router.get('/offers', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/audit/offers`, { headers: headers(req), params: req.query });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Audit error' } : err);
  }
});

// GET /api/v1/audit/offers/:offerId
router.get('/offers/:offerId', requireRole('ADMIN', 'COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/audit/offers/${req.params.offerId}`, { headers: headers(req) });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Audit error' } : err);
  }
});

module.exports = router;
