import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearToken } from '../lib/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/exec-dashboard', label: 'Exec Dashboard', icon: '📈' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/offer-review', label: 'Offer Review Queue', icon: '📋' },
      { path: '/merchant-onboarding', label: 'Merchant Onboarding', icon: '🏪' },
      { path: '/commercial-onboarding', label: 'Commercial Onboarding', icon: '🏢' },
      { path: '/campaigns', label: 'Campaign Management', icon: '📣' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/customer-insights', label: 'Customer Insights', icon: '👥' },
      { path: '/analytics', label: 'Platform Analytics', icon: '🔬' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { path: '/audit', label: 'Audit Log', icon: '🔍' },
      { path: '/compliance', label: 'Compliance Rules', icon: '⚖️' },
    ],
  },
];

// Flat list for icon-only mode
const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Mobile overlay */}
      {isMobile && drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <nav style={{
          width: isTablet ? '64px' : '260px',
          background: '#0F172A',
          color: 'white',
          padding: '1.5rem 0',
          flexShrink: 0,
          overflowY: 'auto',
          transition: 'width 0.2s',
        }}>
          {isTablet ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#1E293B' }}>CC</div>
            </div>
          ) : (
            <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#F59E0B' }}>CC Internal</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>Colleague Portal</p>
            </div>
          )}

          {isTablet ? (
            // Icon-only mode
            ALL_NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} title={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 0',
                color: isActive(item.path) ? 'white' : '#64748B',
                textDecoration: 'none',
                background: isActive(item.path) ? 'rgba(245,158,11,0.15)' : 'transparent',
                borderRight: isActive(item.path) ? '3px solid #F59E0B' : '3px solid transparent',
                fontSize: '1.3rem',
              }}>
                {item.icon}
              </Link>
            ))
          ) : (
            // Full sidebar with sections
            NAV_SECTIONS.map((section) => (
              <div key={section.title} style={{ marginBottom: '1.25rem' }}>
                <p style={{ padding: '0 1.5rem', margin: '0 0 0.35rem', fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link key={item.path} to={item.path} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.55rem 1.5rem',
                    color: isActive(item.path) ? 'white' : '#94A3B8',
                    textDecoration: 'none',
                    background: isActive(item.path) ? 'rgba(245,158,11,0.15)' : 'transparent',
                    borderLeft: isActive(item.path) ? '3px solid #F59E0B' : '3px solid transparent',
                    fontSize: '0.85rem',
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))
          )}
        </nav>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
          background: '#0F172A', color: 'white', zIndex: 200,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto', padding: '1rem 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.25rem 1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#F59E0B' }}>CC Internal</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>Colleague Portal</p>
            </div>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>✕</button>
          </div>
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: '1rem' }}>
              <p style={{ padding: '0 1.25rem', margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </p>
              {section.items.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 1.25rem',
                  color: isActive(item.path) ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  background: isActive(item.path) ? 'rgba(245,158,11,0.15)' : 'transparent',
                  borderLeft: isActive(item.path) ? '3px solid #F59E0B' : '3px solid transparent',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, background: '#F8FAFC', minWidth: 0 }}>
        <header style={{
          background: 'white', borderBottom: '1px solid #E2E8F0',
          padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '1.1rem', color: '#374151', lineHeight: 1 }}>
                ☰
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.1rem', color: '#0F172A' }}>
              {isMobile ? 'CC Internal' : 'Connected Commerce — Colleague Portal'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
              {user?.role || 'COLLEAGUE'}
            </span>
            {!isMobile && <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Internal User'}</span>}
            <button onClick={handleLogout} style={{ padding: '0.2rem 0.6rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#64748B' }}>
              Sign out
            </button>
          </div>
        </header>
        <main style={{ padding: isMobile ? '1rem' : '2rem' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
