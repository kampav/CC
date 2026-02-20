/**
 * Simple API-Key authentication middleware for MVP.
 *
 * How it works:
 * - Checks for X-API-Key header on protected routes
 * - Looks up the key in a hardcoded map (would be a database in production)
 * - Sets X-User-Id, X-User-Role, and X-Partner-Id headers for downstream services
 * - Public routes (GET offers, health endpoints) skip auth
 */

// MVP: Hardcoded API keys. In production, these would come from a database.
const API_KEYS = {
  'merchant-demo-key': {
    userId: '00000000-0000-0000-0000-000000000001',
    role: 'MERCHANT',
    partnerId: null, // Will be set after partner registration
    name: 'Demo Merchant',
  },
  'customer-demo-key': {
    userId: '00000000-0000-0000-0000-000000000002',
    role: 'CUSTOMER',
    name: 'Demo Customer',
  },
  'admin-demo-key': {
    userId: '00000000-0000-0000-0000-000000000003',
    role: 'ADMIN',
    name: 'Demo Admin',
  },
};

// Routes that don't require authentication
const PUBLIC_PATTERNS = [
  { method: 'GET', path: /^\/health/ },
  { method: 'GET', path: /^\/demo/ },              // Demo pages are public
  { method: 'GET', path: /^\/api\/v1\/offers\/health/ },
  { method: 'GET', path: /^\/api\/v1\/partners\/health/ },
  { method: 'GET', path: /^\/api\/v1\/offers/ },   // Browsing offers is public
];

function isPublicRoute(method, path) {
  return PUBLIC_PATTERNS.some(
    (pattern) => pattern.method === method && pattern.path.test(path)
  );
}

function authMiddleware(req, res, next) {
  // Skip auth for public routes
  if (isPublicRoute(req.method, req.path)) {
    // Still attach user info if key is provided (for personalisation)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && API_KEYS[apiKey]) {
      const user = API_KEYS[apiKey];
      req.userId = user.userId;
      req.userRole = user.role;
      req.partnerId = user.partnerId;
    }
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required. Provide X-API-Key header.',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  const user = API_KEYS[apiKey];
  if (!user) {
    return res.status(401).json({
      error: 'Invalid API key.',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  // Attach user info to request
  req.userId = user.userId;
  req.userRole = user.role;
  req.partnerId = user.partnerId;
  req.userName = user.name;

  next();
}

// Helper to check if the user has a specific role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.userRole || 'none'}`,
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
}

// Update a merchant's partnerId after they register
function setMerchantPartnerId(apiKey, partnerId) {
  if (API_KEYS[apiKey]) {
    API_KEYS[apiKey].partnerId = partnerId;
  }
}

module.exports = { authMiddleware, requireRole, setMerchantPartnerId, API_KEYS };
