import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Offer } from '../types';

const BRAND_LABELS: Record<string, string> = {
  BRAND_A: 'Brand A', BRAND_B: 'Brand B', BRAND_C: 'Brand C', BRAND_D: 'Brand D',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: '#FEF3C7', text: '#92400E' },
  PENDING_REVIEW: { bg: '#F3E8FF', text: '#6B21A8' },
  APPROVED: { bg: '#DBEAFE', text: '#1E40AF' },
  LIVE: { bg: '#DCFCE7', text: '#166534' },
  PAUSED: { bg: '#FEE2E2', text: '#991B1B' },
  EXPIRED: { bg: '#F1F5F9', text: '#475569' },
  RETIRED: { bg: '#E2E8F0', text: '#334155' },
};

const OfferList: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
  }, [filter]);

  async function loadOffers() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { size: '50' };
      if (filter) params.status = filter;
      const data = await api.listOffers(params);
      setOffers(data.content || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontWeight: 700 }}>My Offers</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.85rem' }}>{offers.length} offers found</p>
        </div>
        <Link to="/offers/new" style={{
          padding: '0.6rem 1.25rem',
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
          color: 'white',
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
        }}>
          + Create Offer
        </Link>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['', 'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'LIVE', 'PAUSED', 'EXPIRED', 'RETIRED'].map((s) => {
          const isActive = filter === s;
          const style = s ? STATUS_COLORS[s] : { bg: '#F1F5F9', text: '#475569' };
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer',
              border: isActive ? '2px solid ' + style.text : '1px solid #E2E8F0',
              background: isActive ? style.bg : 'white',
              color: isActive ? style.text : '#64748B',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#DC2626', padding: '1rem', background: '#FEF2F2', borderRadius: '12px' }}>{error}</p>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && offers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>&#128221;</p>
          <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 0.5rem' }}>No offers found</p>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1rem' }}>Create your first offer to get started</p>
          <Link to="/offers/new" style={{
            display: 'inline-block', padding: '0.6rem 1.5rem',
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: 'white',
            borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          }}>Create Offer</Link>
        </div>
      )}

      {!loading && offers.length > 0 && (
        <div className="table-scroll" style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Title</th>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Brand</th>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Cashback</th>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Activations</th>
                <th style={{ padding: '0.85rem 1rem', color: '#64748B', fontWeight: 600, fontSize: '0.8rem' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const statusStyle = STATUS_COLORS[offer.status] || { bg: '#F1F5F9', text: '#475569' };
                return (
                  <tr key={offer.id} style={{ borderTop: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFE'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Link to={`/offers/${offer.id}`} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 600 }}>
                        {offer.title}
                      </Link>
                      {offer.category && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#94A3B8' }}>({offer.category})</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: statusStyle.text,
                        background: statusStyle.bg,
                      }}>
                        {offer.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.85rem' }}>
                      {BRAND_LABELS[offer.brand] || offer.brand}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#059669' }}>
                      {offer.cashbackRate ? `${offer.cashbackRate}%` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{offer.currentActivations}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontSize: '0.8rem' }}>
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfferList;
