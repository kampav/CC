-- V4: Revenue ledger — bank commission on every cashback credit

CREATE TABLE IF NOT EXISTS redemptions.revenue_ledger (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashback_credit_id UUID,
  merchant_id        UUID NOT NULL,
  offer_id           UUID NOT NULL,
  customer_id        UUID NOT NULL,
  cashback_amount    DECIMAL(10,2),
  commission_rate    DECIMAL(5,2),
  bank_revenue       DECIMAL(10,2),   -- cashback_amount * commission_rate / 100
  merchant_tier      VARCHAR(20),
  ledger_date        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_ledger_merchant    ON redemptions.revenue_ledger(merchant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_date        ON redemptions.revenue_ledger(ledger_date);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_credit      ON redemptions.revenue_ledger(cashback_credit_id);

-- Back-fill revenue ledger from existing cashback_credits (assume BRONZE tier = 15% commission)
INSERT INTO redemptions.revenue_ledger
  (cashback_credit_id, merchant_id, offer_id, customer_id, cashback_amount, commission_rate, bank_revenue, merchant_tier, ledger_date)
SELECT
  cc.id,
  cc.merchant_id,
  cc.offer_id,
  cc.customer_id,
  cc.cashback_amount,
  15.00                                          AS commission_rate,
  ROUND(cc.cashback_amount * 15.00 / 100, 2)   AS bank_revenue,
  'BRONZE'                                       AS merchant_tier,
  COALESCE(cc.credited_at, NOW())               AS ledger_date
FROM redemptions.cashback_credits cc
WHERE cc.status = 'CREDITED'
ON CONFLICT DO NOTHING;
