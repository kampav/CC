import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { path: '/', label: 'Dashboard' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/offer-review', label: 'Offer Review Queue' },
      { path: '/merchant-onboarding', label: 'Merchant Onboarding' },
      { path: '/campaigns', label: 'Campaign Management' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { path: '/analytics', label: 'Platform Analytics' },
      { path: '/audit', label: 'Audit Log' },
      { path: '/compliance', label: 'Compliance Rules' },
    ],
  },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <nav style={{
        width: '260px',
        background: '#0F172A',
        color: 'white',
        padding: '1.5rem 0',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#F59E0B' }}>CC Internal</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>Colleague Portal</p>
        </div>

        {NAV_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: '1.25rem' }}>
            <p style={{
              padding: '0 1.5rem', margin: '0 0 0.35rem', fontSize: '0.7rem',
              fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} style={{
                  display: 'block',
                  padding: '0.55rem 1.5rem',
                  color: isActive ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(245,158,11,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                  fontSize: '0.85rem',
                }}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Main */}
      <div style={{ flex: 1, background: '#F8FAFC' }}>
        <header style={{
          background: 'white', borderBottom: '1px solid #E2E8F0',
          padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>Connected Commerce — Colleague Portal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem',
              background: '#FEF3C7', color: '#92400E', fontWeight: 600,
            }}>ADMIN</span>
            <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Internal User</span>
          </div>
        </header>
        <main style={{ padding: '2rem' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
