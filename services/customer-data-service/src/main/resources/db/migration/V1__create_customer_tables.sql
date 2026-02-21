-- V1: Customer profiles and classifications schema
-- Bank-style customer data model for 25M-scale personalisation

CREATE TABLE customers.profiles (
    id                       UUID PRIMARY KEY,
    first_name               VARCHAR(100)  NOT NULL,
    last_name                VARCHAR(100)  NOT NULL,
    date_of_birth            DATE,
    postcode_prefix          VARCHAR(4),
    income_band              VARCHAR(30)   CHECK (income_band IN ('UNDER_25K','25K_TO_50K','50K_TO_100K','OVER_100K')),
    customer_segment         VARCHAR(30)   CHECK (customer_segment IN ('MASS_MARKET','MASS_AFFLUENT','PREMIER','PRIVATE')),
    lifecycle_stage          VARCHAR(30)   CHECK (lifecycle_stage IN ('NEW','GROWING','MATURE','AT_RISK','DORMANT')),
    credit_score_band        VARCHAR(20)   CHECK (credit_score_band IN ('POOR','FAIR','GOOD','EXCELLENT')),
    primary_spend_category   VARCHAR(100),
    secondary_spend_category VARCHAR(100),
    spend_pattern            VARCHAR(50)   CHECK (spend_pattern IN ('DEAL_SEEKER','BRAND_LOYAL','CONVENIENCE_SHOPPER','EXPERIENCE_SEEKER')),
    digital_engagement_score INTEGER       CHECK (digital_engagement_score BETWEEN 0 AND 100),
    marketing_consent        BOOLEAN       DEFAULT true,
    created_at               TIMESTAMPTZ   DEFAULT NOW(),
    updated_at               TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE customers.classifications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id          UUID         NOT NULL REFERENCES customers.profiles(id) ON DELETE CASCADE,
    classification_type  VARCHAR(50)  NOT NULL,   -- SEGMENT, AFFINITY, PROPENSITY, CHANNEL_PREFERENCE
    classification_value VARCHAR(100) NOT NULL,   -- e.g. DINING_AFFINITY, HIGH_TRAVEL_PROPENSITY
    confidence_score     DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    effective_date       DATE,
    source               VARCHAR(50),             -- RULES_ENGINE, ML_MODEL, MANUAL
    created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Indexes for 25M-scale queries
CREATE INDEX idx_profiles_segment   ON customers.profiles(customer_segment);
CREATE INDEX idx_profiles_lifecycle ON customers.profiles(lifecycle_stage);
CREATE INDEX idx_profiles_pattern   ON customers.profiles(spend_pattern);

CREATE INDEX idx_classifications_customer      ON customers.classifications(customer_id);
CREATE INDEX idx_classifications_type_value    ON customers.classifications(classification_type, classification_value);
