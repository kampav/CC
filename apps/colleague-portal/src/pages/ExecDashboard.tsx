import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useBreakpoint } from '../hooks/useBreakpoint';

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#94A3B8', GOLD: '#D97706', PLATINUM: '#6366F1',
};

const ExecDashboard: React.FC = () => {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.execDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#64748B' }}>Loading executive dashboard...</p>;
  if (error) return <div style={{ padding: '1rem', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626' }}>{error}</div>;
  if (!data) return null;

  const totalTiers = Object.values(data.merchantTiers || {}).reduce((s: any, v: any) => s + v, 0) as number;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Executive Dashboard</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Platform KPIs · Last 30 days · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#D1FAE5', color: '#065F46', fontWeight: 600 }}>LIVE</span>
      </div>

      {/* AI Insight Banner */}
      {data.aiInsight && (
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Executive Insight</p>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>{data.aiInsight}</p>
        </div>
      )}

      {/* Revenue KPIs */}
      <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Revenue</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KPI label="Bank Commission (30d)" value={`£${(data.revenue?.totalBankCommission || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} color="#059669" isText />
        <KPI label="Revenue Growth MoM" value={`${data.revenue?.growthPct >= 0 ? '+' : ''}${data.revenue?.growthPct}%`} color={data.revenue?.growthPct >= 0 ? '#059669' : '#DC2626'} isText />
        <KPI label="Live Offers" value={data.offers?.live || 0} color="#1E40AF" />
        <KPI label="Total Activations" value={data.offers?.totalActivations || 0} color="#7C3AED" />
        <KPI label="Conversion Rate" value={`${data.offers?.conversionRate || 0}%`} color="#0EA5E9" isText />
        <KPI label="Active Customers" value={data.customers?.active || 0} color="#0F172A" />
        <KPI label="Avg Cashback / Customer" value={`£${(data.customers?.avgCashbackGbp || 0).toFixed(2)}`} color="#D97706" isText />
      </div>

      {/* Category ROI */}
      {data.categoryROI?.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Category ROI</h3>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2rem' }}>
            {data.categoryROI.map((c: any, i: number) => {
              const max = data.categoryROI[0].roi;
              const width = (c.roi / max) * 100;
              const colors = ['#1E40AF', '#7C3AED', '#0EA5E9', '#059669', '#D97706', '#64748B'];
              const color = colors[i % colors.length];
              return (
                <div key={c.category} style={{ marginBottom: i < data.categoryROI.length - 1 ? '1rem' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 500 }}>{c.category}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{c.roi}x ROI</span>
                  </div>
                  <div style={{ height: '24px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: '6px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Merchant Tiers */}
      {Object.keys(data.merchantTiers || {}).length > 0 && (
        <>
          <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Merchant Tier Distribution</h3>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              {Object.entries(data.merchantTiers).map(([tier, count]: [string, any]) => (
                <div key={tier} style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700, color: TIER_COLORS[tier] }}>{count}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{tier}</p>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
              {Object.entries(data.merchantTiers).map(([tier, count]: [string, any]) => (
                <div key={tier} style={{ flex: count || 0.1, background: TIER_COLORS[tier] }} title={`${tier}: ${count}`} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Top Offers */}
      {data.topOffers?.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Top Offers by Activations</h3>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '2rem' }}>
            {data.topOffers.map((o: any, i: number) => (
              <div key={o.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.25rem', borderBottom: i < data.topOffers.length - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, minWidth: '1.2rem' }}>{i + 1}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: '#0F172A', fontSize: '0.9rem' }}>{o.title}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{o.category}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1E40AF' }}>{o.activations || 0}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>activations</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const KPI: React.FC<{ label: string; value: number | string; color: string; isText?: boolean }> = ({ label, value, color, isText }) => (
  <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{label}</p>
    <p style={{ margin: '0.4rem 0 0', fontSize: isText ? '1.4rem' : '2rem', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
  </div>
);

export default ExecDashboard;
