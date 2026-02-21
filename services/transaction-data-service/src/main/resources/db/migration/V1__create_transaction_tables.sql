-- V1: Banking transaction history and spending summaries
-- MCC-enriched transactions with keyset pagination for 25M-scale

CREATE TABLE banking_transactions.transactions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id            UUID         NOT NULL,
    amount                 DECIMAL(12,2) NOT NULL,
    currency               VARCHAR(3)   DEFAULT 'GBP',
    merchant_name          VARCHAR(255),
    merchant_category_code VARCHAR(10),   -- MCC: 5411=Grocery, 5812=Restaurant, 5045=Electronics, etc.
    category               VARCHAR(100),  -- Enriched from MCC
    sub_category           VARCHAR(100),
    channel                VARCHAR(30)  CHECK (channel IN ('POS','ONLINE','CONTACTLESS','ATM')),
    status                 VARCHAR(20)  DEFAULT 'POSTED' CHECK (status IN ('POSTED','PENDING','REVERSED')),
    transaction_date       TIMESTAMPTZ  NOT NULL,
    posted_date            TIMESTAMPTZ,
    created_at             TIMESTAMPTZ  DEFAULT NOW()
);

-- Composite index for keyset pagination — no OFFSET needed
CREATE INDEX idx_txn_customer_date     ON banking_transactions.transactions(customer_id, transaction_date DESC);
CREATE INDEX idx_txn_customer_category ON banking_transactions.transactions(customer_id, category);
CREATE INDEX idx_txn_status            ON banking_transactions.transactions(status);

CREATE TABLE banking_transactions.spending_summaries (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID         NOT NULL,
    category          VARCHAR(100) NOT NULL,
    period_type       VARCHAR(20)  CHECK (period_type IN ('MONTHLY','QUARTERLY','ANNUAL')),
    period_start      DATE         NOT NULL,
    period_end        DATE         NOT NULL,
    total_spend       DECIMAL(12,2),
    transaction_count INTEGER,
    avg_transaction   DECIMAL(10,2),
    computed_at       TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (customer_id, category, period_type, period_start)
);

CREATE INDEX idx_summary_customer ON banking_transactions.spending_summaries(customer_id);
CREATE INDEX idx_summary_period   ON banking_transactions.spending_summaries(customer_id, period_type, period_start);
