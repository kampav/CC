import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Offer } from '../types';

const BRAND_LABELS: Record<string, string> = {
  BRAND_A: 'Brand A', BRAND_B: 'Brand B', BRAND_C: 'Brand C', BRAND_D: 'Brand D',
};

const BRAND_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  BRAND_A: { bg: '#EFF6FF', text: '#1E40AF', accent: '#3B82F6' },
  BRAND_B: { bg: '#FDF2F8', text: '#9D174D', accent: '#EC4899' },
  BRAND_C: { bg: '#F0FDF4', text: '#166534', accent: '#22C55E' },
  BRAND_D: { bg: '#FFF7ED', text: '#9A3412', accent: '#F97316' },
};

const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOffer();
      checkEligibility();
    }
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

  async function checkEligibility() {
    try {
      const result = await api.checkEligibility(id!);
      setEligible(result.eligible);
      if (!result.eligible) {
        const reasons = result.reasons || [];
        setEligibilityReason(reasons.join('. ') || 'You are not eligible for this offer.');
      }
    } catch {
      setEligible(true);
    }
  }

  async function handleActivate() {
    setActivating(true);
    setError(null);
    try {
      await api.activateOffer(id!);
      setActivated(true);
      setMessage('Offer activated! You can now earn cashback on qualifying purchases.');
    } catch (err: any) {
      if (err.message.includes('already activated')) {
        setActivated(true);
        setMessage('You have already activated this offer.');
      } else {
        setError(err.message);
      }
    } finally {
      setActivating(false);
    }
  }

  function daysUntilExpiry(endDate: string | null): number | null {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#4338CA', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error && !offer) return <p style={{ color: '#DC2626' }}>{error}</p>;
  if (!offer) return <p>Offer not found</p>;

  const days = daysUntilExpiry(offer.endDate);
  const urgent = days !== null && days <= 7 && days > 0;
  const expired = days !== null && days <= 0;
  const brandColor = BRAND_COLORS[offer.brand] || BRAND_COLORS.BRAND_A;

  return (
    <div style={{ maxWidth: '700px' }}>
      <Link to="/browse" style={{ color: '#4338CA', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
        &larr; Back to Offers
      </Link>

      {/* Hero Image */}
      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', marginTop: '1rem', height: '240px' }}>
        <img
          src={offer.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'}
          alt={offer.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'; }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
        {offer.cashbackRate && (
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white',
            padding: '0.5rem 1.25rem', borderRadius: '14px', fontWeight: 800, fontSize: '1.3rem',
            boxShadow: '0 4px 12px rgba(5,150,105,0.4)',
          }}>
            {offer.cashbackRate}%
          </div>
        )}
        {urgent && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: '#FEF3C7', color: '#92400E', padding: '0.35rem 0.75rem',
            borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
          }}>
            {days === 1 ? 'Ends tomorrow!' : `${days} days left`}
          </div>
        )}
        {expired && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: '#FEE2E2', color: '#991B1B', padding: '0.35rem 0.75rem',
            borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
          }}>
            Expired
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '2rem', marginTop: '-2rem', position: 'relative', zIndex: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {offer.category && (
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500, background: '#F1F5F9', color: '#475569' }}>
              {offer.category}
            </span>
          )}
          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, background: brandColor.bg, color: brandColor.text }}>
            {BRAND_LABELS[offer.brand] || offer.brand}
          </span>
          {offer.redemptionType && (
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500, background: '#FDF4FF', color: '#7C3AED' }}>
              {offer.redemptionType.replace('_', ' ')}
            </span>
          )}
        </div>

        <h2 style={{ margin: '0 0 0.5rem', color: '#1E293B', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>{offer.title}</h2>

        {offer.cashbackRate && (
          <p style={{ margin: '0 0 1rem', fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
            {offer.cashbackRate}% cashback
          </p>
        )}

        {offer.description && (
          <p style={{ margin: '0 0 1.5rem', color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>{offer.description}</p>
        )}

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {offer.minSpend != null && offer.minSpend > 0 && (
            <DetailBox label="Min Spend" value={`£${offer.minSpend}`} icon="&#128179;" />
          )}
          {offer.cashbackCap && (
            <DetailBox label="Max Cashback" value={`£${offer.cashbackCap}`} icon="&#127919;" />
          )}
          {offer.endDate && (
            <DetailBox label="Expires" value={new Date(offer.endDate).toLocaleDateString()} icon="&#128197;" urgent={urgent} />
          )}
          <DetailBox label="Brand" value={BRAND_LABELS[offer.brand] || offer.brand} icon="&#127991;" />
          {offer.currentActivations != null && (
            <DetailBox label="Activations" value={`${offer.currentActivations}${offer.maxActivations ? ` / ${offer.maxActivations}` : ''}`} icon="&#128101;" />
          )}
        </div>

        {/* Eligibility warning */}
        {eligible === false && (
          <div style={{
            padding: '1rem', background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: '12px', color: '#92400E', marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            {eligibilityReason}
          </div>
        )}

        {message && (
          <div style={{
            padding: '1rem', background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: '12px', color: '#059669', marginBottom: '1rem', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>&#9989;</span> {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '12px', color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {!activated && offer.status === 'LIVE' && !expired && (
          <button
            onClick={handleActivate}
            disabled={activating || eligible === false}
            style={{
              width: '100%', padding: '1rem',
              background: eligible === false ? '#94A3B8' : 'linear-gradient(135deg, #059669, #10B981)',
              color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700,
              cursor: (activating || eligible === false) ? 'not-allowed' : 'pointer',
              opacity: activating ? 0.6 : 1,
              boxShadow: eligible === false ? 'none' : '0 4px 15px rgba(5,150,105,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {activating ? 'Activating...' : eligible === false ? 'Not Eligible' : 'Activate Offer'}
          </button>
        )}

        {activated && (
          <Link to="/my-offers" style={{
            display: 'block', textAlign: 'center', width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg, #4338CA, #6366F1)', color: 'white',
            border: 'none', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700,
            textDecoration: 'none', boxSizing: 'border-box',
            boxShadow: '0 4px 15px rgba(67,56,202,0.3)',
          }}>
            View My Offers
          </Link>
        )}

        {offer.terms && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 0.25rem', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Terms & Conditions</p>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.6 }}>{offer.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailBox: React.FC<{ label: string; value: string; icon: string; urgent?: boolean }> = ({ label, value, icon, urgent }) => (
  <div style={{
    background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem 1rem',
    border: urgent ? '1px solid #FDE68A' : '1px solid #F1F5F9',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.85rem' }}>{icon}</span>
      <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{label}</span>
    </div>
    <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: urgent ? '#D97706' : '#1E293B', fontSize: '0.95rem' }}>{value}</p>
  </div>
);

export default OfferDetail;
