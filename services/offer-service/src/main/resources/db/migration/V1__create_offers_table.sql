-- V1__create_offers_table.sql
-- Connected Commerce Platform - Offer Catalogue Schema
-- Schema: offers (owned by offer-service)

CREATE TABLE IF NOT EXISTS offers.offers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    offer_type      VARCHAR(50) NOT NULL DEFAULT 'CASHBACK',
    category        VARCHAR(100),
    cashback_rate   DECIMAL(5,2) CHECK (cashback_rate >= 0 AND cashback_rate <= 100),
    cashback_cap    DECIMAL(10,2),
    min_spend       DECIMAL(10,2) DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'GBP',
    terms           TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    brand           VARCHAR(50) NOT NULL DEFAULT 'LLOYDS',
    image_url       VARCHAR(500),
    redemption_type VARCHAR(50) DEFAULT 'CARD_LINKED',
    max_activations INTEGER,
    current_activations INTEGER NOT NULL DEFAULT 0,
    start_date      TIMESTAMP WITH TIME ZONE,
    end_date        TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100),

    CONSTRAINT chk_offer_type CHECK (offer_type IN ('CASHBACK', 'DISCOUNT_CODE', 'VOUCHER', 'EXPERIENCE', 'PRIZE_DRAW')),
    CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'LIVE', 'PAUSED', 'EXPIRED', 'RETIRED')),
    CONSTRAINT chk_brand CHECK (brand IN ('LLOYDS', 'HALIFAX', 'BOS', 'SCOTTISH_WIDOWS')),
    CONSTRAINT chk_redemption_type CHECK (redemption_type IN ('CARD_LINKED', 'VOUCHER_CODE', 'BARCODE', 'WALLET_PASS')),
    CONSTRAINT chk_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

-- Indexes for common query patterns
CREATE INDEX idx_offers_status ON offers.offers (status);
CREATE INDEX idx_offers_merchant_id ON offers.offers (merchant_id);
CREATE INDEX idx_offers_category ON offers.offers (category);
CREATE INDEX idx_offers_brand ON offers.offers (brand);
CREATE INDEX idx_offers_live_dates ON offers.offers (status, start_date, end_date)
    WHERE status = 'LIVE';
CREATE INDEX idx_offers_created_at ON offers.offers (created_at DESC);

-- Offer audit log for lifecycle state changes
CREATE TABLE IF NOT EXISTS offers.offer_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    offer_id        UUID NOT NULL REFERENCES offers.offers(id),
    previous_status VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      VARCHAR(100),
    reason          TEXT,
    changed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_offer_id ON offers.offer_audit_log (offer_id);
CREATE INDEX idx_audit_changed_at ON offers.offer_audit_log (changed_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION offers.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_offers_updated_at
    BEFORE UPDATE ON offers.offers
    FOR EACH ROW
    EXECUTE FUNCTION offers.update_updated_at();
