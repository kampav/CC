# Connected Commerce - Data Model

> **WHAT IS THIS?** This file documents every database table — what data we store and what each column means.
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
| merchant_id | UUID | Yes | — | Which merchant created this |
| title | VARCHAR(255) | Yes | — | Offer headline |
| description | TEXT | No | — | Longer description |
| offer_type | VARCHAR(50) | Yes | 'CASHBACK' | CASHBACK, DISCOUNT_CODE, VOUCHER, EXPERIENCE, PRIZE_DRAW |
| category | VARCHAR(100) | No | — | Category: Groceries, Fashion, Travel, Dining, etc. |
| cashback_rate | DECIMAL(5,2) | No | — | Percentage (0-100) |
| cashback_cap | DECIMAL(10,2) | No | — | Max cashback in pounds |
| min_spend | DECIMAL(10,2) | No | 0 | Minimum purchase to qualify |
| currency | VARCHAR(3) | Yes | 'GBP' | Currency code |
| terms | TEXT | No | — | Terms and conditions |
| status | VARCHAR(30) | Yes | 'DRAFT' | Lifecycle state |
| brand | VARCHAR(50) | Yes | 'LLOYDS' | LLOYDS, HALIFAX, BOS, SCOTTISH_WIDOWS |
| image_url | VARCHAR(500) | No | — | Offer image URL |
| redemption_type | VARCHAR(50) | No | 'CARD_LINKED' | CARD_LINKED, VOUCHER_CODE, BARCODE, WALLET_PASS |
| max_activations | INTEGER | No | null (unlimited) | Activation limit |
| current_activations | INTEGER | Yes | 0 | Current activation count |
| start_date | TIMESTAMPTZ | No | — | When offer becomes available |
| end_date | TIMESTAMPTZ | No | — | When offer expires |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified (trigger-updated) |
| created_by | VARCHAR(100) | No | — | Creator email/ID |

**Indexes:** idx_offers_status, idx_offers_merchant_id, idx_offers_category, idx_offers_brand, idx_offers_live_dates, idx_offers_created_at

### Table: offers.offer_audit_log

Every status change is recorded here for audit compliance.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | BIGSERIAL | Yes (auto) | Auto-increment | Row ID |
| offer_id | UUID | Yes | — | Which offer changed |
| previous_status | VARCHAR(30) | No | — | Status before change |
| new_status | VARCHAR(30) | Yes | — | Status after change |
| changed_by | VARCHAR(100) | No | — | Who made the change |
| reason | TEXT | No | — | Why it was changed |
| changed_at | TIMESTAMPTZ | Yes (auto) | NOW() | When it happened |

### Table: offers.campaigns

Groups of offers with targeting, scheduling, and budgets.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Campaign identifier |
| name | VARCHAR(255) | Yes | — | Campaign name |
| description | TEXT | No | — | Campaign description |
| status | VARCHAR(30) | Yes | 'DRAFT' | DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, ARCHIVED |
| target_segment | VARCHAR(100) | No | — | Target audience segment |
| target_brands | VARCHAR(255) | No | — | Comma-separated brand targets |
| priority | INTEGER | Yes | 0 | Display priority (higher = more prominent) |
| start_date | TIMESTAMPTZ | No | — | Campaign start |
| end_date | TIMESTAMPTZ | No | — | Campaign end |
| budget_gbp | DECIMAL(12,2) | No | — | Budget in pounds |
| spent_gbp | DECIMAL(12,2) | Yes | 0 | Amount spent |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified |

### Table: offers.campaign_offers (join table)

| Column | Type | Description |
|--------|------|-------------|
| campaign_id | UUID | FK → campaigns.id |
| offer_id | UUID | FK → offers.id |

---

## Schema: partners

**Owned by:** partner-service (port 8082)
**Migrations:** `services/partner-service/src/main/resources/db/migration/`

### Table: partners.partners

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Partner identifier |
| business_name | VARCHAR(255) | Yes | — | Company name |
| registration_number | VARCHAR(50) | No | — | Company registration number |
| contact_email | VARCHAR(255) | Yes | — | Primary contact email |
| contact_phone | VARCHAR(50) | No | — | Contact phone |
| address | TEXT | No | — | Business address |
| category | VARCHAR(100) | No | — | Business category |
| status | VARCHAR(30) | Yes | 'PENDING' | PENDING, APPROVED, SUSPENDED, DEACTIVATED |
| tier | VARCHAR(30) | No | 'STANDARD' | Partnership tier |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Registration date |
| updated_at | TIMESTAMPTZ | Yes (auto) | NOW() | Last modified |

### Table: partners.partner_audit_log

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | BIGSERIAL | Yes (auto) | Auto-increment | Row ID |
| partner_id | UUID | Yes | — | Which partner changed |
| previous_status | VARCHAR(30) | No | — | Status before |
| new_status | VARCHAR(30) | Yes | — | Status after |
| changed_by | VARCHAR(100) | No | — | Who changed it |
| reason | TEXT | No | — | Why |
| changed_at | TIMESTAMPTZ | Yes (auto) | NOW() | When |

---

## Schema: redemptions

**Owned by:** redemption-service (port 8084)
**Migrations:** `services/redemption-service/src/main/resources/db/migration/`

### Table: redemptions.activations

When a customer activates an offer, a row is created here.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Activation identifier |
| customer_id | UUID | Yes | — | Which customer activated |
| offer_id | UUID | Yes | — | Which offer was activated |
| merchant_id | UUID | Yes | — | The offer's merchant |
| status | VARCHAR(30) | Yes | 'ACTIVE' | ACTIVE, USED, EXPIRED, CANCELLED |
| activated_at | TIMESTAMPTZ | Yes (auto) | NOW() | When activated |
| expires_at | TIMESTAMPTZ | No | — | When activation expires |

**Constraints:** Unique (customer_id, offer_id) — can't activate same offer twice.

### Table: redemptions.transactions

Simulated card transactions against activated offers.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Transaction identifier |
| activation_id | UUID | Yes | — | FK → activations.id |
| customer_id | UUID | Yes | — | Customer who purchased |
| merchant_id | UUID | Yes | — | Merchant where purchased |
| amount | DECIMAL(10,2) | Yes | — | Purchase amount |
| currency | VARCHAR(3) | Yes | 'GBP' | Currency |
| card_last_four | VARCHAR(4) | No | — | Last 4 digits of card |
| description | TEXT | No | — | Transaction description |
| status | VARCHAR(30) | Yes | 'PENDING' | PENDING, MATCHED, CASHBACK_CREDITED, FAILED |
| transaction_date | TIMESTAMPTZ | Yes (auto) | NOW() | When purchase was made |
| created_at | TIMESTAMPTZ | Yes (auto) | NOW() | Record creation |

### Table: redemptions.cashback_credits

Calculated cashback for each qualifying transaction.

| Column | Type | Required? | Default | Description |
|--------|------|-----------|---------|-------------|
| id | UUID | Yes (auto) | Random UUID | Credit identifier |
| transaction_id | UUID | Yes | — | FK → transactions.id |
| customer_id | UUID | Yes | — | Customer receiving cashback |
| offer_id | UUID | Yes | — | Offer that generated this |
| merchant_id | UUID | Yes | — | Merchant for this offer |
| transaction_amount | DECIMAL(10,2) | Yes | — | Original purchase amount |
| cashback_rate | DECIMAL(5,2) | Yes | — | Rate at time of credit |
| cashback_amount | DECIMAL(10,2) | Yes | — | Calculated cashback |
| status | VARCHAR(30) | Yes | 'CREDITED' | PENDING, CREDITED, REVERSED |
| credited_at | TIMESTAMPTZ | Yes (auto) | NOW() | When credited |

---

## Schema: eligibility

**Owned by:** eligibility-service (port 8083)
**Note:** No database tables — eligibility-service is stateless. It calls offer-service and redemption-service to make decisions.

---

## Migration Rules

**CRITICAL:** Never edit an existing migration file. Flyway tracks which have run. If you change one, Flyway throws a checksum error.

To make changes:
1. Create a NEW file: `V3__description.sql`, `V4__description.sql`, etc.
2. Put it in `services/<service>/src/main/resources/db/migration/`
3. Restart the service — Flyway applies it automatically

Current migrations:
| Service | File | What It Does |
|---------|------|-------------|
| offer-service | `V1__create_offers_table.sql` | offers + offer_audit_log + indexes + triggers |
| offer-service | `V2__create_campaigns_table.sql` | campaigns + campaign_offers join table |
| partner-service | `V1__create_partners_table.sql` | partners + partner_audit_log + indexes + triggers |
| redemption-service | `V1__create_redemptions_tables.sql` | activations + transactions + cashback_credits + indexes |
