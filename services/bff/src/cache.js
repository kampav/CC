/**
 * Redis cache helper for BFF.
 * Uses ioredis with a get-or-set pattern.
 * Falls back gracefully if Redis is unavailable.
 */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client = null;

function getClient() {
  if (!client) {
    client = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
    });
    client.on('error', (err) => {
      // Log once, don't crash — Redis is optional enhancement
      if (!client._loggedError) {
        console.warn('[cache] Redis unavailable — caching disabled:', err.message);
        client._loggedError = true;
      }
    });
    client.on('connect', () => {
      client._loggedError = false;
      console.log('[cache] Redis connected at', REDIS_URL);
    });
    client.connect().catch(() => {}); // non-fatal
  }
  return client;
}

/**
 * Get-or-set cache helper.
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - TTL in seconds
 * @param {Function} fn - Async function that returns the value if cache miss
 * @returns {Promise<any>} Cached or fresh value
 */
async function cached(key, ttlSeconds, fn) {
  const redis = getClient();
  try {
    if (redis.status === 'ready') {
      const cached = await redis.get(key);
      if (cached !== null) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    // Cache read failed — proceed to fetch
  }

  const value = await fn();

  try {
    if (redis.status === 'ready') {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    }
  } catch (e) {
    // Cache write failed — non-fatal
  }

  return value;
}

/**
 * Store a value in cache (fire and forget).
 */
async function set(key, ttlSeconds, value) {
  const redis = getClient();
  try {
    if (redis.status === 'ready') {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    }
  } catch (e) {
    // non-fatal
  }
}

/**
 * Invalidate a cache key.
 */
async function invalidate(key) {
  const redis = getClient();
  try {
    if (redis.status === 'ready') {
      await redis.del(key);
    }
  } catch (e) {
    // non-fatal
  }
}

// TTL constants (seconds)
const TTL = {
  CUSTOMER_PROFILE: 300,   // 5 minutes
  OFFERS: 60,              // 1 minute
  SPENDING_SUMMARY: 900,   // 15 minutes
  NOTIFICATIONS: 86400,    // 24 hours
};

module.exports = { cached, set, invalidate, TTL, getClient };
