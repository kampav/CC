require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('./middleware/auth');
const { slimMiddleware } = require('./middleware/slim');
const { initIdentitySchema } = require('./identity');
const { getAllStates } = require('./circuit');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Service URLs ──────────────────────────────────
const SERVICES = {
  offers:      process.env.OFFER_SERVICE_URL      || 'http://localhost:8081',
  partners:    process.env.PARTNER_SERVICE_URL    || 'http://localhost:8082',
  eligibility: process.env.ELIGIBILITY_SERVICE_URL || 'http://localhost:8083',
  redemptions: process.env.REDEMPTION_SERVICE_URL  || 'http://localhost:8084',
  customers:   process.env.CUSTOMER_SERVICE_URL    || 'http://localhost:8085',
  transactions: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:8086',
};

// Export for use in routes
process.env.CUSTOMER_SERVICE_URL   = process.env.CUSTOMER_SERVICE_URL   || 'http://localhost:8085';
process.env.TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:8086';

// ─── Static demo pages ──────────────────────────────
app.use('/demo', express.static(path.join(__dirname, '../public')));

// ─── Security & Body ────────────────────────────────
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

// ─── Rate Limiting ──────────────────────────────────
const recRateLimit = rateLimit({
  windowMs: 60_000,  // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — rate limit exceeded (60/min)', retryAfter: 60 },
});

const apiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — rate limit exceeded (300/min)', retryAfter: 60 },
});

// ─── Correlation ID ──────────────────────────────────
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
});

// ─── Auth ────────────────────────────────────────────
app.use(authMiddleware);

// ─── Slim response middleware (mobile) ───────────────
app.use(slimMiddleware);

// ─── Health ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'bff',
    status: 'UP',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    upstreamServices: SERVICES,
    circuitBreakers: getAllStates(),
  });
});

// ─── Routes ──────────────────────────────────────────
app.use('/api/v1/auth',            apiRateLimit,  require('./routes/auth'));
app.use('/api/v1/exec',            apiRateLimit,  require('./routes/exec'));
app.use('/api/v1/commercial',      apiRateLimit,  require('./routes/commercial'));
app.use('/api/v1/offers',          apiRateLimit,  require('./routes/offers'));
app.use('/api/v1/partners',        apiRateLimit,  require('./routes/partners'));
app.use('/api/v1/activations',     apiRateLimit,  require('./routes/activations'));
app.use('/api/v1/transactions',    apiRateLimit,  require('./routes/transactions'));
app.use('/api/v1/eligibility',     apiRateLimit,  require('./routes/eligibility'));
app.use('/api/v1/analytics',       apiRateLimit,  require('./routes/analytics'));
app.use('/api/v1/campaigns',       apiRateLimit,  require('./routes/campaigns'));
app.use('/api/v1/audit',           apiRateLimit,  require('./routes/audit'));
app.use('/api/v1/recommendations', recRateLimit,  require('./routes/recommendations'));
app.use('/api/v1/customers',       apiRateLimit,  require('./routes/customers'));
app.use('/api/v1/mobile',          apiRateLimit,  require('./routes/mobile'));
// Notifications register lives under /api/v1/notifications (same file as mobile)
app.post('/api/v1/notifications/register', apiRateLimit, (req, res, next) => {
  req.url = '/notifications/register';
  require('./routes/mobile')(req, res, next);
});

// ─── Error handler ────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[${req.correlationId}] Error:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start ────────────────────────────────────────────
if (require.main === module) {
  initIdentitySchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`BFF v1.2.0 running on port ${PORT}`);
        console.log('Upstream services:', SERVICES);
      });
    })
    .catch((err) => {
      console.error('[startup] Identity schema init failed (DB may be unavailable):', err.message);
      app.listen(PORT, () => {
        console.log(`BFF v1.2.0 running on port ${PORT} (identity schema unavailable)`);
      });
    });
}

module.exports = app;
