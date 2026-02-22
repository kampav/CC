import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Activation } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MyOffers: React.FC = () => {
  const isMobile = useBreakpoint() === 'mobile';
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  useEffect(() => {
    loadActivations();
  }, []);

  async function loadActivations() {
    setLoading(true);
    try {
      const data = await api.listActivations();
      setActivations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateTransaction(activation: Activation) {
    setSimulating(activation.id);
    setSimMessage(null);
    try {
      const amount = 50 + Math.floor(Math.random() * 100);
      const result = await api.simulateTransaction(activation.id, amount);
      setSimMessage(
        `Transaction of £${amount} processed! Cashback earned: £${result.cashbackAmount || '0.00'}`
      );
    } catch (err: any) {
      setSimMessage(`Error: ${err.message}`);
    } finally {
      setSimulating(null);
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#4338CA', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <p style={{ color: '#64748B', marginTop: '1rem' }}>Loading your offers...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeCount = activations.filter(a => a.status === 'ACTIVE').length;

  return (
    <div>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
        borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700 }}>My Activated Offers</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
          {activeCount} active offer{activeCount !== 1 ? 's' : ''} &mdash; simulate a transaction to earn cashback
        </p>
      </div>

      {error && <p style={{ color: '#DC2626', padding: '1rem', background: '#FEF2F2', borderRadius: '12px' }}>{error}</p>}

      {simMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          background: simMessage.startsWith('Error') ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${simMessage.startsWith('Error') ? '#FECACA' : '#BBF7D0'}`,
          borderRadius: '14px',
          color: simMessage.startsWith('Error') ? '#DC2626' : '#059669',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {simMessage.startsWith('Error') ? '\u274C' : '\u2705'} {simMessage}
        </div>
      )}

      {activations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>&#9733;</p>
          <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 0.5rem' }}>No activated offers yet</p>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>Browse offers and activate one to get started</p>
          <Link to="/browse" style={{
            display: 'inline-block', padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #4338CA, #6366F1)', color: 'white',
            borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          }}>
            Browse Offers
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {activations.map((activation) => (
          <div key={activation.id} style={{
            background: 'white',
            borderRadius: '16px',
            border: activation.status === 'ACTIVE' ? '1px solid #E2E8F0' : '1px solid #F1F5F9',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : undefined,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            opacity: activation.status === 'ACTIVE' ? 1 : 0.7,
            transition: 'all 0.2s',
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.3rem', color: '#1E293B', fontSize: '1.05rem', fontWeight: 600 }}>
                {activation.offerTitle || 'Offer'}
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {activation.cashbackRate && (
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                    {activation.cashbackRate}%
                  </span>
                )}
                {activation.minSpend && activation.minSpend > 0 && (
                  <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
                    Min £{activation.minSpend}
                  </span>
                )}
                {activation.cashbackCap && (
                  <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
                    Cap £{activation.cashbackCap}
                  </span>
                )}
              </div>
              <p style={{ margin: '0.3rem 0 0', color: '#94A3B8', fontSize: '0.75rem' }}>
                Activated: {new Date(activation.activatedAt).toLocaleDateString()}
                {activation.expiresAt && ` \u2022 Expires: ${new Date(activation.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activation.status === 'ACTIVE' ? '#F0FDF4' : '#F1F5F9',
                color: activation.status === 'ACTIVE' ? '#059669' : '#64748B',
              }}>
                {activation.status}
              </span>
              {activation.status === 'ACTIVE' && (
                <button
                  onClick={() => handleSimulateTransaction(activation)}
                  disabled={simulating === activation.id}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: simulating === activation.id ? 'not-allowed' : 'pointer',
                    opacity: simulating === activation.id ? 0.6 : 1,
                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                  }}
                >
                  {simulating === activation.id ? 'Processing...' : 'Simulate Purchase'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOffers;
