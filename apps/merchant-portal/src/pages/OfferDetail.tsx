import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Offer, OfferStatus } from '../types';

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

const TRANSITION_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Submit for Review',
  APPROVED: 'Approve',
  LIVE: 'Go Live',
  PAUSED: 'Pause',
  EXPIRED: 'Mark Expired',
  RETIRED: 'Retire',
  DRAFT: 'Return to Draft',
};

const TRANSITION_COLORS: Record<string, string> = {
  PENDING_REVIEW: '#7C3AED',
  APPROVED: '#2563EB',
  LIVE: '#059669',
  PAUSED: '#DC2626',
  EXPIRED: '#6B7280',
  RETIRED: '#374151',
  DRAFT: '#94A3B8',
};

const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadOffer();
  }, [id]);

  async function loadOffer() {
    setLoading(true);
    try {
      const data = await api.getOffer(id!);
      setOffer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate() {
    if (!offer) return;
    setActionLoading(true);
    setError(null);
    try {
      const payload: any = {
        merchantId: offer.merchantId,
        title: `${offer.title} (Copy)`,
        description: offer.description,
        offerType: offer.offerType,
        category: offer.category,
        cashbackRate: offer.cashbackRate,
        cashbackCap: offer.cashbackCap,
        minSpend: offer.minSpend,
        terms: offer.terms,
        brand: offer.brand,
        redemptionType: offer.redemptionType,
        maxActivations: offer.maxActivations,
        imageUrl: offer.imageUrl,
        createdBy: 'merchant-portal',
      };
      if (offer.startDate) payload.startDate = offer.startDate;
      if (offer.endDate) payload.endDate = offer.endDate;
      const newOffer = await api.createOffer(payload);
      navigate(`/offers/${newOffer.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(targetStatus: OfferStatus) {
    setActionLoading(true);
    setError(null);
    try {
      const data = await api.changeOfferStatus(id!, {
        status: targetStatus,
        changedBy: 'merchant-portal',
        reason: `Status changed to ${targetStatus} via merchant portal`,
      });
      setOffer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error && !offer) return <p style={{ color: '#DC2626' }}>{error}</p>;
  if (!offer) return <p style={{ color: '#DC2626' }}>Offer not found</p>;

  const statusStyle = STATUS_COLORS[offer.status] || { bg: '#F1F5F9', text: '#475569' };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Breadcrumb + header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/offers" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            &larr; Back to Offers
          </Link>
          <h2 style={{ margin: '0.5rem 0 0', color: '#1E293B', fontWeight: 700, fontSize: '1.3rem' }}>{offer.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleDuplicate} disabled={actionLoading} style={{
            padding: '0.5rem 1rem', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
            borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
          }}>
            Duplicate
          </button>
          {offer.status === 'DRAFT' && (
            <button onClick={() => navigate(`/offers/${id}/edit`)} style={{
              padding: '0.5rem 1rem', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0',
              borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
            }}>
              Edit
            </button>
          )}
          <span style={{
            padding: '0.4rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: statusStyle.text,
            background: statusStyle.bg,
          }}>
            {offer.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Offer image */}
      {offer.imageUrl && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', height: '200px' }}>
          <img src={offer.imageUrl} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Status Actions */}
      {offer.validTransitions && offer.validTransitions.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem 1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Actions:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {offer.validTransitions.map((transition) => (
              <button
                key={transition}
                onClick={() => handleStatusChange(transition)}
                disabled={actionLoading}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: TRANSITION_COLORS[transition] || '#1E293B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {TRANSITION_LABELS[transition] || transition}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offer Details */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Detail label="Offer Type" value={offer.offerType} />
          <Detail label="Category" value={offer.category || '-'} />
          <Detail label="Cashback Rate" value={offer.cashbackRate ? `${offer.cashbackRate}%` : '-'} highlight={!!offer.cashbackRate} />
          <Detail label="Cashback Cap" value={offer.cashbackCap ? `£${offer.cashbackCap}` : 'No cap'} />
          <Detail label="Min Spend" value={offer.minSpend ? `£${offer.minSpend}` : 'None'} />
          <Detail label="Brand" value={BRAND_LABELS[offer.brand] || offer.brand} />
          <Detail label="Redemption Type" value={offer.redemptionType?.replace(/_/g, ' ') || '-'} />
          <Detail label="Max Activations" value={offer.maxActivations?.toString() || 'Unlimited'} />
          <Detail label="Current Activations" value={offer.currentActivations.toString()} />
          <Detail label="Currency" value={offer.currency} />
          <Detail label="Start Date" value={offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'Not set'} />
          <Detail label="End Date" value={offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'Not set'} />
          <Detail label="Created" value={new Date(offer.createdAt).toLocaleString()} />
          <Detail label="Updated" value={new Date(offer.updatedAt).toLocaleString()} />
        </div>
        {offer.description && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Description</p>
            <p style={{ margin: '0.25rem 0 0', color: '#1E293B', lineHeight: 1.6 }}>{offer.description}</p>
          </div>
        )}
        {offer.terms && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Terms & Conditions</p>
            <p style={{ margin: '0.25rem 0 0', color: '#64748B', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{offer.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{ padding: '0.5rem 0' }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>{label}</p>
    <p style={{ margin: '0.15rem 0 0', color: highlight ? '#059669' : '#1E293B', fontWeight: highlight ? 700 : 500, fontSize: highlight ? '1.1rem' : '0.95rem' }}>{value}</p>
  </div>
);

export default OfferDetail;
