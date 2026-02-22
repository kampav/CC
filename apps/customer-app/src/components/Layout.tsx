import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearToken } from '../lib/auth';
import PersonalizationToggle from './PersonalizationToggle';
import { useBreakpoint } from '../hooks/useBreakpoint';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/browse', label: 'Browse Offers', icon: '🔍' },
  { path: '/my-offers', label: 'My Offers', icon: '★' },
  { path: '/cashback', label: 'My Cashback', icon: '💰' },
  { path: '/transactions', label: 'Transactions', icon: '📋' },
  { path: '/demo', label: 'A/B Demo', icon: '🧠' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: '#F8FAFC' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: 'white',
        padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(30, 27, 75, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #818CF8, #C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700,
          }}>CC</div>
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Connected Commerce</h1>
            {!isMobile && <p style={{ margin: 0, fontSize: '0.7rem', color: '#C7D2FE', letterSpacing: '0.05em' }}>Personalised Offers & Cashback</p>}
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isMobile && <PersonalizationToggle />}
          {!isMobile && (
            <div style={{ padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', fontSize: '0.8rem', color: '#E0E7FF' }}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
            </div>
          )}
          {!isMobile && (
            <button onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#E0E7FF', cursor: 'pointer', fontSize: '0.75rem' }}>
              Sign out
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {isMobile && menuOpen && (
        <div style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 99,
          position: 'relative',
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}</span>
            <button onClick={handleLogout} style={{ padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#64748B' }}>Sign out</button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <PersonalizationToggle />
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  color: isActive ? '#4338CA' : '#374151',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid #4338CA' : '3px solid transparent',
                  background: isActive ? '#EEF2FF' : 'transparent',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop/Tablet Navigation */}
      {!isMobile && (
        <nav style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          gap: '0',
          padding: '0 2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflowX: 'auto',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '0.85rem 1.25rem',
                  color: isActive ? '#4338CA' : '#64748B',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '3px solid #4338CA' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Content */}
      <main style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem 2rem', textAlign: 'center',
        color: '#94A3B8', fontSize: '0.75rem',
        borderTop: '1px solid #E2E8F0', marginTop: '2rem',
      }}>
        Connected Commerce Platform v1.2.0 &mdash; Demo Environment
      </footer>
    </div>
  );
};

export default Layout;
