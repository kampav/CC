const express = require('express');
const axios = require('axios');
const router = express.Router();

const ELIGIBILITY_SERVICE = process.env.ELIGIBILITY_SERVICE_URL || 'http://localhost:8083';

// POST /api/v1/eligibility/check - Check offer eligibility
router.post('/check', async (req, res, next) => {
  try {
    const response = await axios.post(`${ELIGIBILITY_SERVICE}/api/v1/eligibility/check`, req.body, {
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

// GET /api/v1/eligibility/health
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ELIGIBILITY_SERVICE}/api/v1/eligibility/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ service: 'eligibility-service', status: 'DOWN' });
  }
});

module.exports = router;
