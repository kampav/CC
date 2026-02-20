import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING_ONBOARDING: { bg: '#FEF3C7', text: '#92400E' },
  KYB_IN_PROGRESS:    { bg: '#EFF6FF', text: '#1E40AF' },
  APPROVED:           { bg: '#D1FAE5', text: '#065F46' },
  REJECTED:           { bg: '#FEE2E2', text: '#991B1B' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_ONBOARDING: 'Pending',
  KYB_IN_PROGRESS:    'KYB In Progress',
  APPROVED:           'Approved',
  REJECTED:           'Rejected',
};

const CommercialOnboarding: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ companyName: '', crn: '', contactName: '', contactEmail: '', industry: '', annualSpendGbp: '' });

  async function load() {
    setLoading(true);
    try {
      const data = await api.listCommercialCustomers(filter || undefined);
      setCustomers(data.commercialCustomers || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    setActionLoading(true);
    try {
      await api.updateCommercialStatus(id, status, actionNote || undefined);
      setSelected(null);
      setActionNote('');
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function createCustomer() {
    if (!newCustomer.companyName) { alert('Company name required'); return; }
    setActionLoading(true);
    try {
      await api.createCommercialCustomer({ ...newCustomer, annualSpendGbp: newCustomer.annualSpendGbp ? parseFloat(newCustomer.annualSpendGbp) : undefined });
      setShowCreate(false);
      setNewCustomer({ companyName: '', crn: '', contactName: '', contactEmail: '', industry: '', annualSpendGbp: '' });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Commercial Onboarding</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>KYB workflow for new commercial customers</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '0.6rem 1.25rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          + Add Customer
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'PENDING_ONBOARDING', 'KYB_IN_PROGRESS', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              background: filter === s ? '#0F172A' : 'white', color: filter === s ? 'white' : '#475569', borderColor: filter === s ? '#0F172A' : '#E2E8F0' }}>
            {s ? STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#64748B' }}>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {customers.length === 0 && <p style={{ color: '#64748B' }}>No commercial customers found.</p>}
          {customers.map(c => {
            const sc = STATUS_COLORS[c.status] || { bg: '#F1F5F9', text: '#475569' };
            return (
              <div key={c.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', color: '#0F172A', fontSize: '1rem' }}>{c.company_name}</h3>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#64748B' }}>
                      {c.contact_name && <>{c.contact_name} · </>}{c.contact_email}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {c.industry && <Tag label={c.industry} />}
                      {c.crn && <Tag label={`CRN: ${c.crn}`} />}
                      {c.annual_spend_gbp && <Tag label={`£${Number(c.annual_spend_gbp).toLocaleString()}/yr`} color="#059669" />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '12px', background: sc.bg, color: sc.text }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                    <button onClick={() => setSelected(c)}
                      style={{ padding: '0.4rem 0.9rem', background: 'white', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Update Status
                    </button>
                  </div>
                </div>
                {c.notes && <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>Note: {c.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Status update modal */}
      {selected && (
        <Modal title={`Update: ${selected.company_name}`} onClose={() => { setSelected(null); setActionNote(''); }}>
          <p style={{ margin: '0 0 1rem', color: '#64748B', fontSize: '0.9rem' }}>Current status: <strong>{STATUS_LABELS[selected.status]}</strong></p>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Notes (optional)</label>
            <textarea value={actionNote} onChange={e => setActionNote(e.target.value)} rows={2}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {['KYB_IN_PROGRESS', 'APPROVED', 'REJECTED', 'PENDING_ONBOARDING']
              .filter(s => s !== selected.status)
              .map(s => {
                const sc = STATUS_COLORS[s] || { bg: '#F1F5F9', text: '#475569' };
                return (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={actionLoading}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', background: sc.bg, color: sc.text }}>
                    → {STATUS_LABELS[s]}
                  </button>
                );
              })}
          </div>
        </Modal>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Add Commercial Customer" onClose={() => setShowCreate(false)}>
          {(['companyName', 'crn', 'contactName', 'contactEmail', 'industry', 'annualSpendGbp'] as const).map(field => (
            <div key={field} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'annualSpendGbp' ? 'number' : field === 'contactEmail' ? 'email' : 'text'}
                value={(newCustomer as any)[field]} onChange={e => setNewCustomer(p => ({ ...p, [field]: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button onClick={createCustomer} disabled={actionLoading}
            style={{ width: '100%', padding: '0.75rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
            {actionLoading ? 'Creating...' : 'Create Customer'}
          </button>
        </Modal>
      )}
    </div>
  );
};

const Tag: React.FC<{ label: string; color?: string }> = ({ label, color = '#475569' }) => (
  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: '#F1F5F9', borderRadius: '4px', color }}>
    {label}
  </span>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, color: '#0F172A' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748B' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default CommercialOnboarding;
