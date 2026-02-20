import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#D97706',
  MATCHED: '#2563EB',
  CASHBACK_CREDITED: '#059669',
  REJECTED: '#DC2626',
};

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const data = await api.listTransactions();
      setTransactions(Array.isArray(data) ? data : data.content || []);
    } catch {
      // Service might not be running
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.status === filter);
  const totalAmount = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCashback = filtered.reduce((sum, t) => sum + (t.cashbackAmount || 0), 0);

  if (loading) return <p style={{ color: '#64748B' }}>Loading transactions...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', color: '#1A2744' }}>Transaction History</h2>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <SummaryCard label="Total Transactions" value={filtered.length.toString()} color="#1A2744" />
        <SummaryCard label="Total Spend" value={`£${totalAmount.toFixed(2)}`} color="#3B82F6" />
        <SummaryCard label="Total Cashback" value={`£${totalCashback.toFixed(2)}`} color="#059669" />
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB',
            fontSize: '0.9rem', background: 'white',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="MATCHED">Matched</option>
          <option value="CASHBACK_CREDITED">Cashback Credited</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748B', margin: 0 }}>No transactions found.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Cashback</th>
                <th style={thStyle}>Card</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={tdStyle}>{new Date(tx.transactionDate).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{tx.customerId.slice(0, 8)}...</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>£{tx.amount.toFixed(2)}</td>
                  <td style={{ ...tdStyle, color: '#059669', fontWeight: 600 }}>
                    {tx.cashbackAmount != null ? `£${tx.cashbackAmount.toFixed(2)}` : '-'}
                  </td>
                  <td style={tdStyle}>{tx.cardLastFour ? `****${tx.cardLastFour}` : '-'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'white',
                      background: STATUS_COLORS[tx.status] || '#6B7280',
                    }}>
                      {tx.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  color: '#475569',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: '#1A2744',
};

const SummaryCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0',
    padding: '1.25rem', minWidth: '180px', flex: 1,
  }}>
    <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>{label}</p>
    <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

export default TransactionHistory;
