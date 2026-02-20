import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Offer, Brand, OfferType, RedemptionType } from '../types';

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

const EditOffer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    offerType: 'CASHBACK' as OfferType,
    category: '',
    cashbackRate: '',
    cashbackCap: '',
    minSpend: '',
    terms: '',
    brand: 'BRAND_A' as Brand,
    redemptionType: 'CARD_LINKED' as RedemptionType,
    maxActivations: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (id) loadOffer();
  }, [id]);

  async function loadOffer() {
    try {
      const data = await api.getOffer(id!);
      setOffer(data);
      setForm({
        title: data.title || '',
        description: data.description || '',
        offerType: data.offerType || 'CASHBACK',
        category: data.category || '',
        cashbackRate: data.cashbackRate?.toString() || '',
        cashbackCap: data.cashbackCap?.toString() || '',
        minSpend: data.minSpend?.toString() || '',
        terms: data.terms || '',
        brand: data.brand || 'BRAND_A',
        redemptionType: data.redemptionType || 'CARD_LINKED',
        maxActivations: data.maxActivations?.toString() || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        imageUrl: data.imageUrl || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        title: form.title,
        offerType: form.offerType,
        brand: form.brand,
        redemptionType: form.redemptionType,
      };
      if (form.description) payload.description = form.description;
      if (form.category) payload.category = form.category;
      if (form.cashbackRate) payload.cashbackRate = parseFloat(form.cashbackRate);
      if (form.cashbackCap) payload.cashbackCap = parseFloat(form.cashbackCap);
      if (form.minSpend) payload.minSpend = parseFloat(form.minSpend);
      if (form.terms) payload.terms = form.terms;
      if (form.maxActivations) payload.maxActivations = parseInt(form.maxActivations);
      if (form.imageUrl) payload.imageUrl = form.imageUrl;
      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();

      await api.updateOffer(id!, payload);
      navigate(`/offers/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p style={{ color: '#64748B' }}>Loading offer...</p>;
  if (!offer) return <p style={{ color: '#DC2626' }}>Offer not found</p>;

  if (offer.status !== 'DRAFT') {
    return (
      <div style={{ maxWidth: '700px' }}>
        <Link to={`/offers/${id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem' }}>
          &larr; Back to Offer
        </Link>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '2rem', marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ color: '#DC2626', fontWeight: 600, margin: '0 0 0.5rem' }}>Cannot Edit</p>
          <p style={{ color: '#64748B', margin: 0 }}>Only offers in DRAFT status can be edited. This offer is currently <strong>{offer.status}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <Link to={`/offers/${id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem' }}>
        &larr; Back to Offer
      </Link>
      <h2 style={{ margin: '0.5rem 0 1.5rem', color: '#1A2744' }}>Edit Offer</h2>

      {error && (
        <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '80px' }} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Offer Type</label>
            <select style={inputStyle} value={form.offerType} onChange={(e) => updateField('offerType', e.target.value)}>
              <option value="CASHBACK">Cashback</option>
              <option value="DISCOUNT_CODE">Discount Code</option>
              <option value="VOUCHER">Voucher</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="PRIZE_DRAW">Prize Draw</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} value={form.category} onChange={(e) => updateField('category', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Cashback Rate (%)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" max="100" value={form.cashbackRate} onChange={(e) => updateField('cashbackRate', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Cashback Cap (GBP)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.cashbackCap} onChange={(e) => updateField('cashbackCap', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Min Spend (GBP)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.minSpend} onChange={(e) => updateField('minSpend', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Brand</label>
            <select style={inputStyle} value={form.brand} onChange={(e) => updateField('brand', e.target.value)}>
              <option value="BRAND_A">Brand A</option>
              <option value="BRAND_B">Brand B</option>
              <option value="BRAND_C">Brand C</option>
              <option value="BRAND_D">Brand D</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Redemption Type</label>
            <select style={inputStyle} value={form.redemptionType} onChange={(e) => updateField('redemptionType', e.target.value)}>
              <option value="CARD_LINKED">Card Linked</option>
              <option value="VOUCHER_CODE">Voucher Code</option>
              <option value="BARCODE">Barcode</option>
              <option value="WALLET_PASS">Wallet Pass</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Max Activations</label>
            <input style={inputStyle} type="number" min="1" value={form.maxActivations} onChange={(e) => updateField('maxActivations', e.target.value)} placeholder="Unlimited" />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Terms & Conditions</label>
          <textarea style={{ ...inputStyle, minHeight: '60px' }} value={form.terms} onChange={(e) => updateField('terms', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={submitting} style={{
            padding: '0.75rem 1.5rem', background: '#1A2744', color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/offers/${id}`)} style={{
            padding: '0.75rem 1.5rem', background: 'white', color: '#1A2744', border: '1px solid #E2E8F0',
            borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOffer;
