# Connected Commerce - Feature Registry

> **PURPOSE:** When you want to change a feature, look it up here to find EVERY file that needs updating. This prevents missing files during modifications.
>
> **FOR AI:** When asked to change a feature, ALWAYS consult this registry first. Update it after every change.
>
> **Version:** v1.2.0

---

## Feature: Offer CRUD (Create, Read, Update, Delete)

**Status:** COMPLETE
**What it does:** Merchants create offers, view them, edit them, and browse with filtering/pagination/sorting.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/offer-service/.../db/migration/V1__create_offers_table.sql` | Creates `offers` + `offer_audit_log` tables |
| Entity | `services/offer-service/.../model/Offer.java` | JPA entity |
| Enums | `services/offer-service/.../model/OfferStatus.java` | State machine with valid transitions |
| | `services/offer-service/.../model/OfferType.java` | CASHBACK, DISCOUNT_CODE, VOUCHER, EXPERIENCE, PRIZE_DRAW |
| | `services/offer-service/.../model/Brand.java` | LLOYDS, HALIFAX, BOS, SCOTTISH_WIDOWS |
| | `services/offer-service/.../model/RedemptionType.java` | CARD_LINKED, VOUCHER_CODE, BARCODE, WALLET_PASS |
| DTOs | `services/offer-service/.../model/CreateOfferRequest.java` | POST body |
| | `services/offer-service/.../model/UpdateOfferRequest.java` | PUT body |
| | `services/offer-service/.../model/StatusChangeRequest.java` | PATCH body |
| | `services/offer-service/.../model/OfferResponse.java` | API response |
| Audit | `services/offer-service/.../model/OfferAuditLog.java` | Status change tracking |
| Repos | `services/offer-service/.../repository/OfferRepository.java` | DB queries |
| | `services/offer-service/.../repository/OfferAuditLogRepository.java` | Audit queries |
| Service | `services/offer-service/.../service/OfferService.java` | Business logic |
| Controller | `services/offer-service/.../controller/OfferController.java` | REST: POST, GET, PUT, PATCH |
| Analytics | `services/offer-service/.../controller/OfferAnalyticsController.java` | Stats by status |
| Audit API | `services/offer-service/.../controller/AuditController.java` | GET audit log |
| Kafka | `services/offer-service/.../service/OfferEventPublisher.java` | Publishes events |
| BFF | `services/bff/src/routes/offers.js` | Proxy to :8081 |
| Test | `services/offer-service/.../OfferStatusTest.java` | State machine unit tests |

---

## Feature: Campaign Management

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/offer-service/.../db/migration/V2__create_campaigns_table.sql` | campaigns + campaign_offers |
| Entity | `services/offer-service/.../model/Campaign.java` | JPA entity with ManyToMany offers |
| Service | `services/offer-service/.../service/CampaignService.java` | CRUD + status transitions |
| Controller | `services/offer-service/.../controller/CampaignController.java` | REST |
| BFF | `services/bff/src/routes/campaigns.js` | Proxy with ADMIN guard |
| UI | `apps/colleague-portal/src/pages/CampaignManagement.tsx` | Create/edit/manage campaigns |

---

## Feature: Partner/Merchant Management

**Status:** COMPLETE (V4 CRM fields added in v1.2.0)

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/partner-service/.../db/migration/V1-V4` | Partners + audit + tier + commercial CRM fields |
| Entity | `services/partner-service/.../model/Partner.java` | JPA entity |
| BFF | `services/bff/src/routes/partners.js` | Proxy with role guards |
| UI (Merchant) | `apps/merchant-portal/src/pages/PartnerProfile.tsx` | Profile form |
| UI (Colleague) | `apps/colleague-portal/src/pages/MerchantOnboarding.tsx` | Review and approve |

---

## Feature: Offer Activation & Cashback

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/redemption-service/.../db/migration/V1__create_redemptions_tables.sql` | activations, transactions, cashback_credits |
| Entities | `Activation.java`, `Transaction.java`, `CashbackCredit.java` | JPA entities |
| Services | `ActivationService.java`, `TransactionService.java` | Business logic |
| Controllers | `ActivationController.java`, `TransactionController.java`, `RedemptionAnalyticsController.java` | REST |
| BFF | `services/bff/src/routes/activations.js`, `transactions.js` | Proxies |
| UI (Customer) | `apps/customer-app/src/pages/OfferDetail.tsx` | Activate button |
| | `apps/customer-app/src/pages/MyOffers.tsx` | Active offers |
| | `apps/customer-app/src/pages/MyCashback.tsx` | Cashback summary |
| | `apps/customer-app/src/pages/TransactionHistory.tsx` | Transaction list |

---

## Feature: Eligibility Checking

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Service | `services/eligibility-service/.../service/EligibilityService.java` | Brand match + activation count |
| Controller | `services/eligibility-service/.../controller/EligibilityController.java` | POST /check |
| BFF | `services/bff/src/routes/eligibility.js` | Proxy |
| UI | `apps/customer-app/src/pages/OfferDetail.tsx` | Eligibility warning + disabled button |

---

## Feature: Personalization & Recommendations v2 (v1.2.0)

**Status:** COMPLETE (rule-based v2 + AI mode + A/B comparison)
**What it does:** Segment-aware personalized offer recommendations with side-by-side A/B comparison.

| Layer | File | What It Does |
|-------|------|-------------|
| BFF Engine | `services/bff/src/routes/recommendations.js` | Rule-based v2 scoring + AI mode + /compare endpoint |
| BFF Proxy | `services/bff/src/routes/customers.js` | Proxy to customer-data-service + transaction-data-service |
| BFF Cache | `services/bff/src/cache.js` | Redis caching: profile 300s, offers 60s, spending 900s |
| UI (Customer) | `apps/customer-app/src/pages/Home.tsx` | Segment-aware home, mode badges, _reason on hover |
| UI (Customer) | `apps/customer-app/src/pages/PersonalizationDemo.tsx` | A/B side-by-side comparison |
| UI (Customer) | `apps/customer-app/src/components/PersonalizationToggle.tsx` | Rule/AI pill toggle in header |
| UI (Customer) | `apps/customer-app/src/context/PersonalizationContext.tsx` | Mode state + localStorage persistence |
| UI (Merchant) | `apps/merchant-portal/src/pages/Dashboard.tsx` | Category performance, cashback tiers, insights |

**Rule-based v2 scoring:**
```
score = categoryAffinity(0-40)     // normalised by real spending from transaction-data-service
      + spendPatternAlignment(0-20) // DEAL_SEEKER→cashback%, EXPERIENCE_SEEKER→offer type
      + segmentAlignment(0-15)      // PREMIER→premium offers, MASS_MARKET→low min_spend
      + lifecycleUrgency(0-25)      // AT_RISK: +25, NEW: +15
      + offerUrgency(0-10)          // <7 days: +10, <30 days: +5
```

**A/B modes:**
- `?mode=rule-based` (default) — deterministic, ~50ms
- `?mode=ai` — AI-powered, natural language reasons, ~2-4s
- `GET /recommendations/compare` — both side-by-side

---

## Feature: Banking Data Platform (v1.2.0)

**Status:** COMPLETE
**What it does:** Two new microservices model upstream core banking data — customer profiles and transaction history.

### customer-data-service (port 8085)

| Layer | File | What It Does |
|-------|------|-------------|
| Migration V1 | `services/customer-data-service/.../V1__create_customer_tables.sql` | profiles + classifications tables |
| Migration V2 | `services/customer-data-service/.../V2__seed_demo_customers.sql` | 9 demo personas with classification tags |
| Entity | `services/customer-data-service/.../model/CustomerProfile.java` | JPA entity |
| Entity | `services/customer-data-service/.../model/Classification.java` | Classification tags |
| Record | `services/customer-data-service/.../model/CustomerSummary.java` | Slim summary for BFF |
| Repos | `CustomerProfileRepository.java`, `ClassificationRepository.java` | DB queries |
| Service | `services/customer-data-service/.../service/CustomerProfileService.java` | Business logic |
| Controller | `services/customer-data-service/.../controller/CustomerController.java` | GET profile/summary/classifications |
| Controller | `services/customer-data-service/.../controller/CustomerHealthController.java` | Health check |
| Kafka | `services/customer-data-service/.../kafka/CustomerEventConsumer.java` | banking.customers consumer |
| Config | `services/customer-data-service/.../config/CorrelationIdFilter.java` | Correlation ID |
| BFF | `services/bff/src/routes/customers.js` | Proxy routes + caching |

### transaction-data-service (port 8086)

| Layer | File | What It Does |
|-------|------|-------------|
| Migration V1 | `services/transaction-data-service/.../V1__create_transaction_tables.sql` | transactions + spending_summaries |
| Migration V2 | `services/transaction-data-service/.../V2__seed_demo_transactions.sql` | 90-day history for 9 personas |
| Entity | `services/transaction-data-service/.../model/BankingTransaction.java` | JPA entity |
| Entity | `services/transaction-data-service/.../model/SpendingSummary.java` | Summary aggregate |
| Record | `services/transaction-data-service/.../model/SpendingCategory.java` | Category roll-up |
| Repos | `BankingTransactionRepository.java`, `SpendingSummaryRepository.java` | DB queries (keyset) |
| Service | `services/transaction-data-service/.../service/TransactionDataService.java` | Business logic |
| Controller | `services/transaction-data-service/.../controller/TransactionDataController.java` | GET transactions/spending |
| Kafka | `services/transaction-data-service/.../kafka/TransactionEventConsumer.java` | banking.transactions consumer |

---

## Feature: BFF Enterprise Patterns (v1.2.0)

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `services/bff/src/cache.js` | Redis via ioredis; `cached(key, ttl, fn)` get-or-set helper |
| `services/bff/src/circuit.js` | Circuit breaker: 5 failures → OPEN, half-open 30s |
| `services/bff/src/middleware/slim.js` | Strips heavy fields for mobile (CCPlatform User-Agent) |
| `services/bff/src/routes/mobile.js` | Mobile endpoints: /mobile/home, /mobile/offers, /notifications/register |
| `services/bff/src/index.js` | Rate limiting: 60/min recommendations, 300/min general |

---

## Feature: Mobile API (v1.2.0)

**Status:** SCAFFOLD (endpoints implemented, push notifications are registration-only)

| File | What It Does |
|------|-------------|
| `services/bff/src/routes/mobile.js` | GET /mobile/home, GET /mobile/offers?slim=true, POST /notifications/register |
| `services/bff/src/middleware/slim.js` | Strips non-essential fields for mobile payload |
| `docs/context/MOBILE-API.md` | Full mobile API reference (auth, ETag, URL schemes, push) |

---

## Feature: GCP Infrastructure (v1.2.0)

**Status:** SCAFFOLD (files ready, not deployed)

| File | What It Does |
|------|-------------|
| `infrastructure/gcp/cloud-run/*.yaml` | Cloud Run manifests per service (min=1, max=100 replicas) |
| `infrastructure/gcp/pubsub/topics.yaml` | Pub/Sub topics (replaces Kafka on GCP) |
| `infrastructure/gcp/cloud-sql/README.md` | Cloud SQL connection setup |
| `infrastructure/gcp/firebase/firebase.json` | Firebase Hosting for 3 React apps |

---

## Feature: Compliance & Offer Review

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| UI | `apps/colleague-portal/src/pages/OfferReview.tsx` | 5-rule compliance engine (BLOCK/WARN/INFO) |
| UI | `apps/colleague-portal/src/pages/Compliance.tsx` | Rules reference |

---

## Feature: Audit Trail

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Backend | `AuditController.java` (offer-service) | GET audit logs by offer ID |
| BFF | `services/bff/src/routes/audit.js` | Proxy |
| UI | `apps/colleague-portal/src/pages/AuditLog.tsx` | Search/filter + drill-down |

---

## Feature: Analytics

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Offer Stats | `OfferAnalyticsController.java` | Counts by status |
| Redemption Stats | `RedemptionAnalyticsController.java` | Activation/transaction/cashback totals |
| Revenue | `services/bff/src/routes/analytics.js` | `GET /analytics/revenue` — tier breakdown + daily trend |
| Customer AI | `services/bff/src/routes/analytics.js` | `GET /analytics/customer-insights/:id` |
| UI (Merchant) | `apps/merchant-portal/src/pages/Dashboard.tsx` | Metrics + category performance |
| UI (Colleague) | `apps/colleague-portal/src/pages/Analytics.tsx` | Platform-wide analytics |

---

## Feature: Kafka Events

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Publisher | `services/offer-service/.../service/OfferEventPublisher.java` | offer.events topic |
| Consumer | `services/customer-data-service/.../kafka/CustomerEventConsumer.java` | banking.customers |
| Consumer | `services/transaction-data-service/.../kafka/TransactionEventConsumer.java` | banking.transactions (6 partitions) |

Kafka topics:
- `offer.events` (1 partition) -- offer status changes
- `banking.customers` (3 partitions) -- customer profile updates
- `banking.transactions` (6 partitions) -- transaction events (25M scale)

---

## Feature: BFF Proxy + Auth Layer

**Status:** COMPLETE (JWT in v1.1.0, extended 9 personas in v1.2.0)

| File | What It Does |
|------|-------------|
| `services/bff/src/index.js` | Express server, middleware, route mounting, rate limiting |
| `services/bff/src/middleware/auth.js` | JWT Bearer OR X-API-Key; `requireRole()` guard |
| `services/bff/src/db.js` | pg Pool to cc-postgres |
| `services/bff/src/identity.js` | Schema init + seed 12 demo users on startup |
| `services/bff/src/cache.js` | Redis caching (v1.2.0) |
| `services/bff/src/circuit.js` | Circuit breaker (v1.2.0) |
| `services/bff/src/routes/auth.js` | POST /login, GET /me, POST /register |
| `services/bff/src/routes/offers.js` | Offer proxy |
| `services/bff/src/routes/partners.js` | Partner proxy with role guards |
| `services/bff/src/routes/activations.js` | Activation proxy |
| `services/bff/src/routes/transactions.js` | Transaction proxy (role-filtered) |
| `services/bff/src/routes/eligibility.js` | Eligibility proxy |
| `services/bff/src/routes/analytics.js` | Analytics proxy |
| `services/bff/src/routes/campaigns.js` | Campaign proxy (ADMIN only) |
| `services/bff/src/routes/audit.js` | Audit proxy (ADMIN only) |
| `services/bff/src/routes/recommendations.js` | Recommendation engine v2 + AI mode |
| `services/bff/src/routes/customers.js` | Customer profile + spending proxy (v1.2.0) |
| `services/bff/src/routes/mobile.js` | Mobile API (v1.2.0) |
| `services/bff/src/routes/exec.js` | Exec dashboard |
| `services/bff/src/routes/commercial.js` | Commercial KYB |

---

## Feature: JWT Authentication

**Status:** COMPLETE (9 customer personas in v1.2.0)

| Layer | File | What It Does |
|-------|------|-------------|
| DB | `identity.users` (BFF-managed) | Users with bcrypt password_hash, role, customerId |
| BFF | `services/bff/src/identity.js` | Creates schema + seeds 12 demo users on startup |
| BFF | `services/bff/src/routes/auth.js` | POST /login → JWT, GET /me, POST /register |
| BFF | `services/bff/src/middleware/auth.js` | JWT Bearer OR X-API-Key |
| Frontend | `apps/*/src/lib/auth.ts` | Token management |
| Frontend | `apps/*/src/pages/Login.tsx` | Email/password form (customer app has persona dropdown) |
| Frontend | `apps/*/src/api/client.ts` | Sends Authorization: Bearer |
| Frontend | `apps/*/src/App.tsx` | ProtectedRoute + /login redirect |

Demo users (pw: `demo1234`):
- customer@ (Alice), customer2@ (Ben), customer3@ (Cara), customer4@ (Dan)
- customer5@ (Emma), customer6@ (Frank), customer7@ (Grace), customer8@ (Harry), customer9@ (Isla)
- merchant@, colleague@, exec@

---

## Feature: Bank Revenue / Tier Model

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `offer-service V5` | commission_rate column |
| Migration | `partner-service V3` | tier column on partners |
| Migration | `redemption-service V4` | revenue_ledger table + backfill |
| BFF | `services/bff/src/routes/analytics.js` | GET /analytics/revenue |

Tier rates: BRONZE 15% / SILVER 12% / GOLD 10% / PLATINUM 8%

---

## Feature: Exec Dashboard

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| BFF | `services/bff/src/routes/exec.js` | GET /exec/dashboard -- KPIs, ROI, tier breakdown, AI narrative |
| UI | `apps/colleague-portal/src/pages/ExecDashboard.tsx` | KPI cards, ROI bars, tier chart, AI insight banner |

---

## Feature: Commercial Customer KYB

**Status:** COMPLETE (V4 CRM fields added in v1.2.0)

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `partner-service V3` | commercial_customers table |
| Migration | `partner-service V4` | CRM-grade fields (company_type, sic_code, employee_count, etc.) |
| BFF | `services/bff/src/routes/commercial.js` | GET list, POST create, PATCH status |
| UI | `apps/colleague-portal/src/pages/CommercialOnboarding.tsx` | Filter/create/approve workflow |

---

## Feature: AI Insights

**Status:** COMPLETE

| Endpoint | File | What It Does |
|----------|------|-------------|
| GET /recommendations/merchant-next-offer | `recommendations.js` | AI suggests 3 new offer ideas |
| GET /analytics/customer-insights/:id | `analytics.js` | AI generates 3-sentence customer profile |
| GET /exec/dashboard → aiInsight | `exec.js` | AI generates 2-sentence exec narrative |
| UI | `merchant-portal/AIOfferSuggestions.tsx` | "What should I offer next?" |
| UI | `colleague-portal/CustomerInsights.tsx` | Customer search + AI profile |

AI providers auto-detected by key prefix: `sk-ant-` = Claude / `sk-` = OpenAI / `AIza` = Gemini. Rule-based fallback if no key.
Models: `claude-haiku-4-5-20251001` / `gpt-4o-mini` / `gemini-1.5-flash`

---

## Feature: Correlation ID Tracing

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `services/*/config/CorrelationIdFilter.java` | Reads/generates X-Correlation-Id, puts in MDC |
| `services/bff/src/index.js` | Generates correlationId, passes to upstream |

---

## Feature: Customer App v2 (v1.2.0)

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/customer-app/src/App.tsx` | Router with 7 routes (+ /demo) |
| `apps/customer-app/src/context/PersonalizationContext.tsx` | Mode state provider |
| `apps/customer-app/src/components/PersonalizationToggle.tsx` | Rule/AI pill toggle |
| `apps/customer-app/src/components/Layout.tsx` | Header + toggle + nav |
| `apps/customer-app/src/pages/Home.tsx` | Segment-aware hero, mode badges, _reason |
| `apps/customer-app/src/pages/PersonalizationDemo.tsx` | A/B side-by-side (/demo route) |
| `apps/customer-app/src/pages/Login.tsx` | 9-persona selector dropdown |
| `apps/customer-app/src/api/client.ts` | getRecommendations (with mode param), getCustomerProfile, getSpendingSummary |

---

## Feature: Merchant Portal

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/merchant-portal/src/pages/Dashboard.tsx` | Metrics + insights + AI suggestions |
| `apps/merchant-portal/src/pages/AIOfferSuggestions.tsx` | "What should I offer next?" |
| `apps/merchant-portal/src/pages/CreateOffer.tsx` | Create offer form |
| `apps/merchant-portal/src/pages/EditOffer.tsx` | Edit offer form |

---

## Feature: Colleague Portal

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/colleague-portal/src/pages/Dashboard.tsx` | Platform overview |
| `apps/colleague-portal/src/pages/OfferReview.tsx` | Compliance + approve/reject |
| `apps/colleague-portal/src/pages/ExecDashboard.tsx` | KPIs + AI narrative |
| `apps/colleague-portal/src/pages/CommercialOnboarding.tsx` | KYB workflow |
| `apps/colleague-portal/src/pages/CustomerInsights.tsx` | AI customer profile |
| `apps/colleague-portal/src/pages/CampaignManagement.tsx` | Campaign CRUD |
| `apps/colleague-portal/src/pages/AuditLog.tsx` | Audit trail |
