# Connected Commerce - Data Model

> **WHAT IS THIS?** This file documents every database table — what data we store and what each column means.
>
> **Version:** v1.2.0
>
> **FOR AI:** When adding/changing any database column or table:
> 1. Create a NEW Flyway migration file (e.g., V3__add_column.sql). NEVER edit an existing migration.
> 2. Update the JPA entity class
> 3. Update DTOs if the field is exposed via API
> 4. Update this file
> 5. Update API-CONTRACTS.md if the API response changes
> 6. Update FEATURE-REGISTRY.md

---

## Database: connected_commerce (PostgreSQL 16)

**Connection details (local development):**
- Host: localhost
- Port: 5432
- Database: connected_commerce
- Username: commerce
- Password: commerce_dev

```powershell
# Connect manually:
docker exec -it cc-postgres psql -U commerce -d connected_commerce
```

---

## Schema: offers

**Owned by:** offer-service (port 8081)
**Migrations:** `services/offer-service/src/main/resources/db/migration/`

### Table: offers.offers

Each row is one offer (e.g., "10% cashback at Tesco").

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Unique offer identifier |
| merchant_id | UUID | Yes | -- | Which merchant created this |
| title | VARCHAR(255) | Yes | -- | Offer headline |
| description | TEXT | No | -- | Longer description |
| offer_type | VARCHAR(50) | Yes | 'CASHBACK' | CASHBACK, DISCOUNT_CODE, VOUCHER, EXPERIENCE, PRIZE_DRAW |
| category | VARCHAR(100) | No | -- | Category: Groceries, Fashion, Travel, Dining, etc. |
| cashback_rate | DECIMAL(5,2) | No | -- | Percentage (0-100) |
| cashback_cap | DECIMAL(10,2) | No | -- | Max cashback in pounds |
| min_spend | DECIMAL(10,2) | No | 0 | Minimum purchase to qualify |
| currency | VARCHAR(3) | Yes | 'GBP' | Currency code |
| terms | TEXT | No | -- | Terms and conditions |
| status | VARCHAR(30) | Yes | 'DRAFT' | Lifecycle state |
| brand | VARCHAR(50) | Yes | 'LLOYDS' | LLOYDS, HALIFAX, BOS, SCOTTISH_WIDOWS |
| image_url | VARCHAR(500) | No | -- | Offer image URL |
| redemption_type | VARCHAR(50) | No | 'CARD_LINKED' | CARD_LINKED, VOUCHER_CODE, BARCODE, WALLET_PASS |
| max_activations | INTEGER | No | null (unlimited) | Activation limit |
| current_activations | INTEGER | Yes | 0 | Current activation count |
| commission_rate | DECIMAL(5,2) | No | 10.00 | Bank commission rate (added V5) |
| start_date | TIMESTAMPTZ | No | -- | When offer becomes available |
| end_date | TIMESTAMPTZ | No | -- | When offer expires |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified (trigger-updated) |
| created_by | VARCHAR(100) | No | -- | Creator email/ID |

**Indexes:** idx_offers_status, idx_offers_merchant_id, idx_offers_category, idx_offers_brand, idx_offers_live_dates, idx_offers_created_at

### Table: offers.offer_audit_log

Every status change is recorded here for audit compliance.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | BIGSERIAL | Yes (auto) | Auto-increment | Row ID |
| offer_id | UUID | Yes | -- | Which offer changed |
| previous_status | VARCHAR(30) | No | -- | Status before change |
| new_status | VARCHAR(30) | Yes | -- | Status after change |
| changed_by | VARCHAR(100) | No | -- | Who made the change |
| reason | TEXT | No | -- | Why it was changed |
| changed_at | TIMESTAMPTZ | Yes (auto) | NOW() | When it happened |

### Table: offers.campaigns

Groups of offers with targeting, scheduling, and budgets.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Campaign identifier |
| name | VARCHAR(255) | Yes | -- | Campaign name |
| description | TEXT | No | -- | Campaign description |
| status | VARCHAR(30) | Yes | 'DRAFT' | DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, ARCHIVED |
| target_segment | VARCHAR(100) | No | -- | Target audience segment |
| target_brands | VARCHAR(255) | No | -- | Comma-separated brand targets |
| priority | INTEGER | Yes | 0 | Display priority (higher = more prominent) |
| start_date | TIMESTAMPTZ | No | -- | Campaign start |
| end_date | TIMESTAMPTZ | No | -- | Campaign end |
| budget_gbp | DECIMAL(12,2) | No | -- | Budget in pounds |
| spent_gbp | DECIMAL(12,2) | Yes | 0 | Amount spent |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified |

### Table: offers.campaign_offers (join table)

| Column | Type | Description |
|--------|------|-------------|
| campaign_id | UUID | FK → campaigns.id |
| offer_id | UUID | FK → offers.id |

**Migrations:**
- V1: offers + offer_audit_log + indexes + triggers
- V2: campaigns + campaign_offers join table
- V3: rebrand + seed data (32 offers)
- V4: campaign seed + 8 more offers
- V5: commission_rate column

---

## Schema: partners

**Owned by:** partner-service (port 8082)
**Migrations:** `services/partner-service/src/main/resources/db/migration/`

### Table: partners.partners

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Partner identifier |
| business_name | VARCHAR(255) | Yes | -- | Company name |
| registration_number | VARCHAR(50) | No | -- | Company registration number |
| contact_email | VARCHAR(255) | Yes | -- | Primary contact email |
| contact_phone | VARCHAR(50) | No | -- | Contact phone |
| address | TEXT | No | -- | Business address |
| category | VARCHAR(100) | No | -- | Business category |
| status | VARCHAR(30) | Yes | 'PENDING' | PENDING, APPROVED, SUSPENDED, DEACTIVATED |
| tier | VARCHAR(30) | No | 'STANDARD' | BRONZE, SILVER, GOLD, PLATINUM |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Registration date |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified |

### Table: partners.partner_audit_log

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | BIGSERIAL | Yes (auto) | Auto-increment | Row ID |
| partner_id | UUID | Yes | -- | Which partner changed |
| previous_status | VARCHAR(30) | No | -- | Status before |
| new_status | VARCHAR(30) | Yes | -- | Status after |
| changed_by | VARCHAR(100) | No | -- | Who changed it |
| reason | TEXT | No | -- | Why |
| changed_at | TIMESTAMPTZ | Yes (auto) | NOW() | When |

### Table: partners.commercial_customers

CRM-grade onboarded business customers (KYB workflow).

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Record identifier |
| company_name | VARCHAR(255) | Yes | -- | Company name |
| company_type | VARCHAR(50) | No | -- | PLC, LTD, LLP, SOLE_TRADER (added V4) |
| company_registration_number | VARCHAR(50) | No | -- | Companies House CRN |
| sic_code | VARCHAR(10) | No | -- | Standard Industry Classification code (added V4) |
| contact_email | VARCHAR(255) | Yes | -- | Primary contact |
| employee_count | INTEGER | No | -- | Headcount (added V4) |
| annual_revenue_band | VARCHAR(30) | No | -- | UNDER_1M, 1M_TO_10M, 10M_TO_50M, OVER_50M (added V4) |
| relationship_tier | VARCHAR(30) | No | 'STANDARD' | STANDARD, PREFERRED, STRATEGIC (added V4) |
| primary_product | VARCHAR(50) | No | 'CASHBACK_OFFERS' | Primary product line (added V4) |
| kyb_documents | JSONB | No | '{}' | Document references (added V4) |
| status | VARCHAR(30) | Yes | 'PENDING_ONBOARDING' | KYB lifecycle |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | |

**Migrations:**
- V1: partners + partner_audit_log
- V2: audit log
- V3: tier column + commercial_customers table (5 demo rows)
- V4: CRM-grade commercial customer fields

---

## Schema: redemptions

**Owned by:** redemption-service (port 8084)
**Migrations:** `services/redemption-service/src/main/resources/db/migration/`

### Table: redemptions.activations

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Activation identifier |
| customer_id | UUID | Yes | -- | Which customer activated |
| offer_id | UUID | Yes | -- | Which offer was activated |
| merchant_id | UUID | Yes | -- | The offer's merchant |
| status | VARCHAR(30) | Yes | 'ACTIVE' | ACTIVE, USED, EXPIRED, CANCELLED |
| activated_at | TIMESTAMPTZ | Yes (auto) | NOW() | When activated |
| expires_at | TIMESTAMPTZ | No | -- | When activation expires |

**Constraints:** Unique (customer_id, offer_id)

### Table: redemptions.transactions

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Transaction identifier |
| activation_id | UUID | Yes | -- | FK to activations.id |
| customer_id | UUID | Yes | -- | Customer who purchased |
| merchant_id | UUID | Yes | -- | Merchant where purchased |
| amount | DECIMAL(10,2) | Yes | -- | Purchase amount |
| currency | VARCHAR(3) | Yes | 'GBP' | Currency |
| card_last_four | VARCHAR(4) | No | -- | Last 4 digits of card |
| description | TEXT | No | -- | Transaction description |
| status | VARCHAR(30) | Yes | 'PENDING' | PENDING, MATCHED, CASHBACK_CREDITED, FAILED |
| transaction_date | TIMESTAMPTZ | Yes (auto) | NOW() | When purchase was made |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Record creation |

### Table: redemptions.cashback_credits

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Credit identifier |
| transaction_id | UUID | Yes | -- | FK to transactions.id |
| customer_id | UUID | Yes | -- | Customer receiving cashback |
| offer_id | UUID | Yes | -- | Offer that generated this |
| merchant_id | UUID | Yes | -- | Merchant for this offer |
| transaction_amount | DECIMAL(10,2) | Yes | -- | Original purchase amount |
| cashback_rate | DECIMAL(5,2) | Yes | -- | Rate at time of credit |
| cashback_amount | DECIMAL(10,2) | Yes | -- | Calculated cashback |
| status | VARCHAR(30) | Yes | 'CREDITED' | PENDING, CREDITED, REVERSED |
| credited_at | TIMESTAMPTZ | Yes (auto) | NOW() | When credited |

### Table: redemptions.revenue_ledger

Bank commission earned on every cashback credit.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Record identifier |
| cashback_credit_id | UUID | FK to cashback_credits.id |
| customer_id | UUID | Customer |
| merchant_tier | VARCHAR(30) | BRONZE/SILVER/GOLD/PLATINUM |
| cashback_amount | DECIMAL(10,2) | Customer's cashback |
| commission_rate | DECIMAL(5,2) | Bank's commission rate |
| commission_amount | DECIMAL(10,2) | Bank revenue earned |
| recorded_at | TIMESTAMPTZ | When recorded |

Tier commission rates: BRONZE 15% / SILVER 12% / GOLD 10% / PLATINUM 8%

**Migrations:**
- V1: activations + transactions + cashback_credits
- V2: demo data
- V3: 9 customer personas with activations + transactions
- V4: revenue_ledger table + backfill

---

## Schema: eligibility

**Owned by:** eligibility-service (port 8083)
**Note:** No database tables -- eligibility-service is stateless. It calls offer-service and redemption-service to make decisions.

---

## Schema: identity

**Owned by:** BFF (Node.js, port 3000) -- created on startup via `services/bff/src/identity.js`

### Table: identity.users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User identifier |
| email | VARCHAR(255) | Login email (unique) |
| password_hash | TEXT | bcrypt hash |
| role | VARCHAR(30) | CUSTOMER, MERCHANT, COLLEAGUE, EXEC |
| partner_id | UUID | Linked merchant partner (MERCHANT role) |
| customer_id | UUID | Linked customer profile (CUSTOMER role) |
| created_at | TIMESTAMPTZ | |

Demo users created on BFF startup (password: `demo1234`):
- customer@ through customer9@demo.com (9 customer users)
- merchant@, colleague@, exec@demo.com

---

## Schema: customers (v1.2.0)

**Owned by:** customer-data-service (port 8085)
**Migrations:** `services/customer-data-service/src/main/resources/db/migration/`

### Table: customers.profiles

Bank-style customer profile. ID matches `identity.users.customer_id`.

| Column | Type | Required? | Description |
|--------|------|-----------|-------------|
| id | UUID | Yes | Matches identity.users.customer_id |
| first_name | VARCHAR(100) | No | |
| last_name | VARCHAR(100) | No | |
| date_of_birth | DATE | No | |
| postcode_prefix | VARCHAR(4) | No | Anonymised (e.g. SW1A) |
| income_band | VARCHAR(30) | No | UNDER_25K, 25K_TO_50K, 50K_TO_100K, OVER_100K |
| customer_segment | VARCHAR(30) | No | MASS_MARKET, MASS_AFFLUENT, PREMIER, PRIVATE |
| lifecycle_stage | VARCHAR(30) | No | NEW, GROWING, MATURE, AT_RISK, DORMANT |
| credit_score_band | VARCHAR(20) | No | POOR, FAIR, GOOD, EXCELLENT |
| primary_spend_category | VARCHAR(100) | No | Top spending category |
| secondary_spend_category | VARCHAR(100) | No | Second spend category |
| spend_pattern | VARCHAR(50) | No | DEAL_SEEKER, BRAND_LOYAL, CONVENIENCE_SHOPPER, EXPERIENCE_SEEKER |
| digital_engagement_score | INTEGER | No | 0-100 |
| marketing_consent | BOOLEAN | No | true |
| created_at | TIMESTAMPTZ | Yes (auto) | |
| updated_at | TIMESTAMPTZ | Yes (auto) | |

**Indexes:** idx_profiles_segment, idx_profiles_lifecycle, idx_profiles_pattern

### Table: customers.classifications

ML/rules-based customer classification tags.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | |
| customer_id | UUID | FK to profiles.id |
| classification_type | VARCHAR(50) | SEGMENT, AFFINITY, PROPENSITY, CHANNEL_PREFERENCE |
| classification_value | VARCHAR(100) | e.g. DINING_AFFINITY, HIGH_TRAVEL_PROPENSITY |
| confidence_score | DECIMAL(3,2) | 0.00 - 1.00 |
| effective_date | DATE | |
| source | VARCHAR(50) | RULES_ENGINE, ML_MODEL, MANUAL |
| created_at | TIMESTAMPTZ | |

**Migrations:**
- V1: profiles + classifications tables + indexes
- V2: 9 demo customer profiles with classification tags

---

## Schema: banking_transactions (v1.2.0)

**Owned by:** transaction-data-service (port 8086)
**Migrations:** `services/transaction-data-service/src/main/resources/db/migration/`

### Table: banking_transactions.transactions

MCC-enriched card transaction history (90-day window for demo).

| Column | Type | Required? | Description |
|--------|------|-----------|-------------|
| id | UUID | Yes (auto) | |
| customer_id | UUID | Yes | |
| amount | DECIMAL(12,2) | Yes | Transaction amount |
| currency | VARCHAR(3) | Yes | 'GBP' |
| merchant_name | VARCHAR(255) | No | e.g. 'Waitrose', 'British Airways' |
| merchant_category_code | VARCHAR(10) | No | MCC code (5411=Grocery, 5812=Restaurant, 5045=Electronics) |
| category | VARCHAR(100) | No | Enriched from MCC |
| sub_category | VARCHAR(100) | No | |
| channel | VARCHAR(30) | No | POS, ONLINE, CONTACTLESS, ATM |
| status | VARCHAR(20) | Yes | 'POSTED' | POSTED, PENDING, REVERSED |
| transaction_date | TIMESTAMPTZ | Yes | |
| posted_date | TIMESTAMPTZ | No | |
| created_at | TIMESTAMPTZ | Yes (auto) | |

**Indexes:**
- `idx_txn_customer_date (customer_id, transaction_date DESC)` -- keyset pagination
- `idx_txn_customer_category (customer_id, category)` -- spending summary queries

### Table: banking_transactions.spending_summaries

Pre-computed category spending totals (refreshed periodically).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | |
| customer_id | UUID | |
| category | VARCHAR(100) | Spend category |
| period_type | VARCHAR(20) | MONTHLY, QUARTERLY, ANNUAL |
| period_start | DATE | |
| period_end | DATE | |
| total_spend | DECIMAL(12,2) | |
| transaction_count | INTEGER | |
| avg_transaction | DECIMAL(10,2) | |
| computed_at | TIMESTAMPTZ | |

**Unique constraint:** (customer_id, category, period_type, period_start)

**Migrations:**
- V1: transactions + spending_summaries tables + indexes
- V2: 90-day transaction history for 9 demo personas + pre-computed summaries

---

## Migration Rules

**CRITICAL:** Never edit an existing migration file. Flyway tracks which have run. If you change one, Flyway throws a checksum error.

To make changes:
1. Create a NEW file: `V6__description.sql`, `V7__description.sql`, etc.
2. Put it in `services/<service>/src/main/resources/db/migration/`
3. Restart the service -- Flyway applies it automatically

Current migrations summary:
| Service | Migrations | Latest |
|---------|-----------|--------|
| offer-service | V1-V5 | V5: commission_rate |
| partner-service | V1-V4 | V4: CRM commercial customer fields |
| redemption-service | V1-V4 | V4: revenue_ledger |
| customer-data-service | V1-V2 | V2: 9 demo personas |
| transaction-data-service | V1-V2 | V2: 90-day transaction history |
