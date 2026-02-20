-- V5: Add commission_rate to offers for bank revenue tier model
ALTER TABLE offers.offers
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;

-- Set initial commission rates based on category
UPDATE offers.offers SET commission_rate = 10.00 WHERE commission_rate IS NULL;
