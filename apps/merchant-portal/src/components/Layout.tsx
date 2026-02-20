import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '\u2302' },
  { path: '/dashboard', label: 'Dashboard', icon: '\uD83D\uDCCA' },
  { path: '/offers', label: 'My Offers', icon: '\uD83C\uDF81' },
  { path: '/offers/new', label: 'Create Offer', icon: '\u2795' },
  { path: '/partners', label: 'Partners', icon: '\uD83E\uDD1D' },
  { path: '/transactions', label: 'Transactions', icon: '\uD83D\uDCB3' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <nav style={{
        width: '250px',
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        color: 'white',
        padding: '1.5rem 0',
        flexShrink: 0,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>CC</div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Connected Commerce</h2>
          </div>
          <p style={{ margin: '0.25rem 0 0 2.5rem', fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.05em' }}>MERCHANT PORTAL</p>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 1.5rem',
                color: isActive ? 'white' : '#94A3B8',
                textDecoration: 'none',
                background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, background: '#F8FAFC' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B', fontWeight: 700 }}>Merchant Portal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem',
              background: '#EFF6FF', color: '#1E40AF', fontWeight: 600,
            }}>MERCHANT</span>
            <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Demo Merchant</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '2rem', maxWidth: '1200px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
