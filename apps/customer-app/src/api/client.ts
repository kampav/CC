import { getToken } from '../lib/auth';

const API_BASE = '/api/v1';

// Fallback customer ID for demo/legacy compatibility
export const CUSTOMER_ID = '00000000-0000-0000-0000-000000000002';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token
      ? { 'Authorization': `Bearer ${token}` }
      : { 'X-API-Key': 'customer-demo-key' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (response.status === 401) {
    // Token expired — redirect to login
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

function getCustomerId(): string {
  const raw = localStorage.getItem('cc_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user.customerId) return user.customerId;
    } catch { /* fall through */ }
  }
  return CUSTOMER_ID;
}

export const api = {
  // Auth
  me: () => request<any>('/auth/me'),

  // Offers (public)
  listOffers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/offers${qs}`);
  },
  getOffer: (id: string) => request<any>(`/offers/${id}`),

  // Activations
  activateOffer: (offerId: string) =>
    request<any>('/activations', {
      method: 'POST',
      body: JSON.stringify({ customerId: getCustomerId(), offerId }),
    }),
  listActivations: () =>
    request<any>(`/activations?customerId=${getCustomerId()}`),

  // Transactions
  simulateTransaction: (activationId: string, amount: number) =>
    request<any>('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify({ customerId: getCustomerId(), activationId, amount, cardLastFour: '4321' }),
    }),
  listTransactions: () =>
    request<any>(`/transactions?customerId=${getCustomerId()}`),

  // Cashback
  getCashbackSummary: () =>
    request<any>(`/transactions/cashback?customerId=${getCustomerId()}`),

  // Eligibility
  checkEligibility: (offerId: string) =>
    request<any>('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify({ customerId: getCustomerId(), offerId }),
    }),

  // Recommendations (v2 — with mode support)
  getRecommendations: (limit = 6, mode: 'rule-based' | 'ai' = 'rule-based') =>
    request<any>(`/recommendations/for-you?limit=${limit}&mode=${mode}`),
  compareRecommendations: (limit = 6) =>
    request<any>(`/recommendations/compare?limit=${limit}`),
  getSimilarOffers: (offerId: string) =>
    request<any>(`/recommendations/similar/${offerId}`),

  // Customer profile (v1.2.0)
  getCustomerProfile: (id: string) =>
    request<any>(`/customers/${id}/profile`),
  getCustomerSummary: (id: string) =>
    request<any>(`/customers/${id}/summary`),
  getCustomerSpending: (id: string, months = 3) =>
    request<any>(`/customers/${id}/spending?months=${months}`),

  // Mobile home (slim)
  getMobileHome: () =>
    request<any>('/mobile/home'),
};
