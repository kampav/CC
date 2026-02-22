# Connected Commerce - Step Log

> **WHAT IS THIS?** A running diary of everything that's been built, in order. When starting a new AI chat, this tells the AI exactly what exists already.

---

## Phase 0: Project Setup (2026-02-14)

### Step 0.1 -- Monorepo Setup
Folder structure for all services, apps, and config files.

### Step 0.2 -- Context Files
8 documentation files in `docs/context/` for AI context persistence.

### Step 0.3 -- Docker Compose
PostgreSQL 16 + Kafka KRaft + Kafka UI. `docker compose up -d` starts everything.
Key files: `docker-compose.yml`, `infrastructure/docker/init-db.sql`

### Step 0.4 -- Service Skeletons
Empty but runnable starters: offer-service (8081), partner-service (8082), eligibility-service (8083), bff (3000), customer-app (5173), merchant-portal (5174).

---

## Phase 1: Offer Service (2026-02-14 - 2026-02-17)

### Step 1.1 -- Offer Data Model
- V1 Flyway migration: `offers` table (21 columns) + `offer_audit_log`
- JPA entity, enums (OfferStatus, OfferType, Brand, RedemptionType)
- Repository with custom queries

### Step 1.2 -- Offer CRUD API
- Full REST: POST, GET (paginated with filters), PUT, PATCH /status
- State machine enforcement (OfferStatus.VALID_TRANSITIONS)
- Audit trail on every status change
- Global error handler
- 37 unit tests

---

## Phase 2: Partner Service + Auth (2026-02-17)

### Batch 1 -- Partner Service
- V1 migration: `partners` + `partner_audit_log` tables
- Full CRUD: create, read, update, status transitions
- Partner status lifecycle: PENDING → APPROVED → SUSPENDED → DEACTIVATED
- Audit log for status changes

### Batch 2 -- BFF Auth
- API-key based auth middleware (`auth.js`)
- Three keys: customer-demo-key, merchant-demo-key, admin-demo-key
- Role injection into requests (userId, userRole)
- `requireRole()` guard function for route protection

---

## Phase 3: Merchant Portal + Customer App UI (2026-02-17)

### Batch 3 -- Merchant Portal
- Dashboard with offer metrics
- OfferList with status badges and filters
- CreateOffer form (all fields including imageUrl)
- EditOffer form (pre-filled, DRAFT/PAUSED only)
- OfferDetail with status transitions
- Layout with sidebar navigation

### Batch 4 -- Redemption Service + Customer App
**4A -- Redemption Service:**
- V1 migration: activations, transactions, cashback_credits
- Activation flow: customer activates offer, uniqueness enforced
- Transaction simulation: creates transaction + auto-credits cashback
- Cashback summary endpoint

**4B -- BFF Routes:**
- activations.js, transactions.js proxies

**4C -- Customer App:**
- Home page with stats
- OfferFeed with browse/filter
- OfferDetail with activation
- MyOffers, MyCashback, TransactionHistory pages

---

## Phase 4: Kafka + Eligibility (2026-02-17)

### Batch 5 -- Kafka Events
- OfferEvent model + OfferEventPublisher
- Publishes to `offer.events` topic on status changes
- Fire-and-forget pattern

### Batch 6 -- Eligibility Service
- Stateless service -- calls offer-service and redemption-service
- Brand match check + activation fatigue limit
- POST /eligibility/check endpoint

---

## Phase 5: Analytics + Dashboard (2026-02-17)

### Batch 7 -- Analytics
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
- Fixed RedemptionAnalyticsController: `totalCashbackPaid` was missing in global summary
- Fixed BFF partners.js: added role guards
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
- Vertex AI scaffold ready

---

## Phase 8: Database Fixes + Gemini AI + Synthetic Data (2026-02-20)

### DB Fix -- V3 Migration Constraint Ordering
- Reordered V3 -- DROP CONSTRAINT now runs before the UPDATE

### New Migrations
- `offer-service V4__seed_campaigns_and_offers.sql`: 6 campaigns, 28 campaign-offer links, 8 additional offers
- `redemption-service V3__more_demo_data.sql`: 4 new customer profiles (Alice, Ben, Cara, Dan), 22 activations/transactions

### Gemini AI Personalisation (BFF)
- Replaced Vertex AI scaffold with Google Gemini integration
- GET /for-you -- uses Gemini when API key set; graceful fallback to rule-based
- GET /explain/:offerId -- NEW endpoint for personalised offer explanation
- `services/bff/.env.example` created

---

## Phase 9: v1.1.0 -- JWT Auth, Revenue Model, AI Insights & Exec Dashboard (2026-02-20)

### Auth
- New `identity` schema + `identity.users` table (BFF-managed)
- JWT login: `POST /api/v1/auth/login` → 8h Bearer token
- auth.js: accepts `Authorization: Bearer <jwt>` OR legacy `X-API-Key`
- identity.js: schema init + seed 5 demo users on startup
- All 3 frontend apps: Login.tsx, auth.ts, ProtectedRoute, Layout header

### Revenue Model
- Tier commission: BRONZE 15% / SILVER 12% / GOLD 10% / PLATINUM 8% of cashback
- offer-service V5: commission_rate column
- partner-service V3: tier column + commercial_customers table
- redemption-service V4: revenue_ledger table backfilled from cashback_credits

### New BFF Routes
- GET /exec/dashboard: KPIs, category ROI, merchant tier breakdown, AI narrative
- GET /recommendations/merchant-next-offer: AI offer suggestions
- GET/POST/PATCH /commercial: commercial customer KYB workflow

### New Frontend Pages
- Merchant Portal: AIOfferSuggestions.tsx
- Colleague Portal: CommercialOnboarding.tsx, CustomerInsights.tsx, ExecDashboard.tsx

---

## Phase 10: v1.2.0 -- Banking Data Platform, Enterprise Personalization & Scale Architecture (2026-02-21)

### Infrastructure
- Redis added to docker-compose.yml (`cc-redis`, port 6379)
- New Kafka topics: `banking.customers` (3 partitions), `banking.transactions` (6 partitions)
- New DB schemas added to init-db.sql: `customers`, `banking_transactions`
- 10 services total: 6 Java + BFF + 3 React apps

### customer-data-service (NEW, port 8085)
- Spring Boot 3.2.3, package `com.cc.customer`
- V1 migration: `customers.profiles` + `customers.classifications` tables
- V2 migration: 9 demo personas (Alice through Isla) with classification tags
- REST: GET /api/v1/customers/{id}, /summary, /classifications
- Kafka consumer: `banking.customers` topic (upserts customer profiles)
- HikariCP: max 20 connections

### transaction-data-service (NEW, port 8086)
- Spring Boot 3.2.3, package `com.cc.transaction`
- V1 migration: `banking_transactions.transactions` + `banking_transactions.spending_summaries`
- V2 migration: 90-day transaction history (15-30 txns per persona) + pre-computed summaries
- REST: GET /api/v1/banking-transactions/customer/{id} (keyset pagination), /spending-summary
- Kafka consumer: `banking.transactions` topic (6 partitions for 25M scale)
- Keyset pagination: `?after=<ISO8601>` replaces OFFSET

### partner-service V4
- CRM-grade commercial customer fields: company_type, sic_code, employee_count, annual_revenue_band, relationship_tier, primary_product, kyb_documents
- 5 demo commercial customers updated with realistic CRM data

### BFF v1.2.0
- Personalization v2: segment+lifecycle+spend_pattern aware scoring
  - Category affinity: 0-40 pts (normalised by real spending data)
  - Spend pattern alignment: 0-20 pts (DEAL_SEEKER→cashback%, EXPERIENCE_SEEKER→offer type)
  - Segment alignment: 0-15 pts (PREMIER→premium offers)
  - Lifecycle urgency: AT_RISK +25 pts, NEW +15 pts
  - Offer urgency: <7 days +10 pts, <30 days +5 pts
- A/B mode toggle: `?mode=rule-based|ai` or `X-Personalization-Mode` header
- GET /recommendations/compare: both modes side-by-side
- GET /customers/:id/profile proxy: customer-data-service (cached 300s)
- GET /customers/:id/spending proxy: transaction-data-service (cached 900s)
- Redis caching (ioredis): profile 300s, offers 60s, spending 900s
- Circuit breaker: 5 failures → OPEN, half-open after 30s
- Rate limiting: 60/min recommendations, 300/min general
- Mobile API: GET /mobile/home, GET /mobile/offers, POST /notifications/register
- Slim middleware: strips heavy fields when User-Agent is CCPlatform-iOS/Android

### Identity -- Extended to 9 customer personas
- customer@ (Alice) through customer9@ (Isla) -- all pw: demo1234
- Each maps to matching customer-data-service profile UUID

### Customer App v2
- PersonalizationContext.tsx: mode state (rule-based/ai) persisted to localStorage
- PersonalizationToggle.tsx: pill toggle in Layout header
- Home.tsx: segment-aware hero banner, mode badges on offer cards, _reason on hover
- PersonalizationDemo.tsx: side-by-side A/B comparison (route: /demo)
- Login.tsx: 9-persona selector dropdown with segment descriptions

### GCP Infrastructure
- infrastructure/gcp/cloud-run/: Cloud Run YAML per service
- infrastructure/gcp/pubsub/topics.yaml: banking.customers, banking.transactions, commerce.offers
- infrastructure/gcp/cloud-sql/README.md: Cloud SQL setup
- infrastructure/gcp/firebase/firebase.json: 3 hosting targets

### Documentation
- docs/context/MOBILE-API.md: mobile endpoint reference (NEW)
- docs/context/JOURNEY-PLANS.md: 9 persona A/B demo scripts (NEW)
- docs/context/ARCHITECTURE.md: v1.2.0 full diagram (UPDATED)
- docs/context/CONTEXT.md: v1.2.0 services + demo flow (UPDATED)
- All other .md files updated to reflect v1.2.0

### CI
- .github/workflows/ci.yml: added customer-data-service and transaction-data-service jobs

---

---

## Phase 11: v1.3.0 -- GCP Deployment + PWA (2026-02-21)

### Dockerfiles (all 7 services)
- Multi-stage builds: `maven:3.9-eclipse-temurin-17-alpine` build → `eclipse-temurin:17-jre-alpine` runtime (~300MB)
- BFF: `node:20-alpine`, production deps only
- Files: `services/{offer,partner,eligibility,redemption,customer-data,transaction-data}-service/Dockerfile`, `services/bff/Dockerfile`

### GCP Infrastructure (deploy-ready)
- `infrastructure/gcp/deploy.ps1` — master PowerShell deploy script
  - Creates Cloud SQL `cc-postgres` db-f1-micro PostgreSQL 14 (us-central1, ~$9.50/mo)
  - Builds + pushes Docker images to Artifact Registry (`us-central1-docker.pkg.dev/gen-lang-client-0315293206/cc-services/`)
  - Deploys 6 Java services to Cloud Run (min-instances=0, scale-to-zero)
  - Deploys BFF to Cloud Run (min-instances=1, always-on)
  - Builds 3 React apps + deploys to Firebase Hosting
  - Flags: `-SkipBuild` (re-deploy only), `-OnlyFrontend` (React apps only)
- `infrastructure/gcp/README.md` — prerequisites, cost breakdown, troubleshooting

### Kafka Disable for GCP
- `application-gcp.yml` in customer-data-service and transaction-data-service: `kafka.consumers.enabled: false` + exclude `KafkaAutoConfiguration`
- `@ConditionalOnProperty(name="kafka.consumers.enabled", ...)` on `CustomerEventConsumer` + `TransactionEventConsumer`
- `application-gcp.yml` in offer-service: dummy `bootstrap-servers: localhost:9092` (publisher is try-catch, no failure)
- Activation: `SPRING_PROFILES_ACTIVE=gcp` as Cloud Run env var

### Firebase Hosting
- `apps/customer-app/firebase.json` — site: `cc-customer-0315`, rewrites `/api/**` to BFF Cloud Run service
- `apps/merchant-portal/firebase.json` — site: `cc-merchant-0315`
- `apps/colleague-portal/firebase.json` — site: `cc-colleague-0315`
- All three `.firebaserc` files link to project `gen-lang-client-0315293206`

### PWA (Customer App)
- `apps/customer-app/public/manifest.json` — installable app: name, theme_color #0a2342, icons, shortcuts to /browse + /cashback
- `apps/customer-app/public/sw.js` — service worker: cache-first static, network-first /api/
- `apps/customer-app/index.html` — PWA meta tags + SW registration

### .gitignore
- Added `infrastructure/gcp/secrets.json`, `urls.json`, `apps/*/.env.production`

### Commit
- `5167cf8` — "feat: GCP deployment + PWA support (v1.3.0)" — 24 files, 862 insertions

---

## Phase 12: v1.3.1 -- GCP Resource Labels + Uptime Monitoring (2026-02-21)

### Resource Labels
- All Cloud Run services (6 Java + BFF) and Cloud SQL instance now tagged at deploy time with:
  `app=connected-commerce, env=demo, version=v1-3-0, team=engineering`
- Label variable `$LABELS` defined once at top of `deploy.ps1` for easy updates
- Enables cost allocation, filtering, and governance in Cloud Console

### Uptime Monitoring (setup-monitoring.ps1)
- NEW `infrastructure/gcp/setup-monitoring.ps1` -- standalone, called from `deploy.ps1`
- Enables `monitoring.googleapis.com` API
- Creates email notification channel "CC Platform Alerts" targeted at GCP account email
- Creates 4 uptime checks at 5-min intervals:
  - `cc-bff-health` → BFF Cloud Run URL /health
  - `cc-customer-site` → cc-customer-0315.web.app/
  - `cc-merchant-site` → cc-merchant-0315.web.app/
  - `cc-colleague-site` → cc-colleague-0315.web.app/
- Creates alerting policy: email alert if any check fails > 60s; auto-closes after 24h
- All steps idempotent (safe to re-run)

### Prerequisites Installer (install-gcp-prereqs.ps1)
- NEW `scripts/install-gcp-prereqs.ps1` -- run before first deploy
- Checks for gcloud, Docker Desktop, npm; prints exact download URLs for any missing
- Installs Firebase CLI via npm if absent
- Runs `gcloud auth login` + `gcloud auth configure-docker`
- Runs `firebase login` (skips if already logged in)
- Creates all 3 Firebase Hosting sites (idempotent)
- Prints "Ready to deploy!" + next-step command

---

## Phase 13: v1.3.0 -- Full Responsive UI (2026-02-22)

### Infrastructure (all 3 apps)
- `src/hooks/useBreakpoint.ts` (NEW) — `window.innerWidth` + resize listener; returns `'mobile' | 'tablet' | 'desktop'`
- `src/index.css` (NEW) — global reset, `box-sizing: border-box`, `.table-scroll` (overflow-x: auto), `@keyframes`
- `src/main.tsx` — added `import './index.css'`

### Layout components
- `apps/customer-app/src/components/Layout.tsx` — mobile hamburger + slide-down nav; menu closes on link click
- `apps/merchant-portal/src/components/Layout.tsx` — icon-only 64px sidebar (tablet); overlay drawer with backdrop (mobile)
- `apps/colleague-portal/src/components/Layout.tsx` — same as merchant, works with grouped NAV_SECTIONS

### customer-app pages (7 files)
- Home.tsx: clamp font-size, responsive stat/recs/category/how-it-works grids, responsive hero padding
- OfferFeed.tsx: responsive offer grid (`1fr` → `repeat(2)` → `auto-fill minmax(300px)`)
- Login.tsx: responsive card padding/width, persona dropdown `maxHeight: 50vh`
- MyOffers.tsx: stacked activation rows on mobile (flex-direction: column)
- MyCashback.tsx: responsive stats grid
- TransactionHistory.tsx: responsive summary grid, stacked transaction rows
- PersonalizationDemo.tsx: `display: flex; flex-direction: column/row` (was grid)

### merchant-portal pages (6 files)
- Dashboard.tsx: responsive KPI grids
- OfferList.tsx: `.table-scroll` + `minWidth: '700px'`
- CreateOffer.tsx: responsive form grids (`1fr 1fr` → `1fr` on mobile)
- AIOfferSuggestions.tsx: responsive suggestions grid
- PartnerProfile.tsx: responsive form grids
- TransactionHistory.tsx: `.table-scroll`, responsive summary

### colleague-portal pages (8 files)
- Dashboard.tsx: responsive KPI + quick-actions grids
- Analytics.tsx: responsive KPI + tier grids
- OfferReview.tsx: two-panel stack on mobile (flexDirection: column)
- CustomerInsights.tsx: responsive cards grid
- AuditLog.tsx: `.table-scroll` + `minWidth: '700px'`
- ExecDashboard.tsx: responsive KPI + tier distribution grids
- MerchantOnboarding.tsx: two-panel stack on mobile
- CampaignManagement.tsx: responsive form grids

### Bug fixes applied during responsive work
- HikariCP `minimum-idle: 0` in all 6 Java `application-gcp.yml` (prevents connection exhaustion)
- Removed `--port=3000` from `deploy-bff-frontend.ps1` (Cloud Run reserves PORT env var)

### Commit
- `bfe909f` — "feat: full responsive UI — mobile/tablet/desktop (v1.3.0)" — 40 files, 606 insertions

---

## Current State (2026-02-22) -- v1.3.0 LIVE

**All services (10):**
- offer-service (8081), partner-service (8082), eligibility-service (8083), redemption-service (8084)
- customer-data-service (8085), transaction-data-service (8086)
- BFF (3000), customer-app (5173), merchant-portal (5174), colleague-portal (5175)
- Redis (6379), PostgreSQL (5432), Kafka (9092), Kafka UI (9080)

**GCP (v1.3.0 — LIVE):**
- https://cc-customer-0315.web.app (PWA-installable, fully responsive)
- https://cc-merchant-0315.web.app
- https://cc-colleague-0315.web.app
- BFF Cloud Run: https://bff-5inerb4npa-uc.a.run.app
- Cost: ~$9.36/month (Cloud SQL db-f1-micro dominates)

**Data summary:**
- 32 offers, 15 partners, 6 campaigns
- 9 customer personas (Alice through Isla) with full banking profiles + 90-day transaction history
- 5 commercial customers (V4 CRM fields)
- revenue_ledger backfilled

**Auth:**
- JWT Bearer tokens (9 customer logins, 1 merchant, 1 colleague, 1 exec)
- Demo password: `demo1234`

**Start:** `.\scripts\stop.ps1 ; docker compose up -d ; .\scripts\start.ps1`
- Docker compose starts PostgreSQL + Kafka + Redis
- start.ps1 starts 10 services (background, logs in logs/ folder)
- BFF prints OK/FAILED on port 3000 after startup (~90s for Java services)

**Key demo flows:**
- A/B personalization: `http://localhost:5173/demo` (side-by-side)
- Persona selector: `http://localhost:5173/login` → dropdown
- Frank (AT_RISK): rule-based surfaces high-value retention offers
- Alice (PREMIER, EXPERIENCE_SEEKER): travel/dining offers with personalised reasons
