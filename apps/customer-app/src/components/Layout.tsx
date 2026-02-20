import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearToken } from '../lib/auth';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '\u2302' },
  { path: '/browse', label: 'Browse Offers', icon: '\uD83D\uDD0D' },
  { path: '/my-offers', label: 'My Offers', icon: '\u2605' },
  { path: '/cashback', label: 'My Cashback', icon: '\uD83D\uDCB0' },
  { path: '/transactions', label: 'Transactions', icon: '\uD83D\uDCCB' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: '#F8FAFC' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: 'white',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(30, 27, 75, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #818CF8, #C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700,
          }}>CC</div>
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Connected Commerce</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#C7D2FE', letterSpacing: '0.05em' }}>Personalised Offers & Cashback</p>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', fontSize: '0.8rem', color: '#E0E7FF' }}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
          </div>
          <button onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#E0E7FF', cursor: 'pointer', fontSize: '0.75rem' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: '0',
        padding: '0 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem 2rem', textAlign: 'center',
        color: '#94A3B8', fontSize: '0.75rem',
        borderTop: '1px solid #E2E8F0', marginTop: '2rem',
      }}>
        Connected Commerce Platform &mdash; Demo Environment
      </footer>
    </div>
  );
};

export default Layout;
