-- V3: Add richer banking transaction history for the 5 personas who had minimal
-- spend signals, and update quarterly spending summaries for all 9 personas
-- Safe / idempotent: transactions use gen_random_uuid() (no fixed IDs),
-- spending_summaries use ON CONFLICT DO UPDATE to refresh totals

-- =====================================================================
-- ADDITIONAL TRANSACTIONS — Emma Hayes (c0000000-…-0009)
-- MASS_AFFLUENT, GROWING, CONVENIENCE_SHOPPER: Fashion + Dining
-- =====================================================================
INSERT INTO banking_transactions.transactions
    (customer_id, amount, merchant_name, merchant_category_code,
     category, sub_category, channel, transaction_date, posted_date)
VALUES
('c0000000-0000-0000-0000-000000000009',  89.00, 'ASOS',              '5311', 'Fashion',           'Online Retail',   'ONLINE',      NOW() - INTERVAL '82 days', NOW() - INTERVAL '81 days'),
('c0000000-0000-0000-0000-000000000009',  32.50, 'Nandos',            '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '76 days', NOW() - INTERVAL '75 days'),
('c0000000-0000-0000-0000-000000000009',  55.00, 'Zara',              '5311', 'Fashion',           'High Street',     'POS',         NOW() - INTERVAL '70 days', NOW() - INTERVAL '69 days'),
('c0000000-0000-0000-0000-000000000009',   4.90, 'Costa Coffee',      '5812', 'Dining',            'Cafes',           'CONTACTLESS', NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000009',  78.00, 'ASOS',              '5311', 'Fashion',           'Online Retail',   'ONLINE',      NOW() - INTERVAL '58 days', NOW() - INTERVAL '57 days'),
('c0000000-0000-0000-0000-000000000009',  24.00, 'Pret A Manger',     '5812', 'Dining',            'Cafes',           'CONTACTLESS', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000009',  65.00, 'ASOS',              '5311', 'Fashion',           'Online Retail',   'ONLINE',      NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days'),
('c0000000-0000-0000-0000-000000000009',  18.90, 'Nandos',            '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '38 days', NOW() - INTERVAL '37 days'),
('c0000000-0000-0000-0000-000000000009',  42.50, 'ASOS',              '5311', 'Fashion',           'Online Retail',   'ONLINE',      NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('c0000000-0000-0000-0000-000000000009',   5.40, 'Costa Coffee',      '5812', 'Dining',            'Cafes',           'CONTACTLESS', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days'),
('c0000000-0000-0000-0000-000000000009',  92.00, 'H&M',               '5311', 'Fashion',           'High Street',     'CONTACTLESS', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('c0000000-0000-0000-0000-000000000009',  28.50, 'Nandos',            '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days'),
('c0000000-0000-0000-0000-000000000009',   4.90, 'Costa Coffee',      '5812', 'Dining',            'Cafes',           'CONTACTLESS', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '4 days');

INSERT INTO banking_transactions.spending_summaries
    (customer_id, category, period_type, period_start, period_end,
     total_spend, transaction_count, avg_transaction)
VALUES
('c0000000-0000-0000-0000-000000000009', 'Fashion', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 422.00, 7, 60.29),
('c0000000-0000-0000-0000-000000000009', 'Dining',  'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 118.70, 6, 19.78)
ON CONFLICT (customer_id, category, period_type, period_start)
DO UPDATE SET
    total_spend       = EXCLUDED.total_spend,
    transaction_count = EXCLUDED.transaction_count,
    avg_transaction   = EXCLUDED.avg_transaction,
    computed_at       = NOW();

-- =====================================================================
-- ADDITIONAL TRANSACTIONS — Frank Osei (c0000000-…-0010)
-- MASS_MARKET, AT_RISK, DEAL_SEEKER: Groceries heavy, lapsing
-- =====================================================================
INSERT INTO banking_transactions.transactions
    (customer_id, amount, merchant_name, merchant_category_code,
     category, sub_category, channel, transaction_date, posted_date)
VALUES
('c0000000-0000-0000-0000-000000000010',  62.40, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '88 days', NOW() - INTERVAL '87 days'),
('c0000000-0000-0000-0000-000000000010',  45.00, 'Aldi',              '5411', 'Groceries',         'Discount',        'CONTACTLESS', NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000010',   6.50, 'Pret A Manger',     '5812', 'Dining',            'Cafes',           'CONTACTLESS', NOW() - INTERVAL '74 days', NOW() - INTERVAL '73 days'),
('c0000000-0000-0000-0000-000000000010',  38.90, 'Sainsbury''s',      '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '68 days', NOW() - INTERVAL '67 days'),
('c0000000-0000-0000-0000-000000000010',  52.10, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
('c0000000-0000-0000-0000-000000000010',  29.50, 'Lidl',              '5411', 'Groceries',         'Discount',        'CONTACTLESS', NOW() - INTERVAL '52 days', NOW() - INTERVAL '51 days'),
('c0000000-0000-0000-0000-000000000010',  34.20, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '43 days', NOW() - INTERVAL '42 days'),
-- Activity drops off after day -40 (AT_RISK signal)
('c0000000-0000-0000-0000-000000000010',  41.80, 'Aldi',              '5411', 'Groceries',         'Discount',        'CONTACTLESS', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000010',  18.00, 'Tesco Express',     '5411', 'Groceries',         'Convenience',     'CONTACTLESS', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days');
-- Note: no transactions in last 18 days — reinforces AT_RISK / lapsed status

INSERT INTO banking_transactions.spending_summaries
    (customer_id, category, period_type, period_start, period_end,
     total_spend, transaction_count, avg_transaction)
VALUES
('c0000000-0000-0000-0000-000000000010', 'Groceries', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 321.90, 8, 40.24),
('c0000000-0000-0000-0000-000000000010', 'Dining',    'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE,   6.50, 1,  6.50)
ON CONFLICT (customer_id, category, period_type, period_start)
DO UPDATE SET
    total_spend       = EXCLUDED.total_spend,
    transaction_count = EXCLUDED.transaction_count,
    avg_transaction   = EXCLUDED.avg_transaction,
    computed_at       = NOW();

-- =====================================================================
-- ADDITIONAL TRANSACTIONS — Grace Liu (c0000000-…-0011)
-- PREMIER, MATURE, EXPERIENCE_SEEKER: Travel + Wellness high-value
-- =====================================================================
INSERT INTO banking_transactions.transactions
    (customer_id, amount, merchant_name, merchant_category_code,
     category, sub_category, channel, transaction_date, posted_date)
VALUES
('c0000000-0000-0000-0000-000000000011', 289.00, 'Virgin Atlantic',   '4511', 'Travel',            'Airlines',        'ONLINE',      NOW() - INTERVAL '87 days', NOW() - INTERVAL '86 days'),
('c0000000-0000-0000-0000-000000000011',  68.50, 'Nobu Restaurant',   '5812', 'Dining',            'Fine Dining',     'CONTACTLESS', NOW() - INTERVAL '81 days', NOW() - INTERVAL '80 days'),
('c0000000-0000-0000-0000-000000000011', 380.00, 'Booking.com',       '7011', 'Travel',            'Hotels',          'ONLINE',      NOW() - INTERVAL '76 days', NOW() - INTERVAL '75 days'),
('c0000000-0000-0000-0000-000000000011',  95.00, 'Triyoga',           '7011', 'Health & Wellness', 'Yoga/Pilates',    'CONTACTLESS', NOW() - INTERVAL '70 days', NOW() - INTERVAL '69 days'),
('c0000000-0000-0000-0000-000000000011',  72.00, 'Pizza Express',     '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000011', 520.00, 'SkyWings',          '4511', 'Travel',            'Airlines',        'ONLINE',      NOW() - INTERVAL '57 days', NOW() - INTERVAL '56 days'),
('c0000000-0000-0000-0000-000000000011',  85.00, 'Bamford Wellness',  '7011', 'Health & Wellness', 'Spa',             'CONTACTLESS', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000011',  45.50, 'Pizza Express',     '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days'),
('c0000000-0000-0000-0000-000000000011', 175.00, 'Eurostar',          '4511', 'Travel',            'Rail',            'ONLINE',      NOW() - INTERVAL '36 days', NOW() - INTERVAL '35 days'),
('c0000000-0000-0000-0000-000000000011',  62.00, 'Dishoom',           '5812', 'Dining',            'Restaurants',     'CONTACTLESS', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000011',  90.00, 'Triyoga',           '7011', 'Health & Wellness', 'Yoga/Pilates',    'CONTACTLESS', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('c0000000-0000-0000-0000-000000000011', 340.00, 'Premier Inn',       '7011', 'Travel',            'Hotels',          'ONLINE',      NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days'),
('c0000000-0000-0000-0000-000000000011',  55.00, 'Zuma Restaurant',   '5812', 'Dining',            'Fine Dining',     'CONTACTLESS', NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days');

INSERT INTO banking_transactions.spending_summaries
    (customer_id, category, period_type, period_start, period_end,
     total_spend, transaction_count, avg_transaction)
VALUES
('c0000000-0000-0000-0000-000000000011', 'Travel',            'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 1804.00, 6, 300.67),
('c0000000-0000-0000-0000-000000000011', 'Dining',            'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE,  303.00, 5,  60.60),
('c0000000-0000-0000-0000-000000000011', 'Health & Wellness', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE,  270.00, 3,  90.00)
ON CONFLICT (customer_id, category, period_type, period_start)
DO UPDATE SET
    total_spend       = EXCLUDED.total_spend,
    transaction_count = EXCLUDED.transaction_count,
    avg_transaction   = EXCLUDED.avg_transaction,
    computed_at       = NOW();

-- =====================================================================
-- ADDITIONAL TRANSACTIONS — Harry Patel (c0000000-…-0012)
-- MASS_AFFLUENT, GROWING, BRAND_LOYAL: Electronics + Entertainment
-- =====================================================================
INSERT INTO banking_transactions.transactions
    (customer_id, amount, merchant_name, merchant_category_code,
     category, sub_category, channel, transaction_date, posted_date)
VALUES
('c0000000-0000-0000-0000-000000000012', 449.99, 'Currys',            '5045', 'Electronics',       'AV & Audio',      'CONTACTLESS', NOW() - INTERVAL '85 days', NOW() - INTERVAL '84 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000012',  89.99, 'Amazon',            '5999', 'Electronics',       'Gadgets',         'ONLINE',      NOW() - INTERVAL '74 days', NOW() - INTERVAL '73 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '68 days', NOW() - INTERVAL '67 days'),
('c0000000-0000-0000-0000-000000000012', 129.99, 'Currys',            '5045', 'Electronics',       'Gaming',          'CONTACTLESS', NOW() - INTERVAL '62 days', NOW() - INTERVAL '61 days'),
('c0000000-0000-0000-0000-000000000012',  32.00, 'Odeon Cinema',      '7922', 'Entertainment',     'Cinema',          'ONLINE',      NOW() - INTERVAL '55 days', NOW() - INTERVAL '54 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '48 days', NOW() - INTERVAL '47 days'),
('c0000000-0000-0000-0000-000000000012', 199.99, 'Amazon',            '5999', 'Electronics',       'Smart Home',      'ONLINE',      NOW() - INTERVAL '42 days', NOW() - INTERVAL '41 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000012',  24.00, 'Odeon Cinema',      '7922', 'Entertainment',     'Cinema',          'CONTACTLESS', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('c0000000-0000-0000-0000-000000000012',  89.99, 'Amazon',            '5999', 'Electronics',       'Gadgets',         'ONLINE',      NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days');

INSERT INTO banking_transactions.spending_summaries
    (customer_id, category, period_type, period_start, period_end,
     total_spend, transaction_count, avg_transaction)
VALUES
('c0000000-0000-0000-0000-000000000012', 'Electronics',    'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 869.95, 5, 173.99),
('c0000000-0000-0000-0000-000000000012', 'Entertainment',  'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 130.93, 8,  16.37)
ON CONFLICT (customer_id, category, period_type, period_start)
DO UPDATE SET
    total_spend       = EXCLUDED.total_spend,
    transaction_count = EXCLUDED.transaction_count,
    avg_transaction   = EXCLUDED.avg_transaction,
    computed_at       = NOW();

-- =====================================================================
-- ADDITIONAL TRANSACTIONS — Isla Brown (c0000000-…-0013)
-- MASS_MARKET, NEW, CONVENIENCE_SHOPPER: Groceries + Fashion (first-time)
-- =====================================================================
INSERT INTO banking_transactions.transactions
    (customer_id, amount, merchant_name, merchant_category_code,
     category, sub_category, channel, transaction_date, posted_date)
VALUES
('c0000000-0000-0000-0000-000000000013',  28.50, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '75 days', NOW() - INTERVAL '74 days'),
('c0000000-0000-0000-0000-000000000013',  39.00, 'Primark',           '5311', 'Fashion',           'Value Retail',    'POS',         NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000013',  22.80, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '55 days', NOW() - INTERVAL '54 days'),
('c0000000-0000-0000-0000-000000000013',  15.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',       'ONLINE',      NOW() - INTERVAL '48 days', NOW() - INTERVAL '47 days'),
('c0000000-0000-0000-0000-000000000013',  31.40, 'Sainsbury''s',      '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days'),
('c0000000-0000-0000-0000-000000000013',  44.00, 'H&M',               '5311', 'Fashion',           'High Street',     'POS',         NOW() - INTERVAL '32 days', NOW() - INTERVAL '31 days'),
('c0000000-0000-0000-0000-000000000013',  32.50, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days'),
('c0000000-0000-0000-0000-000000000013',  19.90, 'Tesco Express',     '5411', 'Groceries',         'Convenience',     'CONTACTLESS', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
('c0000000-0000-0000-0000-000000000013',  26.00, 'Tesco',             '5411', 'Groceries',         'Supermarket',     'CONTACTLESS', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '4 days');

INSERT INTO banking_transactions.spending_summaries
    (customer_id, category, period_type, period_start, period_end,
     total_spend, transaction_count, avg_transaction)
VALUES
('c0000000-0000-0000-0000-000000000013', 'Groceries',     'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 160.10, 6, 26.68),
('c0000000-0000-0000-0000-000000000013', 'Fashion',       'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE,  83.00, 2, 41.50),
('c0000000-0000-0000-0000-000000000013', 'Entertainment', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE,  15.99, 1, 15.99)
ON CONFLICT (customer_id, category, period_type, period_start)
DO UPDATE SET
    total_spend       = EXCLUDED.total_spend,
    transaction_count = EXCLUDED.transaction_count,
    avg_transaction   = EXCLUDED.avg_transaction,
    computed_at       = NOW();
