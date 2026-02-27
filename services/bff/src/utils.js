/**
 * Shared BFF utilities.
 */

/**
 * withRetry — wraps an async function with cold-start retry logic.
 * Retries on 502/503 or network errors (Java service cold-start on Cloud Run min-instances=0).
 * @param {Function} fn - async function to call
 * @param {number} retries - number of retries (default 2)
 * @param {number} delayMs - delay between retries in ms (default 6000)
 */
async function withRetry(fn, retries = 2, delayMs = 6000) {
  try {
    return await fn();
  } catch (error) {
    const status = error.response?.status;
    if (retries > 0 && (status === 502 || status === 503 || !error.response)) {
      await new Promise(r => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}

module.exports = { withRetry };
