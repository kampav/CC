import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Transaction {
  id: string;
  activationId: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency: string;
  cardLastFour: string | null;
  description: string | null;
  status: string;
  transactionDate: string;
  cashbackAmount: number | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#92400E' },
  MATCHED: { bg: '#DBEAFE', text: '#1E40AF' },
  CASHBACK_CREDITED: { bg: '#DCFCE7', text: '#166534' },
  REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
};

const TransactionHistory: React.FC = () => {
  const isMobile = useBreakpoint() === 'mobile';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const data = await api.listTransactions();
      setTransactions(Array.isArray(data) ? data : data.content || []);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }

  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCashback = transactions.reduce((sum, t) => sum + (t.cashbackAmount || 0), 0);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <p style={{ color: '#64748B', marginTop: '1rem' }}>Loading transactions...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700 }}>Transaction History</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
          Track your purchases and cashback earnings
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Transactions</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>{transactions.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Total Spent</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#3B82F6' }}>£{totalSpent.toFixed(2)}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(5,150,105,0.2)',
        }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>Cashback Earned</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>£{totalCashback.toFixed(2)}</p>
        </div>
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>&#128203;</p>
          <p style={{ color: '#475569', fontWeight: 600, margin: '0 0 0.25rem' }}>No transactions yet</p>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Activate an offer and make a purchase to see your transactions here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {transactions.map((tx) => {
            const statusStyle = STATUS_COLORS[tx.status] || { bg: '#F1F5F9', text: '#475569' };
            return (
              <div key={tx.id} style={{
                background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0',
                padding: '1rem 1.25rem', display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '0.75rem' : undefined,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <p style={{ margin: 0, color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
                      £{tx.amount.toFixed(2)} purchase
                    </p>
                    {tx.description && (
                      <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>&mdash; {tx.description}</span>
                    )}
                  </div>
                  <p style={{ margin: '0.15rem 0 0', color: '#64748B', fontSize: '0.8rem' }}>
                    {new Date(tx.transactionDate).toLocaleString()}
                    {tx.cardLastFour ? ` \u2022 Card ****${tx.cardLastFour}` : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {tx.cashbackAmount != null && tx.cashbackAmount > 0 && (
                    <span style={{
                      fontSize: '1.1rem', fontWeight: 800, color: '#059669',
                      background: '#F0FDF4', padding: '0.4rem 0.75rem', borderRadius: '10px',
                    }}>
                      +£{tx.cashbackAmount.toFixed(2)}
                    </span>
                  )}
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                    color: statusStyle.text, background: statusStyle.bg,
                  }}>
                    {tx.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
