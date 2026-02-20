# Connected Commerce - Architecture

> **WHAT IS THIS?** This shows how all the pieces of our app connect together. Think of it like a building's floor plan — it shows where each room is and how they connect.

---

## The Big Picture (How Data Flows)

```
    PEOPLE                         WHAT THEY SEE                    THE MIDDLEMAN
    ──────                         ──────────────                   ──────────────

    Bank Customer  ──────────►  Customer App (:5173)  ─────►  BFF Gateway (:3000)
    (browses offers,              React + TypeScript             Node.js + Express
     activates, earns)            7 pages                        │
                                                                 │  API-key auth
    Merchant  ───────────────►  Merchant Portal (:5174) ────────►│  Role injection
    (creates offers,              React + TypeScript              │  Correlation IDs
     views analytics)             9 pages                        │  Route proxying
                                                                 │
    Bank Colleague ──────────►  Colleague Portal (:5175) ───────►│
    (reviews offers,              React + TypeScript              │
     manages campaigns)           8 pages                        │
                                                                 ▼
                               BACKEND SERVICES (the brains)
                               ──────────────────────────────
                               ┌──────────────┐  ┌──────────────┐
                               │ Offer Service │  │Partner Service│
                               │   (:8081)     │  │   (:8082)    │
                               │ Offers + Cam- │  │ Merchant     │
                               │ paigns + Audit│  │ onboarding   │
                               └──────┬────────┘  └──────┬───────┘
                               ┌──────────────┐  ┌──────────────┐
                               │ Eligibility  │  │ Redemption   │
                               │   (:8083)    │  │   (:8084)    │
                               │ Brand-match  │  │ Activations  │
                               │ + fatigue    │  │ Transactions │
                               │ checks       │  │ Cashback     │
                               └──────┬────────┘  └──────┬───────┘
                                      │                   │
                               ▼──────▼───────────────────▼─────▼
                               ┌─────────────────────────────────┐
                               │     PostgreSQL Database (:5432)  │
                               │  ┌────────┐ ┌─────────┐        │
                               │  │ offers │ │partners │        │
                               │  │ schema │ │ schema  │        │
                               │  └────────┘ └─────────┘        │
                               │  ┌──────────┐ ┌────────────┐   │
                               │  │redemp-   │ │eligibility │   │
                               │  │ tions    │ │ schema     │   │
                               │  └──────────┘ └────────────┘   │
                               └─────────────────────────────────┘

                               ┌─────────────────────────────────┐
                               │   Kafka Message Bus (:9092)      │
                               │   offer.events topic             │
                               │   Kafka UI (:9080) — web monitor │
                               └─────────────────────────────────┘
```

---

## Service Details

### Customer App (Port 5173)
**What:** The web page bank customers see to browse offers, activate them, and track cashback.
**Technology:** React 18 + TypeScript + Vite
**Talks to:** BFF only (never directly to backend services)
**Auth:** Uses `customer-demo-key` API key
**Windows location:** `apps\customer-app\`
**Pages:**
| Page | Route | What It Does |
|------|-------|-------------|
| Home | `/` | Hero banner, stats cards (offers/cashback/active), recommended offers section |
| OfferFeed | `/browse` | Browse all offers with category/brand filters, pagination, expiry badges |
| OfferDetail | `/offers/:id` | Offer details, eligibility check, activate button, similar offers |
| MyOffers | `/my-offers` | List of activated offers with status |
| MyCashback | `/cashback` | Cashback summary and credit history |
| TransactionHistory | `/transactions` | Transaction list with amounts and statuses |

### Merchant Portal (Port 5174)
**What:** The web page merchants use to create offers, view analytics, and manage their profile.
**Technology:** React 18 + TypeScript + Vite
**Talks to:** BFF only
**Auth:** Uses `merchant-demo-key` API key
**Windows location:** `apps\merchant-portal\`
**Pages:**
| Page | Route | What It Does |
|------|-------|-------------|
| Dashboard | `/` | Offer stats, redemption metrics, category performance table, cashback tier distribution, actionable insights |
| OfferList | `/offers` | All offers with status badges and filters |
| CreateOffer | `/offers/new` | Form to create new offer (all fields including imageUrl) |
| EditOffer | `/offers/:id/edit` | Pre-filled form to edit DRAFT/PAUSED offers |
| OfferDetail | `/offers/:id` | Full offer details, status transitions, duplicate button |
| PartnerProfile | `/profile` | Merchant profile management |
| TransactionHistory | `/transactions` | Merchant's transaction history |

### Colleague Portal (Port 5175)
**What:** Internal web app for bank colleagues to review offers, manage campaigns, onboard merchants, and monitor compliance.
**Technology:** React 18 + TypeScript + Vite
**Talks to:** BFF only
**Auth:** Uses `admin-demo-key` API key
**Windows location:** `apps\colleague-portal\`
**Pages:**
| Page | Route | What It Does |
|------|-------|-------------|
| Dashboard | `/` | Overview stats (offers, campaigns, partners, transactions) |
| OfferReview | `/offer-review` | Compliance checks (FCA, ASA), approve/reject offers with blocking failures |
| MerchantOnboarding | `/merchant-onboarding` | Review and approve merchant applications |
| CampaignManagement | `/campaigns` | Create/edit campaigns, add/remove offers, status transitions |
| Analytics | `/analytics` | Offer and redemption analytics with charts |
| AuditLog | `/audit` | Full audit trail with search/filter and per-offer drill-down |
| Compliance | `/compliance` | Compliance rules reference and policy management |

### BFF Gateway (Port 3000)
**What:** The middleman. All browser requests come here first. It validates API keys, injects user identity, and routes to the right backend service.
**Technology:** Node.js 20 + Express
**Talks to:** All backend services
**Windows location:** `services\bff\`
**Routes:**
| Route Prefix | Backend Target | Auth Required |
|-------------|---------------|---------------|
| `/api/v1/offers` | offer-service :8081 | Any role |
| `/api/v1/partners` | partner-service :8082 | MERCHANT/ADMIN for writes |
| `/api/v1/activations` | redemption-service :8084 | CUSTOMER/ADMIN |
| `/api/v1/transactions` | redemption-service :8084 | Any (role-filtered) |
| `/api/v1/eligibility` | eligibility-service :8083 | CUSTOMER/ADMIN |
| `/api/v1/analytics` | offer-service + redemption-service | MERCHANT/ADMIN |
| `/api/v1/campaigns` | offer-service :8081 | ADMIN |
| `/api/v1/audit` | offer-service :8081 | ADMIN |
| `/api/v1/recommendations` | BFF-internal (rule-based engine) | Role-dependent |

### Offer Service (Port 8081)
**What:** Manages offers, campaigns, and audit logs.
**Technology:** Java 17 + Spring Boot 3.2.3 + Flyway + JPA
**Database schema:** `offers` (tables: offers, offer_audit_log, campaigns, campaign_offers)
**Kafka:** Publishes events to `offer.events` topic
**Windows location:** `services\offer-service\`

### Partner Service (Port 8082)
**What:** Manages merchant accounts — registration, approval, profiles.
**Technology:** Java 17 + Spring Boot 3.2.3 + Flyway + JPA
**Database schema:** `partners` (tables: partners, partner_audit_log)
**Windows location:** `services\partner-service\`

### Eligibility Service (Port 8083)
**What:** Checks if a customer is eligible for an offer based on brand matching and activation fatigue limits.
**Technology:** Java 17 + Spring Boot 3.2.3 (no database — calls other services)
**Windows location:** `services\eligibility-service\`

### Redemption Service (Port 8084)
**What:** Handles offer activations, simulated transactions, and automatic cashback crediting.
**Technology:** Java 17 + Spring Boot 3.2.3 + Flyway + JPA
**Database schema:** `redemptions` (tables: activations, transactions, cashback_credits)
**Windows location:** `services\redemption-service\`

---

## Authentication Model (MVP)

The BFF uses a simple API-key authentication model (not JWT — simplified for demo):

| API Key | Role | User ID | Can Access |
|---------|------|---------|------------|
| `customer-demo-key` | CUSTOMER | `00000000-0000-0000-0000-000000000002` | Offers (read), activations, transactions (own), cashback, eligibility, recommendations |
| `merchant-demo-key` | MERCHANT | `00000000-0000-0000-0000-000000000001` | Offers (CRUD), partners (own), transactions (all), analytics, insights |
| `admin-demo-key` | ADMIN | `admin-user` | Everything — campaigns, audit, compliance, analytics |

API keys are sent via the `X-API-Key` header. The BFF middleware (`auth.js`) validates the key and injects `req.userId` and `req.userRole` for downstream use.

---

## How Services Communicate

| From | To | Method | Example |
|------|----|--------|---------|
| Browser | BFF | HTTP with X-API-Key header | Customer clicks "Browse Offers" |
| BFF | Backend service | HTTP with X-Correlation-Id header | BFF forwards to offer-service |
| Backend service | Database | JPA (Java database queries) | Offer service reads offers table |
| Backend service | Kafka | Publish event message | "offer.status_changed" event published |
| BFF | BFF (internal) | Rule-based engine | Recommendations scored and returned |

---

## Cross-Cutting Concerns (Things Every Service Has)

| Feature | What It Does | Implementation |
|---------|-------------|----------------|
| Correlation ID | Every request gets a unique tracking ID that follows it everywhere | `CorrelationIdFilter.java` in Java, middleware in BFF `index.js` |
| Structured Logging | All logs include `[correlationId]` for traceability | SLF4J + Logback with pattern in `application.yml` |
| Health Checks | Every service has a `/health` URL to verify it's alive | Spring Actuator + custom `*HealthController.java` |
| Error Handling | All errors return `{error, correlationId, timestamp}` | `GlobalExceptionHandler.java` in each service |
| Database Migrations | Schema changes applied automatically on startup | Flyway with `V*__description.sql` files |
| Role-Based Access | BFF guards routes by role | `requireRole()` middleware in BFF route files |

---

## Personalization Architecture

The recommendation engine is implemented in the BFF (`recommendations.js`) with two modes:

**Mode 1: Rule-Based (current)**
- Fetches customer activation history from redemption-service
- Fetches all LIVE offers from offer-service
- Scores offers by: category affinity (x10), brand affinity (x5), cashback rate, recency boost, urgency boost (expiring within 7 days)
- Filters out already-activated offers
- Returns top N scored offers

**Mode 2: Vertex AI (when configured)**
- Set `VERTEX_API_KEY` and `VERTEX_ENDPOINT` environment variables
- BFF calls Vertex AI Predict endpoint with customer ID
- Falls back to rule-based if Vertex AI is unavailable

**Endpoints:**
- `GET /api/v1/recommendations/for-you` — Personalized customer recommendations
- `GET /api/v1/recommendations/similar/:offerId` — Similar offers by category/brand/type
- `GET /api/v1/recommendations/merchant-insights` — Merchant targeting insights (category performance, brand distribution, cashback tiers, actionable recommendations)
