# Connected Commerce - Step Log

> **WHAT IS THIS?** A running diary of everything that's been built, in order. When starting a new AI chat, this tells the AI exactly what exists already.

---

## Phase 0: Project Setup (2026-02-14)

### Step 0.1 — Monorepo Setup
Folder structure for all services, apps, and config files.

### Step 0.2 — Context Files
8 documentation files in `docs/context/` for AI context persistence.

### Step 0.3 — Docker Compose
PostgreSQL 16 + Kafka KRaft + Kafka UI. `docker compose up -d` starts everything.
Key files: `docker-compose.yml`, `infrastructure/docker/init-db.sql`

### Step 0.4 — Service Skeletons
Empty but runnable starters: offer-service (8081), partner-service (8082), eligibility-service (8083), bff (3000), customer-app (5173), merchant-portal (5174).

---

## Phase 1: Offer Service (2026-02-14 — 2026-02-17)

### Step 1.1 — Offer Data Model
- V1 Flyway migration: `offers` table (21 columns) + `offer_audit_log`
- JPA entity, enums (OfferStatus, OfferType, Brand, RedemptionType)
- Repository with custom queries

### Step 1.2 — Offer CRUD API
- Full REST: POST, GET (paginated with filters), PUT, PATCH /status
- State machine enforcement (OfferStatus.VALID_TRANSITIONS)
- Audit trail on every status change
- Global error handler
- 37 unit tests

---

## Phase 2: Partner Service + Auth (2026-02-17)

### Batch 1 — Partner Service
- V1 migration: `partners` + `partner_audit_log` tables
- Full CRUD: create, read, update, status transitions
- Partner status lifecycle: PENDING → APPROVED → SUSPENDED → DEACTIVATED
- Audit log for status changes

### Batch 2 — BFF Auth
- API-key based auth middleware (`auth.js`)
- Three keys: customer-demo-key, merchant-demo-key, admin-demo-key
- Role injection into requests (userId, userRole)
- `requireRole()` guard function for route protection

---

## Phase 3: Merchant Portal + Customer App UI (2026-02-17)

### Batch 3 — Merchant Portal
- Dashboard with offer metrics
- OfferList with status badges and filters
- CreateOffer form (all fields including imageUrl)
- EditOffer form (pre-filled, DRAFT/PAUSED only)
- OfferDetail with status transitions
- Layout with sidebar navigation

### Batch 4 — Redemption Service + Customer App
**4A — Redemption Service:**
- V1 migration: activations, transactions, cashback_credits
- Activation flow: customer activates offer, uniqueness enforced
- Transaction simulation: creates transaction + auto-credits cashback
- Cashback summary endpoint

**4B — BFF Routes:**
- activations.js, transactions.js proxies

**4C — Customer App:**
- Home page with stats
- OfferFeed with browse/filter
- OfferDetail with activation
- MyOffers, MyCashback, TransactionHistory pages

---

## Phase 4: Kafka + Eligibility (2026-02-17)

### Batch 5 — Kafka Events
- OfferEvent model + OfferEventPublisher
- Publishes to `offer.events` topic on status changes
- Fire-and-forget pattern

### Batch 6 — Eligibility Service
- Stateless service — calls offer-service and redemption-service
- Brand match check + activation fatigue limit
- POST /eligibility/check endpoint

---

## Phase 5: Analytics + Dashboard (2026-02-17)

### Batch 7 — Analytics
- OfferAnalyticsController: counts by status
- RedemptionAnalyticsController: activation/transaction/cashback totals
- BFF analytics proxy routes
- Merchant Dashboard updated with real data

---

## Phase 6: Colleague Portal (2026-02-17)

### Colleague Portal Build
- V2 migration: campaigns + campaign_offers tables
- CampaignService + CampaignController (CRUD + status transitions + offer management)
- 7 colleague portal pages:
  - Dashboard (platform overview stats)
  - OfferReview (compliance checks: FCA Fair Value, FCA Clear Terms, ASA Misleading Claims, Prohibited Categories, Description Quality)
  - MerchantOnboarding (review and approve merchant applications)
  - CampaignManagement (create/edit campaigns, add/remove offers, status transitions)
  - Analytics (platform-wide offer + redemption metrics)
  - AuditLog (search/filter with per-offer drill-down)
  - Compliance (rules reference)

---

## Phase 7: Bug Fixes + Enhancements (2026-02-18)

### Critical Bug Fixes
- Fixed RedemptionAnalyticsController: `totalCashbackPaid` was missing in global summary (added `sumAllCashback()` query)
- Fixed BFF partners.js: added role guards (was open to any API key)
- Fixed BFF transactions.js: role-filtered GET (CUSTOMER sees own, MERCHANT/ADMIN see all)
- Fixed TransactionController: added merchantId param + listAllTransactions fallback
- Fixed customer TransactionHistory: replaced raw fetch with api client
- Fixed OfferDetail back link: `/` → `/browse`
- Fixed CampaignManagement: excluded DRAFT offers from campaign assignment

### Customer App Enhancements
- OfferFeed: server-side category/brand filtering, pagination, expiry badges
- OfferDetail: eligibility check on load, warning banner, disabled activate when ineligible
- Home: "Recommended For You" section with recommendation cards

### Merchant Portal Enhancements
- CreateOffer/EditOffer: added imageUrl field
- OfferDetail: Duplicate Offer button
- Dashboard: merchant insights (category performance table, cashback tier distribution, actionable recommendations)

### Colleague Portal Enhancements
- CampaignManagement: edit campaigns, add/remove offers from existing campaigns
- AuditLog: search/filter by offer ID, user, status; per-offer drill-down
- OfferReview: 5-rule compliance engine with severity levels (BLOCK/WARN/INFO)

### Personalization Infrastructure
- BFF recommendations.js: rule-based recommendation engine
  - GET /for-you: personalized recommendations (category affinity, brand affinity, cashback rate, recency, urgency)
  - GET /similar/:offerId: similar offers by category/brand/type
  - GET /merchant-insights: category performance, brand distribution, cashback tiers
- Vertex AI scaffold ready (set VERTEX_API_KEY + VERTEX_ENDPOINT env vars)

### Compilation Fix
- Fixed CampaignService.java: `Instant` → `OffsetDateTime` for campaign date parsing

---

## Phase 8: Database Fixes + Gemini AI + Synthetic Data (2026-02-20)

### DB Fix — V3 Migration Constraint Ordering
- **Bug**: `V3__rebrand_and_seed_data.sql` ran UPDATE (brand→BRAND_A) before DROP CONSTRAINT, causing constraint violation if any offers existed with old brand values (LLOYDS etc.)
- **Fix**: Reordered V3 — DROP CONSTRAINT now runs before the UPDATE
- **Recovery**: If Flyway marked V3 as FAILED, run the repair SQL in `START.md` then restart offer-service

### New Migrations
- `offer-service V4__seed_campaigns_and_offers.sql`:
  - 6 campaigns (Summer Essentials, Dining Rewards, Fashion Forward, Travel, Tech, Health)
  - 28 campaign-offer links
  - 8 additional offers (Ocado, Pizza Express, Holland & Barrett, Premier Inn, ASOS, Amazon, NOW TV, Pret)
- `redemption-service V3__more_demo_data.sql`:
  - 4 new customer profiles: Alice (dining/travel), Ben (family grocery), Cara (student/entertainment), Dan (tech)
  - 22 activations, 22 transactions, 22 cashback credits

### Gemini AI Personalisation (BFF)
- Replaced Vertex AI scaffold with Google Gemini 2.0 Flash integration
- `GET /api/v1/recommendations/for-you` — uses Gemini when `GEMINI_API_KEY` set
  - Builds customer preference profile from activation history
  - Sends ranked offer candidates to Gemini with structured prompt
  - Returns recommendations with personalised `_reason` per offer
  - Graceful fallback to rule-based engine on error
- `GET /api/v1/recommendations/explain/:offerId` — NEW endpoint
  - Gemini generates a 2-sentence personalised explanation for why an offer suits the customer
  - Fallback to category-matching explanation
- `services/bff/.env.example` created with all config vars documented
- Uses axios (already a dependency) — no new npm packages required

---

## Phase 9: v1.1.0 — JWT Auth, Revenue Model, AI Insights & Exec Dashboard (2026-02-20)

### Auth
- New `identity` schema + `identity.users` table (BFF-managed via `pg`, auto-created on startup)
- JWT login: `POST /api/v1/auth/login` → 8h Bearer token
- `services/bff/src/routes/auth.js`: login, `/me`, register
- `services/bff/src/middleware/auth.js`: accepts `Authorization: Bearer <jwt>` OR legacy `X-API-Key`
- `services/bff/src/db.js`: pg Pool to cc-postgres
- `services/bff/src/identity.js`: schema init + seed 5 demo users on startup
- All 3 frontend apps: `src/lib/auth.ts`, `src/pages/Login.tsx`, updated `api/client.ts` (JWT-first), `App.tsx` with `ProtectedRoute` + `/login` route
- Layout headers updated: show user name + Sign out button
- Demo users (pw: demo1234): customer@, customer2@, merchant@, colleague@, exec@demo.com

### Revenue Model
- Tier commission: BRONZE 15% / SILVER 12% / GOLD 10% / PLATINUM 8% of cashback
- `services/bff/src/routes/commercial.js`: commercial customer KYB CRUD
- `GET /api/v1/analytics/revenue`: commission breakdown by tier + daily trend (from revenue_ledger)
- `GET /api/v1/analytics/customer-insights/:id`: AI customer profile summary

### New Flyway Migrations
- `offer-service V5`: `commission_rate DECIMAL(5,2) DEFAULT 10.00` on offers
- `partner-service V3`: `tier` column on partners + `commercial_customers` table (5 demo rows)
- `redemption-service V4`: `revenue_ledger` table, backfilled from existing cashback_credits

### New BFF Routes
- `GET /api/v1/exec/dashboard`: KPIs, category ROI, merchant tier breakdown, AI narrative
- `GET /api/v1/recommendations/merchant-next-offer`: AI "what to offer next"
- `GET/POST/PATCH /api/v1/commercial`: commercial customer KYB workflow

### New Frontend Pages
- Merchant Portal: `AIOfferSuggestions.tsx`, nav link "AI Suggestions"
- Colleague Portal: `CommercialOnboarding.tsx`, `CustomerInsights.tsx`, `ExecDashboard.tsx`
- Colleague Portal: `Analytics.tsx` updated with AI revenue narrative + tier breakdown

### Bug Fixes (post-v1.1.0)
- `exec.js`: removed TypeScript `(o: any)` annotation from plain JS file (caused Node.js SyntaxError / BFF crash)
- `analytics.js`: widened role guards to include COLLEAGUE + EXEC (was MERCHANT/ADMIN only)
- `start.ps1`: BFF now waits for port 3000 to open, prints OK/FAILED with log hint

---

## Current State (2026-02-20) — v1.1.0

**All services:** offer-service (8081), partner-service (8082), eligibility-service (8083), redemption-service (8084), BFF (3000), customer-app (5173), merchant-portal (5174), colleague-portal (5175)

**Data summary:**
- 32 offers, 15 partners, 6 campaigns, 7 customer personas, 40+ activations/transactions/cashback credits
- 5 commercial customers (seeded: 2 APPROVED, 1 KYB_IN_PROGRESS, 2 PENDING)
- revenue_ledger backfilled from existing cashback_credits (BRONZE tier, 15%)

**Auth:**
- Login at each portal's `/login` page — JWT stored in localStorage
- Demo pw: `demo1234` for all users

**Start:** `.\scripts\stop.ps1 ; .\scripts\start.ps1` — BFF prints OK/FAILED on port 3000
