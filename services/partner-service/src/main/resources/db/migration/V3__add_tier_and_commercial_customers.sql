-- V3: Add merchant tier and commercial customer onboarding table

ALTER TABLE partners.partners
  ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'BRONZE'
    CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'));

-- Assign tiers to seeded partners based on category/size
UPDATE partners.partners SET tier = 'GOLD'     WHERE business_name IN ('Tesco PLC', 'Sainsbury''s Supermarkets Ltd');
UPDATE partners.partners SET tier = 'SILVER'   WHERE business_name IN ('Nike UK Ltd', 'Booking.com BV', 'H&M Hennes & Mauritz UK Ltd');
UPDATE partners.partners SET tier = 'BRONZE'   WHERE tier IS NULL OR tier = 'BRONZE';

CREATE TABLE IF NOT EXISTS partners.commercial_customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     VARCHAR(255) NOT NULL,
  crn              VARCHAR(50),
  contact_name     VARCHAR(255),
  contact_email    VARCHAR(255),
  industry         VARCHAR(100),
  annual_spend_gbp DECIMAL(14,2),
  status           VARCHAR(30) DEFAULT 'PENDING_ONBOARDING'
                     CHECK (status IN ('PENDING_ONBOARDING','KYB_IN_PROGRESS','APPROVED','REJECTED')),
  onboarded_by     UUID,
  onboarded_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commercial_customers_status ON partners.commercial_customers(status);
CREATE INDEX IF NOT EXISTS idx_commercial_customers_email  ON partners.commercial_customers(contact_email);

-- Seed a few demo commercial customers
INSERT INTO partners.commercial_customers (company_name, crn, contact_name, contact_email, industry, annual_spend_gbp, status) VALUES
  ('Horizon Retail Group',    '12345678', 'Sarah Mitchell',  'sarah.mitchell@horizonretail.co.uk',    'Retail',       2500000.00, 'APPROVED'),
  ('BlueSky Hospitality Ltd', '23456789', 'James Thornton',  'j.thornton@bluesky-hospitality.co.uk',  'Hospitality',  850000.00,  'KYB_IN_PROGRESS'),
  ('TechNova Solutions',      '34567890', 'Priya Sharma',    'priya@technovasolutions.com',           'Technology',   1200000.00, 'PENDING_ONBOARDING'),
  ('Urban Fitness Co.',       '45678901', 'Liam Brooks',     'liam@urbanfitness.co.uk',               'Health',       320000.00,  'APPROVED'),
  ('Prestige Motors UK',      '56789012', 'Charlotte Davies','c.davies@prestigemotors.co.uk',         'Automotive',   5000000.00, 'PENDING_ONBOARDING')
ON CONFLICT DO NOTHING;
