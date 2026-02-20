import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const Dashboard: React.FC = () => {
  const [offerStats, setOfferStats] = useState<any>(null);
  const [redemptionStats, setRedemptionStats] = useState<any>(null);
  const [pendingOffers, setPendingOffers] = useState(0);
  const [pendingPartners, setPendingPartners] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        api.offerAnalytics(),
        api.redemptionAnalytics(),
        api.listOffers({ status: 'PENDING_REVIEW', size: '1' }),
        api.listPartners({ status: 'PENDING' }),
      ]);
      if (results[0].status === 'fulfilled') setOfferStats(results[0].value);
      if (results[1].status === 'fulfilled') setRedemptionStats(results[1].value);
      if (results[2].status === 'fulfilled') setPendingOffers(results[2].value.totalElements ?? results[2].value.content?.length ?? 0);
      if (results[3].status === 'fulfilled') {
        const d = results[3].value;
        setPendingPartners(d.totalElements ?? (Array.isArray(d.content) ? d.content : Array.isArray(d) ? d : []).length);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ color: '#64748B' }}>Loading platform overview...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 0.5rem', color: '#0F172A' }}>Platform Overview</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.9rem' }}>Real-time operational health and key metrics</p>

      {/* Alerts */}
      {(pendingOffers > 0 || pendingPartners > 0) && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px',
          padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 600, color: '#92400E', fontSize: '0.9rem' }}>Action Required:</span>
          {pendingOffers > 0 && (
            <Link to="/offer-review" style={{ color: '#B45309', fontSize: '0.9rem' }}>
              {pendingOffers} offer(s) pending review
            </Link>
          )}
          {pendingPartners > 0 && (
            <Link to="/merchant-onboarding" style={{ color: '#B45309', fontSize: '0.9rem' }}>
              {pendingPartners} merchant(s) pending approval
            </Link>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KPI label="Total Offers" value={offerStats?.totalOffers ?? 0} color="#1E40AF" />
        <KPI label="Live Offers" value={offerStats?.count_live ?? 0} color="#059669" />
        <KPI label="Pending Review" value={offerStats?.count_pending_review ?? 0} color="#D97706" />
        <KPI label="Activations" value={redemptionStats?.totalActivations ?? 0} color="#7C3AED" />
        <KPI label="Transactions" value={redemptionStats?.totalTransactions ?? 0} color="#0EA5E9" />
        <KPI label="Cashback Paid" value={`£${(redemptionStats?.totalCashbackPaid ?? 0).toFixed?.(2) ?? '0.00'}`} color="#059669" isText />
      </div>

      {/* Offer Pipeline */}
      <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Offer Pipeline</h3>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
          {['draft', 'pending_review', 'approved', 'live', 'paused', 'expired', 'retired'].map((status) => {
            const count = offerStats?.[`count_${status}`] ?? 0;
            const maxCount = Math.max(...['draft', 'pending_review', 'approved', 'live', 'paused', 'expired', 'retired'].map(s => offerStats?.[`count_${s}`] ?? 0), 1);
            const height = Math.max((count / maxCount) * 120, 4);
            const colors: Record<string, string> = { draft: '#94A3B8', pending_review: '#F59E0B', approved: '#3B82F6', live: '#10B981', paused: '#EF4444', expired: '#6B7280', retired: '#374151' };
            return (
              <div key={status} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: `${height}px`, background: colors[status] || '#94A3B8', borderRadius: '4px 4px 0 0', margin: '0 auto', maxWidth: '60px' }} />
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>{status.replace('_', ' ')}</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <ActionCard title="Review Offers" description="Approve or reject pending offers" link="/offer-review" color="#F59E0B" />
        <ActionCard title="Onboard Merchants" description="Review merchant applications" link="/merchant-onboarding" color="#3B82F6" />
        <ActionCard title="Manage Campaigns" description="Create and schedule campaigns" link="/campaigns" color="#8B5CF6" />
        <ActionCard title="View Audit Log" description="Track all platform changes" link="/audit" color="#64748B" />
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

const ActionCard: React.FC<{ title: string; description: string; link: string; color: string }> = ({ title, description, link, color }) => (
  <Link to={link} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem',
      borderLeft: `4px solid ${color}`, cursor: 'pointer',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <h4 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>{title}</h4>
      <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>{description}</p>
    </div>
  </Link>
);

export default Dashboard;
