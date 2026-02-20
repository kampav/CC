import { getToken } from '../lib/auth';

const API_BASE = '/api/v1';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token
      ? { 'Authorization': `Bearer ${token}` }
      : { 'X-API-Key': 'admin-demo-key' }),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (options.body) headers['Content-Type'] = 'application/json';

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
  changeOfferStatus: (id: string, data: any) =>
    request<any>(`/offers/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Partners
  listPartners: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners${qs}`);
  },
  getPartner: (id: string) => request<any>(`/partners/${id}`),
  changePartnerStatus: (id: string, data: any) =>
    request<any>(`/partners/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Campaigns
  listCampaigns: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/campaigns${qs}`);
  },
  getCampaign: (id: string) => request<any>(`/campaigns/${id}`),
  createCampaign: (data: any) =>
    request<any>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) =>
    request<any>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  changeCampaignStatus: (id: string, data: any) =>
    request<any>(`/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  addOffersToCampaign: (id: string, offerIds: string[]) =>
    request<any>(`/campaigns/${id}/offers`, { method: 'POST', body: JSON.stringify({ offerIds }) }),
  removeOfferFromCampaign: (id: string, offerId: string) =>
    request<any>(`/campaigns/${id}/offers/${offerId}`, { method: 'DELETE' }),

  // Analytics
  offerAnalytics: () => request<any>('/analytics/offers'),
  redemptionAnalytics: () => request<any>('/analytics/redemptions'),
  revenueAnalytics: () => request<any>('/analytics/revenue'),
  customerInsights: (customerId: string) => request<any>(`/analytics/customer-insights/${customerId}`),

  // Exec dashboard
  execDashboard: () => request<any>('/exec/dashboard'),

  // Commercial customers
  listCommercialCustomers: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<any>(`/commercial${qs}`);
  },
  createCommercialCustomer: (data: any) =>
    request<any>('/commercial', { method: 'POST', body: JSON.stringify(data) }),
  updateCommercialStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/commercial/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),

  // Audit
  listAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/audit/offers${qs}`);
  },
  getAuditLogByOffer: (offerId: string) =>
    request<any>(`/audit/offers/${offerId}`),
};
