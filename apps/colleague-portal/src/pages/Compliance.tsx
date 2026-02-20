import React, { useState } from 'react';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'FCA' | 'ASA' | 'INTERNAL';
  severity: 'BLOCK' | 'WARN' | 'INFO';
  enabled: boolean;
  config: Record<string, any>;
}

const DEFAULT_RULES: ComplianceRule[] = [
  {
    id: 'fca-001',
    name: 'FCA Fair Value Assessment',
    description: 'Cashback rate must not exceed 30% to ensure fair value for consumers. Offers exceeding this threshold are automatically flagged for review.',
    category: 'FCA',
    severity: 'BLOCK',
    enabled: true,
    config: { maxCashbackRate: 30 },
  },
  {
    id: 'fca-002',
    name: 'FCA Clear Terms Requirement',
    description: 'All offers must include clear terms and conditions before going live. Missing terms will block the offer from being published.',
    category: 'FCA',
    severity: 'BLOCK',
    enabled: true,
    config: { requireTerms: true },
  },
  {
    id: 'asa-001',
    name: 'ASA Misleading Claims Check',
    description: 'Offer titles and descriptions are scanned for potentially misleading language such as "guaranteed", "risk-free", or "unlimited".',
    category: 'ASA',
    severity: 'WARN',
    enabled: true,
    config: { blockedWords: ['guaranteed', 'risk-free', 'unlimited', 'free money'] },
  },
  {
    id: 'asa-002',
    name: 'ASA Price Accuracy',
    description: 'Cashback rates advertised must match the actual rate configured. Cross-validated during compliance check.',
    category: 'ASA',
    severity: 'BLOCK',
    enabled: true,
    config: {},
  },
  {
    id: 'int-001',
    name: 'Prohibited Categories',
    description: 'Offers in prohibited categories (Gambling, Tobacco, Weapons, Adult Content) are automatically blocked.',
    category: 'INTERNAL',
    severity: 'BLOCK',
    enabled: true,
    config: { prohibitedCategories: ['Gambling', 'Tobacco', 'Weapons', 'Adult Content'] },
  },
  {
    id: 'int-002',
    name: 'Maximum Offer Duration',
    description: 'Offers should not run for more than 90 days. Offers exceeding this duration receive a warning.',
    category: 'INTERNAL',
    severity: 'WARN',
    enabled: true,
    config: { maxDurationDays: 90 },
  },
  {
    id: 'int-003',
    name: 'Minimum Description Length',
    description: 'Offers must have a description of at least 20 characters to ensure adequate information for consumers.',
    category: 'INTERNAL',
    severity: 'INFO',
    enabled: false,
    config: { minLength: 20 },
  },
  {
    id: 'int-004',
    name: 'Budget Cap Warning',
    description: 'Campaign spend approaching 80% of budget triggers a warning notification to campaign managers.',
    category: 'INTERNAL',
    severity: 'WARN',
    enabled: true,
    config: { thresholdPercent: 80 },
  },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  BLOCK: { bg: '#FEE2E2', text: '#DC2626' },
  WARN: { bg: '#FEF3C7', text: '#D97706' },
  INFO: { bg: '#DBEAFE', text: '#2563EB' },
};

const CATEGORY_LABELS: Record<string, string> = {
  FCA: 'Financial Conduct Authority',
  ASA: 'Advertising Standards Authority',
  INTERNAL: 'Internal Policy',
};

const Compliance: React.FC = () => {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  const filtered = filter === 'ALL' ? rules : rules.filter(r => r.category === filter);
  const activeCount = rules.filter(r => r.enabled).length;
  const blockCount = rules.filter(r => r.enabled && r.severity === 'BLOCK').length;

  return (
    <div>
      <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Compliance Rules</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
        Configure automated compliance checks applied during offer review
      </p>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem 1.5rem', flex: 1 }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Active Rules</p>
          <p style={{ margin: '0.3rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>{activeCount}/{rules.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem 1.5rem', flex: 1 }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Blocking Rules</p>
          <p style={{ margin: '0.3rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#DC2626' }}>{blockCount}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem 1.5rem', flex: 1 }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>Regulatory Bodies</p>
          <p style={{ margin: '0.3rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#1E40AF' }}>FCA, ASA</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['ALL', 'FCA', 'ASA', 'INTERNAL'].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', cursor: 'pointer',
            border: filter === c ? '2px solid #0F172A' : '1px solid #D1D5DB',
            background: filter === c ? '#0F172A' : 'white',
            color: filter === c ? 'white' : '#374151',
          }}>
            {c === 'ALL' ? 'All Rules' : c}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {filtered.map(rule => (
          <div key={rule.id} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0',
            padding: '1rem 1.25rem', opacity: rule.enabled ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                  background: SEVERITY_COLORS[rule.severity].bg, color: SEVERITY_COLORS[rule.severity].text,
                }}>{rule.severity}</span>
                <span style={{
                  padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem',
                  background: '#F1F5F9', color: '#475569',
                }}>{rule.category}</span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>{rule.name}</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </label>
            </div>
            {expanded === rule.id && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.5 }}>{rule.description}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  <strong>Source:</strong> {CATEGORY_LABELS[rule.category]} | <strong>ID:</strong> {rule.id}
                </p>
                {Object.keys(rule.config).length > 0 && (
                  <pre style={{ margin: '0.5rem 0 0', padding: '0.5rem', background: '#F8FAFC', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>
                    {JSON.stringify(rule.config, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Compliance;
