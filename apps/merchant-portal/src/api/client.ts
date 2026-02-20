import { getToken } from '../lib/auth';

const API_BASE = '/api/v1';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token
      ? { 'Authorization': `Bearer ${token}` }
      : { 'X-API-Key': 'merchant-demo-key' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (response.status === 401) {
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

export const api = {
  // Auth
  me: () => request<any>('/auth/me'),

  // Offers
  listOffers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/offers${qs}`);
  },
  getOffer: (id: string) => request<any>(`/offers/${id}`),
  createOffer: (data: any) => request<any>('/offers', { method: 'POST', body: JSON.stringify(data) }),
  updateOffer: (id: string, data: any) => request<any>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  changeOfferStatus: (id: string, data: any) => request<any>(`/offers/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Partners
  listPartners: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners${qs}`);
  },
  getPartner: (id: string) => request<any>(`/partners/${id}`),
  createPartner: (data: any) => request<any>('/partners', { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id: string, data: any) => request<any>(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Transactions
  listTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/transactions${qs}`);
  },

  // Recommendations & Insights
  getMerchantInsights: () => request<any>('/recommendations/merchant-insights'),
  getNextOfferSuggestions: () => request<any>('/recommendations/merchant-next-offer'),

  // Analytics
  offerAnalytics: (merchantId?: string) => {
    const qs = merchantId ? `?merchantId=${merchantId}` : '';
    return request<any>(`/analytics/offers${qs}`);
  },
  redemptionAnalytics: (merchantId?: string) => {
    const qs = merchantId ? `?merchantId=${merchantId}` : '';
    return request<any>(`/analytics/redemptions${qs}`);
  },
};
