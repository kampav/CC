-- V2__seed_partners.sql
-- Seed partner/merchant data for demo

INSERT INTO partners.partners (id, business_name, trading_name, registration_number, contact_email, contact_name, phone, address_line1, city, postcode, status, category, logo_url, created_by)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tesco PLC', 'Tesco', '00445790', 'merchant@tesco.com', 'Sarah Johnson', '+44 20 7555 0100', 'Tesco House, Shire Park', 'Welwyn Garden City', 'AL7 1GA', 'APPROVED', 'Groceries', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000002', 'J Sainsbury PLC', 'Sainsburys', '00185647', 'merchant@sainsburys.com', 'James Wilson', '+44 20 7555 0200', '33 Holborn, Sainsburys Store Support Centre', 'London', 'EC1N 2HT', 'APPROVED', 'Groceries', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000003', 'Nike UK Ltd', 'Nike', '02361948', 'merchant@nike.com', 'Alex Thompson', '+44 20 7555 0300', 'Nike Town, 236 Oxford Street', 'London', 'W1C 1DE', 'APPROVED', 'Fashion', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000004', 'Costa Limited', 'Costa Coffee', '03298066', 'merchant@costa.com', 'Emma Brown', '+44 20 7555 0400', 'Costa House, Lambeth Road', 'London', 'SE1 7JN', 'APPROVED', 'Dining', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000005', 'Booking.com BV', 'Booking.com', 'NL805734958B01', 'merchant@booking.com', 'Michael Chen', '+31 20 555 0500', 'Herengracht 597', 'Amsterdam', 'NL 1017', 'APPROVED', 'Travel', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000006', 'H&M Hennes & Mauritz UK Ltd', 'H&M', '03158427', 'merchant@hm.com', 'Sofia Anderson', '+44 20 7555 0600', '25 Argyll Street', 'London', 'W1F 7TU', 'APPROVED', 'Fashion', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000007', 'Nandos UK Ltd', 'Nandos', '03166017', 'merchant@nandos.com', 'David Patel', '+44 20 7555 0700', '37 Windmill Street', 'London', 'W1T 2JW', 'APPROVED', 'Dining', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000008', 'MasterChef Experience Ltd', 'MasterChef Experience', '09876543', 'merchant@masterchef-exp.com', 'Gordon Smith', '+44 20 7555 0800', '1 Gourmet Lane', 'London', 'SW1A 1AA', 'PENDING', 'Dining', NULL, 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000009', 'SkyWings Airlines Ltd', 'SkyWings', '04567890', 'merchant@skywings.com', 'Rachel Kim', '+44 20 7555 0900', 'Terminal 5, Heathrow Airport', 'London', 'TW6 2GA', 'APPROVED', 'Travel', 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000010', 'Currys Group PLC', 'Currys', '00504877', 'merchant@currys.com', 'Tom Hughes', '+44 20 7555 1000', 'Currys House, Wembley Park', 'London', 'HA9 0FJ', 'APPROVED', 'Electronics', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000011', 'Spotify UK Ltd', 'Spotify', '08132497', 'merchant@spotify.com', 'Lisa Garcia', '+44 20 7555 1100', '4 Savoy Court', 'London', 'WC2R 0EZ', 'APPROVED', 'Entertainment', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000012', 'Odeon Cinemas Group Ltd', 'Odeon', '02629498', 'merchant@odeon.com', 'Chris Baker', '+44 20 7555 1200', '54-56 Leicester Square', 'London', 'WC2H 7NA', 'APPROVED', 'Entertainment', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop', 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000013', 'PureGym Ltd', 'PureGym', '06524568', 'merchant@puregym.com', 'Mark Davies', '+44 20 7555 1300', 'Town Centre House', 'Leeds', 'LS1 2HB', 'PENDING', 'Health & Wellness', NULL, 'admin@platform.com'),
  ('10000000-0000-0000-0000-000000000014', 'Boots UK Ltd', 'Boots', '00928555', 'merchant@boots.com', 'Hannah Wilson', '+44 20 7555 1400', 'Thane Road', 'Nottingham', 'NG90 1BS', 'APPROVED', 'Health & Wellness', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&h=100&fit=crop', 'admin@platform.com')
ON CONFLICT (id) DO NOTHING;

-- Seed audit log for the approved partners
INSERT INTO partners.partner_audit_log (partner_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, NULL, 'PENDING', created_by, 'Application submitted', created_at - INTERVAL '7 days'
FROM partners.partners WHERE status = 'APPROVED' AND id != '00000000-0000-0000-0000-000000000001';

INSERT INTO partners.partner_audit_log (partner_id, previous_status, new_status, changed_by, reason, changed_at)
SELECT id, 'PENDING', 'APPROVED', 'admin@platform.com', 'KYB checks passed', created_at
FROM partners.partners WHERE status = 'APPROVED' AND id != '00000000-0000-0000-0000-000000000001';
