/**
 * GCP Identity Token helper for Cloud Run service-to-service auth.
 * On GCP: fetches a short-lived OIDC token from the metadata server for each target service URL.
 * Locally: returns null (no auth needed — services run without IAM checks).
 * Tokens are cached per audience for 45 minutes (tokens are valid for 1 hour).
 */
const axios = require('axios');

const IS_GCP = process.env.NODE_ENV === 'production';
const METADATA_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';
const TOKEN_TTL_MS = 45 * 60 * 1000; // 45 minutes

const tokenCache = new Map(); // audience -> { token, expiresAt }

async function getIdentityToken(audience) {
  if (!IS_GCP) return null;

  const cached = tokenCache.get(audience);
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  try {
    const resp = await axios.get(`${METADATA_URL}?audience=${encodeURIComponent(audience)}`, {
      headers: { 'Metadata-Flavor': 'Google' },
      timeout: 3000,
    });
    const token = resp.data;
    tokenCache.set(audience, { token, expiresAt: Date.now() + TOKEN_TTL_MS });
    return token;
  } catch (err) {
    console.error('[gcpAuth] Failed to get identity token:', err.message);
    return null;
  }
}

/**
 * Returns axios headers with Authorization: Bearer <token> for the given base URL.
 * Pass the result to axios calls: axios.get(url, { headers: await gcpHeaders(url) })
 */
async function gcpHeaders(serviceBaseUrl) {
  const token = await getIdentityToken(serviceBaseUrl);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

module.exports = { gcpHeaders };
