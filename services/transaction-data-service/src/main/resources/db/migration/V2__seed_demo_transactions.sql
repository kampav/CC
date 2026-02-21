-- V2: Seed 90-day transaction history for all 9 demo customers
-- MCC codes: 5411=Grocery, 5812=Restaurant, 5045=Electronics, 5311=Department/Fashion
--            5411=Grocery, 7011=Hotel/Travel, 4511=Airlines, 7922=Entertainment
--            5912=Pharmacy/Health, 5999=Misc, 5945=Gaming

-- ============================================================
-- Alice Morgan (c0000000-...-0005) — Travel + Dining
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000005', 342.00, 'British Airways',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '85 days', NOW() - INTERVAL '84 days'),
('c0000000-0000-0000-0000-000000000005',  89.50, 'Nobu Restaurant',   '5812', 'Dining',            'Fine Dining',   'CONTACTLESS', NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000005', 215.00, 'Premier Inn',       '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '75 days', NOW() - INTERVAL '74 days'),
('c0000000-0000-0000-0000-000000000005',  65.20, 'Ivy Restaurant',    '5812', 'Dining',            'Fine Dining',   'CONTACTLESS', NOW() - INTERVAL '72 days', NOW() - INTERVAL '71 days'),
('c0000000-0000-0000-0000-000000000005', 189.00, 'Eurostar',          '4511', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000005',  48.30, 'Dishoom',           '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
('c0000000-0000-0000-0000-000000000005', 420.00, 'British Airways',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '55 days', NOW() - INTERVAL '54 days'),
('c0000000-0000-0000-0000-000000000005',  72.00, 'Gaucho Steakhouse', '5812', 'Dining',            'Fine Dining',   'CONTACTLESS', NOW() - INTERVAL '48 days', NOW() - INTERVAL '47 days'),
('c0000000-0000-0000-0000-000000000005', 156.00, 'Marriott Hotels',   '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days'),
('c0000000-0000-0000-0000-000000000005',  38.50, 'Pret A Manger',    '5812', 'Dining',            'Cafes',         'CONTACTLESS', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000005',  95.00, 'Virgin Atlantic',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000005',  54.00, 'Zuma Restaurant',   '5812', 'Dining',            'Fine Dining',   'CONTACTLESS', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('c0000000-0000-0000-0000-000000000005',  82.50, 'Trainline',         '4111', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
('c0000000-0000-0000-0000-000000000005',  41.00, 'Wagamama',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days'),
('c0000000-0000-0000-0000-000000000005',  67.00, 'National Rail',     '4111', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '3 days',  NOW() - INTERVAL '2 days');

-- Spending summaries for Alice
INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000005', 'Travel', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 1249.50, 8, 156.19),
('c0000000-0000-0000-0000-000000000005', 'Dining', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 408.50,  7, 58.36);

-- ============================================================
-- Ben Clarke (c0000000-...-0006) — Groceries + Health
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000006',  78.40, 'Tesco',            '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '88 days', NOW() - INTERVAL '87 days'),
('c0000000-0000-0000-0000-000000000006',  22.50, 'Boots',            '5912', 'Health & Wellness', 'Pharmacy',      'CONTACTLESS', NOW() - INTERVAL '83 days', NOW() - INTERVAL '82 days'),
('c0000000-0000-0000-0000-000000000006',  91.20, 'Tesco',            '5411', 'Groceries',         'Supermarket',   'ONLINE',      NOW() - INTERVAL '75 days', NOW() - INTERVAL '74 days'),
('c0000000-0000-0000-0000-000000000006',  35.00, 'Holland & Barrett','5912', 'Health & Wellness', 'Health Food',   'POS',         NOW() - INTERVAL '68 days', NOW() - INTERVAL '67 days'),
('c0000000-0000-0000-0000-000000000006',  65.80, 'Sainsbury''s',     '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
('c0000000-0000-0000-0000-000000000006',  18.90, 'Boots',            '5912', 'Health & Wellness', 'Pharmacy',      'CONTACTLESS', NOW() - INTERVAL '52 days', NOW() - INTERVAL '51 days'),
('c0000000-0000-0000-0000-000000000006',  82.10, 'Tesco',            '5411', 'Groceries',         'Supermarket',   'ONLINE',      NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days'),
('c0000000-0000-0000-0000-000000000006',  45.00, 'Virgin Active',    '7011', 'Health & Wellness', 'Gym',           'CONTACTLESS', NOW() - INTERVAL '38 days', NOW() - INTERVAL '37 days'),
('c0000000-0000-0000-0000-000000000006',  73.50, 'Waitrose',         '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('c0000000-0000-0000-0000-000000000006',  28.00, 'Boots',            '5912', 'Health & Wellness', 'Pharmacy',      'CONTACTLESS', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days'),
('c0000000-0000-0000-0000-000000000006',  88.60, 'Tesco',            '5411', 'Groceries',         'Supermarket',   'ONLINE',      NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'),
('c0000000-0000-0000-0000-000000000006',  45.00, 'Virgin Active',    '7011', 'Health & Wellness', 'Gym',           'CONTACTLESS', NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days'),
('c0000000-0000-0000-0000-000000000006',  55.80, 'Sainsbury''s',     '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '2 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000006', 'Groceries',         'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 535.40, 8, 66.93),
('c0000000-0000-0000-0000-000000000006', 'Health & Wellness', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 149.40, 5, 29.88);

-- ============================================================
-- Cara Singh (c0000000-...-0007) — Entertainment + Dining
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000007',  15.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '88 days', NOW() - INTERVAL '87 days'),
('c0000000-0000-0000-0000-000000000007',  12.50, 'Burger King',       '5812', 'Dining',            'Fast Food',     'CONTACTLESS', NOW() - INTERVAL '82 days', NOW() - INTERVAL '81 days'),
('c0000000-0000-0000-0000-000000000007',  14.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '76 days', NOW() - INTERVAL '75 days'),
('c0000000-0000-0000-0000-000000000007',  22.00, 'Vue Cinema',        '7922', 'Entertainment',     'Cinema',        'ONLINE',      NOW() - INTERVAL '70 days', NOW() - INTERVAL '69 days'),
('c0000000-0000-0000-0000-000000000007',  18.40, 'McDonald''s',       '5812', 'Dining',            'Fast Food',     'CONTACTLESS', NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000007',  15.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '58 days', NOW() - INTERVAL '57 days'),
('c0000000-0000-0000-0000-000000000007',  35.00, 'Odeon Cinema',      '7922', 'Entertainment',     'Cinema',        'CONTACTLESS', NOW() - INTERVAL '52 days', NOW() - INTERVAL '51 days'),
('c0000000-0000-0000-0000-000000000007',  21.50, 'Nando''s',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days'),
('c0000000-0000-0000-0000-000000000007',  15.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '38 days', NOW() - INTERVAL '37 days'),
('c0000000-0000-0000-0000-000000000007',  14.99, 'Spotify',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('c0000000-0000-0000-0000-000000000007',  28.00, 'Pizza Express',     '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days'),
('c0000000-0000-0000-0000-000000000007',  15.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('c0000000-0000-0000-0000-000000000007',  18.00, 'Cineworld',         '7922', 'Entertainment',     'Cinema',        'CONTACTLESS', NOW() - INTERVAL '8 days',  NOW() - INTERVAL '7 days'),
('c0000000-0000-0000-0000-000000000007',  11.90, 'Subway',            '5812', 'Dining',            'Fast Food',     'CONTACTLESS', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '2 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000007', 'Entertainment', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 188.94, 9, 20.99),
('c0000000-0000-0000-0000-000000000007', 'Dining',        'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 110.30, 5, 22.06);

-- ============================================================
-- Dan Webb (c0000000-...-0008) — Electronics + Travel
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000008', 899.00, 'Apple Store',       '5045', 'Electronics',       'Mobile',        'ONLINE',      NOW() - INTERVAL '87 days', NOW() - INTERVAL '86 days'),
('c0000000-0000-0000-0000-000000000008', 315.00, 'British Airways',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000008', 249.00, 'Currys',            '5045', 'Electronics',       'Appliances',    'POS',         NOW() - INTERVAL '72 days', NOW() - INTERVAL '71 days'),
('c0000000-0000-0000-0000-000000000008', 145.00, 'Amazon',            '5045', 'Electronics',       'Computing',     'ONLINE',      NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000008', 420.00, 'Virgin Atlantic',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '57 days', NOW() - INTERVAL '56 days'),
('c0000000-0000-0000-0000-000000000008',  89.99, 'Samsung',           '5045', 'Electronics',       'Accessories',   'ONLINE',      NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000008', 199.00, 'Apple Store',       '5045', 'Electronics',       'Accessories',   'ONLINE',      NOW() - INTERVAL '42 days', NOW() - INTERVAL '41 days'),
('c0000000-0000-0000-0000-000000000008', 165.00, 'Premier Inn',       '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000008',  79.99, 'Amazon',            '5045', 'Electronics',       'Computing',     'ONLINE',      NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000008', 319.00, 'Currys',            '5045', 'Electronics',       'Audio',         'POS',         NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('c0000000-0000-0000-0000-000000000008',  55.00, 'Trainline',         '4111', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
('c0000000-0000-0000-0000-000000000008', 129.00, 'Amazon',            '5045', 'Electronics',       'Smart Home',    'ONLINE',      NOW() - INTERVAL '5 days',  NOW() - INTERVAL '4 days'),
('c0000000-0000-0000-0000-000000000008', 517.00, 'Apple Store',       '5045', 'Electronics',       'Tablet',        'ONLINE',      NOW() - INTERVAL '2 days',  NOW() - INTERVAL '1 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000008', 'Electronics', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 2627.98, 9, 291.98),
('c0000000-0000-0000-0000-000000000008', 'Travel',      'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 955.00,  4, 238.75);

-- ============================================================
-- Emma Hayes (c0000000-...-0009) — Fashion + Dining
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000009',  89.99, 'ASOS',              '5311', 'Fashion',           'Online Fashion','ONLINE',      NOW() - INTERVAL '86 days', NOW() - INTERVAL '85 days'),
('c0000000-0000-0000-0000-000000000009',  42.00, 'Wagamama',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000009', 115.00, 'Zara',              '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '73 days', NOW() - INTERVAL '72 days'),
('c0000000-0000-0000-0000-000000000009',  38.50, 'Nando''s',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '67 days', NOW() - INTERVAL '66 days'),
('c0000000-0000-0000-0000-000000000009',  74.99, 'ASOS',              '5311', 'Fashion',           'Online Fashion','ONLINE',      NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
('c0000000-0000-0000-0000-000000000009',  55.00, 'H&M',               '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '52 days', NOW() - INTERVAL '51 days'),
('c0000000-0000-0000-0000-000000000009',  48.00, 'Dishoom',           '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days'),
('c0000000-0000-0000-0000-000000000009',  99.00, 'Reiss',             '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '38 days', NOW() - INTERVAL '37 days'),
('c0000000-0000-0000-0000-000000000009',  34.90, 'Pizza Express',     '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '31 days', NOW() - INTERVAL '30 days'),
('c0000000-0000-0000-0000-000000000009',  65.99, 'ASOS',              '5311', 'Fashion',           'Online Fashion','ONLINE',      NOW() - INTERVAL '23 days', NOW() - INTERVAL '22 days'),
('c0000000-0000-0000-0000-000000000009',  42.50, 'Wagamama',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('c0000000-0000-0000-0000-000000000009',  79.99, 'Zara',              '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days'),
('c0000000-0000-0000-0000-000000000009',  29.90, 'Nando''s',          '5812', 'Dining',            'Restaurants',   'CONTACTLESS', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '1 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000009', 'Fashion', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 580.96, 7, 82.99),
('c0000000-0000-0000-0000-000000000009', 'Dining',  'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 235.80, 6, 39.30);

-- ============================================================
-- Frank Osei (c0000000-...-0010) — Groceries (discount), AT_RISK
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000010',  45.20, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '86 days', NOW() - INTERVAL '85 days'),
('c0000000-0000-0000-0000-000000000010',  38.50, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '79 days', NOW() - INTERVAL '78 days'),
('c0000000-0000-0000-0000-000000000010',  52.10, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '72 days', NOW() - INTERVAL '71 days'),
('c0000000-0000-0000-0000-000000000010',  41.80, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '64 days', NOW() - INTERVAL '63 days'),
('c0000000-0000-0000-0000-000000000010',  48.90, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '57 days', NOW() - INTERVAL '56 days'),
('c0000000-0000-0000-0000-000000000010',  36.00, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000010',  54.30, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '43 days', NOW() - INTERVAL '42 days'),
('c0000000-0000-0000-0000-000000000010',  43.70, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000010',  49.50, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000010',  37.20, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
('c0000000-0000-0000-0000-000000000010',  51.80, 'Lidl',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'),
('c0000000-0000-0000-0000-000000000010',  40.90, 'Aldi',              '5411', 'Groceries',         'Discount Supermarket','CONTACTLESS', NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000010', 'Groceries', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 539.90, 12, 44.99);

-- ============================================================
-- Grace Liu (c0000000-...-0011) — Travel + Wellness
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000011', 285.00, 'British Airways',   '4511', 'Travel',            'Airlines',      'ONLINE',      NOW() - INTERVAL '84 days', NOW() - INTERVAL '83 days'),
('c0000000-0000-0000-0000-000000000011',  75.00, 'Virgin Active',     '7011', 'Health & Wellness', 'Gym',           'CONTACTLESS', NOW() - INTERVAL '78 days', NOW() - INTERVAL '77 days'),
('c0000000-0000-0000-0000-000000000011', 195.00, 'Premier Inn',       '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '71 days', NOW() - INTERVAL '70 days'),
('c0000000-0000-0000-0000-000000000011',  85.00, 'Cowshed Spa',       '7299', 'Health & Wellness', 'Spa',           'POS',         NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000011', 320.00, 'Eurostar',          '4511', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '58 days', NOW() - INTERVAL '57 days'),
('c0000000-0000-0000-0000-000000000011',  75.00, 'Virgin Active',     '7011', 'Health & Wellness', 'Gym',           'CONTACTLESS', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000011', 245.00, 'Marriott Hotels',   '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '43 days', NOW() - INTERVAL '42 days'),
('c0000000-0000-0000-0000-000000000011', 120.00, 'ESPA Spa',          '7299', 'Health & Wellness', 'Spa',           'POS',         NOW() - INTERVAL '36 days', NOW() - INTERVAL '35 days'),
('c0000000-0000-0000-0000-000000000011', 178.00, 'National Rail',     '4111', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000011',  75.00, 'Virgin Active',     '7011', 'Health & Wellness', 'Gym',           'CONTACTLESS', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
('c0000000-0000-0000-0000-000000000011', 169.00, 'Premier Inn',       '7011', 'Travel',            'Hotels',        'ONLINE',      NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'),
('c0000000-0000-0000-0000-000000000011',  95.00, 'Lush Spa',          '7299', 'Health & Wellness', 'Spa',           'POS',         NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days'),
('c0000000-0000-0000-0000-000000000011',  92.00, 'Trainline',         '4111', 'Travel',            'Rail',          'ONLINE',      NOW() - INTERVAL '2 days',  NOW() - INTERVAL '1 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000011', 'Travel',            'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 1284.00, 7, 183.43),
('c0000000-0000-0000-0000-000000000011', 'Health & Wellness', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 525.00,  6, 87.50);

-- ============================================================
-- Harry Patel (c0000000-...-0012) — Electronics + Entertainment (Gaming)
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000012', 499.00, 'Amazon',            '5045', 'Electronics',       'Computing',     'ONLINE',      NOW() - INTERVAL '85 days', NOW() - INTERVAL '84 days'),
('c0000000-0000-0000-0000-000000000012',  59.99, 'PlayStation Store', '5945', 'Entertainment',     'Gaming',        'ONLINE',      NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days'),
('c0000000-0000-0000-0000-000000000012', 249.00, 'Currys',            '5045', 'Electronics',       'Audio',         'POS',         NOW() - INTERVAL '73 days', NOW() - INTERVAL '72 days'),
('c0000000-0000-0000-0000-000000000012',  69.99, 'Steam',             '5945', 'Entertainment',     'Gaming',        'ONLINE',      NOW() - INTERVAL '65 days', NOW() - INTERVAL '64 days'),
('c0000000-0000-0000-0000-000000000012', 149.00, 'Amazon',            '5045', 'Electronics',       'Accessories',   'ONLINE',      NOW() - INTERVAL '58 days', NOW() - INTERVAL '57 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days'),
('c0000000-0000-0000-0000-000000000012', 319.00, 'Currys',            '5045', 'Electronics',       'TV',            'POS',         NOW() - INTERVAL '43 days', NOW() - INTERVAL '42 days'),
('c0000000-0000-0000-0000-000000000012',  49.99, 'PlayStation Store', '5945', 'Entertainment',     'Gaming',        'ONLINE',      NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000012',  99.00, 'Amazon',            '5045', 'Electronics',       'Smart Home',    'ONLINE',      NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('c0000000-0000-0000-0000-000000000012',  59.99, 'Xbox Game Pass',    '5945', 'Entertainment',     'Gaming',        'ONLINE',      NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days'),
('c0000000-0000-0000-0000-000000000012', 179.00, 'Currys',            '5045', 'Electronics',       'Accessories',   'POS',         NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days'),
('c0000000-0000-0000-0000-000000000012',  14.99, 'Netflix',           '7922', 'Entertainment',     'Streaming',     'ONLINE',      NOW() - INTERVAL '1 days',  NOW() - INTERVAL '0 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000012', 'Electronics',   'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 1494.99, 7, 213.57),
('c0000000-0000-0000-0000-000000000012', 'Entertainment', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 283.93,  6, 47.32);

-- ============================================================
-- Isla Brown (c0000000-...-0013) — Groceries + Fashion (NEW customer)
-- ============================================================
INSERT INTO banking_transactions.transactions (customer_id, amount, merchant_name, merchant_category_code, category, sub_category, channel, transaction_date, posted_date) VALUES
('c0000000-0000-0000-0000-000000000013',  55.40, 'Tesco',             '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days'),
('c0000000-0000-0000-0000-000000000013',  29.99, 'Primark',           '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days'),
('c0000000-0000-0000-0000-000000000013',  62.10, 'Sainsbury''s',      '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
('c0000000-0000-0000-0000-000000000013',  45.00, 'Shein',             '5311', 'Fashion',           'Online Fashion','ONLINE',      NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
('c0000000-0000-0000-0000-000000000013',  48.80, 'Tesco',             '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'),
('c0000000-0000-0000-0000-000000000013',  35.00, 'Primark',           '5311', 'Fashion',           'Retail Fashion','POS',         NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days'),
('c0000000-0000-0000-0000-000000000013',  51.20, 'Tesco',             '5411', 'Groceries',         'Supermarket',   'CONTACTLESS', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '2 days');

INSERT INTO banking_transactions.spending_summaries (customer_id, category, period_type, period_start, period_end, total_spend, transaction_count, avg_transaction) VALUES
('c0000000-0000-0000-0000-000000000013', 'Groceries', 'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 217.50, 4, 54.38),
('c0000000-0000-0000-0000-000000000013', 'Fashion',   'QUARTERLY', CURRENT_DATE - 90, CURRENT_DATE, 109.99, 3, 36.66);
