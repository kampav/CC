import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Brand, OfferType, RedemptionType } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

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

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpoint() === 'mobile';
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
  const [imagePreview, setImagePreview] = useState<string>('');

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const aspect = img.width / img.height;
      canvas.width = 400;
      canvas.height = Math.round(400 / aspect);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setImagePreview(dataUrl);
      const key = `offer_img_${Date.now()}`;
      localStorage.setItem(key, dataUrl);
      updateField('imageUrl', key);
    };
    img.src = URL.createObjectURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        merchantId: '00000000-0000-0000-0000-000000000001',
        title: form.title,
        offerType: form.offerType,
        brand: form.brand,
        redemptionType: form.redemptionType,
        createdBy: 'merchant-portal',
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

      await api.createOffer(payload);
      navigate('/offers');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ margin: '0 0 1.5rem', color: '#1A2744' }}>Create New Offer</h2>

      {error && (
        <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => updateField('title', e.target.value)} required placeholder="e.g. 10% cashback at Tesco" />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '80px' }} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Longer explanation of the offer" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
            <input style={inputStyle} value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="e.g. Groceries, Fashion" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Cashback Rate (%)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" max="100" value={form.cashbackRate} onChange={(e) => updateField('cashbackRate', e.target.value)} placeholder="e.g. 5.00" />
          </div>
          <div>
            <label style={labelStyle}>Cashback Cap (GBP)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.cashbackCap} onChange={(e) => updateField('cashbackCap', e.target.value)} placeholder="e.g. 20.00" />
          </div>
          <div>
            <label style={labelStyle}>Min Spend (GBP)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.minSpend} onChange={(e) => updateField('minSpend', e.target.value)} placeholder="e.g. 10.00" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Offer Image</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input type="file" accept="image/*" onChange={handleImageFile} style={{ flex: 1, fontSize: '0.85rem' }} />
            <span style={{ color: '#94A3B8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or URL:</span>
            <input style={{ ...inputStyle, flex: 2 }} value={form.imageUrl.startsWith('offer_img_') ? '' : form.imageUrl}
              onChange={(e) => { setImagePreview(e.target.value); updateField('imageUrl', e.target.value); }}
              placeholder="https://example.com/image.jpg" />
          </div>
          {imagePreview && (
            <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Terms & Conditions</label>
          <textarea style={{ ...inputStyle, minHeight: '60px' }} value={form.terms} onChange={(e) => updateField('terms', e.target.value)} placeholder="Offer terms and conditions" />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={submitting} style={{
            padding: '0.75rem 1.5rem',
            background: '#1A2744',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? 'Creating...' : 'Create Offer'}
          </button>
          <button type="button" onClick={() => navigate('/offers')} style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#1A2744',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffer;
