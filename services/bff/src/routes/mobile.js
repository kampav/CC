/**
 * Mobile API routes — slim, efficient endpoints for iOS and Android.
 * Auth: same JWT Bearer as web.
 */
const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { cached, TTL } = require('../cache');

const router = express.Router();
const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';
const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

const SLIM_OFFER_FIELDS = ['id', 'title', 'cashbackRate', 'category', 'imageUrl', 'endDate', 'brand'];

function slimOffer(o) {
  const s = {};
  for (const f of SLIM_OFFER_FIELDS) if (o[f] !== undefined) s[f] = o[f];
  return s;
}

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' };
}

/**
 * GET /api/v1/mobile/home
 * Aggregated home screen payload: greeting, stats, top 6 offers.
 */
router.get('/home', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const firstName = req.firstName || 'there';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const [offersRes, activationsRes, cashbackRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, {
        headers: headers(req),
        params: { status: 'LIVE', size: 6, sortBy: 'cashbackRate' },
      }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, {
        headers: headers(req),
        params: { customerId },
      }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/transactions/cashback`, {
        headers: headers(req),
        params: { customerId },
      }),
    ]);

    const offers = offersRes.status === 'fulfilled'
      ? (offersRes.value.data.content || []).slice(0, 6).map(slimOffer)
      : [];

    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data)
          ? activationsRes.value.data
          : activationsRes.value.data.content || [])
      : [];

    const totalCashback = cashbackRes.status === 'fulfilled'
      ? (cashbackRes.value.data.totalCashback || 0)
      : 0;

    const categories = [...new Set(offers.map(o => o.category).filter(Boolean))];

    res.json({
      greeting: `${greeting}, ${firstName}!`,
      stats: {
        activeOffers: activations.filter(a => a.status === 'ACTIVE').length,
        totalCashback,
        availableOffers: offersRes.status === 'fulfilled'
          ? (offersRes.value.data.totalElements || offers.length)
          : offers.length,
      },
      offers,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/mobile/offers?slim=true
 * Slim offer list for mobile browse.
 */
router.get('/offers', async (req, res, next) => {
  try {
    const { category, size = 20, page = 0 } = req.query;
    const cacheKey = `mobile:offers:${category || 'all'}:${page}:${size}`;

    const data = await cached(cacheKey, TTL.OFFERS, async () => {
      const params = { status: 'LIVE', size, page };
      if (category) params.category = category;
      const resp = await axios.get(`${OFFER_SERVICE}/api/v1/offers`, {
        headers: headers(req),
        params,
      });
      return {
        content: (resp.data.content || []).map(slimOffer),
        totalElements: resp.data.totalElements,
        totalPages: resp.data.totalPages,
      };
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/notifications/register
 * Register a device FCM token for push notifications.
 */
router.post('/notifications/register', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const { fcmToken, platform } = req.body;
    const customerId = req.customerId || req.userId;

    if (!fcmToken) {
      return res.status(400).json({ error: 'fcmToken is required' });
    }

    // Store in Redis (24h) — in production this would go to a notifications DB
    const { set, TTL } = require('../cache');
    await set(`notifications:${customerId}`, TTL.NOTIFICATIONS, {
      customerId,
      fcmToken,
      platform: platform || 'UNKNOWN',
      registeredAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      customerId,
      platform: platform || 'UNKNOWN',
      message: 'Device registered for push notifications',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
