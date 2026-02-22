-- V5: Complete redemption data for the 5 personas missing from V2/V3
-- Adds activations, transactions, cashback credits, and revenue ledger entries for:
--   Emma Hayes  (c0000000-…-0009) — MASS_AFFLUENT, GROWING, CONVENIENCE_SHOPPER
--   Frank Osei  (c0000000-…-0010) — MASS_MARKET,   AT_RISK,  DEAL_SEEKER
--   Grace Liu   (c0000000-…-0011) — PREMIER,        MATURE,   EXPERIENCE_SEEKER
--   Harry Patel (c0000000-…-0012) — MASS_AFFLUENT, GROWING,  BRAND_LOYAL
--   Isla Brown  (c0000000-…-0013) — MASS_MARKET,   NEW,      CONVENIENCE_SHOPPER
-- Safe / idempotent: all INSERTs use ON CONFLICT DO NOTHING

-- =====================================================================
-- ACTIVATIONS
-- =====================================================================

-- Emma Hayes: Fashion + Dining convenience shopper
INSERT INTO redemptions.activations
    (id, customer_id, offer_id, offer_title, merchant_id,
     cashback_rate, cashback_cap, min_spend, status, activated_at, expires_at)
VALUES
    -- ASOS 15% (offer a0000009-...-0005 points to H&M merchant for demo)
    ('b0000009-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000009',
     'a0000009-0000-0000-0000-000000000005',
     '15% Cashback at ASOS',
     '10000000-0000-0000-0000-000000000006',
     15.00, 30.00, 30.00,
     'ACTIVE', NOW() - INTERVAL '18 days', NOW() + INTERVAL '22 days'),

    -- Nandos 12%
    ('b0000009-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000009',
     'a0000003-0000-0000-0000-000000000002',
     '12% Back at Nandos',
     '10000000-0000-0000-0000-000000000007',
     12.00, 20.00, 15.00,
     'ACTIVE', NOW() - INTERVAL '14 days', NOW() + INTERVAL '24 days'),

    -- Costa Coffee 25%
    ('b0000009-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000009',
     'a0000003-0000-0000-0000-000000000001',
     '25% Cashback at Costa Coffee',
     '10000000-0000-0000-0000-000000000004',
     25.00, 10.00, 3.00,
     'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '29 days')

ON CONFLICT (customer_id, offer_id) DO NOTHING;

-- Frank Osei: AT_RISK deal seeker — mix of active and expired activations
INSERT INTO redemptions.activations
    (id, customer_id, offer_id, offer_title, merchant_id,
     cashback_rate, cashback_cap, min_spend, status, activated_at, expires_at)
VALUES
    -- Pret 30% — EXPIRED (high cashback attracted him but offer has lapsed)
    ('b0000010-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000010',
     'a0000009-0000-0000-0000-000000000008',
     '30% Off Pret a Manger',
     '10000000-0000-0000-0000-000000000007',
     30.00, 8.00, 5.00,
     'EXPIRED', NOW() - INTERVAL '40 days', NOW() - INTERVAL '13 days'),

    -- Sainsbury's 15% — ACTIVE but no transactions (dormant behaviour, AT_RISK signal)
    ('b0000010-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000010',
     'a0000001-0000-0000-0000-000000000003',
     '15% Cashback at Sainsburys',
     '10000000-0000-0000-0000-000000000002',
     15.00, 30.00, 30.00,
     'ACTIVE', NOW() - INTERVAL '8 days', NOW() + INTERVAL '4 days'),

    -- Tesco 10% — ACTIVE, one old transaction showing lapsed engagement
    ('b0000010-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000010',
     'a0000001-0000-0000-0000-000000000001',
     '10% Cashback at Tesco',
     '00000000-0000-0000-0000-000000000001',
     10.00, 25.00, 20.00,
     'ACTIVE', NOW() - INTERVAL '22 days', NOW() + INTERVAL '25 days')

ON CONFLICT (customer_id, offer_id) DO NOTHING;

-- Grace Liu: PREMIER experience seeker — high-value travel and dining
INSERT INTO redemptions.activations
    (id, customer_id, offer_id, offer_title, merchant_id,
     cashback_rate, cashback_cap, min_spend, status, activated_at, expires_at)
VALUES
    -- Booking.com £50 off — COMPLETED (hotel stay done)
    ('b0000011-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000011',
     'a0000004-0000-0000-0000-000000000001',
     '£50 Off Booking.com Hotels',
     '10000000-0000-0000-0000-000000000005',
     NULL, 50.00, 200.00,
     'COMPLETED', NOW() - INTERVAL '25 days', NOW() + INTERVAL '26 days'),

    -- Pizza Express 18%
    ('b0000011-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     'a0000009-0000-0000-0000-000000000002',
     '18% Cashback at Pizza Express',
     '10000000-0000-0000-0000-000000000008',
     18.00, 15.00, 20.00,
     'ACTIVE', NOW() - INTERVAL '20 days', NOW() + INTERVAL '26 days'),

    -- SkyWings Flights 7%
    ('b0000011-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000011',
     'a0000004-0000-0000-0000-000000000002',
     '7% Back on Flights',
     '10000000-0000-0000-0000-000000000009',
     7.00, 100.00, 100.00,
     'ACTIVE', NOW() - INTERVAL '15 days', NOW() + INTERVAL '18 days'),

    -- Nandos 12% (dining alongside travel — experience seeker pattern)
    ('b0000011-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000011',
     'a0000003-0000-0000-0000-000000000002',
     '12% Back at Nandos',
     '10000000-0000-0000-0000-000000000007',
     12.00, 20.00, 15.00,
     'ACTIVE', NOW() - INTERVAL '12 days', NOW() + INTERVAL '24 days')

ON CONFLICT (customer_id, offer_id) DO NOTHING;

-- Harry Patel: BRAND_LOYAL electronics + entertainment
INSERT INTO redemptions.activations
    (id, customer_id, offer_id, offer_title, merchant_id,
     cashback_rate, cashback_cap, min_spend, status, activated_at, expires_at)
VALUES
    -- Currys 5%
    ('b0000012-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     'a0000005-0000-0000-0000-000000000001',
     '5% Cashback at Currys',
     '10000000-0000-0000-0000-000000000010',
     5.00, 75.00, 50.00,
     'ACTIVE', NOW() - INTERVAL '28 days', NOW() + INTERVAL '21 days'),

    -- Amazon Electronics 3%
    ('b0000012-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000012',
     'a0000009-0000-0000-0000-000000000006',
     '3% Cashback on Amazon Electronics',
     '10000000-0000-0000-0000-000000000010',
     3.00, 50.00, 20.00,
     'ACTIVE', NOW() - INTERVAL '20 days', NOW() + INTERVAL '20 days'),

    -- NOW Entertainment (free trial — brand affinity with entertainment)
    ('b0000012-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000012',
     'a0000009-0000-0000-0000-000000000007',
     '2 Months Free NOW Entertainment',
     '10000000-0000-0000-0000-000000000012',
     NULL, NULL, NULL,
     'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '25 days')

ON CONFLICT (customer_id, offer_id) DO NOTHING;

-- Isla Brown: NEW customer, simple convenience purchases
INSERT INTO redemptions.activations
    (id, customer_id, offer_id, offer_title, merchant_id,
     cashback_rate, cashback_cap, min_spend, status, activated_at, expires_at)
VALUES
    -- Tesco 10% — first activation
    ('b0000013-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000013',
     'a0000001-0000-0000-0000-000000000001',
     '10% Cashback at Tesco',
     '00000000-0000-0000-0000-000000000001',
     10.00, 25.00, 20.00,
     'ACTIVE', NOW() - INTERVAL '6 days', NOW() + INTERVAL '25 days'),

    -- H&M 8% — fashion as secondary spend
    ('b0000013-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000013',
     'a0000002-0000-0000-0000-000000000003',
     '8% Cashback at H&M',
     '10000000-0000-0000-0000-000000000006',
     8.00, 20.00, 15.00,
     'ACTIVE', NOW() - INTERVAL '4 days', NOW() + INTERVAL '28 days')

ON CONFLICT (customer_id, offer_id) DO NOTHING;


-- =====================================================================
-- TRANSACTIONS
-- =====================================================================

INSERT INTO redemptions.transactions
    (id, activation_id, customer_id, merchant_id,
     amount, currency, card_last_four, description, status, transaction_date)
VALUES

    -- ===== Emma Hayes (ASOS + Nandos + Costa) =====
    ('f0000009-0000-0000-0000-000000000001',
     'b0000009-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000009',
     '10000000-0000-0000-0000-000000000006',
     65.00, 'GBP', '2211', 'ASOS - Summer Dress + Sandals', 'CASHBACK_CREDITED', NOW() - INTERVAL '15 days'),

    ('f0000009-0000-0000-0000-000000000002',
     'b0000009-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000009',
     '10000000-0000-0000-0000-000000000006',
     42.50, 'GBP', '2211', 'ASOS - Linen Trousers', 'CASHBACK_CREDITED', NOW() - INTERVAL '8 days'),

    ('f0000009-0000-0000-0000-000000000003',
     'b0000009-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000009',
     '10000000-0000-0000-0000-000000000007',
     28.50, 'GBP', '2211', 'Nandos - Dinner for Two', 'CASHBACK_CREDITED', NOW() - INTERVAL '11 days'),

    ('f0000009-0000-0000-0000-000000000004',
     'b0000009-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000009',
     '10000000-0000-0000-0000-000000000004',
     4.90, 'GBP', '2211', 'Costa Coffee - Morning Flat White', 'CASHBACK_CREDITED', NOW() - INTERVAL '7 days'),

    -- ===== Frank Osei (Pret expired + Tesco old/lapsed) =====
    -- Pret transaction while offer was active (now expired)
    ('f0000010-0000-0000-0000-000000000001',
     'b0000010-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000010',
     '10000000-0000-0000-0000-000000000007',
     6.50, 'GBP', '8866', 'Pret A Manger - Sandwich + Coffee', 'CASHBACK_CREDITED', NOW() - INTERVAL '36 days'),

    -- Tesco transaction (early on, now lapsed — AT_RISK signal)
    ('f0000010-0000-0000-0000-000000000002',
     'b0000010-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001',
     34.20, 'GBP', '8866', 'Tesco - Weekly Essentials', 'CASHBACK_CREDITED', NOW() - INTERVAL '19 days'),

    -- ===== Grace Liu (Booking.com + Pizza Express x2 + SkyWings) =====
    ('f0000011-0000-0000-0000-000000000001',
     'b0000011-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000011',
     '10000000-0000-0000-0000-000000000005',
     380.00, 'GBP', '4499', 'Booking.com - Edinburgh Hotel 3 Nights', 'CASHBACK_CREDITED', NOW() - INTERVAL '22 days'),

    ('f0000011-0000-0000-0000-000000000002',
     'b0000011-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     '10000000-0000-0000-0000-000000000008',
     72.00, 'GBP', '4499', 'Pizza Express - Anniversary Dinner', 'CASHBACK_CREDITED', NOW() - INTERVAL '17 days'),

    ('f0000011-0000-0000-0000-000000000003',
     'b0000011-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     '10000000-0000-0000-0000-000000000008',
     45.50, 'GBP', '4499', 'Pizza Express - Business Lunch', 'CASHBACK_CREDITED', NOW() - INTERVAL '10 days'),

    ('f0000011-0000-0000-0000-000000000004',
     'b0000011-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000011',
     '10000000-0000-0000-0000-000000000009',
     520.00, 'GBP', '4499', 'SkyWings - Return Flight Barcelona', 'CASHBACK_CREDITED', NOW() - INTERVAL '13 days'),

    -- ===== Harry Patel (Currys x2 + Amazon Electronics) =====
    ('f0000012-0000-0000-0000-000000000001',
     'b0000012-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     '10000000-0000-0000-0000-000000000010',
     449.99, 'GBP', '6633', 'Currys - Sony WH-1000XM5 Headphones', 'CASHBACK_CREDITED', NOW() - INTERVAL '25 days'),

    ('f0000012-0000-0000-0000-000000000002',
     'b0000012-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     '10000000-0000-0000-0000-000000000010',
     129.99, 'GBP', '6633', 'Currys - Nintendo Switch Game Bundle', 'CASHBACK_CREDITED', NOW() - INTERVAL '18 days'),

    ('f0000012-0000-0000-0000-000000000003',
     'b0000012-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000012',
     '10000000-0000-0000-0000-000000000010',
     89.99, 'GBP', '6633', 'Amazon - Smart Ring + Charging Dock', 'CASHBACK_CREDITED', NOW() - INTERVAL '14 days'),

    -- ===== Isla Brown (Tesco + H&M — first-time customer) =====
    ('f0000013-0000-0000-0000-000000000001',
     'b0000013-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000013',
     '00000000-0000-0000-0000-000000000001',
     32.50, 'GBP', '1177', 'Tesco - Weekly Shop', 'CASHBACK_CREDITED', NOW() - INTERVAL '4 days'),

    ('f0000013-0000-0000-0000-000000000002',
     'b0000013-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000013',
     '10000000-0000-0000-0000-000000000006',
     44.00, 'GBP', '1177', 'H&M - Spring Wardrobe Update', 'CASHBACK_CREDITED', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- CASHBACK CREDITS
-- =====================================================================

INSERT INTO redemptions.cashback_credits
    (id, transaction_id, customer_id, offer_id, merchant_id,
     transaction_amount, cashback_rate, cashback_amount, status, credited_at)
VALUES

    -- ===== Emma Hayes =====
    -- ASOS: 65.00 × 15% = 9.75
    ('cc000009-0000-0000-0000-000000000001',
     'f0000009-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000009',
     'a0000009-0000-0000-0000-000000000005',
     '10000000-0000-0000-0000-000000000006',
     65.00, 15.00, 9.75, 'CREDITED', NOW() - INTERVAL '15 days'),

    -- ASOS: 42.50 × 15% = 6.38
    ('cc000009-0000-0000-0000-000000000002',
     'f0000009-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000009',
     'a0000009-0000-0000-0000-000000000005',
     '10000000-0000-0000-0000-000000000006',
     42.50, 15.00, 6.38, 'CREDITED', NOW() - INTERVAL '8 days'),

    -- Nandos: 28.50 × 12% = 3.42
    ('cc000009-0000-0000-0000-000000000003',
     'f0000009-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000009',
     'a0000003-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000007',
     28.50, 12.00, 3.42, 'CREDITED', NOW() - INTERVAL '11 days'),

    -- Costa: 4.90 × 25% = 1.23
    ('cc000009-0000-0000-0000-000000000004',
     'f0000009-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000009',
     'a0000003-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000004',
     4.90, 25.00, 1.23, 'CREDITED', NOW() - INTERVAL '7 days'),

    -- ===== Frank Osei =====
    -- Pret: 6.50 × 30% = 1.95 (from now-expired activation)
    ('cc000010-0000-0000-0000-000000000001',
     'f0000010-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000010',
     'a0000009-0000-0000-0000-000000000008',
     '10000000-0000-0000-0000-000000000007',
     6.50, 30.00, 1.95, 'CREDITED', NOW() - INTERVAL '36 days'),

    -- Tesco: 34.20 × 10% = 3.42
    ('cc000010-0000-0000-0000-000000000002',
     'f0000010-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000010',
     'a0000001-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     34.20, 10.00, 3.42, 'CREDITED', NOW() - INTERVAL '19 days'),

    -- ===== Grace Liu =====
    -- Booking.com: £50 fixed voucher (cashback_rate = 0.00, fixed amount)
    ('cc000011-0000-0000-0000-000000000001',
     'f0000011-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000011',
     'a0000004-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000005',
     380.00, 0.00, 50.00, 'CREDITED', NOW() - INTERVAL '22 days'),

    -- Pizza Express: 72.00 × 18% = 12.96
    ('cc000011-0000-0000-0000-000000000002',
     'f0000011-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     'a0000009-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000008',
     72.00, 18.00, 12.96, 'CREDITED', NOW() - INTERVAL '17 days'),

    -- Pizza Express: 45.50 × 18% = 8.19
    ('cc000011-0000-0000-0000-000000000003',
     'f0000011-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000011',
     'a0000009-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000008',
     45.50, 18.00, 8.19, 'CREDITED', NOW() - INTERVAL '10 days'),

    -- SkyWings: 520.00 × 7% = 36.40
    ('cc000011-0000-0000-0000-000000000004',
     'f0000011-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000011',
     'a0000004-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000009',
     520.00, 7.00, 36.40, 'CREDITED', NOW() - INTERVAL '13 days'),

    -- ===== Harry Patel =====
    -- Currys: 449.99 × 5% = 22.50
    ('cc000012-0000-0000-0000-000000000001',
     'f0000012-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     'a0000005-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000010',
     449.99, 5.00, 22.50, 'CREDITED', NOW() - INTERVAL '25 days'),

    -- Currys: 129.99 × 5% = 6.50
    ('cc000012-0000-0000-0000-000000000002',
     'f0000012-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000012',
     'a0000005-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000010',
     129.99, 5.00, 6.50, 'CREDITED', NOW() - INTERVAL '18 days'),

    -- Amazon Electronics: 89.99 × 3% = 2.70
    ('cc000012-0000-0000-0000-000000000003',
     'f0000012-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000012',
     'a0000009-0000-0000-0000-000000000006',
     '10000000-0000-0000-0000-000000000010',
     89.99, 3.00, 2.70, 'CREDITED', NOW() - INTERVAL '14 days'),

    -- ===== Isla Brown =====
    -- Tesco: 32.50 × 10% = 3.25
    ('cc000013-0000-0000-0000-000000000001',
     'f0000013-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000013',
     'a0000001-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     32.50, 10.00, 3.25, 'CREDITED', NOW() - INTERVAL '4 days'),

    -- H&M: 44.00 × 8% = 3.52
    ('cc000013-0000-0000-0000-000000000002',
     'f0000013-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000013',
     'a0000002-0000-0000-0000-000000000003',
     '10000000-0000-0000-0000-000000000006',
     44.00, 8.00, 3.52, 'CREDITED', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- REVENUE LEDGER
-- Bank earns commission on each cashback credit (tier-based rate)
-- Tesco/Sainsbury's = GOLD (10%), Nike/Costa/Booking/H&M/Nandos/Boots = SILVER (12%)
-- All others = BRONZE (15%)
-- =====================================================================

INSERT INTO redemptions.revenue_ledger
    (cashback_credit_id, merchant_id, offer_id, customer_id,
     cashback_amount, commission_rate, bank_revenue, merchant_tier, ledger_date)
VALUES

    -- ===== Emma Hayes =====
    -- ASOS/H&M merchant → SILVER (12%): 9.75 × 12% = 1.17
    ('cc000009-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000006',
     'a0000009-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000009',
     9.75, 12.00, 1.17, 'SILVER', NOW() - INTERVAL '15 days'),

    -- ASOS/H&M → SILVER: 6.38 × 12% = 0.77
    ('cc000009-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000006',
     'a0000009-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000009',
     6.38, 12.00, 0.77, 'SILVER', NOW() - INTERVAL '8 days'),

    -- Nandos → SILVER: 3.42 × 12% = 0.41
    ('cc000009-0000-0000-0000-000000000003',
     '10000000-0000-0000-0000-000000000007',
     'a0000003-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000009',
     3.42, 12.00, 0.41, 'SILVER', NOW() - INTERVAL '11 days'),

    -- Costa Coffee → SILVER: 1.23 × 12% = 0.15
    ('cc000009-0000-0000-0000-000000000004',
     '10000000-0000-0000-0000-000000000004',
     'a0000003-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000009',
     1.23, 12.00, 0.15, 'SILVER', NOW() - INTERVAL '7 days'),

    -- ===== Frank Osei =====
    -- Pret (via Nandos merchant) → SILVER: 1.95 × 12% = 0.23
    ('cc000010-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000007',
     'a0000009-0000-0000-0000-000000000008',
     'c0000000-0000-0000-0000-000000000010',
     1.95, 12.00, 0.23, 'SILVER', NOW() - INTERVAL '36 days'),

    -- Tesco → GOLD: 3.42 × 10% = 0.34
    ('cc000010-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'a0000001-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000010',
     3.42, 10.00, 0.34, 'GOLD', NOW() - INTERVAL '19 days'),

    -- ===== Grace Liu =====
    -- Booking.com → SILVER: 50.00 × 12% = 6.00
    ('cc000011-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000005',
     'a0000004-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000011',
     50.00, 12.00, 6.00, 'SILVER', NOW() - INTERVAL '22 days'),

    -- Pizza Express (MasterChef merchant) → BRONZE: 12.96 × 15% = 1.94
    ('cc000011-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000008',
     'a0000009-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     12.96, 15.00, 1.94, 'BRONZE', NOW() - INTERVAL '17 days'),

    -- Pizza Express → BRONZE: 8.19 × 15% = 1.23
    ('cc000011-0000-0000-0000-000000000003',
     '10000000-0000-0000-0000-000000000008',
     'a0000009-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     8.19, 15.00, 1.23, 'BRONZE', NOW() - INTERVAL '10 days'),

    -- SkyWings → BRONZE: 36.40 × 15% = 5.46
    ('cc000011-0000-0000-0000-000000000004',
     '10000000-0000-0000-0000-000000000009',
     'a0000004-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000011',
     36.40, 15.00, 5.46, 'BRONZE', NOW() - INTERVAL '13 days'),

    -- ===== Harry Patel =====
    -- Currys → BRONZE: 22.50 × 15% = 3.38
    ('cc000012-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000010',
     'a0000005-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     22.50, 15.00, 3.38, 'BRONZE', NOW() - INTERVAL '25 days'),

    -- Currys → BRONZE: 6.50 × 15% = 0.98
    ('cc000012-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000010',
     'a0000005-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000012',
     6.50, 15.00, 0.98, 'BRONZE', NOW() - INTERVAL '18 days'),

    -- Amazon/Currys merchant → BRONZE: 2.70 × 15% = 0.41
    ('cc000012-0000-0000-0000-000000000003',
     '10000000-0000-0000-0000-000000000010',
     'a0000009-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000012',
     2.70, 15.00, 0.41, 'BRONZE', NOW() - INTERVAL '14 days'),

    -- ===== Isla Brown =====
    -- Tesco → GOLD: 3.25 × 10% = 0.33
    ('cc000013-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'a0000001-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000013',
     3.25, 10.00, 0.33, 'GOLD', NOW() - INTERVAL '4 days'),

    -- H&M → SILVER: 3.52 × 12% = 0.42
    ('cc000013-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000006',
     'a0000002-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000013',
     3.52, 12.00, 0.42, 'SILVER', NOW() - INTERVAL '2 days')

ON CONFLICT DO NOTHING;
