-- Campaigns: group offers into managed campaigns with scheduling and targeting
CREATE TABLE IF NOT EXISTS offers.campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','SCHEDULED','ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
    target_segment  VARCHAR(50)  -- MASS, AFFLUENT, PRIVATE, ALL
                        CHECK (target_segment IS NULL OR target_segment IN ('ALL','MASS','AFFLUENT','PRIVATE')),
    target_brands   VARCHAR(255), -- comma-separated: LLOYDS,HALIFAX,BOS,SCOTTISH_WIDOWS
    priority        INTEGER NOT NULL DEFAULT 0,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    budget_gbp      DECIMAL(12,2),
    spent_gbp       DECIMAL(12,2) DEFAULT 0,
    created_by      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link offers to campaigns (many-to-many)
CREATE TABLE IF NOT EXISTS offers.campaign_offers (
    campaign_id UUID NOT NULL REFERENCES offers.campaigns(id) ON DELETE CASCADE,
    offer_id    UUID NOT NULL REFERENCES offers.offers(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (campaign_id, offer_id)
);

-- Add campaign_id convenience column on offers (optional single-campaign link)
ALTER TABLE offers.offers ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES offers.campaigns(id);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON offers.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON offers.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_offers_offer ON offers.campaign_offers(offer_id);
CREATE INDEX IF NOT EXISTS idx_offers_campaign ON offers.offers(campaign_id);

-- Audit trigger
CREATE OR REPLACE FUNCTION offers.update_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_campaigns_updated
    BEFORE UPDATE ON offers.campaigns
    FOR EACH ROW EXECUTE FUNCTION offers.update_campaigns_timestamp();
