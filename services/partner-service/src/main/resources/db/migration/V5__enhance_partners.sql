-- V5: Approve pending merchants, fix partner tiers, enrich commercial pipeline
-- Safe / idempotent: UPDATE by ID, INSERT uses ON CONFLICT DO NOTHING

-- ===================== FIX SAINSBURY'S TIER =====================
-- V3 used wrong business_name ('Sainsbury''s Supermarkets Ltd'); actual name is 'J Sainsbury PLC'
-- Update directly by ID to ensure GOLD tier is applied
UPDATE partners.partners SET tier = 'GOLD' WHERE id = '10000000-0000-0000-0000-000000000002';

-- ===================== PROMOTE HIGH-VOLUME PARTNERS TO SILVER =====================
-- Costa Coffee, Nandos, and Boots have significant transaction volumes → upgrade to SILVER
-- Boots: large health/pharmacy partner with strong cashback activity
UPDATE partners.partners
SET tier = 'SILVER'
WHERE id IN (
    '10000000-0000-0000-0000-000000000004',  -- Costa Coffee
    '10000000-0000-0000-0000-000000000007',  -- Nandos
    '10000000-0000-0000-0000-000000000014'   -- Boots
);

-- ===================== APPROVE PENDING MERCHANTS =====================

-- MasterChef Experience → powers Pizza Express dining offers in demo
UPDATE partners.partners
SET status   = 'APPROVED',
    logo_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop'
WHERE id = '10000000-0000-0000-0000-000000000008';

-- PureGym → powers Holland & Barrett vitamins and Spring Fitness offers in demo
UPDATE partners.partners
SET status   = 'APPROVED',
    logo_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop'
WHERE id = '10000000-0000-0000-0000-000000000013';

-- ===================== AUDIT TRAIL FOR NEWLY APPROVED MERCHANTS =====================
INSERT INTO partners.partner_audit_log (partner_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
    ('10000000-0000-0000-0000-000000000008',
     'PENDING', 'APPROVED', 'colleague@demo.com',
     'KYB checks passed. Company documentation, insurance and food hygiene certificates verified.',
     NOW() - INTERVAL '2 days'),
    ('10000000-0000-0000-0000-000000000013',
     'PENDING', 'APPROVED', 'colleague@demo.com',
     'KYB checks passed. Gym licence, public liability insurance and health & safety report verified.',
     NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ===================== ENRICH COMMERCIAL CUSTOMER PIPELINE =====================
-- Three new commercial customers to show growing enterprise pipeline for exec dashboard
INSERT INTO partners.commercial_customers
    (company_name, crn, contact_name, contact_email, industry, annual_spend_gbp, status)
VALUES
    ('Meridian Dining Group',
     '67890123', 'Patricia Wells', 'p.wells@meridiandining.co.uk',
     'Hospitality', 3200000.00, 'KYB_IN_PROGRESS'),

    ('FitNation Gyms Ltd',
     '78901234', 'Ryan Scott', 'ryan.scott@fitnation.co.uk',
     'Health', 420000.00, 'PENDING_ONBOARDING'),

    ('NovaTech Electronics UK',
     '89012345', 'Aisha Rahman', 'a.rahman@novatechuk.com',
     'Technology', 1800000.00, 'APPROVED')
ON CONFLICT DO NOTHING;
