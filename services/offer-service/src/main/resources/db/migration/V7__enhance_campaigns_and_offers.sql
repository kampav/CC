-- V7: Add completed historical campaign, new active campaign, new offers, update metrics
-- Safe / idempotent: all INSERTs use ON CONFLICT DO NOTHING; UPDATEs are idempotent by ID

-- ===================== NEW CAMPAIGNS =====================

INSERT INTO offers.campaigns
    (id, name, description, status, target_segment, target_brands, priority,
     start_date, end_date, budget_gbp, spent_gbp, created_by)
VALUES
    -- COMPLETED historical campaign — provides analytics depth for exec dashboard
    ('c0000001-0000-0000-0000-000000000007',
     'Winter Warmers 2025',
     'Festive cashback rewards on dining, travel, and lifestyle — Q4 2025 campaign now complete.',
     'COMPLETED', 'ALL', 'BRAND_A,BRAND_B,BRAND_C', 9,
     NOW() - INTERVAL '90 days', NOW() - INTERVAL '32 days',
     40000.00, 38750.00, 'admin@platform.com'),

    -- NEW ACTIVE campaign — Spring wellness push
    ('c0000001-0000-0000-0000-000000000008',
     'Spring Fitness & Wellness',
     'Kickstart the year with cashback on gym memberships, health supplements, and outdoor activities.',
     'ACTIVE', 'ALL', 'BRAND_C,BRAND_D', 7,
     NOW() - INTERVAL '3 days', NOW() + INTERVAL '57 days',
     20000.00, 1240.00, 'admin@platform.com')

ON CONFLICT (id) DO NOTHING;

-- ===================== NEW OFFERS =====================

INSERT INTO offers.offers
    (id, merchant_id, title, description, offer_type, category,
     cashback_rate, cashback_cap, min_spend, currency, terms,
     status, brand, image_url, redemption_type,
     max_activations, current_activations, start_date, end_date, created_by)
VALUES
    -- PureGym membership cashback (now approved)
    ('a0000010-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000013',
     '20% Cashback on PureGym Membership',
     'Join PureGym and earn 20% cashback on your first month''s membership. No contract, no joining fee — just great value fitness.',
     'CASHBACK', 'Health & Wellness', 20.00, 12.00, 15.00, 'GBP',
     'New PureGym members only. First month membership fee only. Excludes premium locations.',
     'LIVE', 'BRAND_C',
     'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop',
     'CARD_LINKED', 2000, 143,
     NOW() - INTERVAL '3 days', NOW() + INTERVAL '57 days',
     'merchant@puregym.com'),

    -- M&S Food — premium grocery for PREMIER segment
    ('a0000010-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000002',
     '8% Cashback at M&S Food',
     'Earn 8% cashback at Marks & Spencer Food halls and online. Premium ready meals, fresh produce and bakery all qualify.',
     'CASHBACK', 'Groceries', 8.00, 25.00, 25.00, 'GBP',
     'M&S Food only (not clothing or home). Excludes alcohol. Max cashback £25 per transaction.',
     'LIVE', 'BRAND_A',
     'https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=250&fit=crop',
     'CARD_LINKED', 3000, 97,
     NOW() - INTERVAL '2 days', NOW() + INTERVAL '58 days',
     'merchant@sainsburys.com')

ON CONFLICT (id) DO NOTHING;

-- ===================== CAMPAIGN → OFFER LINKS =====================

INSERT INTO offers.campaign_offers (campaign_id, offer_id)
VALUES
    -- Spring Fitness & Wellness
    ('c0000001-0000-0000-0000-000000000008', 'a0000009-0000-0000-0000-000000000003'),  -- H&B Vitamins
    ('c0000001-0000-0000-0000-000000000008', 'a0000010-0000-0000-0000-000000000001'),  -- PureGym
    -- Summer Essentials (add M&S Food)
    ('c0000001-0000-0000-0000-000000000001', 'a0000010-0000-0000-0000-000000000002'),  -- M&S Food
    -- Winter Warmers (historical campaign links)
    ('c0000001-0000-0000-0000-000000000007', 'a0000003-0000-0000-0000-000000000001'),  -- Costa Coffee
    ('c0000001-0000-0000-0000-000000000007', 'a0000003-0000-0000-0000-000000000002'),  -- Nandos
    ('c0000001-0000-0000-0000-000000000007', 'a0000004-0000-0000-0000-000000000001'),  -- Booking.com
    ('c0000001-0000-0000-0000-000000000007', 'a0000007-0000-0000-0000-000000000002')   -- Boots
ON CONFLICT DO NOTHING;

-- ===================== CAMPAIGN AUDIT TRAIL =====================

INSERT INTO offers.campaign_audit_log
    (campaign_id, previous_status, new_status, changed_by, reason, changed_at)
VALUES
    -- Winter Warmers — full lifecycle (DRAFT → SCHEDULED → ACTIVE → COMPLETED)
    ('c0000001-0000-0000-0000-000000000007',
     NULL,        'DRAFT',     'admin@platform.com',
     'Campaign created for Q4 2025 festive push',
     NOW() - INTERVAL '92 days'),
    ('c0000001-0000-0000-0000-000000000007',
     'DRAFT',     'SCHEDULED', 'admin@platform.com',
     'Approved by campaigns committee — ready for festive activation',
     NOW() - INTERVAL '91 days'),
    ('c0000001-0000-0000-0000-000000000007',
     'SCHEDULED', 'ACTIVE',    'system@platform.com',
     'Auto-activated at campaign start date',
     NOW() - INTERVAL '90 days'),
    ('c0000001-0000-0000-0000-000000000007',
     'ACTIVE',    'COMPLETED', 'system@platform.com',
     'Campaign end date reached — 97% budget utilised, all objectives met',
     NOW() - INTERVAL '32 days'),

    -- Spring Fitness & Wellness — new campaign lifecycle
    ('c0000001-0000-0000-0000-000000000008',
     NULL,        'DRAFT',     'admin@platform.com',
     'Campaign created for Q1 2026 wellness initiative',
     NOW() - INTERVAL '5 days'),
    ('c0000001-0000-0000-0000-000000000008',
     'DRAFT',     'SCHEDULED', 'admin@platform.com',
     'Reviewed and approved — PureGym and H&B confirmed as campaign partners',
     NOW() - INTERVAL '4 days'),
    ('c0000001-0000-0000-0000-000000000008',
     'SCHEDULED', 'ACTIVE',    'system@platform.com',
     'Auto-activated at campaign start date',
     NOW() - INTERVAL '3 days')

ON CONFLICT (campaign_id, previous_status, new_status) DO NOTHING;

-- ===================== UPDATE CAMPAIGN BUDGET SPENT =====================
-- Reflect accumulated cashback paid out across all active personas

UPDATE offers.campaigns SET spent_gbp = 19800.00 WHERE id = 'c0000001-0000-0000-0000-000000000001';  -- Summer Essentials
UPDATE offers.campaigns SET spent_gbp =  8420.00 WHERE id = 'c0000001-0000-0000-0000-000000000002';  -- Dining & Coffee
UPDATE offers.campaigns SET spent_gbp =  4350.00 WHERE id = 'c0000001-0000-0000-0000-000000000003';  -- Fashion Forward
UPDATE offers.campaigns SET spent_gbp =  5980.00 WHERE id = 'c0000001-0000-0000-0000-000000000005';  -- Tech & Entertainment

-- ===================== UPDATE OFFER ACTIVATION COUNTS =====================
-- Reflect new persona activations being added in redemption-service V5

UPDATE offers.offers SET current_activations = current_activations + 2
    WHERE id = 'a0000001-0000-0000-0000-000000000001';  -- Tesco 10% (+Emma, +Isla)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000002-0000-0000-0000-000000000003';  -- H&M 8% (+Isla)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000003-0000-0000-0000-000000000001';  -- Costa 25% (+Emma)

UPDATE offers.offers SET current_activations = current_activations + 2
    WHERE id = 'a0000003-0000-0000-0000-000000000002';  -- Nandos 12% (+Emma, +Grace)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000001-0000-0000-0000-000000000003';  -- Sainsbury's 15% (+Frank)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000009-0000-0000-0000-000000000008';  -- Pret 30% (+Frank)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000004-0000-0000-0000-000000000001';  -- Booking.com (+Grace)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000009-0000-0000-0000-000000000002';  -- Pizza Express (+Grace)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000004-0000-0000-0000-000000000002';  -- SkyWings Flights (+Grace)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000005-0000-0000-0000-000000000001';  -- Currys 5% (+Harry)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000009-0000-0000-0000-000000000006';  -- Amazon Electronics (+Harry)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000009-0000-0000-0000-000000000007';  -- NOW Entertainment (+Harry)

UPDATE offers.offers SET current_activations = current_activations + 1
    WHERE id = 'a0000009-0000-0000-0000-000000000005';  -- ASOS 15% (+Emma)
