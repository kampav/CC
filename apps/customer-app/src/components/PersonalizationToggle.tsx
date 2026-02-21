import React from 'react';
import { usePersonalization } from '../context/PersonalizationContext';

const PersonalizationToggle: React.FC = () => {
  const { mode, setMode } = usePersonalization();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>Mode:</span>
      <div style={{
        display: 'flex', background: '#F1F5F9', borderRadius: '20px',
        padding: '2px', gap: '2px',
      }}>
        <button
          onClick={() => setMode('rule-based')}
          style={{
            padding: '0.25rem 0.75rem', borderRadius: '18px', border: 'none',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            background: mode === 'rule-based' ? '#475569' : 'transparent',
            color: mode === 'rule-based' ? 'white' : '#64748B',
            transition: 'all 0.2s',
          }}
        >
          Rules
        </button>
        <button
          onClick={() => setMode('ai')}
          style={{
            padding: '0.25rem 0.75rem', borderRadius: '18px', border: 'none',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            background: mode === 'ai' ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : 'transparent',
            color: mode === 'ai' ? 'white' : '#64748B',
            transition: 'all 0.2s',
          }}
        >
          AI
        </button>
      </div>
    </div>
  );
};

export default PersonalizationToggle;
