-- V6__seed_campaign_audit_log.sql
-- Add campaign_audit_log table and seed realistic status history for demo campaigns
-- Safe / idempotent: CREATE IF NOT EXISTS; unique constraint guards inserts

-- ===================== CAMPAIGN AUDIT LOG TABLE =====================
CREATE TABLE IF NOT EXISTS offers.campaign_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES offers.campaigns(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      VARCHAR(255),
    reason          TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_audit_campaign_id ON offers.campaign_audit_log (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_changed_at  ON offers.campaign_audit_log (changed_at DESC);

-- Unique constraint so ON CONFLICT DO NOTHING actually protects against re-runs
ALTER TABLE offers.campaign_audit_log
    ADD CONSTRAINT uq_campaign_audit_transition
    UNIQUE (campaign_id, previous_status, new_status);

-- ===================== AUDIT TRAIL FOR SEEDED CAMPAIGNS =====================

-- Campaign 1: Summer Essentials 2026 (ACTIVE)
-- Lifecycle: DRAFT → SCHEDULED → ACTIVE
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000001', NULL,        'DRAFT',     'admin@platform.com',  'Campaign created',                        NOW() - INTERVAL '16 days'),
  ('c0000001-0000-0000-0000-000000000001', 'DRAFT',     'SCHEDULED', 'admin@platform.com',  'Reviewed and approved for summer push',   NOW() - INTERVAL '15 days'),
  ('c0000001-0000-0000-0000-000000000001', 'SCHEDULED', 'ACTIVE',    'system@platform.com', 'Auto-activated at campaign start date',   NOW() - INTERVAL '14 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- Campaign 2: Dining & Coffee Rewards (ACTIVE)
-- Lifecycle: DRAFT → SCHEDULED → ACTIVE
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000002', NULL,        'DRAFT',     'admin@platform.com',  'Campaign created',                        NOW() - INTERVAL '9 days'),
  ('c0000001-0000-0000-0000-000000000002', 'DRAFT',     'SCHEDULED', 'admin@platform.com',  'Reviewed and scheduled',                  NOW() - INTERVAL '8 days'),
  ('c0000001-0000-0000-0000-000000000002', 'SCHEDULED', 'ACTIVE',    'system@platform.com', 'Auto-activated at campaign start date',   NOW() - INTERVAL '7 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- Campaign 3: Fashion Forward (ACTIVE)
-- Lifecycle: DRAFT → ACTIVE (fast-tracked for season)
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000003', NULL,    'DRAFT',  'admin@platform.com', 'Campaign created',                          NOW() - INTERVAL '4 days'),
  ('c0000001-0000-0000-0000-000000000003', 'DRAFT', 'ACTIVE', 'admin@platform.com', 'Fast-tracked for new fashion season launch', NOW() - INTERVAL '2 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- Campaign 4: Travel & Adventure (SCHEDULED)
-- Lifecycle: DRAFT → SCHEDULED (awaiting launch)
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000004', NULL,    'DRAFT',     'admin@platform.com', 'Campaign created',                         NOW() - INTERVAL '7 days'),
  ('c0000001-0000-0000-0000-000000000004', 'DRAFT', 'SCHEDULED', 'admin@platform.com', 'Approved and scheduled for travel season', NOW() - INTERVAL '6 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- Campaign 5: Tech & Entertainment Bundle (ACTIVE)
-- Lifecycle: DRAFT → SCHEDULED → ACTIVE
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000005', NULL,        'DRAFT',     'admin@platform.com',  'Campaign created',                       NOW() - INTERVAL '7 days'),
  ('c0000001-0000-0000-0000-000000000005', 'DRAFT',     'SCHEDULED', 'admin@platform.com',  'Reviewed and scheduled',                 NOW() - INTERVAL '6 days'),
  ('c0000001-0000-0000-0000-000000000005', 'SCHEDULED', 'ACTIVE',    'system@platform.com', 'Auto-activated at campaign start date',  NOW() - INTERVAL '5 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- Campaign 6: Health & Wellness Month (PAUSED)
-- Lifecycle: DRAFT → SCHEDULED → ACTIVE → PAUSED (budget review)
INSERT INTO offers.campaign_audit_log (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
  ('c0000001-0000-0000-0000-000000000006', NULL,        'DRAFT',     'admin@platform.com',  'Campaign created',                        NOW() - INTERVAL '32 days'),
  ('c0000001-0000-0000-0000-000000000006', 'DRAFT',     'SCHEDULED', 'admin@platform.com',  'Approved and scheduled',                  NOW() - INTERVAL '31 days'),
  ('c0000001-0000-0000-0000-000000000006', 'SCHEDULED', 'ACTIVE',    'system@platform.com', 'Auto-activated at campaign start date',   NOW() - INTERVAL '30 days'),
  ('c0000001-0000-0000-0000-000000000006', 'ACTIVE',    'PAUSED',    'admin@platform.com',  'Paused pending quarterly budget review',  NOW() - INTERVAL '10 days')
ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;
