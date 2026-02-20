-- V1__create_redemptions_tables.sql
-- Schema: redemptions (owned by redemption-service)

-- Activations: when a customer activates an offer
CREATE TABLE IF NOT EXISTS redemptions.activations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL,
    offer_id        UUID NOT NULL,
    offer_title     VARCHAR(255),
    merchant_id     UUID,
    cashback_rate   DECIMAL(5,2),
    cashback_cap    DECIMAL(10,2),
    min_spend       DECIMAL(10,2) DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    activated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_activation UNIQUE (customer_id, offer_id),
    CONSTRAINT chk_activation_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'))
);

CREATE INDEX idx_activations_customer_id ON redemptions.activations (customer_id);
CREATE INDEX idx_activations_offer_id ON redemptions.activations (offer_id);
CREATE INDEX idx_activations_status ON redemptions.activations (status);
CREATE INDEX idx_activations_merchant_id ON redemptions.activations (merchant_id);

-- Transactions: simulated card transactions matched to activations
CREATE TABLE IF NOT EXISTS redemptions.transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_id   UUID NOT NULL REFERENCES redemptions.activations(id),
    customer_id     UUID NOT NULL,
    merchant_id     UUID,
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'GBP',
    card_last_four  VARCHAR(4),
    description     VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'MATCHED',
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_transaction_status CHECK (status IN ('PENDING', 'MATCHED', 'CASHBACK_CREDITED', 'REJECTED'))
);

CREATE INDEX idx_transactions_activation_id ON redemptions.transactions (activation_id);
CREATE INDEX idx_transactions_customer_id ON redemptions.transactions (customer_id);
CREATE INDEX idx_transactions_merchant_id ON redemptions.transactions (merchant_id);

-- Cashback credits: calculated cashback from transactions
CREATE TABLE IF NOT EXISTS redemptions.cashback_credits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id      UUID NOT NULL REFERENCES redemptions.transactions(id),
    customer_id         UUID NOT NULL,
    offer_id            UUID NOT NULL,
    merchant_id         UUID,
    transaction_amount  DECIMAL(10,2) NOT NULL,
    cashback_rate       DECIMAL(5,2) NOT NULL,
    cashback_amount     DECIMAL(10,2) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'CREDITED',
    credited_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_cashback_status CHECK (status IN ('PENDING', 'CREDITED', 'REVERSED'))
);

CREATE INDEX idx_cashback_customer_id ON redemptions.cashback_credits (customer_id);
CREATE INDEX idx_cashback_offer_id ON redemptions.cashback_credits (offer_id);
CREATE INDEX idx_cashback_merchant_id ON redemptions.cashback_credits (merchant_id);

-- Auto-update trigger for activations
CREATE OR REPLACE FUNCTION redemptions.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_activations_updated_at
    BEFORE UPDATE ON redemptions.activations
    FOR EACH ROW
    EXECUTE FUNCTION redemptions.update_updated_at();
