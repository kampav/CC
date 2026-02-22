import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  merchantId: string;
  offerType: string;
  category: string | null;
  cashbackRate: number | null;
  cashbackCap: number | null;
  minSpend: number | null;
  terms: string | null;
  status: string;
  brand: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string | null;
  validTransitions: string[];
}

const BLOCKED_WORDS = ['guaranteed', 'risk-free', 'unlimited', 'free money'];
const PROHIBITED_CATEGORIES = ['Gambling', 'Tobacco', 'Weapons', 'Adult Content'];

const OfferReview: React.FC = () => {
  const isMobile = useBreakpoint() === 'mobile';
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => { loadOffers(); }, []);

  async function loadOffers() {
    try {
      const [pending, all] = await Promise.all([
        api.listOffers({ status: 'PENDING_REVIEW', size: '100' }),
        api.listOffers({ size: '100' }),
      ]);
      setOffers(pending.content || []);
      setAllOffers(all.content || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleAction(offerId: string, status: string) {
    setActionLoading(true);
    try {
      await api.changeOfferStatus(offerId, { status, reason: reason || `${status} by colleague`, changedBy: 'colleague-portal' });
      await loadOffers();
      setSelected(null);
      setReason('');
    } catch (err: any) {
      alert(err.message);
    }
    setActionLoading(false);
  }

  function runComplianceCheck(offer: Offer) {
    const checks = [];

    // FCA Fair Value
    const fcaPass = offer.cashbackRate == null || offer.cashbackRate <= 30;
    checks.push({
      name: 'FCA Fair Value',
      description: `Cashback rate ${offer.cashbackRate ?? 0}% ${fcaPass ? 'within' : 'EXCEEDS'} 30% limit`,
      pass: fcaPass,
      severity: 'BLOCK' as const,
    });

    // FCA Terms
    const termsPass = !!offer.terms && offer.terms.length > 0;
    checks.push({
      name: 'FCA Clear Terms',
      description: termsPass ? 'Terms and conditions provided' : 'Missing terms and conditions',
      pass: termsPass,
      severity: 'BLOCK' as const,
    });

    // ASA Misleading Claims
    const text = `${offer.title || ''} ${offer.description || ''}`.toLowerCase();
    const foundWords = BLOCKED_WORDS.filter(w => text.includes(w));
    const asaPass = foundWords.length === 0;
    checks.push({
      name: 'ASA Misleading Claims',
      description: asaPass ? 'No misleading language detected' : `Found: "${foundWords.join('", "')}"`,
      pass: asaPass,
      severity: 'WARN' as const,
    });

    // Prohibited Categories
    const catPass = !PROHIBITED_CATEGORIES.includes(offer.category || '');
    checks.push({
      name: 'Prohibited Categories',
      description: catPass ? 'Category is permitted' : `"${offer.category}" is a prohibited category`,
      pass: catPass,
      severity: 'BLOCK' as const,
    });

    // Description length
    const descPass = (offer.description || '').length >= 20;
    checks.push({
      name: 'Description Quality',
      description: descPass ? 'Description meets minimum length' : 'Description too short (min 20 chars)',
      pass: descPass,
      severity: 'INFO' as const,
    });

    return checks;
  }

  const displayOffers = tab === 'pending' ? offers : allOffers;

  if (loading) return <p style={{ color: '#64748B' }}>Loading review queue...</p>;

  const complianceResults = selected ? runComplianceCheck(selected) : [];
  const hasBlockingFailure = complianceResults.some(c => !c.pass && c.severity === 'BLOCK');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Offer Review Queue</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Review, approve, or reject offers submitted by merchants</p>
        </div>
        <span style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: '#FEF3C7', color: '#92400E', fontWeight: 600, fontSize: '0.9rem' }}>
          {offers.length} pending
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
        {(['pending', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.6rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
            color: tab === t ? '#0F172A' : '#64748B', fontWeight: tab === t ? 600 : 400, fontSize: '0.9rem',
          }}>
            {t === 'pending' ? `Pending Review (${offers.length})` : `All Offers (${allOffers.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Offer List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {displayOffers.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#64748B', margin: 0 }}>{tab === 'pending' ? 'No offers pending review.' : 'No offers found.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {displayOffers.map(offer => (
                <div key={offer.id} onClick={() => setSelected(offer)} style={{
                  background: 'white', borderRadius: '8px', border: selected?.id === offer.id ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  padding: '1rem', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>{offer.title}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                        {offer.brand} | {offer.category || 'Uncategorised'} | {offer.cashbackRate ?? 0}% cashback
                      </p>
                    </div>
                    <StatusBadge status={offer.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: isMobile ? '100%' : '420px', flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', position: isMobile ? 'static' : 'sticky', top: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#0F172A' }}>{selected.title}</h3>

              <DetailRow label="Offer ID" value={selected.id.slice(0, 12) + '...'} />
              <DetailRow label="Merchant ID" value={selected.merchantId.slice(0, 8) + '...'} />
              <DetailRow label="Type" value={selected.offerType} />
              <DetailRow label="Category" value={selected.category || '-'} />
              <DetailRow label="Cashback Rate" value={selected.cashbackRate ? `${selected.cashbackRate}%` : '-'} />
              {selected.cashbackCap && <DetailRow label="Cashback Cap" value={`£${selected.cashbackCap}`} />}
              {selected.minSpend && <DetailRow label="Min Spend" value={`£${selected.minSpend}`} />}
              <DetailRow label="Brand" value={selected.brand} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Created" value={new Date(selected.createdAt).toLocaleString()} />
              <DetailRow label="Submitted By" value={selected.createdBy || '-'} />

              {/* Description preview */}
              {selected.description && (
                <div style={{ margin: '0.75rem 0', padding: '0.5rem', background: '#F8FAFC', borderRadius: '4px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Description:</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{selected.description}</p>
                </div>
              )}

              {/* Compliance Checks */}
              <h4 style={{ margin: '1.25rem 0 0.5rem', color: '#0F172A', fontSize: '0.9rem' }}>Compliance Checks</h4>
              {hasBlockingFailure && (
                <div style={{
                  padding: '0.5rem 0.75rem', background: '#FEE2E2', border: '1px solid #FECACA',
                  borderRadius: '6px', color: '#DC2626', fontSize: '0.8rem', marginBottom: '0.5rem',
                }}>
                  Blocking compliance failures detected - review required
                </div>
              )}
              {complianceResults.map(check => (
                <div key={check.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: check.pass ? '#059669' : check.severity === 'BLOCK' ? '#DC2626' : '#D97706', fontSize: '1rem', flexShrink: 0 }}>
                    {check.pass ? '\u2713' : '\u2717'}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{check.name}</span>
                    <span style={{
                      marginLeft: '0.5rem', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 600,
                      background: check.severity === 'BLOCK' ? '#FEE2E2' : check.severity === 'WARN' ? '#FEF3C7' : '#DBEAFE',
                      color: check.severity === 'BLOCK' ? '#DC2626' : check.severity === 'WARN' ? '#D97706' : '#2563EB',
                    }}>{check.severity}</span>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>{check.description}</p>
                  </div>
                </div>
              ))}

              {/* Actions — use validTransitions from backend */}
              {selected.validTransitions && selected.validTransitions.length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <textarea
                    placeholder="Reason for decision..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', minHeight: '60px', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selected.validTransitions.map((t: string) => {
                      const colors: Record<string, string> = {
                        APPROVED: '#059669', LIVE: '#10B981', DRAFT: '#94A3B8', PAUSED: '#EF4444', RETIRED: '#374151', PENDING_REVIEW: '#F59E0B',
                      };
                      const isApproval = t === 'APPROVED' || t === 'LIVE';
                      return (
                        <button key={t} disabled={actionLoading || (isApproval && hasBlockingFailure)} onClick={() => handleAction(selected.id, t)} style={{
                          flex: 1, minWidth: '100px', padding: '0.6rem', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer',
                          color: 'white', background: colors[t] || '#0F172A',
                          opacity: (isApproval && hasBlockingFailure) ? 0.5 : 1,
                        }} title={isApproval && hasBlockingFailure ? 'Cannot approve: blocking compliance failures' : ''}>
                          {t === 'DRAFT' ? 'Return to Draft' : t.charAt(0) + t.slice(1).toLowerCase().replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    DRAFT: '#94A3B8', PENDING_REVIEW: '#F59E0B', APPROVED: '#3B82F6', LIVE: '#10B981', PAUSED: '#EF4444', EXPIRED: '#6B7280', RETIRED: '#374151',
  };
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'white', background: colors[status] || '#6B7280' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #F1F5F9' }}>
    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}>{value}</span>
  </div>
);

export default OfferReview;
