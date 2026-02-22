import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearToken } from '../lib/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/offers', label: 'My Offers', icon: '🎁' },
  { path: '/offers/new', label: 'Create Offer', icon: '➕' },
  { path: '/partners', label: 'Partners', icon: '🤝' },
  { path: '/transactions', label: 'Transactions', icon: '💳' },
  { path: '/ai-suggestions', label: 'AI Suggestions', icon: '🤖' },
];

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

  const sidebarWidth = isTablet ? '64px' : '250px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Mobile overlay */}
      {isMobile && drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Sidebar / Drawer */}
      {!isMobile && (
        <nav style={{
          width: sidebarWidth,
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          padding: '1.5rem 0',
          flexShrink: 0,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          transition: 'width 0.2s',
        }}>
          {!isTablet && (
            <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>CC</div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Connected Commerce</h2>
              </div>
              <p style={{ margin: '0.25rem 0 0 2.5rem', fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.05em' }}>MERCHANT PORTAL</p>
            </div>
          )}
          {isTablet && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>CC</div>
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : (item.path === '/offers' ? location.pathname === '/offers' || location.pathname.startsWith('/offers/') && !location.pathname.includes('/new') : location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isTablet ? 'center' : 'flex-start',
                  gap: isTablet ? '0' : '0.6rem',
                  padding: isTablet ? '0.85rem 0' : '0.7rem 1.5rem',
                  color: isActive ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderLeft: isTablet ? 'none' : (isActive ? '3px solid #3B82F6' : '3px solid transparent'),
                  borderRight: isTablet && isActive ? '3px solid #3B82F6' : isTablet ? '3px solid transparent' : 'none',
                  fontSize: isTablet ? '1.4rem' : '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: isTablet ? '1.4rem' : '0.85rem' }}>{item.icon}</span>
                {!isTablet && item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          color: 'white', zIndex: 200,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto',
          padding: '1rem 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.25rem 1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>CC</div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Connected Commerce</span>
              </div>
              <p style={{ margin: '0.2rem 0 0 2rem', fontSize: '0.65rem', color: '#64748B', letterSpacing: '0.05em' }}>MERCHANT PORTAL</p>
            </div>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>✕</button>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                  fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, background: '#F8FAFC', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: isMobile ? '0.75rem 1rem' : '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '1.1rem', color: '#374151', lineHeight: 1 }}>
                ☰
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.15rem', color: '#1E293B', fontWeight: 700 }}>Merchant Portal</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', background: '#EFF6FF', color: '#1E40AF', fontWeight: 600 }}>MERCHANT</span>
            {!isMobile && <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Merchant'}</span>}
            <button onClick={handleLogout} style={{ padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#64748B' }}>Sign out</button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1200px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
