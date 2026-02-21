import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Partner } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #D1D5DB',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontWeight: 500,
  color: '#374151',
  fontSize: '0.85rem',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#D97706',
  APPROVED: '#059669',
  SUSPENDED: '#DC2626',
  DEACTIVATED: '#6B7280',
};

const PartnerProfile: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    tradingName: '',
    registrationNumber: '',
    contactEmail: '',
    contactName: '',
    phone: '',
    addressLine1: '',
    city: '',
    postcode: '',
    category: '',
  });

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    try {
      const data = await api.listPartners();
      const list = data.content || data;
      setPartners(Array.isArray(list) ? list : []);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch {
      // Service might not be running
    } finally {
      setLoading(false);
    }
  }

  function resetForm(partner?: Partner) {
    setForm({
      businessName: partner?.businessName || '',
      tradingName: partner?.tradingName || '',
      registrationNumber: partner?.registrationNumber || '',
      contactEmail: partner?.contactEmail || '',
      contactName: partner?.contactName || '',
      phone: partner?.phone || '',
      addressLine1: partner?.addressLine1 || '',
      city: partner?.city || '',
      postcode: partner?.postcode || '',
      category: partner?.category || '',
    });
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: any = { ...form, createdBy: 'merchant-portal' };
      // Remove empty strings
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
      payload.businessName = form.businessName; // required
      payload.contactEmail = form.contactEmail; // required
      const created = await api.createPartner(payload);
      setPartners(prev => [created, ...prev]);
      setSelected(created);
      setShowForm(false);
      setSuccess('Partner registered successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      payload.businessName = form.businessName;
      payload.contactEmail = form.contactEmail;
      const updated = await api.updatePartner(selected.id, payload);
      setPartners(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelected(updated);
      setShowForm(false);
      setSuccess('Partner updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p style={{ color: '#64748B' }}>Loading partners...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1A2744' }}>Merchant Partners</h2>
        <button onClick={() => { resetForm(); setShowForm(true); setSelected(null); }} style={{
          padding: '0.6rem 1.25rem',
          background: '#1A2744',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}>
          Register New Partner
        </button>
      </div>

      {success && (
        <div style={{ padding: '0.75rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', color: '#16A34A', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {showForm ? (
        <form onSubmit={selected ? handleUpdate : handleCreate} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', maxWidth: '700px' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1A2744' }}>{selected ? 'Edit Partner' : 'Register New Partner'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input style={inputStyle} value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} required placeholder="e.g. Tesco PLC" />
            </div>
            <div>
              <label style={labelStyle}>Trading Name</label>
              <input style={inputStyle} value={form.tradingName} onChange={(e) => updateField('tradingName', e.target.value)} placeholder="e.g. Tesco" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Contact Email *</label>
              <input style={inputStyle} type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} required placeholder="partner@company.com" />
            </div>
            <div>
              <label style={labelStyle}>Contact Name</label>
              <input style={inputStyle} value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} placeholder="Jane Smith" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+44 20 1234 5678" />
            </div>
            <div>
              <label style={labelStyle}>Registration Number</label>
              <input style={inputStyle} value={form.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)} placeholder="Companies House No." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.addressLine1} onChange={(e) => updateField('addressLine1', e.target.value)} placeholder="Street address" />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="London" />
            </div>
            <div>
              <label style={labelStyle}>Postcode</label>
              <input style={inputStyle} value={form.postcode} onChange={(e) => updateField('postcode', e.target.value)} placeholder="EC2A 1NT" />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="e.g. Groceries, Fashion, Travel" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={submitting} style={{
              padding: '0.75rem 1.5rem', background: '#1A2744', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem',
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
            }}>
              {submitting ? 'Saving...' : selected ? 'Update Partner' : 'Register Partner'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              padding: '0.75rem 1.5rem', background: 'white', color: '#1A2744', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Partner List */}
          {partners.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#64748B', fontSize: '1rem', margin: '0 0 1rem' }}>No partners registered yet.</p>
              <button onClick={() => { resetForm(); setShowForm(true); }} style={{
                padding: '0.75rem 1.5rem', background: '#1A2744', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
              }}>
                Register Your First Partner
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {partners.map((partner) => (
                <div key={partner.id} style={{
                  background: 'white', borderRadius: '12px', border: selected?.id === partner.id ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                  padding: '1.25rem', cursor: 'pointer',
                }}
                  onClick={() => setSelected(partner)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', color: '#1A2744' }}>{partner.businessName}</h4>
                      <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>
                        {partner.contactEmail} {partner.tradingName ? `| Trading as: ${partner.tradingName}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
                        color: 'white', background: STATUS_COLORS[partner.status] || '#6B7280',
                      }}>
                        {partner.status}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); resetForm(partner); setSelected(partner); setShowForm(true); }} style={{
                        padding: '0.35rem 0.75rem', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0',
                        borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                        Edit
                      </button>
                    </div>
                  </div>
                  {selected?.id === partner.id && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <Detail label="Contact" value={partner.contactName || '-'} />
                      <Detail label="Phone" value={partner.phone || '-'} />
                      <Detail label="Category" value={partner.category || '-'} />
                      <Detail label="Address" value={partner.addressLine1 || '-'} />
                      <Detail label="City" value={partner.city || '-'} />
                      <Detail label="Postcode" value={partner.postcode || '-'} />
                      <Detail label="Reg. Number" value={partner.registrationNumber || '-'} />
                      <Detail label="Registered" value={new Date(partner.createdAt).toLocaleDateString()} />
                      <Detail label="ID" value={partner.id.slice(0, 8) + '...'} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{label}</p>
    <p style={{ margin: '0.1rem 0 0', color: '#1A2744', fontWeight: 500, fontSize: '0.9rem' }}>{value}</p>
  </div>
);

export default PartnerProfile;
