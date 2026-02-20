const API_BASE = '/api/v1';
const API_KEY = 'customer-demo-key';
const CUSTOMER_ID = '00000000-0000-0000-0000-000000000002';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
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
      body: JSON.stringify({ customerId: CUSTOMER_ID, offerId }),
    }),
  listActivations: () =>
    request<any>(`/activations?customerId=${CUSTOMER_ID}`),

  // Transactions
  simulateTransaction: (activationId: string, amount: number) =>
    request<any>('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify({ customerId: CUSTOMER_ID, activationId, amount, cardLastFour: '4321' }),
    }),

  // Transactions
  listTransactions: () =>
    request<any>(`/transactions?customerId=${CUSTOMER_ID}`),

  // Cashback
  getCashbackSummary: () =>
    request<any>(`/transactions/cashback?customerId=${CUSTOMER_ID}`),

  // Eligibility
  checkEligibility: (offerId: string) =>
    request<any>('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify({ customerId: CUSTOMER_ID, offerId }),
    }),

  // Recommendations
  getRecommendations: (limit = 6) =>
    request<any>(`/recommendations/for-you?limit=${limit}`),
  getSimilarOffers: (offerId: string) =>
    request<any>(`/recommendations/similar/${offerId}`),
};

export { CUSTOMER_ID };
