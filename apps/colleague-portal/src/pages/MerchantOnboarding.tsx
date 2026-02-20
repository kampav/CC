import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Partner {
  id: string;
  businessName: string;
  tradingName: string | null;
  registrationNumber: string | null;
  contactEmail: string;
  contactName: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  postcode: string | null;
  status: string;
  category: string | null;
  createdAt: string;
  createdBy: string | null;
  validTransitions: string[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', APPROVED: '#10B981', SUSPENDED: '#EF4444', DEACTIVATED: '#6B7280',
};

const KYB_CHECKS = [
  { name: 'Companies House Verification', field: 'registrationNumber' },
  { name: 'Contact Email Valid', field: 'contactEmail' },
  { name: 'Business Address Provided', field: 'addressLine1' },
  { name: 'Category Assigned', field: 'category' },
];

const MerchantOnboarding: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadPartners(); }, []);

  async function loadPartners() {
    try {
      const data = await api.listPartners({ size: '100' });
      const list = data.content || (Array.isArray(data) ? data : []);
      setPartners(list);
    } catch { /* */ }
    setLoading(false);
  }

  async function handleStatusChange(partnerId: string, status: string) {
    setActionLoading(true);
    try {
      await api.changePartnerStatus(partnerId, { status, reason: reason || `${status} by colleague`, changedBy: 'colleague-portal' });
      await loadPartners();
      setSelected(null);
      setReason('');
    } catch (err: any) {
      alert(err.message);
    }
    setActionLoading(false);
  }

  function kybStatus(partner: Partner) {
    return KYB_CHECKS.map(check => ({
      ...check,
      pass: Boolean((partner as any)[check.field]),
    }));
  }

  const filtered = filter === 'ALL' ? partners : partners.filter(p => p.status === filter);

  if (loading) return <p style={{ color: '#64748B' }}>Loading merchants...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Merchant Onboarding</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>Review merchant applications, verify KYB details, approve or reject</p>

      {/* Status summary */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'DEACTIVATED'].map(s => {
          const count = s === 'ALL' ? partners.length : partners.filter(p => p.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', cursor: 'pointer',
              border: filter === s ? '2px solid #0F172A' : '1px solid #D1D5DB',
              background: filter === s ? '#0F172A' : 'white',
              color: filter === s ? 'white' : '#374151',
            }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* List */}
        <div style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#64748B', margin: 0 }}>No merchants found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {filtered.map(p => (
                <div key={p.id} onClick={() => setSelected(p)} style={{
                  background: 'white', borderRadius: '8px',
                  border: selected?.id === p.id ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  padding: '1rem', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#0F172A' }}>{p.businessName}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                        {p.contactEmail} | {p.category || 'No category'} | Applied {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      color: 'white', background: STATUS_COLORS[p.status] || '#6B7280',
                    }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ width: '400px', flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#0F172A' }}>{selected.businessName}</h3>

              <DetailRow label="Trading Name" value={selected.tradingName || '-'} />
              <DetailRow label="Contact" value={selected.contactName || '-'} />
              <DetailRow label="Email" value={selected.contactEmail} />
              <DetailRow label="Phone" value={selected.phone || '-'} />
              <DetailRow label="Reg. Number" value={selected.registrationNumber || 'Not provided'} />
              <DetailRow label="Address" value={selected.addressLine1 || '-'} />
              <DetailRow label="City" value={selected.city || '-'} />
              <DetailRow label="Postcode" value={selected.postcode || '-'} />
              <DetailRow label="Category" value={selected.category || '-'} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="ID" value={selected.id.slice(0, 12) + '...'} />

              {/* KYB */}
              <h4 style={{ margin: '1.25rem 0 0.5rem', color: '#0F172A', fontSize: '0.9rem' }}>KYB Verification</h4>
              {kybStatus(selected).map(check => (
                <div key={check.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: check.pass ? '#059669' : '#DC2626', fontSize: '1rem' }}>{check.pass ? '\u2713' : '\u2717'}</span>
                  <span style={{ fontSize: '0.85rem', color: '#374151' }}>{check.name}</span>
                </div>
              ))}

              {/* Actions */}
              {selected.validTransitions && selected.validTransitions.length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <textarea placeholder="Reason..." value={reason} onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', minHeight: '50px', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selected.validTransitions.map((t: string) => (
                      <button key={t} disabled={actionLoading} onClick={() => handleStatusChange(selected.id, t)} style={{
                        padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: 'white',
                        background: t === 'APPROVED' ? '#059669' : t === 'SUSPENDED' ? '#DC2626' : t === 'DEACTIVATED' ? '#6B7280' : '#1E40AF',
                      }}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
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

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #F1F5F9' }}>
    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}>{value}</span>
  </div>
);

export default MerchantOnboarding;
