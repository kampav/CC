import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const Analytics: React.FC = () => {
  const [offerStats, setOfferStats] = useState<any>(null);
  const [redemptionStats, setRedemptionStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [o, r, rev] = await Promise.allSettled([
        api.offerAnalytics(),
        api.redemptionAnalytics(),
        api.revenueAnalytics(),
      ]);
      if (o.status === 'fulfilled') setOfferStats(o.value);
      if (r.status === 'fulfilled') setRedemptionStats(r.value);
      if (rev.status === 'fulfilled') {
        setRevenueStats(rev.value);
        // Build AI narrative from revenue data
        const summary = rev.value.summary;
        if (summary && parseFloat(summary.total_revenue) > 0) {
          const topTier = (rev.value.byTier || [])[0];
          setAiNarrative(
            `Platform has generated £${parseFloat(summary.revenue_30d || 0).toFixed(2)} in bank commission over the last 30 days. ` +
            (topTier ? `${topTier.merchant_tier} tier merchants contribute the most revenue — consider tier upgrade incentives to grow the SILVER/GOLD segments.` : 'Expand merchant tier coverage to increase commission revenue.')
          );
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ color: '#64748B' }}>Loading analytics...</p>;

  const totalOffers = offerStats?.totalOffers ?? 0;
  const liveOffers = offerStats?.count_live ?? 0;
  const activations = redemptionStats?.totalActivations ?? 0;
  const transactions = redemptionStats?.totalTransactions ?? 0;
  const cashback = redemptionStats?.totalCashbackPaid ?? 0;
  const bankRevenue = parseFloat(revenueStats?.summary?.total_revenue || 0);

  const funnel = [
    { stage: 'Total Offers',  count: totalOffers,   color: '#1E40AF' },
    { stage: 'Live Offers',   count: liveOffers,    color: '#3B82F6' },
    { stage: 'Activations',   count: activations,   color: '#8B5CF6' },
    { stage: 'Transactions',  count: transactions,  color: '#0EA5E9' },
  ];
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1);

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Platform Analytics</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>Platform-wide performance metrics and funnel analysis</p>

      {/* AI Narrative */}
      {aiNarrative && (
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Revenue Narrative</p>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.9rem' }}>{aiNarrative}</p>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KPI label="Total Offers"    value={totalOffers}  color="#1E40AF" />
        <KPI label="Live Offers"     value={liveOffers}   color="#10B981" />
        <KPI label="Activations"     value={activations}  color="#8B5CF6" />
        <KPI label="Transactions"    value={transactions} color="#0EA5E9" />
        <KPI label="Cashback Paid"   value={`£${typeof cashback === 'number' ? cashback.toFixed(2) : '0.00'}`} color="#059669" isText />
        {bankRevenue > 0 && <KPI label="Bank Commission" value={`£${bankRevenue.toFixed(2)}`} color="#D97706" isText />}
      </div>

      {/* Revenue Tier Breakdown */}
      {revenueStats?.byTier?.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Commission by Merchant Tier</h3>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {revenueStats.byTier.map((t: any) => (
                <div key={t.merchant_tier} style={{ textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748B' }}>{t.merchant_tier}</p>
                  <p style={{ margin: '0 0 0.1rem', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>£{parseFloat(t.revenue).toFixed(2)}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{t.transactions} txns</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Funnel */}
      <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Conversion Funnel</h3>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '2rem', marginBottom: '2rem' }}>
        {funnel.map((step, i) => {
          const width = Math.max((step.count / maxFunnel) * 100, 5);
          const prevCount = i > 0 ? funnel[i - 1].count : null;
          const dropoff = prevCount && prevCount > 0 ? ((1 - step.count / prevCount) * 100).toFixed(1) : null;
          return (
            <div key={step.stage} style={{ marginBottom: i < funnel.length - 1 ? '1rem' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 500 }}>{step.stage}</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {dropoff && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{dropoff}% drop-off</span>}
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: step.color }}>{step.count}</span>
                </div>
              </div>
              <div style={{ height: '28px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${width}%`, height: '100%', background: step.color, borderRadius: '6px', transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Offer Status Breakdown */}
      <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Offer Status Breakdown</h3>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {['draft', 'pending_review', 'approved', 'live', 'paused', 'expired', 'retired'].map(status => {
            const count = offerStats?.[`count_${status}`] ?? 0;
            const colors: Record<string, string> = { draft: '#94A3B8', pending_review: '#F59E0B', approved: '#3B82F6', live: '#10B981', paused: '#EF4444', expired: '#6B7280', retired: '#374151' };
            return (
              <div key={status} style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: 700, color: colors[status] }}>{count}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const KPI: React.FC<{ label: string; value: number | string; color: string; isText?: boolean }> = ({ label, value, color, isText }) => (
  <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{label}</p>
    <p style={{ margin: '0.4rem 0 0', fontSize: isText ? '1.5rem' : '2rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

export default Analytics;
