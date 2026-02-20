-- V1__create_partners_table.sql
-- Schema: partners (owned by partner-service)

CREATE TABLE IF NOT EXISTS partners.partners (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name       VARCHAR(255) NOT NULL,
    trading_name        VARCHAR(255),
    registration_number VARCHAR(50),
    contact_email       VARCHAR(255) NOT NULL,
    contact_name        VARCHAR(255),
    phone               VARCHAR(20),
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    postcode            VARCHAR(10),
    status              VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    category            VARCHAR(100),
    logo_url            VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(100),

    CONSTRAINT uq_partners_contact_email UNIQUE (contact_email),
    CONSTRAINT chk_partner_status CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'DEACTIVATED'))
);

-- Indexes for common query patterns
CREATE INDEX idx_partners_status ON partners.partners (status);
CREATE INDEX idx_partners_contact_email ON partners.partners (contact_email);
CREATE INDEX idx_partners_business_name ON partners.partners (business_name);
CREATE INDEX idx_partners_created_at ON partners.partners (created_at DESC);

-- Audit log table
CREATE TABLE IF NOT EXISTS partners.partner_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    partner_id      UUID NOT NULL REFERENCES partners.partners(id),
    previous_status VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      VARCHAR(100),
    reason          TEXT,
    changed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partner_audit_partner_id ON partners.partner_audit_log (partner_id);
CREATE INDEX idx_partner_audit_changed_at ON partners.partner_audit_log (changed_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION partners.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partners_updated_at
    BEFORE UPDATE ON partners.partners
    FOR EACH ROW
    EXECUTE FUNCTION partners.update_updated_at();
