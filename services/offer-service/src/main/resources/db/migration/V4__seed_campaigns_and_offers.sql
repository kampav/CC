-- V4__seed_campaigns_and_offers.sql
-- Seed campaigns, link offers, add extra offers for richer demo data
-- Safe / idempotent: all inserts use ON CONFLICT DO NOTHING

-- ===================== CAMPAIGNS =====================
INSERT INTO offers.campaigns (id, name, description, status, target_segment, target_brands, priority, start_date, end_date, budget_gbp, spent_gbp, created_by)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Summer Essentials 2026',
   'Top cashback offers across groceries, health and lifestyle for the summer season.',
   'ACTIVE', 'ALL', 'BRAND_A,BRAND_B', 10,
   NOW() - INTERVAL '14 days', NOW() + INTERVAL '46 days',
   50000.00, 12500.00, 'admin@platform.com'),

  ('c0000001-0000-0000-0000-000000000002', 'Dining & Coffee Rewards',
   'Earn more when you eat out and grab your daily coffee.',
   'ACTIVE', 'MASS', 'BRAND_A,BRAND_D', 8,
   NOW() - INTERVAL '7 days', NOW() + INTERVAL '53 days',
   25000.00, 4800.00, 'admin@platform.com'),

  ('c0000001-0000-0000-0000-000000000003', 'Fashion Forward',
   'Exclusive cashback on leading fashion brands for the style-conscious customer.',
   'ACTIVE', 'AFFLUENT', 'BRAND_B,BRAND_C', 7,
   NOW() - INTERVAL '2 days', NOW() + INTERVAL '58 days',
   30000.00, 1200.00, 'admin@platform.com'),

  ('c0000001-0000-0000-0000-000000000004', 'Travel & Adventure',
   'Earn big cashback on flights and hotels this travel season.',
   'SCHEDULED', 'ALL', 'BRAND_A,BRAND_B', 9,
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '95 days',
   75000.00, 0.00, 'admin@platform.com'),

  ('c0000001-0000-0000-0000-000000000005', 'Tech & Entertainment Bundle',
   'Electronics and entertainment offers for the digitally-savvy.',
   'ACTIVE', 'MASS', 'BRAND_C,BRAND_D', 6,
   NOW() - INTERVAL '5 days', NOW() + INTERVAL '55 days',
   20000.00, 3200.00, 'admin@platform.com'),

  ('c0000001-0000-0000-0000-000000000006', 'Health & Wellness Month',
   'Get cashback on gym, pharmacy and wellness spending.',
   'PAUSED', 'ALL', 'BRAND_A,BRAND_D', 5,
   NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days',
   15000.00, 8900.00, 'admin@platform.com')

ON CONFLICT (id) DO NOTHING;

-- ===================== CAMPAIGN → OFFER LINKS =====================
INSERT INTO offers.campaign_offers (campaign_id, offer_id)
VALUES
  -- Summer Essentials
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000002'),

  -- Dining & Coffee Rewards
  ('c0000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003'),

  -- Fashion Forward
  ('c0000001-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000003'),

  -- Travel & Adventure
  ('c0000001-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000002'),

  -- Tech & Entertainment Bundle
  ('c0000001-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000005', 'a0000006-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000005', 'a0000006-0000-0000-0000-000000000002'),

  -- Health & Wellness Month
  ('c0000001-0000-0000-0000-000000000006', 'a0000007-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000006', 'a0000007-0000-0000-0000-000000000002')

ON CONFLICT DO NOTHING;

-- ===================== EXTRA OFFERS (more variety for demo) =====================
INSERT INTO offers.offers (id, merchant_id, title, description, offer_type, category, cashback_rate, cashback_cap, min_spend, currency, terms, status, brand, image_url, redemption_type, max_activations, current_activations, start_date, end_date, created_by)
VALUES
  -- Groceries: Ocado
  ('a0000009-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002',
   '12% Back on First Ocado Order', 'New to Ocado? Earn 12% cashback on your first online grocery order. Fresh ingredients delivered to your door.',
   'CASHBACK', 'Groceries', 12.00, 20.00, 40.00, 'GBP',
   'First order only. Minimum basket £40. Excludes alcohol.',
   'LIVE', 'BRAND_A',
   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop',
   'CARD_LINKED', 1000, 67, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days', 'merchant@sainsburys.com'),

  -- Dining: Pizza Express
  ('a0000009-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008',
   '18% Cashback at Pizza Express', 'Enjoy Italian dining with 18% cashback on your bill at any Pizza Express restaurant nationwide.',
   'CASHBACK', 'Dining', 18.00, 15.00, 20.00, 'GBP',
   'Dine-in only. Excludes service charge. Max cashback £15 per visit.',
   'LIVE', 'BRAND_B',
   'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=250&fit=crop',
   'CARD_LINKED', 5000, 312, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', 'admin@platform.com'),

  -- Health: Holland & Barrett
  ('a0000009-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013',
   '25% Off Holland & Barrett Vitamins', 'Stock up on vitamins and supplements with 25% cashback at Holland & Barrett.',
   'CASHBACK', 'Health & Wellness', 25.00, 20.00, 15.00, 'GBP',
   'Applies to vitamins and supplements only. Max cashback £20.',
   'LIVE', 'BRAND_C',
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop',
   'CARD_LINKED', 3000, 445, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', 'merchant@puregym.com'),

  -- Travel: Premier Inn
  ('a0000009-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000009',
   '10% Cashback at Premier Inn', 'Book a UK staycation and earn 10% cashback on your Premier Inn stay.',
   'CASHBACK', 'Travel', 10.00, 40.00, 80.00, 'GBP',
   'Minimum 2-night stay. Book direct only. Valid on flexible rates.',
   'LIVE', 'BRAND_D',
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
   'CARD_LINKED', 2000, 156, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', 'merchant@skywings.com'),

  -- Fashion: ASOS
  ('a0000009-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006',
   '15% Cashback at ASOS', 'Shop the latest trends online and earn 15% cashback on your ASOS order.',
   'CASHBACK', 'Fashion', 15.00, 30.00, 30.00, 'GBP',
   'Online only. Excludes sale items. Max cashback £30 per order.',
   'LIVE', 'BRAND_A',
   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=250&fit=crop',
   'CARD_LINKED', 4000, 789, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', 'merchant@hm.com'),

  -- Electronics: Amazon
  ('a0000009-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000010',
   '3% Cashback on Amazon Electronics', 'Earn cashback on all Amazon electronics and gadgets purchases.',
   'CASHBACK', 'Electronics', 3.00, 50.00, 20.00, 'GBP',
   'Electronics category only. Prime members get double. Max cashback £50.',
   'LIVE', 'BRAND_B',
   'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=250&fit=crop',
   'CARD_LINKED', 10000, 2134, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 'merchant@currys.com'),

  -- Entertainment: NOW TV
  ('a0000009-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000012',
   '2 Months Free NOW Entertainment', 'Activate for 2 months of NOW Entertainment pass — hit movies, drama and more.',
   'EXPERIENCE', 'Entertainment', NULL, NULL, NULL, 'GBP',
   'New NOW subscribers only. Standard pricing applies after trial.',
   'LIVE', 'BRAND_C',
   'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=250&fit=crop',
   'VOUCHER_CODE', 5000, 1876, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'merchant@odeon.com'),

  -- Dining: Pret a Manger (expiring soon — urgency signal)
  ('a0000009-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007',
   '30% Off Pret a Manger — Last Few Days!', 'Grab 30% cashback on any Pret purchase. Offer expires in 3 days!',
   'CASHBACK', 'Dining', 30.00, 8.00, 5.00, 'GBP',
   'Valid on all Pret menu items. Max cashback £8 per transaction.',
   'LIVE', 'BRAND_D',
   'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=250&fit=crop',
   'CARD_LINKED', 15000, 4821, NOW() - INTERVAL '27 days', NOW() + INTERVAL '3 days', 'merchant@nandos.com')

ON CONFLICT (id) DO NOTHING;

-- Link new offers to campaigns
INSERT INTO offers.campaign_offers (campaign_id, offer_id)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000009-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000002', 'a0000009-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000002', 'a0000009-0000-0000-0000-000000000008'),
  ('c0000001-0000-0000-0000-000000000003', 'a0000009-0000-0000-0000-000000000005'),
  ('c0000001-0000-0000-0000-000000000004', 'a0000009-0000-0000-0000-000000000004'),
  ('c0000001-0000-0000-0000-000000000005', 'a0000009-0000-0000-0000-000000000006'),
  ('c0000001-0000-0000-0000-000000000005', 'a0000009-0000-0000-0000-000000000007'),
  ('c0000001-0000-0000-0000-000000000006', 'a0000009-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;
