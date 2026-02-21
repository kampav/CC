/**
 * Simple circuit breaker for BFF upstream calls.
 * Tracks failure counts per host; opens after 5 failures in 30s window.
 * Half-opens after 30s to allow retry.
 */

const FAILURE_THRESHOLD = 5;
const WINDOW_MS = 30_000;  // 30 seconds
const HALF_OPEN_AFTER_MS = 30_000;

const circuits = new Map(); // host → { failures: number[], openedAt: number|null }

function getCircuit(host) {
  if (!circuits.has(host)) {
    circuits.set(host, { failures: [], openedAt: null });
  }
  return circuits.get(host);
}

/**
 * Check if circuit is open for a given host.
 * Cleans up old failure timestamps.
 * @returns {'open'|'half-open'|'closed'}
 */
function getState(host) {
  const circuit = getCircuit(host);
  const now = Date.now();

  // Purge old failures outside the window
  circuit.failures = circuit.failures.filter(ts => now - ts < WINDOW_MS);

  if (circuit.openedAt !== null) {
    if (now - circuit.openedAt >= HALF_OPEN_AFTER_MS) {
      return 'half-open';
    }
    return 'open';
  }

  if (circuit.failures.length >= FAILURE_THRESHOLD) {
    circuit.openedAt = now;
    console.warn(`[circuit] OPEN for host: ${host} (${circuit.failures.length} failures in ${WINDOW_MS}ms)`);
    return 'open';
  }

  return 'closed';
}

/**
 * Record a failure for a host.
 */
function recordFailure(host) {
  const circuit = getCircuit(host);
  circuit.failures.push(Date.now());
}

/**
 * Record a success — resets the circuit if it was half-open.
 */
function recordSuccess(host) {
  const circuit = getCircuit(host);
  circuit.failures = [];
  if (circuit.openedAt !== null) {
    console.log(`[circuit] CLOSED for host: ${host} (recovered)`);
    circuit.openedAt = null;
  }
}

/**
 * Wrap an axios call with circuit breaker logic.
 * @param {string} host - e.g. 'http://localhost:8085'
 * @param {Function} fn - async function that makes the upstream call
 * @param {any} fallback - value to return when circuit is open
 */
async function withCircuitBreaker(host, fn, fallback = null) {
  const state = getState(host);

  if (state === 'open') {
    return { _circuitOpen: true, _host: host, data: fallback };
  }

  try {
    const result = await fn();
    recordSuccess(host);
    return result;
  } catch (err) {
    recordFailure(host);
    const state2 = getState(host);
    console.warn(`[circuit] Failure for ${host} (state: ${state2}):`, err.message);
    if (fallback !== null) {
      return { _circuitOpen: false, _fallback: true, data: fallback };
    }
    throw err;
  }
}

/**
 * Get all circuit states (for health endpoint).
 */
function getAllStates() {
  const result = {};
  for (const host of circuits.keys()) {
    result[host] = getState(host);
  }
  return result;
}

module.exports = { withCircuitBreaker, getState, recordFailure, recordSuccess, getAllStates };
