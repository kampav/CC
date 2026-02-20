import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2744 0%, #2D4A7A 100%)',
        borderRadius: '16px',
        padding: '3rem',
        color: 'white',
        marginBottom: '2rem',
      }}>
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '2rem', fontWeight: 700 }}>
          Welcome to Connected Commerce
        </h1>
        <p style={{ margin: '0 0 2rem', fontSize: '1.1rem', color: '#CBD5E1', maxWidth: '600px', lineHeight: 1.6 }}>
          Manage your offers, track customer activations, and monitor cashback performance
          — all from one place.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/offers/new" style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#1A2744',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}>
            Create New Offer
          </Link>
          <Link to="/dashboard" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.95rem',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <h3 style={{ margin: '0 0 1rem', color: '#1A2744', fontSize: '1.1rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <QuickCard
          title="Manage Offers"
          description="View, create, and manage your offer catalogue. Track offer lifecycle from draft to live."
          link="/offers"
          accent="#3B82F6"
        />
        <QuickCard
          title="Merchant Profile"
          description="Register your business, update details, and manage your partner account."
          link="/partners"
          accent="#059669"
        />
        <QuickCard
          title="Transaction History"
          description="View customer transactions, cashback credits, and redemption activity."
          link="/transactions"
          accent="#D97706"
        />
        <QuickCard
          title="Analytics Dashboard"
          description="Track performance metrics: activations, transactions, and cashback payouts."
          link="/dashboard"
          accent="#7C3AED"
        />
      </div>
    </div>
  );
};

const QuickCard: React.FC<{ title: string; description: string; link: string; accent: string }> = ({
  title, description, link, accent,
}) => (
  <Link to={link} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      padding: '1.5rem',
      cursor: 'pointer',
      borderTop: `3px solid ${accent}`,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <h4 style={{ margin: '0 0 0.5rem', color: '#1A2744', fontSize: '1rem' }}>{title}</h4>
      <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>{description}</p>
    </div>
  </Link>
);

export default Home;
