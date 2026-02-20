import React, { useState } from 'react';
import { api } from '../api/client';

const DEMO_CUSTOMERS = [
  { id: '00000000-0000-0000-0000-000000000002', label: 'Customer 1 — Grocery & Dining' },
  { id: 'c0000000-0000-0000-0000-000000000003', label: 'Customer 2 — Fashion & Travel' },
  { id: 'c0000000-0000-0000-0000-000000000004', label: 'Customer 3 — Electronics & Entertainment' },
  { id: 'c0000000-0000-0000-0000-000000000005', label: 'Alice — Professional, Dining & Travel' },
  { id: 'c0000000-0000-0000-0000-000000000006', label: 'Ben — Family, Grocery & Health' },
  { id: 'c0000000-0000-0000-0000-000000000007', label: 'Cara — Student, Entertainment' },
  { id: 'c0000000-0000-0000-0000-000000000008', label: 'Dan — Tech Enthusiast' },
];

const CustomerInsights: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchInsights(id?: string) {
    const cid = id || customerId;
    if (!cid) { setError('Please select or enter a customer ID'); return; }
    setLoading(true);
    setError('');
    setInsights(null);
    try {
      const data = await api.customerInsights(cid);
      setInsights(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Customer Insights</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>AI-powered customer profile, activation history, and campaign recommendations</p>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Select Demo Customer</label>
          <select value={customerId} onChange={e => { setCustomerId(e.target.value); if (e.target.value) fetchInsights(e.target.value); }}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}>
            <option value="">— Select a customer —</option>
            {DEMO_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={customerId} onChange={e => setCustomerId(e.target.value)}
            placeholder="Or paste any customer UUID..."
            style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
          />
          <button onClick={() => fetchInsights()} disabled={loading}
            style={{ padding: '0.6rem 1.25rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? '...' : 'Analyse'}
          </button>
        </div>
        {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>{error}</p>}
      </div>

      {loading && <p style={{ color: '#64748B' }}>Loading insights...</p>}

      {insights && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <KPI label="Activations" value={insights.activationCount} color="#7C3AED" />
            <KPI label="Transactions" value={insights.transactionCount} color="#0EA5E9" />
            <KPI label="Total Spend" value={`£${(insights.totalSpendGbp || 0).toFixed(2)}`} color="#0F172A" isText />
            <KPI label="Cashback Earned" value={`£${(insights.totalCashbackGbp || 0).toFixed(2)}`} color="#059669" isText />
          </div>

          {/* AI Summary */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Customer Profile</p>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>{insights.aiSummary}</p>
          </div>

          {/* Category Breakdown */}
          {insights.categoryBreakdown && Object.keys(insights.categoryBreakdown).length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#0F172A' }}>Category Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(insights.categoryBreakdown).sort((a: any, b: any) => b[1] - a[1]).map(([cat, count]: [string, any]) => (
                  <div key={cat} style={{ textAlign: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#7C3AED' }}>{count}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{cat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activations */}
          {insights.recentActivations?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#0F172A' }}>Recent Activations</h3>
              {insights.recentActivations.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.9rem', color: '#0F172A' }}>{a.offerTitle || a.offer_title}</span>
                  <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: a.status === 'ACTIVE' ? '#D1FAE5' : '#F1F5F9', color: a.status === 'ACTIVE' ? '#065F46' : '#475569' }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const KPI: React.FC<{ label: string; value: number | string; color: string; isText?: boolean }> = ({ label, value, color, isText }) => (
  <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{label}</p>
    <p style={{ margin: '0.4rem 0 0', fontSize: isText ? '1.5rem' : '2rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

export default CustomerInsights;
