-- Connected Commerce Platform - Database Initialization
-- Each service gets its own schema for domain separation

CREATE SCHEMA IF NOT EXISTS offers;
CREATE SCHEMA IF NOT EXISTS partners;
CREATE SCHEMA IF NOT EXISTS eligibility;
CREATE SCHEMA IF NOT EXISTS redemptions;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant usage to the commerce user
GRANT ALL PRIVILEGES ON SCHEMA offers TO commerce;
GRANT ALL PRIVILEGES ON SCHEMA partners TO commerce;
GRANT ALL PRIVILEGES ON SCHEMA eligibility TO commerce;
GRANT ALL PRIVILEGES ON SCHEMA redemptions TO commerce;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO commerce;

-- Confirm initialization
SELECT 'Connected Commerce database initialized with schemas: offers, partners, eligibility, redemptions, analytics' AS status;
