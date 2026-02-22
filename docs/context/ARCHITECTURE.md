# Connected Commerce - Architecture v1.3.0

> **v1.3.0** — GCP Live, PWA, Responsive UI
> Two new banking data microservices, Redis caching, A/B personalisation mode, 9 customer personas, mobile API, GCP deployed to Cloud Run + Firebase Hosting, Progressive Web App, full responsive UI (mobile/tablet/desktop).

---

## The Big Picture (How Data Flows)

```
═══════════════════════════════════════════════════════════════════════════════
  UPSTREAM (Core Banking — simulated via Kafka)
═══════════════════════════════════════════════════════════════════════════════

  banking.customers (3 partitions)  ──────────►  customer-data-service (:8085)
  banking.transactions (6 partitions) ─────────►  transaction-data-service (:8086)
  commerce.offers (1 partition)     ──────────►  (offer-service consumer)

═══════════════════════════════════════════════════════════════════════════════
  PEOPLE                 WHAT THEY SEE              THE MIDDLEMAN
═══════════════════════════════════════════════════════════════════════════════

  Bank Customer ──────►  Customer App (:5173)  ──►  BFF Gateway (:3000)
  (9 personas,            React + TypeScript          Node.js + Express
   browses offers,        9 pages + /demo             │
   A/B toggle)                                        ├── JWT auth (Bearer)
                                                      ├── Rate limiting
  Merchant ────────────►  Merchant Portal (:5174) ──►│   (60/min recs)
  (creates offers,        React + TypeScript          ├── Circuit breaker
   views analytics)       9 pages                     ├── Redis cache
                                                      │   (ioredis)
  Colleague ───────────►  Colleague Portal (:5175) ──►│── Slim middleware
  (reviews, approves,     React + TypeScript          │   (mobile)
   exec dashboard)        8+ pages                    │
                                                      ▼
══════════════════════════════════════════════════════════════════════════════
  BACKEND SERVICES
══════════════════════════════════════════════════════════════════════════════

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │  offer-service   │  │ partner-service   │  │eligibility-service│
  │     (:8081)      │  │     (:8082)       │  │     (:8083)       │
  │ Offers+Campaigns │  │ Merchants+KYB    │  │ Brand-match       │
  │ Audit log        │  │ Commercial cust. │  │ Fatigue check     │
  │ Commission tiers │  │ CRM fields (V4)  │  │                   │
  └────────┬─────────┘  └────────┬─────────┘  └────────┬──────────┘

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │redemption-service│  │customer-data-svc │  │transaction-data- │
  │     (:8084)      │  │     (:8085) NEW  │  │     svc (:8086)  │
  │ Activations      │  │ Bank-style       │  │ MCC-enriched     │
  │ Transactions     │  │ profiles +       │  │ transactions     │
  │ Cashback credits │  │ classifications  │  │ Spending summaries│
  │ Revenue ledger   │  │ Kafka-fed        │  │ Keyset pagination│
  └────────┬─────────┘  └────────┬─────────┘  └────────┬──────────┘
           │                     │                      │
           ▼─────────────────────▼──────────────────────▼
  ┌─────────────────────────────────────────────────────┐
  │           PostgreSQL Database (:5432)                │
  │  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐  │
  │  │ offers │ │partners │ │redemptions│ │eligibility│  │
  │  └────────┘ └─────────┘ └──────────┘ └──────────┘  │
  │  ┌──────────────┐ ┌────────────────────┐ ┌───────┐  │
  │  │  customers   │ │banking_transactions│ │identity│  │
  │  │  (NEW v1.2)  │ │    (NEW v1.2)      │ │ (BFF) │  │
  │  └──────────────┘ └────────────────────┘ └───────┘  │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │   Kafka Message Bus (:9092)          │
  │   commerce.offers:1:1               │
  │   banking.customers:3:1  (NEW)      │
  │   banking.transactions:6:1  (NEW)   │
  │   Kafka UI (:9080) — web monitor    │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │   Redis Cache (:6379)  NEW          │
  │   Customer profile  TTL 300s        │
  │   Offers            TTL 60s         │
  │   Spending summary  TTL 900s        │
  └─────────────────────────────────────┘
```

---

## Port Map

| Port | Service | Notes |
|------|---------|-------|
| 5173 | Customer App (React) | + /demo A/B page |
| 5174 | Merchant Portal (React) | |
| 5175 | Colleague Portal (React) | + exec dashboard |
| 3000 | BFF (Node/Express) | JWT auth + rate limiting |
| 8081 | offer-service (Spring Boot) | Flyway V5 |
| 8082 | partner-service (Spring Boot) | Flyway V4 (CRM enrichment) |
| 8083 | eligibility-service (Spring Boot) | |
| 8084 | redemption-service (Spring Boot) | Flyway V4 (revenue ledger) |
| 8085 | **customer-data-service (NEW)** | Bank profiles + classifications |
| 8086 | **transaction-data-service (NEW)** | MCC transactions + summaries |
| 5432 | PostgreSQL (Docker: cc-postgres) | 7 schemas |
| 9092 | Kafka | KRaft, 3 topics |
| 9080 | Kafka UI | |
| 6379 | **Redis (NEW)** | ioredis via BFF |

---

## Service Details

### Customer App (Port 5173) — v1.2.0

**New in v1.2.0:** A/B personalization toggle, 9 persona login, per-persona hero banner, mode badges on offer cards, `/demo` A/B comparison page.

| Page | Route | What It Does |
|------|-------|-------------|
| Home | `/` | Segment-aware hero banner, recommended offers with mode badges (AI/RULES) |
| PersonalizationDemo | `/demo` | Two-column side-by-side rule-based vs AI comparison |
| Login | `/login` | 9-persona selector dropdown pre-fills email |
| OfferFeed | `/browse` | Browse all offers with filters |
| OfferDetail | `/offers/:id` | Offer details, eligibility, activate |
| MyOffers | `/my-offers` | Activated offers |
| MyCashback | `/cashback` | Cashback history |
| TransactionHistory | `/transactions` | Transaction list |

### BFF Gateway (Port 3000) — v1.2.0

**Auth:** JWT Bearer token (primary) + legacy X-API-Key (backward compat)
**New in v1.2.0:** Redis caching, rate limiting, circuit breaker, slim middleware, A/B toggle.

| Route Prefix | Backend Target | Auth |
|-------------|---------------|------|
| `/api/v1/offers` | offer-service :8081 | Any role |
| `/api/v1/partners` | partner-service :8082 | MERCHANT/ADMIN for writes |
| `/api/v1/activations` | redemption-service :8084 | CUSTOMER/ADMIN |
| `/api/v1/transactions` | redemption-service :8084 | Any (role-filtered) |
| `/api/v1/eligibility` | eligibility-service :8083 | CUSTOMER/ADMIN |
| `/api/v1/campaigns` | offer-service :8081 | ADMIN |
| `/api/v1/audit` | offer-service :8081 | ADMIN |
| `/api/v1/recommendations` | BFF-internal scoring | CUSTOMER |
| `/api/v1/customers/:id/profile` | customer-data-service :8085 | Any |
| `/api/v1/customers/:id/spending` | transaction-data-service :8086 | Any |
| `/api/v1/mobile/*` | BFF-internal | CUSTOMER (slim mode) |
| `/api/v1/notifications/register` | BFF-internal (Redis) | CUSTOMER |

**Rate limits:**
- `/api/v1/recommendations/*` → 60 req/min
- All other `/api/v1/*` → 300 req/min

**Circuit breaker:** Opens after 5 failures in 30s per upstream host; half-open after 30s.

### customer-data-service (Port 8085) — NEW in v1.2.0

**What:** Bank-style customer profiles with segment, lifecycle, spend pattern, and classification tags. Read-model fed by Kafka `banking.customers` events.

**Technology:** Java 17 + Spring Boot 3.2.3 + Flyway + JPA
**Database schema:** `customers` (tables: profiles, classifications)
**Kafka consumer:** `banking.customers` topic (3 partitions, keyed by customer_id)

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/customers/{id}` | Full profile + classifications |
| GET | `/api/v1/customers/{id}/summary` | Slim profile for BFF scoring |
| GET | `/api/v1/customers/{id}/classifications` | Classification tags only |
| GET | `/api/v1/customers/health` | Health check |

**Classification types:** AFFINITY, PROPENSITY, SEGMENT, CHANNEL_PREFERENCE
**Sources:** RULES_ENGINE, ML_MODEL, MANUAL

### transaction-data-service (Port 8086) — NEW in v1.2.0

**What:** MCC-enriched banking transaction history with keyset pagination and pre-computed spending summaries. Read-model fed by Kafka `banking.transactions` events.

**Technology:** Java 17 + Spring Boot 3.2.3 + Flyway + JPA
**Database schema:** `banking_transactions` (tables: transactions, spending_summaries)
**Kafka consumer:** `banking.transactions` topic (6 partitions for 25M scale)

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/banking-transactions/customer/{id}?after=<ts>&limit=50` | Keyset-paginated transactions |
| GET | `/api/v1/banking-transactions/customer/{id}/spending-summary?periodType=QUARTERLY` | Category spend totals |
| GET | `/api/v1/banking-transactions/health` | Health check |

**Keyset pagination:** `?after=<ISO8601 timestamp>` replaces OFFSET — safe at 25M scale.

**MCC codes used:** 5411=Grocery · 5812=Restaurant · 5045=Electronics · 5311=Fashion · 7011=Travel/Hotel · 4511=Airlines · 4111=Rail · 7922=Entertainment · 5912=Health/Pharmacy · 5945=Gaming

### Other services (unchanged from v1.1.0)

| Service | Port | Key Tables | Notes |
|---------|------|-----------|-------|
| offer-service | 8081 | offers, offer_audit_log, campaigns | Flyway V5 (commission_rate) |
| partner-service | 8082 | partners, partner_audit_log, commercial_customers | Flyway V4 (CRM enrichment) |
| eligibility-service | 8083 | (no DB) | Brand-match + fatigue checks |
| redemption-service | 8084 | activations, transactions, cashback_credits, revenue_ledger | Flyway V4 (revenue model) |

---

## Authentication Model — v1.2.0

**Primary:** JWT Bearer token — login via `POST /api/v1/auth/login`
**Legacy (compat):** X-API-Key header still accepted

### Demo Users

| Login | Name | Role | customer_id | Segment |
|-------|------|------|-------------|---------|
| customer@demo.com | Alice Morgan | CUSTOMER | c0000000-…-0005 | PREMIER |
| customer2@demo.com | Ben Clarke | CUSTOMER | c0000000-…-0006 | MASS_AFFLUENT |
| customer3@demo.com | Cara Singh | CUSTOMER | c0000000-…-0007 | MASS_MARKET |
| customer4@demo.com | Dan Webb | CUSTOMER | c0000000-…-0008 | PREMIER |
| customer5@demo.com | Emma Hayes | CUSTOMER | c0000000-…-0009 | MASS_AFFLUENT |
| customer6@demo.com | Frank Osei | CUSTOMER | c0000000-…-0010 | MASS_MARKET |
| customer7@demo.com | Grace Liu | CUSTOMER | c0000000-…-0011 | PREMIER |
| customer8@demo.com | Harry Patel | CUSTOMER | c0000000-…-0012 | MASS_AFFLUENT |
| customer9@demo.com | Isla Brown | CUSTOMER | c0000000-…-0013 | MASS_MARKET |
| merchant@demo.com | - | MERCHANT | - | - |
| colleague@demo.com | - | COLLEAGUE | - | - |
| exec@demo.com | - | EXEC | - | - |

All passwords: **demo1234**

**Role hierarchy:** EXEC inherits COLLEAGUE privileges.

---

## Personalization Architecture — v1.2.0

### A/B Mode Toggle

Activate via query param `?mode=rule-based|ai` or header `X-Personalization-Mode: ai`.

```
GET /api/v1/recommendations/for-you?mode=rule-based
GET /api/v1/recommendations/for-you?mode=ai
GET /api/v1/recommendations/compare          ← both modes side-by-side (demo)
```

### Rule-Based Scoring v2 (`scoreOffersV2`)

| Factor | Points | Detail |
|--------|--------|--------|
| Category affinity | 0–40 | Normalised from 90-day spending summaries |
| Spend pattern match | 0–20 | DEAL_SEEKER→cashback%, BRAND_LOYAL→brand, EXPERIENCE_SEEKER→offer type |
| Segment alignment | 0–15 | PREMIER→premium brands, MASS_MARKET→low min_spend |
| Lifecycle urgency | 0–25 | AT_RISK +25 (retention), NEW +15 (onboarding) |
| Offer urgency | 0–10 | Expiry <7 days +10, <30 days +5 |

Returns `_score`, `_reason`, `_mode: "rule-based"`.

### AI Mode

Requires `AI_KEY` in `services/bff/.env`. Auto-detects provider:
- `sk-ant-…` → Anthropic Claude (claude-haiku-4-5-20251001)
- `sk-…` → OpenAI (gpt-4o-mini)
- `AIza…` → Google Gemini (gemini-1.5-flash)

Prompt includes: customer_segment, lifecycle_stage, spend_pattern, income_band, top 3 spend categories, classification tags.

Falls back to rule-based v2 if key missing or rate-limited.

---

## Mobile API Layer — v1.2.0

Mobile clients (iOS/Android) use the same JWT auth as web. Slim mode strips heavy fields.

**Platform detection:** `User-Agent: CCPlatform-iOS/1.0` or `CCPlatform-Android/1.0`

**Key endpoints:**
```
GET  /api/v1/mobile/home              → greeting, stats, offer feed, categories
GET  /api/v1/mobile/offers?slim=true  → slim offer list (id, title, cashbackRate only)
POST /api/v1/notifications/register   → FCM push token registration
```

**URL scheme for deep links:**
- `ccplatform://offer/{id}`
- `ccplatform://cashback`
- `ccplatform://browse?category=Travel`

See `docs/context/MOBILE-API.md` for full reference.

---

## 25M Scale Patterns

| Pattern | Where | Detail |
|---------|-------|--------|
| Keyset pagination | transaction-data-service | `?after=<ts>` cursor, no OFFSET |
| Kafka partitioning | banking.transactions (6) | customer_id hash → consistent consumer |
| Redis caching | BFF | Profile 5min, offers 1min, spending 15min |
| HikariCP pool | All Java services | max 2 (GCP db-f1-micro), min-idle 0 (scale-to-zero safe) |
| Composite indexes | Both new services | (customer_id, date DESC) on transactions |
| Circuit breaker | BFF | 5 failures in 30s → OPEN |
| Eventual consistency | Kafka consumers | Profile/transaction updates async |
| GCP auto-scale | Cloud Run | BFF min=1 (no cold start); Java min=0 (scale-to-zero) |

---

## GCP Deployment (LIVE)

Sites: https://[your-customer-site].web.app / https://[your-merchant-site].web.app / https://[your-colleague-site].web.app
BFF Cloud Run: https://[your-bff-service].run.app

See `infrastructure/gcp/` for deployment scripts and manifests.

```
infrastructure/gcp/
├── cloud-run/
│   ├── bff.yaml                      (ingress=all, min=1, max=100)
│   ├── customer-data-service.yaml    (ingress=internal)
│   ├── transaction-data-service.yaml (ingress=internal)
│   ├── offer-service.yaml            (ingress=internal)
│   └── ... (one per service)
├── cloud-sql/
│   └── README.md                     (connection string, proxy setup, IAM)
├── pubsub/
│   └── topics.yaml                   (3 topics with ordering keys)
└── firebase/
    └── firebase.json                 (3 hosting targets)
```

**Kafka → Pub/Sub mapping for GCP:**
- Local: Kafka KRaft (Docker)
- GCP: Cloud Pub/Sub with `ordering_key = customer_id`

**Spring profile activation:** `SPRING_PROFILES_ACTIVE=gcp` → uses `CLOUD_SQL_URL` and `PUBSUB_ENDPOINT`.

---

## Responsive UI Architecture (v1.3.0)

All three React apps (customer-app, merchant-portal, colleague-portal) are fully responsive. Zero CSS frameworks — 100% inline `style={{}}` with a shared breakpoint hook.

### Breakpoints

| Name | Range | Behaviour |
|------|-------|-----------|
| `mobile` | < 768 px | Hamburger nav / overlay drawer |
| `tablet` | 768 – 1023 px | Icon-only sidebar (64 px) |
| `desktop` | >= 1024 px | Full layout — unchanged from original |

### Shared Infrastructure (all 3 apps)

| File | What It Does |
|------|-------------|
| `src/hooks/useBreakpoint.ts` | `window.innerWidth` + resize listener; returns `'mobile' | 'tablet' | 'desktop'` |
| `src/index.css` | Global reset, `box-sizing: border-box`, `.table-scroll` (overflow-x: auto), `@keyframes` |
| `src/main.tsx` | Imports `index.css` |

### Layout Patterns

- **Customer App**: full horizontal top-nav on tablet/desktop; hamburger + slide-down nav on mobile
- **Merchant/Colleague portals**: 250 px sidebar (desktop) → 64 px icon-only (tablet) → hidden + overlay drawer (mobile)

### Page Patterns

| Pattern | Where |
|---------|-------|
| Responsive grid columns (`1fr` → `repeat(2,1fr)` → `auto-fit`) | All KPI/card grids |
| Flex direction stack (`column` on mobile, `row` on desktop) | Two-panel detail views |
| `.table-scroll` wrapper + `minWidth` on table | All `<table>` elements |
| Responsive form grids (`1fr` on mobile → `1fr 1fr` on desktop) | Create/edit forms |

---

## Cross-Cutting Concerns

| Feature | What It Does | Implementation |
|---------|-------------|----------------|
| Correlation ID | Every request gets a unique tracking ID | `CorrelationIdFilter.java` (all services) |
| Structured Logging | Logs include `[correlationId]` | SLF4J + MDC pattern in `application.yml` |
| Health Checks | Each service has `/health` URL | Spring Actuator + custom `*HealthController.java` |
| Error Handling | Errors return `{error, correlationId, timestamp}` | `GlobalExceptionHandler.java` (all services) |
| DB Migrations | Schema changes on startup | Flyway `V*__description.sql` per service |
| Role-Based Access | BFF guards routes by role | `requireRole()` middleware |
| Rate Limiting | Prevent API abuse | `express-rate-limit` in BFF |
| Circuit Breaker | Upstream failure isolation | `circuit.js` in BFF |
| Redis Caching | Reduce latency, protect Java services | `cache.js` with ioredis |
| Slim Mode | Mobile-optimized payloads | `middleware/slim.js` in BFF |
