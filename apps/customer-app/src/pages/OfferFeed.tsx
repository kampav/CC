import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Offer } from '../types';

const CATEGORIES = ['All', 'Groceries', 'Fashion', 'Travel', 'Dining', 'Electronics', 'Entertainment', 'Health & Wellness'];
const BRANDS = ['All', 'BRAND_A', 'BRAND_B', 'BRAND_C', 'BRAND_D'];

const BRAND_LABELS: Record<string, string> = {
  BRAND_A: 'Brand A', BRAND_B: 'Brand B', BRAND_C: 'Brand C', BRAND_D: 'Brand D',
};

const BRAND_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  BRAND_A: { bg: '#EFF6FF', text: '#1E40AF', accent: '#3B82F6' },
  BRAND_B: { bg: '#FDF2F8', text: '#9D174D', accent: '#EC4899' },
  BRAND_C: { bg: '#F0FDF4', text: '#166534', accent: '#22C55E' },
  BRAND_D: { bg: '#FFF7ED', text: '#9A3412', accent: '#F97316' },
};


const OfferFeed: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => { loadOffers(); }, [category, brand, page]);

  async function loadOffers() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { status: 'LIVE', size: '12', page: page.toString() };
      if (category !== 'All') params.category = category;
      if (brand !== 'All') params.brand = brand;
      const data = await api.listOffers(params);
      setOffers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  function daysUntilExpiry(endDate: string | null): number | null {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const displayed = search
    ? offers.filter(o => o.title.toLowerCase().includes(search.toLowerCase()))
    : offers;

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', right: '80px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 700 }}>Discover Amazing Offers</h2>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, maxWidth: '500px' }}>
          Browse {totalElements} exclusive cashback deals from top brands. Activate, shop, and earn rewards.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <input
          type="text" placeholder="Search offers..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '500px', padding: '0.75rem 1rem 0.75rem 2.5rem',
            borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '0.95rem', boxSizing: 'border-box',
            background: 'white', transition: 'border-color 0.2s',
          }}
        />
        <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '1.1rem' }}>&#128269;</span>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => { setCategory(cat); setPage(0); }} style={{
            padding: '0.5rem 1.1rem', borderRadius: '12px', border: 'none',
            background: category === cat ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
            color: category === cat ? 'white' : '#475569', fontSize: '0.85rem', cursor: 'pointer',
            fontWeight: category === cat ? 600 : 400, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Brand pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {BRANDS.map((b) => {
          const colors = BRAND_COLORS[b];
          const isActive = brand === b;
          return (
            <button key={b} onClick={() => { setBrand(b); setPage(0); }} style={{
              padding: '0.4rem 0.85rem', borderRadius: '10px', border: '2px solid',
              borderColor: isActive ? (colors?.accent || '#3B82F6') : '#E2E8F0',
              background: isActive ? (colors?.bg || '#EFF6FF') : 'white',
              color: isActive ? (colors?.text || '#1D4ED8') : '#64748B',
              fontSize: '0.8rem', cursor: 'pointer', fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              {b === 'All' ? 'All Brands' : BRAND_LABELS[b] || b}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#DC2626', padding: '1rem', background: '#FEF2F2', borderRadius: '12px' }}>{error}</p>}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748B', marginTop: '1rem' }}>Loading offers...</p>
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>&#128722;</p>
          <p style={{ color: '#475569', fontWeight: 500, margin: '0 0 0.25rem' }}>No offers found</p>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Offer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {displayed.map((offer) => {
          const days = daysUntilExpiry(offer.endDate);
          const urgent = days !== null && days <= 7 && days > 0;
          const expired = days !== null && days <= 0;
          const brandColor = BRAND_COLORS[offer.brand] || BRAND_COLORS.BRAND_A;

          return (
            <Link key={offer.id} to={`/offers/${offer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'white', borderRadius: '16px', overflow: 'hidden',
                border: urgent ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                {/* Offer Image */}
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <img
                    src={offer.imageUrl || `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop`}
                    alt={offer.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop'; }}
                  />
                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }} />

                  {/* Cashback badge */}
                  {offer.cashbackRate && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white',
                      padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                    }}>
                      {offer.cashbackRate}%
                    </div>
                  )}

                  {/* Urgency badge */}
                  {urgent && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.6rem',
                      borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {days === 1 ? 'Ends tomorrow!' : `${days} days left`}
                    </div>
                  )}
                  {expired && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.6rem',
                      borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      Expired
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    {offer.category && (
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 500,
                        background: '#F1F5F9', color: '#475569',
                      }}>
                        {offer.category}
                      </span>
                    )}
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                      background: brandColor.bg, color: brandColor.text,
                    }}>
                      {BRAND_LABELS[offer.brand] || offer.brand}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.4rem', color: '#1E293B', fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                    {offer.title}
                  </h3>

                  {offer.description && (
                    <p style={{ margin: '0 0 0.75rem', color: '#64748B', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {offer.description.length > 80 ? offer.description.slice(0, 80) + '...' : offer.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {offer.cashbackRate ? (
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
                        {offer.cashbackRate}% cashback
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: brandColor.accent }}>
                        {offer.offerType.replace('_', ' ')}
                      </span>
                    )}
                    {offer.currentActivations > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {offer.currentActivations.toLocaleString()} activated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem', alignItems: 'center' }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none',
            background: page === 0 ? '#F1F5F9' : 'white', cursor: page === 0 ? 'default' : 'pointer',
            color: page === 0 ? '#94A3B8' : '#475569', fontSize: '0.85rem', fontWeight: 500,
            boxShadow: page === 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none',
            background: page >= totalPages - 1 ? '#F1F5F9' : 'linear-gradient(135deg, #667eea, #764ba2)',
            cursor: page >= totalPages - 1 ? 'default' : 'pointer',
            color: page >= totalPages - 1 ? '#94A3B8' : 'white', fontSize: '0.85rem', fontWeight: 500,
          }}>
            Next
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OfferFeed;
