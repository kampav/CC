import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useBreakpoint } from '../hooks/useBreakpoint';

const BRAND_LABELS: Record<string, string> = {
  BRAND_A: 'Brand A', BRAND_B: 'Brand B', BRAND_C: 'Brand C', BRAND_D: 'Brand D',
};

interface OfferStats {
  totalOffers: number;
  count_draft: number;
  count_live: number;
  count_pending_review: number;
  count_approved: number;
  count_paused: number;
  count_expired: number;
  count_archived: number;
}

interface RedemptionStats {
  totalActivations: number;
  totalTransactions: number;
  totalCashbackPaid: number | null;
}

interface MerchantInsights {
  totalOffers: number;
  categoryPerformance: Record<string, { offers: number; liveOffers: number; totalActivations: number }>;
  brandDistribution: Record<string, number>;
  cashbackTiers: Record<string, number>;
  recommendations: string[];
}

const Dashboard: React.FC = () => {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const [offerStats, setOfferStats] = useState<OfferStats | null>(null);
  const [redemptionStats, setRedemptionStats] = useState<RedemptionStats | null>(null);
  const [insights, setInsights] = useState<MerchantInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [offers, redemptions, insightsRes] = await Promise.allSettled([
          api.offerAnalytics(),
          api.redemptionAnalytics(),
          api.getMerchantInsights(),
        ]);
        if (offers.status === 'fulfilled') setOfferStats(offers.value);
        if (redemptions.status === 'fulfilled') setRedemptionStats(redemptions.value);
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
      } catch { /* */ }
      finally { setLoading(false); }
    }
    loadStats();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <p style={{ color: '#64748B', marginTop: '1rem' }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalOffers = offerStats?.totalOffers ?? 0;
  const liveOffers = offerStats?.count_live ?? 0;
  const draftOffers = offerStats?.count_draft ?? 0;
  const pendingReview = offerStats?.count_pending_review ?? 0;
  const totalActivations = redemptionStats?.totalActivations ?? 0;
  const totalTransactions = redemptionStats?.totalTransactions ?? 0;
  const totalCashback = redemptionStats?.totalCashbackPaid ?? 0;

  return (
    <div>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Merchant Dashboard</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8' }}>
          Overview of your offers, activations, and performance metrics
        </p>
      </div>

      {/* Insights banner */}
      {insights && insights.recommendations.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1px solid #FCD34D', borderRadius: '16px',
          padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#92400E', fontSize: '0.95rem', fontWeight: 700 }}>Insights & Recommendations</h3>
          {insights.recommendations.map((rec, i) => (
            <p key={i} style={{ margin: '0.25rem 0', color: '#78350F', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {rec}
            </p>
          ))}
        </div>
      )}

      {/* Offer metrics */}
      <h3 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>Offer Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="Total Offers" value={totalOffers} color="#1E293B" />
        <MetricCard label="Live" value={liveOffers} color="#059669" />
        <MetricCard label="Drafts" value={draftOffers} color="#D97706" />
        <MetricCard label="Pending Review" value={pendingReview} color="#7C3AED" />
      </div>

      {/* Redemption metrics */}
      <h3 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>Redemption Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="Total Activations" value={totalActivations} color="#3B82F6" />
        <MetricCard label="Transactions" value={totalTransactions} color="#0EA5E9" />
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          borderRadius: '16px', padding: '1.25rem',
          boxShadow: '0 4px 15px rgba(5,150,105,0.2)',
        }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>Total Cashback Paid</p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 700, color: 'white' }}>
            £{typeof totalCashback === 'number' ? totalCashback.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Category Performance */}
      {insights && Object.keys(insights.categoryPerformance).length > 0 && (
        <>
          <h3 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>Category Performance</h3>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#475569' }}>Category</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem', color: '#475569' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem', color: '#475569' }}>Live</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem', color: '#475569' }}>Activations</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(insights.categoryPerformance).map(([cat, data]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.6rem 0.5rem', color: '#1E293B', fontWeight: 500 }}>{cat}</td>
                    <td style={{ textAlign: 'center', padding: '0.6rem 0.5rem', color: '#64748B' }}>{data.offers}</td>
                    <td style={{ textAlign: 'center', padding: '0.6rem 0.5rem' }}>
                      <span style={{
                        background: data.liveOffers > 0 ? '#DCFCE7' : '#FEF2F2',
                        color: data.liveOffers > 0 ? '#065F46' : '#991B1B',
                        padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {data.liveOffers}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.6rem 0.5rem', color: '#3B82F6', fontWeight: 600 }}>{data.totalActivations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Brand Distribution */}
      {insights && Object.keys(insights.brandDistribution || {}).length > 0 && (
        <>
          <h3 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>Brand Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {Object.entries(insights.brandDistribution).map(([brand, count]) => (
              <div key={brand} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0',
                padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{BRAND_LABELS[brand] || brand}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{count}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cashback Rate Distribution */}
      {insights && Object.keys(insights.cashbackTiers || {}).length > 0 && (
        <>
          <h3 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>Cashback Rate Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {Object.entries(insights.cashbackTiers).map(([tier, count]) => (
              <div key={tier} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0',
                padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{tier}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{count}</p>
                <p style={{ margin: '0.15rem 0 0', color: '#94A3B8', fontSize: '0.7rem' }}>offers</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/offers/new" style={{
          display: 'inline-block', padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: 'white',
          borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
        }}>
          Create New Offer
        </Link>
        <Link to="/offers" style={{
          display: 'inline-block', padding: '0.75rem 1.5rem',
          background: 'white', color: '#1E293B',
          borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          border: '1px solid #E2E8F0',
        }}>
          View All Offers
        </Link>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0',
    padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{label}</p>
    <p style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

export default Dashboard;
