import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

interface AuditEntry {
  id: number;
  offerId: string;
  previousStatus: string | null;
  newStatus: string;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8', PENDING_REVIEW: '#F59E0B', APPROVED: '#3B82F6', LIVE: '#10B981', PAUSED: '#EF4444', EXPIRED: '#6B7280', RETIRED: '#374151',
};

const AuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOfferId, setFilterOfferId] = useState('');
  const [filterChangedBy, setFilterChangedBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [drillDownOffer, setDrillDownOffer] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await api.listAuditLogs({ size: '200', sort: 'changedAt,desc' });
      setEntries(data.content || (Array.isArray(data) ? data : []));
    } catch { /* */ }
    setLoading(false);
  }

  async function loadByOffer(offerId: string) {
    setDrillDownOffer(offerId);
    try {
      const data = await api.getAuditLogByOffer(offerId);
      setEntries(Array.isArray(data) ? data : data.content || []);
    } catch { /* */ }
  }

  function clearDrillDown() {
    setDrillDownOffer(null);
    loadEntries();
  }

  const filtered = entries.filter(e => {
    if (filterOfferId && !e.offerId.includes(filterOfferId)) return false;
    if (filterChangedBy && !(e.changedBy || '').toLowerCase().includes(filterChangedBy.toLowerCase())) return false;
    if (filterStatus !== 'ALL' && e.newStatus !== filterStatus) return false;
    return true;
  });

  if (loading) return <p style={{ color: '#64748B' }}>Loading audit log...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Audit Log</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
        Complete record of all offer status changes across the platform
      </p>

      {/* Drill-down banner */}
      {drillDownOffer && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
        }}>
          <span style={{ color: '#1D4ED8' }}>Showing history for offer: <strong>{drillDownOffer.slice(0, 12)}...</strong></span>
          <button onClick={clearDrillDown} style={{
            padding: '0.25rem 0.75rem', background: 'white', color: '#1D4ED8',
            border: '1px solid #BFDBFE', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
          }}>Show All</button>
        </div>
      )}

      {/* Filters */}
      {!drillDownOffer && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Filter by Offer ID..."
            value={filterOfferId}
            onChange={e => setFilterOfferId(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', width: '200px' }}
          />
          <input
            placeholder="Filter by Changed By..."
            value={filterChangedBy}
            onChange={e => setFilterChangedBy(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', width: '200px' }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
            padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem',
          }}>
            <option value="ALL">All Statuses</option>
            {['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'LIVE', 'PAUSED', 'EXPIRED', 'RETIRED'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <span style={{ color: '#64748B', fontSize: '0.85rem', alignSelf: 'center' }}>{filtered.length} entries</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748B', margin: 0 }}>No audit entries found.</p>
        </div>
      ) : (
        <div className="table-scroll" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={th}>Timestamp</th>
                <th style={th}>Offer ID</th>
                <th style={th}>Previous Status</th>
                <th style={th}>New Status</th>
                <th style={th}>Changed By</th>
                <th style={th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={td}>{new Date(entry.changedAt).toLocaleString()}</td>
                  <td style={td}>
                    <button onClick={() => loadByOffer(entry.offerId)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#3B82F6', fontSize: '0.8rem', textDecoration: 'underline',
                    }}>
                      {entry.offerId?.slice(0, 8)}...
                    </button>
                  </td>
                  <td style={td}>
                    {entry.previousStatus ? (
                      <StatusBadge status={entry.previousStatus} />
                    ) : <span style={{ color: '#94A3B8' }}>-</span>}
                  </td>
                  <td style={td}><StatusBadge status={entry.newStatus} /></td>
                  <td style={td}>{entry.changedBy || 'system'}</td>
                  <td style={{ ...td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.reason || '-'}
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span style={{
    padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
    color: 'white', background: STATUS_COLORS[status] || '#6B7280',
  }}>
    {status.replace(/_/g, ' ')}
  </span>
);

const th: React.CSSProperties = { padding: '0.6rem 0.75rem', textAlign: 'left', color: '#475569', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.6rem 0.75rem', color: '#0F172A' };

export default AuditLog;
