/**
 * Slim response middleware for mobile clients.
 * If req.query.slim === 'true' or User-Agent contains 'CCPlatform',
 * strip heavy fields from offer responses.
 */

const SLIM_OFFER_FIELDS = ['id', 'title', 'cashbackRate', 'category', 'imageUrl', 'endDate', 'brand', '_reason', '_mode'];

function slimOffer(offer) {
  const slim = {};
  for (const field of SLIM_OFFER_FIELDS) {
    if (offer[field] !== undefined) slim[field] = offer[field];
  }
  return slim;
}

function isSlimRequest(req) {
  if (req.query.slim === 'true') return true;
  const ua = req.headers['user-agent'] || '';
  return ua.includes('CCPlatform-iOS') || ua.includes('CCPlatform-Android');
}

/**
 * Middleware: intercepts res.json() and slims offer arrays when slim mode active.
 */
function slimMiddleware(req, res, next) {
  if (!isSlimRequest(req)) return next();

  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (data && Array.isArray(data.recommendations)) {
      data = { ...data, recommendations: data.recommendations.map(slimOffer) };
    } else if (data && Array.isArray(data.offers)) {
      data = { ...data, offers: data.offers.map(slimOffer) };
    } else if (Array.isArray(data)) {
      data = data.map(item => item.cashbackRate !== undefined ? slimOffer(item) : item);
    }
    res.setHeader('X-Slim-Response', 'true');
    return originalJson(data);
  };

  next();
}

module.exports = { slimMiddleware, slimOffer, isSlimRequest };
