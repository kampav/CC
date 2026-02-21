-- v1.2.0: Enrich commercial_customers with CRM-grade fields

ALTER TABLE partners.commercial_customers
  ADD COLUMN IF NOT EXISTS company_type        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sic_code            VARCHAR(10),
  ADD COLUMN IF NOT EXISTS employee_count      INTEGER,
  ADD COLUMN IF NOT EXISTS annual_revenue_band VARCHAR(30)
    CHECK (annual_revenue_band IN ('UNDER_1M','1M_TO_10M','10M_TO_50M','OVER_50M')),
  ADD COLUMN IF NOT EXISTS relationship_tier   VARCHAR(30) DEFAULT 'STANDARD'
    CHECK (relationship_tier IN ('STANDARD','PREFERRED','STRATEGIC')),
  ADD COLUMN IF NOT EXISTS primary_product     VARCHAR(50) DEFAULT 'CASHBACK_OFFERS',
  ADD COLUMN IF NOT EXISTS kyb_documents       JSONB DEFAULT '{}';

-- Update existing rows with realistic CRM data
UPDATE partners.commercial_customers
SET company_type = 'PLC', sic_code = '4711', employee_count = 5000,
    annual_revenue_band = 'OVER_50M', relationship_tier = 'STRATEGIC',
    primary_product = 'CASHBACK_OFFERS'
WHERE status = 'APPROVED' AND company_name ILIKE '%Horizon%';

UPDATE partners.commercial_customers
SET company_type = 'LTD', sic_code = '5551', employee_count = 120,
    annual_revenue_band = '1M_TO_10M', relationship_tier = 'PREFERRED',
    primary_product = 'CASHBACK_OFFERS'
WHERE status = 'KYB_IN_PROGRESS' AND company_name ILIKE '%BlueSky%';

UPDATE partners.commercial_customers
SET company_type = 'PLC', sic_code = '6201', employee_count = 2500,
    annual_revenue_band = 'OVER_50M', relationship_tier = 'STRATEGIC',
    primary_product = 'CASHBACK_OFFERS'
WHERE status = 'APPROVED' AND company_name ILIKE '%Tech%';

UPDATE partners.commercial_customers
SET company_type = 'LTD', sic_code = '7490', employee_count = 45,
    annual_revenue_band = 'UNDER_1M', relationship_tier = 'STANDARD',
    primary_product = 'CASHBACK_OFFERS'
WHERE status = 'PENDING_ONBOARDING' AND company_name ILIKE '%Green%';

UPDATE partners.commercial_customers
SET company_type = 'LLP', sic_code = '6920', employee_count = 80,
    annual_revenue_band = '1M_TO_10M', relationship_tier = 'PREFERRED',
    primary_product = 'CASHBACK_OFFERS'
WHERE status = 'PENDING_ONBOARDING' AND company_name ILIKE '%Capital%';
