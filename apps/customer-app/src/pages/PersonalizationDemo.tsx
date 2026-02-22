import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useBreakpoint } from '../hooks/useBreakpoint';

const CATEGORY_IMAGES: Record<string, string> = {
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop',
  Fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
  Travel: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=200&fit=crop',
  Dining: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop',
  Electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=200&fit=crop',
  Entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=200&fit=crop',
  'Health & Wellness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
};

const PersonalizationDemo: React.FC = () => {
  const isMobile = useBreakpoint() === 'mobile';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.compareRecommendations(6)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loading comparison...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1.5rem', color: '#DC2626' }}>
      Error: {error}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Personalisation A/B Demo
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem', maxWidth: '700px', lineHeight: 1.6 }}>
          Compare how rule-based scoring vs. AI personalisation ranks offers for your customer persona.
          Same offers, different algorithms — see the difference side by side.
        </p>
      </div>

      {/* Customer Context */}
      {(data?.customerSegment || data?.spendPattern || data?.lifecycleStage) && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>YOUR PROFILE:</span>
          {data.customerSegment && <Chip label={data.customerSegment.replace('_', ' ')} color="#7C3AED" />}
          {data.lifecycleStage && <Chip label={data.lifecycleStage.replace('_', ' ')} color="#0891B2" />}
          {data.spendPattern && <Chip label={data.spendPattern.replace('_', ' ')} color="#059669" />}
          {data.totalCandidates && (
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              {data.totalCandidates} offers evaluated · {data.activatedCount} already active
            </span>
          )}
        </div>
      )}

      {/* Spending Summary */}
      {data?.spendSummary && data.spendSummary.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Spending (Last 90 Days)
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {data.spendSummary.map((s: any) => (
              <div key={s.category} style={{
                background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.6rem 1rem',
                fontSize: '0.82rem',
              }}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{s.category}</span>
                <span style={{ color: '#059669', fontWeight: 700, marginLeft: '0.5rem' }}>
                  £{parseFloat(s.totalSpend || 0).toFixed(0)}
                </span>
                <span style={{ color: '#94A3B8', marginLeft: '0.25rem' }}>
                  ({s.transactionCount || 0} txns)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem' }}>
        {/* Rule-Based column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
              background: '#475569', color: 'white',
            }}>RULE-BASED</div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Scoring v2 — segment + spend aware</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.ruleBasedRecommendations || []).length === 0 && (
              <EmptyState message="No rule-based recommendations available" />
            )}
            {(data?.ruleBasedRecommendations || []).map((offer: any, idx: number) => (
              <OfferCard key={offer.id} offer={offer} rank={idx + 1} mode="rule-based" />
            ))}
          </div>
        </div>

        {/* AI column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: 'white',
            }}>AI POWERED</div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {data?.aiSource ? data.aiSource.toUpperCase() : 'Not configured'}
            </span>
          </div>
          {!data?.aiAvailable && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400E' }}>
              No AI key configured. Set <code>ANTHROPIC_API_KEY</code>, <code>OPENAI_API_KEY</code>, or <code>GEMINI_API_KEY</code> in BFF <code>.env</code> to enable AI mode.
            </div>
          )}
          {data?.aiError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#DC2626' }}>
              AI error: {data.aiError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.aiRecommendations === null && data?.aiAvailable && !data?.aiError && (
              <EmptyState message="AI recommendations loading..." />
            )}
            {data?.aiRecommendations === null && !data?.aiAvailable && (
              <EmptyState message="Configure an AI key to see AI recommendations" />
            )}
            {(data?.aiRecommendations || []).map((offer: any, idx: number) => (
              <OfferCard key={offer.id} offer={offer} rank={idx + 1} mode="ai" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span style={{
    padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
    background: color + '18', color,
  }}>
    {label}
  </span>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
    {message}
  </div>
);

const OfferCard: React.FC<{ offer: any; rank: number; mode: 'rule-based' | 'ai' }> = ({ offer, rank, mode }) => {
  const [showReason, setShowReason] = useState(false);
  const img = offer.imageUrl || CATEGORY_IMAGES[offer.category] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop';

  return (
    <div
      style={{
        background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
        overflow: 'hidden', cursor: 'pointer',
        outline: showReason ? (mode === 'ai' ? '2px solid #7C3AED' : '2px solid #475569') : 'none',
      }}
      onClick={() => setShowReason(v => !v)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: mode === 'ai' ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : '#475569',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.75rem',
        }}>
          {rank}
        </div>
        <img src={img} alt={offer.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {offer.title}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
            {offer.category && (
              <span style={{ fontSize: '0.65rem', background: '#F1F5F9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {offer.category}
              </span>
            )}
            {offer.cashbackRate && (
              <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#059669', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {offer.cashbackRate}% cashback
              </span>
            )}
          </div>
        </div>
      </div>
      {showReason && offer._reason && (
        <div style={{
          padding: '0.6rem 0.75rem', borderTop: '1px solid #F1F5F9',
          background: mode === 'ai' ? '#FAF5FF' : '#F8FAFC',
          fontSize: '0.78rem', color: mode === 'ai' ? '#7C3AED' : '#475569', fontStyle: 'italic',
        }}>
          {offer._reason}
        </div>
      )}
    </div>
  );
};

export default PersonalizationDemo;
