require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Service URLs ──────────────────────────────────
const SERVICES = {
  offers: process.env.OFFER_SERVICE_URL || 'http://localhost:8081',
  partners: process.env.PARTNER_SERVICE_URL || 'http://localhost:8082',
  eligibility: process.env.ELIGIBILITY_SERVICE_URL || 'http://localhost:8083',
  redemptions: process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084',
};

// ─── Static demo pages ──────────────────────────────
// Served at /demo/* — no auth required
app.use('/demo', express.static(path.join(__dirname, '../public')));

// ─── Middleware ─────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', // customer-app
    'http://localhost:5174', // merchant-portal
    'http://localhost:5175', // colleague-portal
  ],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('combined'));

// Correlation ID middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
});

// Auth middleware
app.use(authMiddleware);

// ─── Health ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'bff',
    status: 'UP',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    upstreamServices: SERVICES,
  });
});

// ─── Routes ────────────────────────────────────────
app.use('/api/v1/offers', require('./routes/offers'));
app.use('/api/v1/partners', require('./routes/partners'));
app.use('/api/v1/activations', require('./routes/activations'));
app.use('/api/v1/transactions', require('./routes/transactions'));
app.use('/api/v1/eligibility', require('./routes/eligibility'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/campaigns', require('./routes/campaigns'));
app.use('/api/v1/audit', require('./routes/audit'));
app.use('/api/v1/recommendations', require('./routes/recommendations'));

// ─── Error handler ─────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[${req.correlationId}] Error:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start ─────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`BFF running on port ${PORT}`);
    console.log('Upstream services:', SERVICES);
  });
}

module.exports = app;
