const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';
const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId };
}

// GET /api/v1/analytics/offers?merchantId=...
router.get('/offers', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const params = req.query.merchantId ? { merchantId: req.query.merchantId } : {};
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/offers/analytics/summary`, {
      headers: headers(req),
      params,
    });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Offer analytics error' } : err);
  }
});

// GET /api/v1/analytics/redemptions?merchantId=...
router.get('/redemptions', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const params = req.query.merchantId ? { merchantId: req.query.merchantId } : {};
    const { data } = await axios.get(`${REDEMPTION_SERVICE}/api/v1/redemptions/analytics/summary`, {
      headers: headers(req),
      params,
    });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Redemption analytics error' } : err);
  }
});

module.exports = router;
