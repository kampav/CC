import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { usePersonalization } from '../context/PersonalizationContext';
import { getUser } from '../lib/auth';

const CATEGORY_IMAGES: Record<string, string> = {
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=300&fit=crop',
  Fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop',
  Travel: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&h=300&fit=crop',
  Dining: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop',
  Electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=300&fit=crop',
  Entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop',
  'Health & Wellness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=300&fit=crop',
};

const SEGMENT_CONFIG: Record<string, { headline: string; sub: string; gradient: string }> = {
  PREMIER: {
    headline: 'Premier Rewards',
    sub: 'Exclusive offers curated for your lifestyle.',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #7C3AED 100%)',
  },
  MASS_AFFLUENT: {
    headline: 'Your Cashback Hub',
    sub: 'Smart offers matched to your spending habits.',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4338CA 70%, #6366F1 100%)',
  },
  MASS_MARKET: {
    headline: 'Cashback Made Easy',
    sub: 'Discover great deals and earn rewards on every purchase.',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #1D4ED8 50%, #3B82F6 100%)',
  },
  PRIVATE: {
    headline: 'Private Client Offers',
    sub: 'Premium rewards tailored exclusively for you.',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 100%)',
  },
};

const DEFAULT_HERO = {
  headline: 'Welcome to Connected Commerce',
  sub: 'Discover exclusive cashback offers from your favourite brands.',
  gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4338CA 70%, #6366F1 100%)',
};

const Home: React.FC = () => {
  const { mode } = usePersonalization();
  const user = getUser();

  const [offerCount, setOfferCount] = useState(0);
  const [cashback, setCashback] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [recMode, setRecMode] = useState<string>('rule-based');

  useEffect(() => {
    async function load() {
      try {
        const [offers, summary, activations, recs] = await Promise.allSettled([
          api.listOffers({ status: 'LIVE', size: '1' }),
          api.getCashbackSummary(),
          api.listActivations(),
          api.getRecommendations(4, mode),
        ]);
        if (offers.status === 'fulfilled') {
          setOfferCount(offers.value.totalElements || offers.value.content?.length || 0);
        }
        if (summary.status === 'fulfilled') {
          setCashback(summary.value.totalCashback || 0);
        }
        if (activations.status === 'fulfilled') {
          const list = Array.isArray(activations.value) ? activations.value : activations.value.content || [];
          setActiveOffers(list.filter((a: any) => a.status === 'ACTIVE').length);
        }
        if (recs.status === 'fulfilled') {
          setRecommendations(recs.value.recommendations || []);
          setRecMode(recs.value.mode || 'rule-based');
        }
      } catch { /* ignore */ }
    }
    load();
  }, [mode]);

  // Load customer profile for persona-aware banner
  useEffect(() => {
    const customerId = user?.customerId;
    if (!customerId) return;
    api.getCustomerSummary(customerId)
      .then(p => setProfile(p))
      .catch(() => {});
  }, [user?.customerId]);

  const heroConfig = profile?.customerSegment
    ? (SEGMENT_CONFIG[profile.customerSegment] || DEFAULT_HERO)
    : DEFAULT_HERO;

  const firstName = user?.firstName || profile?.firstName || '';

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: heroConfig.gradient,
        borderRadius: '24px', padding: '3rem 2.5rem', color: 'white', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-40px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '100px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative' }}>
          {profile?.customerSegment && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em',
              }}>
                {profile.customerSegment.replace('_', ' ')}
                {profile.lifecycleStage ? ` · ${profile.lifecycleStage.replace('_', ' ')}` : ''}
              </span>
            </div>
          )}
          <h1 style={{ margin: '0 0 0.75rem', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {firstName ? `Hello, ${firstName}!` : heroConfig.headline}
          </h1>
          <p style={{ margin: '0 0 2rem', fontSize: '1.05rem', color: '#C7D2FE', maxWidth: '550px', lineHeight: 1.7 }}>
            {heroConfig.sub}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/browse" style={{
              display: 'inline-block', padding: '0.875rem 2.5rem',
              background: 'white', color: '#312E81',
              borderRadius: '14px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
              Browse Offers
            </Link>
            <Link to="/demo" style={{
              display: 'inline-block', padding: '0.875rem 1.5rem',
              background: 'rgba(255,255,255,0.15)', color: 'white',
              borderRadius: '14px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              A/B Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard label="Available Offers" value={offerCount.toString()} color="#4338CA" icon="&#128722;" />
        <Link to="/my-offers" style={{ textDecoration: 'none' }}>
          <StatCard label="Active Offers" value={activeOffers.toString()} color="#7C3AED" icon="&#9733;" />
        </Link>
        <Link to="/cashback" style={{ textDecoration: 'none' }}>
          <StatCard label="Your Cashback" value={`£${cashback.toFixed(2)}`} color="#059669" icon="&#128176;" />
        </Link>
      </div>

      {/* Recommended For You */}
      {recommendations.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, color: '#1E293B', fontSize: '1.2rem', fontWeight: 700 }}>Recommended For You</h3>
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                background: recMode === 'ai'
                  ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
                  : '#E2E8F0',
                color: recMode === 'ai' ? 'white' : '#475569',
              }}>
                {recMode === 'ai' ? 'AI Powered' : 'Rule-Based'}
              </span>
            </div>
            <Link to="/browse" style={{ color: '#4338CA', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>View all &rarr;</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {recommendations.map((offer: any) => (
              <Link key={offer.id} to={`/offers/${offer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'white', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid #E2E8F0', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
                    <img
                      src={offer.imageUrl || CATEGORY_IMAGES[offer.category] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop'}
                      alt={offer.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }} />
                    {/* Mode badge */}
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 700,
                      background: (offer._mode === 'ai')
                        ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
                        : 'rgba(71,85,105,0.85)',
                      color: 'white',
                    }}>
                      {offer._mode === 'ai' ? 'AI' : 'RULES'}
                    </div>
                    {offer.cashbackRate && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white',
                        padding: '0.25rem 0.6rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                      }}>
                        {offer.cashbackRate}%
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem 1rem 1rem' }}>
                    {offer.category && (
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', background: '#F1F5F9', color: '#475569', marginBottom: '0.4rem', display: 'inline-block' }}>
                        {offer.category}
                      </span>
                    )}
                    <h4 style={{ margin: '0.25rem 0', color: '#1E293B', fontSize: '0.9rem', fontWeight: 600 }}>{offer.title}</h4>
                    {offer._reason && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>{offer._reason}</p>
                    )}
                    {offer.cashbackRate && (
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', display: 'block', marginTop: '0.25rem' }}>
                        {offer.cashbackRate}% cashback
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Browse by Category */}
      <h3 style={{ margin: '0 0 1rem', color: '#1E293B', fontSize: '1.2rem', fontWeight: 700 }}>Browse by Category</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {Object.entries(CATEGORY_IMAGES).map(([cat, img]) => (
          <Link key={cat} to={`/browse?category=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
            <div style={{
              borderRadius: '16px', overflow: 'hidden', position: 'relative', height: '120px',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)',
                display: 'flex', alignItems: 'flex-end', padding: '0.75rem',
              }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{cat}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* How it works */}
      <h3 style={{ margin: '0 0 1rem', color: '#1E293B', fontSize: '1.2rem', fontWeight: 700 }}>How It Works</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StepCard step="1" title="Browse" description="Explore personalised cashback offers from top brands." color="#4338CA" />
        <StepCard step="2" title="Activate" description="Tap to activate an offer — it's linked to your card instantly." color="#7C3AED" />
        <StepCard step="3" title="Shop" description="Make a purchase at the merchant using your linked card." color="#059669" />
        <StepCard step="4" title="Earn" description="Cashback is automatically credited to your account." color="#F59E0B" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string; icon: string }> = ({ label, value, color, icon }) => (
  <div style={{
    background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0',
    padding: '1.5rem', position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-5px', fontSize: '3rem', opacity: 0.08 }}>{icon}</div>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>{label}</p>
    <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; color: string }> = ({ step, title, description, color }) => (
  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '12px', background: color + '15',
      color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem',
    }}>
      {step}
    </div>
    <h4 style={{ margin: '0 0 0.25rem', color: '#1E293B', fontWeight: 700 }}>{title}</h4>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>{description}</p>
  </div>
);

export default Home;
