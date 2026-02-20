/**
 * Authentication middleware — accepts JWT Bearer token OR legacy X-API-Key header.
 *
 * JWT payload: { sub: userId, role, email, firstName, lastName, partnerId, customerId }
 * Legacy keys remain for backward-compat with demo pages and existing integrations.
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cc-dev-secret-change-in-prod';

// Legacy demo API keys (backward-compat)
const API_KEYS = {
  'merchant-demo-key': {
    userId: '00000000-0000-0000-0000-000000000001',
    role: 'MERCHANT',
    partnerId: null,
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
  { method: 'GET',  path: /^\/health/ },
  { method: 'GET',  path: /^\/demo/ },
  { method: 'POST', path: /^\/api\/v1\/auth\/login/ },
  { method: 'GET',  path: /^\/api\/v1\/offers\/health/ },
  { method: 'GET',  path: /^\/api\/v1\/partners\/health/ },
  { method: 'GET',  path: /^\/api\/v1\/offers/ },
];

function isPublicRoute(method, path) {
  return PUBLIC_PATTERNS.some(
    (p) => p.method === method && p.path.test(path)
  );
}

function attachFromApiKey(req, apiKey) {
  const user = API_KEYS[apiKey];
  if (!user) return false;
  req.userId    = user.userId;
  req.userRole  = user.role;
  req.partnerId = user.partnerId || null;
  req.userName  = user.name;
  return true;
}

function attachFromJwt(req, token) {
  const decoded  = jwt.verify(token, JWT_SECRET);
  req.userId     = decoded.sub;
  req.userRole   = decoded.role;
  req.partnerId  = decoded.partnerId  || null;
  req.customerId = decoded.customerId || null;
  req.userEmail  = decoded.email;
  req.userName   = `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim();
  return true;
}

function authMiddleware(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  const apiKey       = req.headers['x-api-key'];

  if (isPublicRoute(req.method, req.path)) {
    // Optionally attach identity for personalisation on public routes
    try {
      if (bearerHeader && bearerHeader.startsWith('Bearer ')) {
        attachFromJwt(req, bearerHeader.slice(7));
      } else if (apiKey) {
        attachFromApiKey(req, apiKey);
      }
    } catch (_) { /* ignore on public routes */ }
    return next();
  }

  // Protected route — require valid credentials
  if (bearerHeader && bearerHeader.startsWith('Bearer ')) {
    try {
      attachFromJwt(req, bearerHeader.slice(7));
      return next();
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid or expired JWT token.',
        correlationId: req.correlationId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (apiKey) {
    if (attachFromApiKey(req, apiKey)) return next();
    return res.status(401).json({
      error: 'Invalid API key.',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(401).json({
    error: 'Authentication required. Provide Authorization: Bearer <token> or X-API-Key header.',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  });
}

// Helper to check if the user has a specific role.
// EXEC is treated as having COLLEAGUE privileges too.
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.userRole;
    const allowed = roles.includes(role) ||
      (role === 'EXEC' && roles.includes('COLLEAGUE'));
    if (!role || !allowed) {
      return res.status(403).json({
        error: `Access denied. Required: ${roles.join(' or ')}. Your role: ${role || 'none'}`,
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
