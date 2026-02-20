import React, { useState } from 'react';
import { api } from '../api/client';

interface Suggestion {
  title: string;
  category: string;
  cashbackRate: number;
  rationale: string;
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#94A3B8', GOLD: '#D97706', PLATINUM: '#6366F1',
};

const AIOfferSuggestions: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchSuggestions() {
    setLoading(true);
    setError('');
    try {
      const result = await api.getNextOfferSuggestions();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>AI Offer Suggestions</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
        Discover your next winning cashback offer — powered by AI analysis of platform trends
      </p>

      {!data && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#0F172A' }}>What should I offer next?</h3>
          <p style={{ margin: '0 0 1.5rem', color: '#64748B' }}>
            Get AI-powered recommendations based on platform trends, customer behaviour, and your current offer portfolio.
          </p>
          <button
            onClick={fetchSuggestions}
            style={{ padding: '0.75rem 2rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Generate Suggestions
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <p style={{ color: '#64748B' }}>Analysing platform data...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {data && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Chip label={`Source: ${data.source}`} color="#7C3AED" />
            <Chip label={`Top performing: ${data.topPerformingCategory}`} color="#059669" />
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {(data.suggestions || []).map((s: Suggestion, i: number) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', color: '#0F172A', fontSize: '1rem' }}>{s.title}</h3>
                    <span style={{ fontSize: '0.8rem', background: '#EDE9FE', color: '#7C3AED', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                      {s.category}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{s.cashbackRate}%</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>cashback</p>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontStyle: 'italic' }}>{s.rationale}</p>
              </div>
            ))}
          </div>

          {data.categoryStats && Object.keys(data.categoryStats).length > 0 && (
            <>
              <h3 style={{ margin: '0 0 1rem', color: '#0F172A', fontSize: '1rem' }}>Your Current Category Coverage</h3>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  {Object.entries(data.categoryStats).map(([cat, stats]: [string, any]) => (
                    <div key={cat} style={{ textAlign: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>{cat}</p>
                      <p style={{ margin: '0 0 0.1rem', fontSize: '1.25rem', fontWeight: 700, color: stats.live > 0 ? '#059669' : '#94A3B8' }}>{stats.live}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>live of {stats.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={fetchSuggestions}
              style={{ padding: '0.6rem 1.5rem', background: 'white', color: '#7C3AED', border: '1px solid #7C3AED', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}
            >
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Chip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span style={{ fontSize: '0.8rem', background: `${color}15`, color, padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: 500 }}>
    {label}
  </span>
);

export default AIOfferSuggestions;
