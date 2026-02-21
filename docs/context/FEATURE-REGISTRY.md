# Connected Commerce - Feature Registry

> **PURPOSE:** When you want to change a feature, look it up here to find EVERY file that needs updating. This prevents missing files during modifications.
>
> **FOR AI:** When asked to change a feature, ALWAYS consult this registry first. Update it after every change.

---

## Feature: Offer CRUD (Create, Read, Update, Delete)

**Status:** COMPLETE
**What it does:** Merchants create offers, view them, edit them, and browse with filtering/pagination/sorting.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/offer-service/src/main/resources/db/migration/V1__create_offers_table.sql` | Creates `offers` + `offer_audit_log` tables |
| Entity | `services/offer-service/.../model/Offer.java` | JPA entity — one row in the offers table |
| Enums | `services/offer-service/.../model/OfferStatus.java` | State machine with valid transitions |
| | `services/offer-service/.../model/OfferType.java` | CASHBACK, DISCOUNT_CODE, VOUCHER, EXPERIENCE, PRIZE_DRAW |
| | `services/offer-service/.../model/Brand.java` | LLOYDS, HALIFAX, BOS, SCOTTISH_WIDOWS |
| | `services/offer-service/.../model/RedemptionType.java` | CARD_LINKED, VOUCHER_CODE, BARCODE, WALLET_PASS |
| DTOs | `services/offer-service/.../model/CreateOfferRequest.java` | POST body for creating an offer |
| | `services/offer-service/.../model/UpdateOfferRequest.java` | PUT body for editing |
| | `services/offer-service/.../model/StatusChangeRequest.java` | PATCH body for status transitions |
| | `services/offer-service/.../model/OfferResponse.java` | API response (includes validTransitions) |
| Audit | `services/offer-service/.../model/OfferAuditLog.java` | Tracks every status change |
| Repos | `services/offer-service/.../repository/OfferRepository.java` | DB queries (by status, merchant, brand, category) |
| | `services/offer-service/.../repository/OfferAuditLogRepository.java` | Audit log queries |
| Service | `services/offer-service/.../service/OfferService.java` | Business logic: create, update, status transitions |
| Controller | `services/offer-service/.../controller/OfferController.java` | REST: POST, GET, PUT, PATCH |
| Analytics | `services/offer-service/.../controller/OfferAnalyticsController.java` | Offer count stats by status |
| Audit API | `services/offer-service/.../controller/AuditController.java` | GET audit log entries by offer |
| Kafka | `services/offer-service/.../model/OfferEvent.java` | Event payload for Kafka |
| | `services/offer-service/.../service/OfferEventPublisher.java` | Publishes events to offer.events topic |
| Config | `services/offer-service/.../config/CorrelationIdFilter.java` | Correlation ID propagation |
| | `services/offer-service/.../config/GlobalExceptionHandler.java` | Error response formatting |
| | `services/offer-service/src/main/resources/application.yml` | DB, port, Kafka config |
| BFF | `services/bff/src/routes/offers.js` | Proxy: GET, POST, PUT, PATCH to :8081 |
| Test | `services/offer-service/src/test/.../OfferStatusTest.java` | State machine unit tests |

---

## Feature: Offer Lifecycle State Machine

**Status:** COMPLETE

```
DRAFT → PENDING_REVIEW → APPROVED → LIVE → PAUSED → LIVE (resume)
                ↓              ↓        ↓       ↓
             DRAFT          RETIRED  EXPIRED  RETIRED
                ↓                      ↓
             RETIRED                RETIRED
```

| From | Valid Transitions |
|------|------------------|
| DRAFT | PENDING_REVIEW, RETIRED |
| PENDING_REVIEW | APPROVED, DRAFT, RETIRED |
| APPROVED | LIVE, RETIRED |
| LIVE | PAUSED, EXPIRED, RETIRED |
| PAUSED | LIVE, RETIRED |
| EXPIRED | RETIRED |
| RETIRED | (terminal) |

Key files: `OfferStatus.java`, `Offer.java` (`transitionTo()`), `OfferService.java` (`changeStatus()`)

---

## Feature: Campaign Management

**Status:** COMPLETE
**What it does:** Colleagues group offers into campaigns with targeting, scheduling, and budgets.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/offer-service/.../db/migration/V2__create_campaigns_table.sql` | campaigns + campaign_offers join table |
| Entity | `services/offer-service/.../model/Campaign.java` | JPA entity with ManyToMany offers |
| Enum | `services/offer-service/.../model/CampaignStatus.java` | DRAFT→SCHEDULED→ACTIVE→PAUSED→COMPLETED→ARCHIVED |
| DTOs | `services/offer-service/.../model/CreateCampaignRequest.java` | POST body |
| | `services/offer-service/.../model/CampaignResponse.java` | Response with nested offer summaries |
| Repo | `services/offer-service/.../repository/CampaignRepository.java` | DB queries by status |
| Service | `services/offer-service/.../service/CampaignService.java` | CRUD, add/remove offers, status transitions, partial updates |
| Controller | `services/offer-service/.../controller/CampaignController.java` | REST: GET, POST, PUT, PATCH, offer management |
| BFF | `services/bff/src/routes/campaigns.js` | Proxy to :8081 with ADMIN role guard |
| UI | `apps/colleague-portal/src/pages/CampaignManagement.tsx` | Create/edit campaigns, manage offers, status transitions |
| API Client | `apps/colleague-portal/src/api/client.ts` | `createCampaign`, `updateCampaign`, `removeOfferFromCampaign` |

---

## Feature: Partner/Merchant Management

**Status:** COMPLETE
**What it does:** Merchants register, colleagues approve/reject, merchants manage profiles.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/partner-service/.../db/migration/V1__create_partners_table.sql` | partners + partner_audit_log tables |
| Entity | `services/partner-service/.../model/Partner.java` | JPA entity |
| Enum | `services/partner-service/.../model/PartnerStatus.java` | PENDING→APPROVED→SUSPENDED→DEACTIVATED |
| DTOs | `CreatePartnerRequest.java`, `UpdatePartnerRequest.java`, `StatusChangeRequest.java`, `PartnerResponse.java` |
| Audit | `services/partner-service/.../model/PartnerAuditLog.java` | Status change tracking |
| Repos | `PartnerRepository.java`, `PartnerAuditLogRepository.java` |
| Service | `services/partner-service/.../service/PartnerService.java` | CRUD + status transitions |
| Controller | `services/partner-service/.../controller/PartnerController.java` | REST: GET, POST, PUT, PATCH |
| BFF | `services/bff/src/routes/partners.js` | Proxy with role guards (MERCHANT/ADMIN for writes, ADMIN for status) |
| UI (Merchant) | `apps/merchant-portal/src/pages/PartnerProfile.tsx` | Profile form |
| UI (Colleague) | `apps/colleague-portal/src/pages/MerchantOnboarding.tsx` | Review and approve merchants |

---

## Feature: Offer Activation & Cashback

**Status:** COMPLETE
**What it does:** Customer activates an offer, simulates a transaction, cashback is automatically credited.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `services/redemption-service/.../db/migration/V1__create_redemptions_tables.sql` | activations, transactions, cashback_credits tables |
| Entities | `Activation.java`, `Transaction.java`, `CashbackCredit.java` | JPA entities |
| Enums | `ActivationStatus.java` (ACTIVE, USED, EXPIRED, CANCELLED), `TransactionStatus.java`, `CashbackStatus.java` |
| DTOs | `CreateActivationRequest.java`, `SimulateTransactionRequest.java`, `ActivationResponse.java`, `TransactionResponse.java`, `CashbackSummary.java`, `CashbackCreditResponse.java` |
| Repos | `ActivationRepository.java`, `TransactionRepository.java`, `CashbackCreditRepository.java` |
| Services | `ActivationService.java` (activate offer, validate uniqueness) |
| | `TransactionService.java` (simulate transaction, auto-credit cashback) |
| Controllers | `ActivationController.java` (POST activate, GET list) |
| | `TransactionController.java` (POST simulate, GET list by customer/merchant/all) |
| Analytics | `RedemptionAnalyticsController.java` (summary: activations, transactions, cashback totals) |
| BFF | `services/bff/src/routes/activations.js` | POST activate, GET list |
| | `services/bff/src/routes/transactions.js` | POST simulate, GET list (role-filtered) |
| UI (Customer) | `apps/customer-app/src/pages/OfferDetail.tsx` | Activate button with eligibility check |
| | `apps/customer-app/src/pages/MyOffers.tsx` | Active offers list |
| | `apps/customer-app/src/pages/MyCashback.tsx` | Cashback summary |
| | `apps/customer-app/src/pages/TransactionHistory.tsx` | Transaction list |

---

## Feature: Eligibility Checking

**Status:** COMPLETE
**What it does:** Before activation, checks if customer is eligible (brand match + fatigue limit).

| Layer | File | What It Does |
|-------|------|-------------|
| DTOs | `EligibilityRequest.java`, `EligibilityResponse.java` | Request/response shapes |
| Service | `services/eligibility-service/.../service/EligibilityService.java` | Brand match + activation count check |
| Controller | `services/eligibility-service/.../controller/EligibilityController.java` | POST /check |
| BFF | `services/bff/src/routes/eligibility.js` | Proxy to :8083 |
| UI | `apps/customer-app/src/pages/OfferDetail.tsx` | Shows eligibility warning, disables activate button |

---

## Feature: Personalization & Recommendations

**Status:** COMPLETE (rule-based) / SCAFFOLD (Vertex AI)
**What it does:** Personalized offer recommendations for customers, similar offers, merchant insights.

| Layer | File | What It Does |
|-------|------|-------------|
| BFF Engine | `services/bff/src/routes/recommendations.js` | Rule-based scoring engine + Vertex AI fallback |
| UI (Customer) | `apps/customer-app/src/pages/Home.tsx` | "Recommended For You" section |
| UI (Merchant) | `apps/merchant-portal/src/pages/Dashboard.tsx` | Category performance, cashback tiers, insights |
| API Client | `apps/customer-app/src/api/client.ts` | `getRecommendations()`, `getSimilarOffers()` |
| API Client | `apps/merchant-portal/src/api/client.ts` | `getMerchantInsights()` |

**Scoring factors:** Category affinity (x10), brand affinity (x5), cashback rate, recency boost (10 - age in days), urgency boost (+15 for expiring within 7 days).

---

## Feature: Compliance & Offer Review

**Status:** COMPLETE
**What it does:** Colleague reviews offers against FCA/ASA compliance rules before approval.

| Layer | File | What It Does |
|-------|------|-------------|
| UI | `apps/colleague-portal/src/pages/OfferReview.tsx` | Compliance check engine with 5 rule categories |
| UI | `apps/colleague-portal/src/pages/Compliance.tsx` | Compliance rules reference |

**Compliance checks (client-side):**
| Check | Severity | Rule |
|-------|----------|------|
| FCA Fair Value | BLOCK | Cashback rate must be ≤30% |
| FCA Clear Terms | WARN | Terms field should not be empty |
| ASA Misleading Claims | BLOCK | Title/description scanned for prohibited words (free, guaranteed, risk-free, etc.) |
| Prohibited Categories | BLOCK | Blocks Gambling, Tobacco, Weapons, Cryptocurrency |
| Description Quality | INFO | Description should be ≥20 characters |

---

## Feature: Audit Trail

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Backend | `AuditController.java` (offer-service) | GET audit logs by offer ID |
| BFF | `services/bff/src/routes/audit.js` | Proxy to :8081 |
| UI | `apps/colleague-portal/src/pages/AuditLog.tsx` | Search/filter by offer ID, user, status; per-offer drill-down |
| API Client | `apps/colleague-portal/src/api/client.ts` | `getAuditLog()`, `getAuditLogByOffer()` |

---

## Feature: Analytics

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Offer Stats | `OfferAnalyticsController.java` | Counts by status (total, draft, live, etc.) |
| Redemption Stats | `RedemptionAnalyticsController.java` | Activation count, transaction count, total cashback |
| BFF | `services/bff/src/routes/analytics.js` | Proxies to both services |
| UI (Merchant) | `apps/merchant-portal/src/pages/Dashboard.tsx` | Offer + redemption metrics, category performance |
| UI (Colleague) | `apps/colleague-portal/src/pages/Analytics.tsx` | Platform-wide analytics |

---

## Feature: Kafka Events

**Status:** COMPLETE
**What it does:** Publishes events when offers change status (fire-and-forget).

| Layer | File | What It Does |
|-------|------|-------------|
| Event Model | `services/offer-service/.../model/OfferEvent.java` | Event payload |
| Publisher | `services/offer-service/.../service/OfferEventPublisher.java` | Sends to `offer.events` topic |
| Integration | `services/offer-service/.../service/OfferService.java` | Calls publisher on status change |

---

## Feature: BFF Proxy + Auth Layer

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `services/bff/src/index.js` | Express server, middleware stack, route mounting |
| `services/bff/src/middleware/auth.js` | API key validation, role/userId injection, `requireRole()` guard |
| `services/bff/src/routes/offers.js` | Offer proxy routes |
| `services/bff/src/routes/partners.js` | Partner proxy with role guards |
| `services/bff/src/routes/activations.js` | Activation proxy |
| `services/bff/src/routes/transactions.js` | Transaction proxy (role-filtered) |
| `services/bff/src/routes/eligibility.js` | Eligibility proxy |
| `services/bff/src/routes/analytics.js` | Analytics proxy |
| `services/bff/src/routes/campaigns.js` | Campaign proxy (ADMIN only) |
| `services/bff/src/routes/audit.js` | Audit proxy (ADMIN only) |
| `services/bff/src/routes/recommendations.js` | Recommendation engine (BFF-internal logic) |

---

## Feature: Correlation ID Tracing

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `services/offer-service/.../config/CorrelationIdFilter.java` | Reads/generates X-Correlation-Id, puts in MDC |
| `services/partner-service/.../config/CorrelationIdFilter.java` | Same pattern |
| `services/eligibility-service/.../config/CorrelationIdFilter.java` | Same pattern |
| `services/redemption-service/.../config/CorrelationIdFilter.java` | Same pattern |
| `services/bff/src/index.js` | Middleware generates correlationId, passes to upstream |

---

## Feature: Customer App

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/customer-app/src/App.tsx` | Router with 6 routes |
| `apps/customer-app/src/main.tsx` | React entry point |
| `apps/customer-app/src/api/client.ts` | API client (listOffers, getOffer, activateOffer, listActivations, simulateTransaction, listTransactions, getCashbackSummary, checkEligibility, getRecommendations, getSimilarOffers) |
| `apps/customer-app/src/components/Layout.tsx` | Header + sidebar navigation |
| `apps/customer-app/src/types/index.ts` | TypeScript interfaces |
| `apps/customer-app/src/pages/Home.tsx` | Dashboard with stats + recommendations |
| `apps/customer-app/src/pages/OfferFeed.tsx` | Browse offers with filters + pagination |
| `apps/customer-app/src/pages/OfferDetail.tsx` | Offer details + eligibility + activate |
| `apps/customer-app/src/pages/MyOffers.tsx` | Active offers |
| `apps/customer-app/src/pages/MyCashback.tsx` | Cashback summary |
| `apps/customer-app/src/pages/TransactionHistory.tsx` | Transaction list |
| `apps/customer-app/vite.config.ts` | Dev server :5173, proxies /api to BFF |

---

## Feature: Merchant Portal

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/merchant-portal/src/App.tsx` | Router with 8 routes |
| `apps/merchant-portal/src/main.tsx` | React entry point |
| `apps/merchant-portal/src/api/client.ts` | API client (offers CRUD, analytics, transactions, insights) |
| `apps/merchant-portal/src/components/Layout.tsx` | Header + sidebar navigation |
| `apps/merchant-portal/src/types/index.ts` | TypeScript interfaces |
| `apps/merchant-portal/src/pages/Dashboard.tsx` | Metrics + insights + category performance |
| `apps/merchant-portal/src/pages/OfferList.tsx` | Offer list with status filters |
| `apps/merchant-portal/src/pages/CreateOffer.tsx` | Create offer form |
| `apps/merchant-portal/src/pages/EditOffer.tsx` | Edit offer form |
| `apps/merchant-portal/src/pages/OfferDetail.tsx` | Offer detail + status actions + duplicate |
| `apps/merchant-portal/src/pages/PartnerProfile.tsx` | Merchant profile |
| `apps/merchant-portal/src/pages/TransactionHistory.tsx` | Transaction list |
| `apps/merchant-portal/vite.config.ts` | Dev server :5174, proxies /api to BFF |

---

## Feature: Colleague Portal

**Status:** COMPLETE

| File | What It Does |
|------|-------------|
| `apps/colleague-portal/src/App.tsx` | Router with 7 routes |
| `apps/colleague-portal/src/main.tsx` | React entry point |
| `apps/colleague-portal/src/api/client.ts` | API client (offers, partners, campaigns, audit, analytics) |
| `apps/colleague-portal/src/components/Layout.tsx` | Header + sidebar navigation |
| `apps/colleague-portal/src/pages/Dashboard.tsx` | Platform overview stats |
| `apps/colleague-portal/src/pages/OfferReview.tsx` | Compliance checks + approve/reject |
| `apps/colleague-portal/src/pages/MerchantOnboarding.tsx` | Merchant approval workflow |
| `apps/colleague-portal/src/pages/CampaignManagement.tsx` | Campaign CRUD + offer management |
| `apps/colleague-portal/src/pages/Analytics.tsx` | Platform analytics |
| `apps/colleague-portal/src/pages/AuditLog.tsx` | Audit trail with search |
| `apps/colleague-portal/src/pages/Compliance.tsx` | Compliance rules reference |
| `apps/colleague-portal/vite.config.ts` | Dev server :5175, proxies /api to BFF |

---

## Feature: JWT Authentication (v1.1.0)

**Status:** COMPLETE
**What it does:** Email/password login returning 8h JWT. All 3 portals redirect to /login if not authenticated. Legacy X-API-Key still accepted for backward-compat.

| Layer | File | What It Does |
|-------|------|-------------|
| DB | `identity.users` (BFF-managed) | Users table with bcrypt password_hash, role, partnerId, customerId |
| BFF Init | `services/bff/src/db.js` | pg Pool connecting to cc-postgres |
| BFF Init | `services/bff/src/identity.js` | Creates schema + seeds 5 demo users on BFF startup |
| BFF Route | `services/bff/src/routes/auth.js` | POST /login → JWT, GET /me, POST /register |
| BFF Middleware | `services/bff/src/middleware/auth.js` | JWT Bearer OR X-API-Key; `requireRole()` guard |
| Frontend | `apps/*/src/lib/auth.ts` | `getToken/setToken/clearToken/isLoggedIn/getUser` |
| Frontend | `apps/*/src/pages/Login.tsx` | Email/password form, posts to /api/v1/auth/login |
| Frontend | `apps/*/src/api/client.ts` | Sends `Authorization: Bearer <token>`, falls back to demo key |
| Frontend | `apps/*/src/App.tsx` | `/login` route + `ProtectedRoute` redirects unauthenticated users |
| Frontend | `apps/*/src/components/Layout.tsx` | User name + Sign out button in header |

Demo users (pw: `demo1234`): customer@, customer2@, merchant@, colleague@, exec@demo.com

---

## Feature: Bank Revenue / Tier Model (v1.1.0)

**Status:** COMPLETE
**What it does:** Bank earns commission on every cashback credit. Commission rate depends on merchant tier.

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `offer-service V5` | `commission_rate DECIMAL(5,2) DEFAULT 10.00` on offers |
| Migration | `partner-service V3` | `tier` column on partners (BRONZE/SILVER/GOLD/PLATINUM) |
| Migration | `redemption-service V4` | `revenue_ledger` table + backfill from cashback_credits |
| BFF Route | `services/bff/src/routes/analytics.js` | `GET /analytics/revenue` — tier breakdown + daily trend |

Tier rates: BRONZE 15% · SILVER 12% · GOLD 10% · PLATINUM 8%

---

## Feature: Exec Dashboard (v1.1.0)

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| BFF Route | `services/bff/src/routes/exec.js` | `GET /exec/dashboard` — KPIs, category ROI, tier breakdown, AI narrative |
| UI | `apps/colleague-portal/src/pages/ExecDashboard.tsx` | KPI cards, ROI bars, tier stacked bar, AI insight banner |

---

## Feature: Commercial Customer KYB (v1.1.0)

**Status:** COMPLETE

| Layer | File | What It Does |
|-------|------|-------------|
| Migration | `partner-service V3` | `commercial_customers` table (company, CRN, KYB status) |
| BFF Route | `services/bff/src/routes/commercial.js` | GET list, POST create, PATCH status |
| UI | `apps/colleague-portal/src/pages/CommercialOnboarding.tsx` | Filter by status, create, approve/reject |

Statuses: PENDING_ONBOARDING → KYB_IN_PROGRESS → APPROVED / REJECTED

---

## Feature: AI Insights (v1.1.0)

**Status:** COMPLETE

| Endpoint | File | What It Does |
|----------|------|-------------|
| `GET /recommendations/merchant-next-offer` | `recommendations.js` | AI suggests 3 new offer ideas based on category coverage + trends |
| `GET /analytics/customer-insights/:id` | `analytics.js` | AI generates 3-sentence customer profile + campaign suggestion |
| `GET /exec/dashboard` → `aiInsight` | `exec.js` | AI generates 2-sentence exec narrative from KPI context |
| UI | `merchant-portal/AIOfferSuggestions.tsx` | "What should I offer next?" with AI suggestions + category stats |
| UI | `colleague-portal/CustomerInsights.tsx` | Customer search + AI profile + activations breakdown |

AI providers auto-detected by key prefix: `sk-ant-` = Claude · `sk-` = OpenAI · `AIza` = Gemini. Rule-based fallback if no key.
