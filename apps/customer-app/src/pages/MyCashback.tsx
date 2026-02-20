import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CashbackSummary } from '../types';

const MyCashback: React.FC = () => {
  const [summary, setSummary] = useState<CashbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCashback();
  }, []);

  async function loadCashback() {
    setLoading(true);
    try {
      const data = await api.getCashbackSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <p style={{ color: '#64748B', marginTop: '1rem' }}>Loading cashback...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error) return <p style={{ color: '#DC2626', padding: '1rem', background: '#FEF2F2', borderRadius: '12px' }}>{error}</p>;

  return (
    <div>
      {/* Summary banner */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        borderRadius: '24px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(5,150,105,0.25)',
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '60px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.85, fontWeight: 500 }}>Total Cashback Earned</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            £{summary?.totalCashback?.toFixed(2) || '0.00'}
          </p>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
            From {summary?.totalTransactions || 0} qualifying transaction{summary?.totalTransactions !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Credits</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{summary?.credits?.length || 0}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Avg. Cashback</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
            £{summary?.credits?.length ? (summary.totalCashback / summary.credits.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Transactions</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>{summary?.totalTransactions || 0}</p>
        </div>
      </div>

      {/* Credits list */}
      <h3 style={{ margin: '0 0 1rem', color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>Cashback History</h3>

      {(!summary?.credits || summary.credits.length === 0) && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>&#128176;</p>
          <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 0.25rem' }}>No cashback earned yet</p>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Activate an offer and make a purchase to start earning</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {summary?.credits?.map((credit) => (
          <div key={credit.id} style={{
            background: 'white',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: credit.status === 'CREDITED' ? '#10B981' : credit.status === 'PENDING' ? '#F59E0B' : '#94A3B8',
                  display: 'inline-block',
                }} />
                <p style={{ margin: 0, color: '#1E293B', fontWeight: 600, fontSize: '0.9rem' }}>
                  Purchase: £{credit.transactionAmount.toFixed(2)}
                </p>
              </div>
              <p style={{ margin: '0.1rem 0 0 1.1rem', color: '#64748B', fontSize: '0.8rem' }}>
                {credit.cashbackRate}% cashback rate
                <span style={{ color: '#CBD5E1', margin: '0 0.4rem' }}>|</span>
                <span style={{
                  padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                  background: credit.status === 'CREDITED' ? '#F0FDF4' : '#FEF3C7',
                  color: credit.status === 'CREDITED' ? '#059669' : '#D97706',
                }}>
                  {credit.status}
                </span>
              </p>
              <p style={{ margin: '0.1rem 0 0 1.1rem', color: '#94A3B8', fontSize: '0.7rem' }}>
                {new Date(credit.creditedAt).toLocaleString()}
              </p>
            </div>
            <span style={{
              fontSize: '1.2rem', fontWeight: 800, color: '#059669',
              background: '#F0FDF4', padding: '0.5rem 1rem', borderRadius: '12px',
            }}>
              +£{credit.cashbackAmount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCashback;
