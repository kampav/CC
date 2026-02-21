import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/auth';

const PERSONAS = [
  { email: 'customer@demo.com',  name: 'Alice Morgan',  segment: 'PREMIER',        pattern: 'EXPERIENCE_SEEKER', lifecycle: 'MATURE'  },
  { email: 'customer2@demo.com', name: 'Ben Clarke',    segment: 'MASS_AFFLUENT',   pattern: 'BRAND_LOYAL',       lifecycle: 'MATURE'  },
  { email: 'customer3@demo.com', name: 'Cara Singh',    segment: 'MASS_MARKET',     pattern: 'DEAL_SEEKER',       lifecycle: 'NEW'     },
  { email: 'customer4@demo.com', name: 'Dan Webb',      segment: 'PREMIER',         pattern: 'BRAND_LOYAL',       lifecycle: 'GROWING' },
  { email: 'customer5@demo.com', name: 'Emma Hayes',    segment: 'MASS_AFFLUENT',   pattern: 'CONVENIENCE_SHOPPER', lifecycle: 'GROWING' },
  { email: 'customer6@demo.com', name: 'Frank Osei',    segment: 'MASS_MARKET',     pattern: 'DEAL_SEEKER',       lifecycle: 'AT_RISK' },
  { email: 'customer7@demo.com', name: 'Grace Liu',     segment: 'PREMIER',         pattern: 'EXPERIENCE_SEEKER', lifecycle: 'MATURE'  },
  { email: 'customer8@demo.com', name: 'Harry Patel',   segment: 'MASS_AFFLUENT',   pattern: 'BRAND_LOYAL',       lifecycle: 'GROWING' },
  { email: 'customer9@demo.com', name: 'Isla Brown',    segment: 'MASS_MARKET',     pattern: 'CONVENIENCE_SHOPPER', lifecycle: 'NEW'   },
];

const SEGMENT_COLOR: Record<string, string> = {
  PREMIER: '#7C3AED',
  MASS_AFFLUENT: '#0891B2',
  MASS_MARKET: '#059669',
  PRIVATE: '#1E293B',
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);

  function selectPersona(p: typeof PERSONAS[0]) {
    setEmail(p.email);
    setShowPersonas(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedPersona = PERSONAS.find(p => p.email === email);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0F172A', fontWeight: 700 }}>Connected Commerce</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748B', fontSize: '0.9rem' }}>Customer Rewards v1.2.0</p>
        </div>

        {/* Persona selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '0.4rem', fontWeight: 500 }}>
            Login as...
          </label>
          <button
            type="button"
            onClick={() => setShowPersonas(v => !v)}
            style={{
              width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB',
              fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>
              {selectedPersona ? (
                <>
                  <span style={{ fontWeight: 600 }}>{selectedPersona.name}</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: SEGMENT_COLOR[selectedPersona.segment] || '#64748B' }}>
                    {selectedPersona.segment.replace('_', ' ')} · {selectedPersona.lifecycle}
                  </span>
                </>
              ) : 'Select persona'}
            </span>
            <span style={{ color: '#94A3B8' }}>{showPersonas ? '▲' : '▼'}</span>
          </button>

          {showPersonas && (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', marginTop: '4px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: '280px', overflowY: 'auto' }}>
              {PERSONAS.map(p => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => selectPersona(p)}
                  style={{
                    width: '100%', padding: '0.65rem 1rem', border: 'none', textAlign: 'left',
                    cursor: 'pointer', borderBottom: '1px solid #F1F5F9',
                    background: email === p.email ? '#F5F3FF' : 'white',
                    display: 'flex', flexDirection: 'column', gap: '0.15rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>{p.name}</span>
                  <span style={{ fontSize: '0.73rem', color: '#64748B' }}>
                    <span style={{ color: SEGMENT_COLOR[p.segment] || '#64748B', fontWeight: 600 }}>
                      {p.segment.replace('_', ' ')}
                    </span>
                    {' · '}{p.pattern.replace(/_/g, ' ')}
                    {' · '}{p.lifecycle}
                    {' · '}<span style={{ color: '#94A3B8' }}>{p.email}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '0.4rem', fontWeight: 500 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '0.4rem', fontWeight: 500 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0 0 1rem' }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.75rem', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#94A3B8' }}>
          All demo passwords: <strong>demo1234</strong>
        </p>
      </div>
    </div>
  );
};

export default Login;
