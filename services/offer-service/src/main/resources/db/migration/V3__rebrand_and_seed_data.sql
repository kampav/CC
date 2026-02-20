-- V3__rebrand_and_seed_data.sql
-- Remove LBG brand references, replace with Brand A/B/C/D
-- Seed synthetic data for personalization demo

-- 1. Drop old constraint FIRST (must happen before updating values)
ALTER TABLE offers.offers DROP CONSTRAINT IF EXISTS chk_brand;
ALTER TABLE offers.offers ALTER COLUMN brand SET DEFAULT 'BRAND_A';

-- 2. Now safe to update existing offers to new brand names
UPDATE offers.offers SET brand = 'BRAND_A' WHERE brand = 'LLOYDS';
UPDATE offers.offers SET brand = 'BRAND_B' WHERE brand = 'HALIFAX';
UPDATE offers.offers SET brand = 'BRAND_C' WHERE brand = 'BOS';
UPDATE offers.offers SET brand = 'BRAND_D' WHERE brand = 'SCOTTISH_WIDOWS';

-- 3. Add new constraint
ALTER TABLE offers.offers ADD CONSTRAINT chk_brand CHECK (brand IN ('BRAND_A', 'BRAND_B', 'BRAND_C', 'BRAND_D'));

-- 3. Seed merchants (UUIDs for reference)
-- Merchant 1: Tesco (00000000-0000-0000-0000-000000000001) - already exists via demo
-- Merchant 2: Sainsburys
-- Merchant 3: Nike
-- Merchant 4: Costa Coffee
-- Merchant 5: Booking.com

-- 4. Seed rich offer data across all categories and brands
-- ===================== GROCERIES =====================
INSERT INTO offers.offers (id, merchant_id, title, description, offer_type, category, cashback_rate, cashback_cap, min_spend, currency, terms, status, brand, image_url, redemption_type, max_activations, current_activations, start_date, end_date, created_by)
VALUES
  ('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10% Cashback at Tesco', 'Earn 10% cashback on your weekly grocery shop. Valid on all in-store and online purchases over £20. Stack with Clubcard deals for maximum savings.', 'CASHBACK', 'Groceries', 10.00, 25.00, 20.00, 'GBP', 'Maximum cashback £25 per transaction. Valid for 30 days after activation. Cannot be combined with other cashback offers.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop', 'CARD_LINKED', 5000, 342, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'merchant@tesco.com'),

  ('a0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '5% Back on Fresh Produce', 'Get 5% cashback on all fresh fruit, vegetables, and organic products. Support local farmers while saving money.', 'CASHBACK', 'Groceries', 5.00, 15.00, 10.00, 'GBP', 'Applies to fresh produce section only. Max £15 cashback per month.', 'LIVE', 'BRAND_B', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=250&fit=crop', 'CARD_LINKED', 3000, 187, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 'merchant@tesco.com'),

  ('a0000001-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '15% Cashback at Sainsburys', 'Exclusive 15% cashback on your next Sainsburys shop. Perfect for stocking up on essentials.', 'CASHBACK', 'Groceries', 15.00, 30.00, 30.00, 'GBP', 'Valid on single transaction over £30. First 2000 activations only.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=250&fit=crop', 'CARD_LINKED', 2000, 856, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 'merchant@sainsburys.com'),

-- ===================== FASHION =====================
  ('a0000002-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20% Off at Nike', 'Score 20% cashback on all Nike footwear and apparel. New season, new savings. Available both in-store and online.', 'CASHBACK', 'Fashion', 20.00, 50.00, 50.00, 'GBP', 'Excludes sale items. Max cashback £50. Valid for online and in-store purchases.', 'LIVE', 'BRAND_C', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=250&fit=crop', 'CARD_LINKED', 1500, 423, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', 'merchant@nike.com'),

  ('a0000002-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Nike Members Exclusive: Free Shipping + 10%', 'As a connected commerce member, enjoy free shipping plus 10% cashback on all Nike.com orders.', 'CASHBACK', 'Fashion', 10.00, 30.00, 25.00, 'GBP', 'Online only. Standard delivery. Max cashback £30 per order.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=250&fit=crop', 'VOUCHER_CODE', 3000, 612, NOW() - INTERVAL '14 days', NOW() + INTERVAL '16 days', 'merchant@nike.com'),

  ('a0000002-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', '8% Cashback at H&M', 'Refresh your wardrobe with 8% cashback on all H&M purchases. From basics to statement pieces.', 'CASHBACK', 'Fashion', 8.00, 20.00, 15.00, 'GBP', 'Valid in-store and online. Excludes gift cards.', 'LIVE', 'BRAND_B', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop', 'CARD_LINKED', 4000, 298, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', 'merchant@hm.com'),

-- ===================== DINING =====================
  ('a0000003-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '25% Cashback at Costa Coffee', 'Enjoy 25% cashback on your daily coffee and snacks at Costa. Hot drinks, cold drinks, and bakery items all qualify.', 'CASHBACK', 'Dining', 25.00, 10.00, 3.00, 'GBP', 'Maximum 2 transactions per day. Max cashback £10 per month.', 'LIVE', 'BRAND_D', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop', 'CARD_LINKED', 10000, 1523, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days', 'merchant@costa.com'),

  ('a0000003-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', '12% Back at Nandos', 'Get 12% cashback on all Nandos orders. Dine in or takeaway, the savings are spicy.', 'CASHBACK', 'Dining', 12.00, 20.00, 15.00, 'GBP', 'Valid at all UK Nandos locations. Dine-in and takeaway.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop', 'CARD_LINKED', 5000, 891, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', 'merchant@nandos.com'),

  ('a0000003-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 'Win a Michelin Star Dinner', 'Spend £50+ at any partner restaurant this month for a chance to win a Michelin star dining experience for two.', 'PRIZE_DRAW', 'Dining', NULL, NULL, 50.00, 'GBP', 'One entry per qualifying transaction. Draw date: end of month.', 'LIVE', 'BRAND_C', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop', 'CARD_LINKED', NULL, 234, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', 'admin@platform.com'),

-- ===================== TRAVEL =====================
  ('a0000004-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '£50 Off Booking.com Hotels', 'Get £50 off your next hotel booking when you spend £200+. Perfect for weekend getaways and holidays.', 'VOUCHER', 'Travel', NULL, 50.00, 200.00, 'GBP', 'Single use voucher. Min 2-night stay. Excludes non-refundable bookings.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop', 'VOUCHER_CODE', 500, 123, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', 'merchant@booking.com'),

  ('a0000004-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', '7% Back on Flights', 'Earn 7% cashback on flight bookings through our partner airlines. Business and economy class eligible.', 'CASHBACK', 'Travel', 7.00, 100.00, 100.00, 'GBP', 'Valid on direct bookings only. Max cashback £100 per booking.', 'LIVE', 'BRAND_B', 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=250&fit=crop', 'CARD_LINKED', 2000, 456, NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', 'merchant@flights.com'),

-- ===================== ELECTRONICS =====================
  ('a0000005-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '5% Cashback at Currys', 'Get 5% cashback on all electronics, appliances, and tech accessories at Currys.', 'CASHBACK', 'Electronics', 5.00, 75.00, 50.00, 'GBP', 'Valid on all products except Apple devices. Max cashback £75.', 'LIVE', 'BRAND_D', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=250&fit=crop', 'CARD_LINKED', 3000, 567, NOW() - INTERVAL '9 days', NOW() + INTERVAL '21 days', 'merchant@currys.com'),

  ('a0000005-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'Double Cashback on Smart Home', 'Earn double cashback (10%) on all smart home devices. Lights, speakers, cameras and more.', 'CASHBACK', 'Electronics', 10.00, 40.00, 30.00, 'GBP', 'Smart home category only. Valid online and in-store.', 'LIVE', 'BRAND_C', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=250&fit=crop', 'CARD_LINKED', 1000, 189, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'merchant@currys.com'),

-- ===================== ENTERTAINMENT =====================
  ('a0000006-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', '3 Months Free Spotify Premium', 'Activate to receive a voucher for 3 months of Spotify Premium. Stream ad-free music anywhere.', 'EXPERIENCE', 'Entertainment', NULL, NULL, NULL, 'GBP', 'New Spotify Premium subscribers only. After trial, standard pricing applies.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=250&fit=crop', 'VOUCHER_CODE', 5000, 2341, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'merchant@spotify.com'),

  ('a0000006-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', '15% Off Cinema Tickets', 'Enjoy 15% discount on all cinema tickets at Odeon and Vue. Includes IMAX and 3D screenings.', 'DISCOUNT_CODE', 'Entertainment', 15.00, 10.00, 8.00, 'GBP', 'Max 4 tickets per transaction. Valid 7 days a week.', 'LIVE', 'BRAND_B', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=250&fit=crop', 'VOUCHER_CODE', 8000, 1567, NOW() - INTERVAL '11 days', NOW() + INTERVAL '19 days', 'merchant@odeon.com'),

-- ===================== HEALTH & WELLNESS =====================
  ('a0000007-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', '£10 Off First Gym Session', 'Try any partner gym for free with £10 off your first visit. No commitment required.', 'VOUCHER', 'Health & Wellness', NULL, 10.00, NULL, 'GBP', 'First visit only. Present voucher at reception. Valid at participating gyms.', 'LIVE', 'BRAND_D', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop', 'VOUCHER_CODE', 2000, 890, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', 'merchant@gym.com'),

  ('a0000007-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000014', '20% Cashback at Boots', 'Earn 20% cashback on health and beauty products at Boots. From skincare to vitamins.', 'CASHBACK', 'Health & Wellness', 20.00, 25.00, 10.00, 'GBP', 'Excludes prescriptions and pharmacy services. Max cashback £25.', 'LIVE', 'BRAND_A', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=250&fit=crop', 'CARD_LINKED', 6000, 1234, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', 'merchant@boots.com'),

-- ===================== PENDING REVIEW / DRAFT offers =====================
  ('a0000008-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30% Cashback on Nike Kids', 'Get 30% cashback on all Nike kids footwear and clothing. Perfect for back-to-school shopping.', 'CASHBACK', 'Fashion', 30.00, 40.00, 25.00, 'GBP', 'Kids range only (ages 3-16). Max cashback £40.', 'PENDING_REVIEW', 'BRAND_C', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=250&fit=crop', 'CARD_LINKED', 1000, 0, NOW() + INTERVAL '2 days', NOW() + INTERVAL '32 days', 'merchant@nike.com'),

  ('a0000008-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Free Coffee Friday', 'Every Friday, get a free regular coffee with any food purchase at Costa.', 'EXPERIENCE', 'Dining', NULL, NULL, 5.00, 'GBP', 'Valid Fridays only. One free coffee per customer per Friday.', 'DRAFT', 'BRAND_D', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=250&fit=crop', 'CARD_LINKED', NULL, 0, NOW() + INTERVAL '5 days', NOW() + INTERVAL '35 days', 'merchant@costa.com'),

  ('a0000008-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'Luxury Hotel Weekend Package', 'Book a luxury weekend and earn 15% cashback on stays over £300. Spa access included.', 'CASHBACK', 'Travel', 15.00, 100.00, 300.00, 'GBP', 'Weekend bookings only. Min 2 nights.', 'PENDING_REVIEW', 'BRAND_B', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop', 'CARD_LINKED', 200, 0, NOW() + INTERVAL '3 days', NOW() + INTERVAL '33 days', 'merchant@booking.com')

ON CONFLICT (id) DO NOTHING;

-- 5. Seed audit log entries for the LIVE offers
INSERT INTO offers.offer_audit_log (offer_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, NULL, 'DRAFT', created_by, 'Offer created', created_at - INTERVAL '3 days'
FROM offers.offers WHERE id::text LIKE 'a0000%' AND status = 'LIVE'
ON CONFLICT DO NOTHING;

INSERT INTO offers.offer_audit_log (offer_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, 'DRAFT', 'PENDING_REVIEW', created_by, 'Submitted for review', created_at - INTERVAL '2 days'
FROM offers.offers WHERE id::text LIKE 'a0000%' AND status = 'LIVE'
ON CONFLICT DO NOTHING;

INSERT INTO offers.offer_audit_log (offer_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, 'PENDING_REVIEW', 'APPROVED', 'compliance@platform.com', 'Passed compliance checks', created_at - INTERVAL '1 day'
FROM offers.offers WHERE id::text LIKE 'a0000%' AND status = 'LIVE'
ON CONFLICT DO NOTHING;

INSERT INTO offers.offer_audit_log (offer_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, 'APPROVED', 'LIVE', 'admin@platform.com', 'Published to customers', created_at
FROM offers.offers WHERE id::text LIKE 'a0000%' AND status = 'LIVE'
ON CONFLICT DO NOTHING;
