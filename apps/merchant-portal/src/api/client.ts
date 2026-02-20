const API_BASE = '/api/v1';
const API_KEY = 'merchant-demo-key';

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
