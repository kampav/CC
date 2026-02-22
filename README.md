# Connected Commerce Platform

> Bridging Retail & Commercial Banking through Merchant Offers, Cashback & Loyalty

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cc-customer-0315.web.app)

## Overview

A two-sided marketplace connecting bank retail customers with commercial banking clients (merchants) through personalised offers, cashback rewards, and loyalty experiences — deployable locally or on GCP.

**Three portals:**
- **Customer App** — Browse offers, activate cashback, track earnings, AI personalisation
- **Merchant Portal** — Create offers, view analytics, manage performance, AI suggestions
- **Colleague Portal** — Approve merchants, review offers, run campaigns, exec dashboard

## Live Demo (GCP / Firebase)

| Portal | URL | Login |
|--------|-----|-------|
| Customer App | https://cc-customer-0315.web.app | customer@demo.com / demo1234 |
| Merchant Portal | https://cc-merchant-0315.web.app | merchant@demo.com / demo1234 |
| Colleague Portal | https://cc-colleague-0315.web.app | colleague@demo.com / demo1234 |

Nine customer personas available: `customer@` through `customer9@demo.com` (all pw: `demo1234`)

## Quick Start (Local)

```powershell
# 1. Clone & enter repo
git clone https://github.com/kampav/CC.git
cd CC

# 2. Start infrastructure (PostgreSQL + Redis + Kafka)
docker compose up -d

# 3. Create new schemas (first run only)
docker exec cc-postgres psql -U commerce -d connected_commerce -c "CREATE SCHEMA IF NOT EXISTS customers; CREATE SCHEMA IF NOT EXISTS banking_transactions; GRANT ALL PRIVILEGES ON SCHEMA customers TO commerce; GRANT ALL PRIVILEGES ON SCHEMA banking_transactions TO commerce;"

# 4. Configure BFF
copy services\bff\.env.example services\bff\.env
# Edit services\bff\.env — leave defaults for local use
# Optionally add an AI key (Claude, OpenAI, or Gemini) for AI recommendations

# 5. Start all 10 services (background, no popups)
.\scripts\start.ps1

# Wait ~90 seconds for Java to compile, then open:
#   http://localhost:5173  Customer App
#   http://localhost:5174  Merchant Portal
#   http://localhost:5175  Colleague Portal
#   http://localhost:9080  Kafka UI

# 6. Stop everything
.\scripts\stop.ps1
```

See [SETUP.md](SETUP.md) for detailed first-time setup.

## Demo Flow

1. **Merchant Portal** (http://localhost:5174) — Login as `merchant@demo.com`, create an offer, submit for review
2. **Colleague Portal** (http://localhost:5175) — Login as `colleague@demo.com`, approve offer, set to LIVE
3. **Customer App** (http://localhost:5173) — Login as any persona, browse offers, activate cashback
4. **Customer App** — Simulate a transaction, see cashback credited
5. **Customer App** → `/demo` — A/B toggle: rule-based vs AI personalisation side by side
6. **Colleague Portal** — Executive Dashboard (`exec@demo.com`) — platform KPIs + AI narrative
7. **Kafka UI** (http://localhost:9080) — See offer lifecycle events

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           CHANNELS                               │
│  Customer App     │  Merchant Portal   │  Colleague Portal       │
│  React PWA :5173  │  React :5174       │  React :5175            │
│  9 personas       │  Offer management  │  Ops & compliance       │
│  Mobile-first     │  Analytics         │  Exec dashboard         │
└────────┬──────────┴──────────┬─────────┴──────────┬─────────────┘
         │                     │                     │
┌────────▼─────────────────────▼─────────────────────▼────────────┐
│             BFF Gateway  (Node.js/Express :3000)                  │
│  JWT Auth · Role Guards · Redis Cache · Circuit Breaker           │
│  AI Recommendations (Claude / OpenAI / Gemini · A/B toggle)      │
│  Rate Limiting · Correlation IDs · Mobile Slim Middleware         │
└────────┬─────────────────────┬─────────────────────┬────────────┘
         │                     │                     │
┌────────▼─────────────────────▼─────────────────────▼────────────┐
│              Backend Microservices  (Spring Boot 3)               │
│                                                                   │
│  offer-service       :8081  │  partner-service      :8082        │
│  Offers, campaigns,         │  Merchants, KYB,                   │
│  audit log, analytics       │  tier management, CRM              │
│                             │                                    │
│  eligibility-service :8083  │  redemption-service   :8084        │
│  Brand match,               │  Activations, cashback,            │
│  fatigue checks             │  transactions, revenue             │
│                             │                                    │
│  customer-data-service :8085│  transaction-data-service :8086    │
│  9 customer profiles,       │  90-day transaction history,       │
│  segments, lifecycle        │  spend summaries by category       │
└────────┬─────────────────────┴─────────────────────┬────────────┘
         │                                            │
┌────────▼────────────────────────────────────────────▼───────────┐
│  PostgreSQL 16 (:5432)  7 schemas                                 │
│  offers · partners · eligibility · redemptions                    │
│  identity · customers · banking_transactions                      │
│                                                                   │
│  Redis (:6379)  Cache layer               Apache Kafka (:9092)   │
│  Profile TTL 300s · Offers TTL 60s        KRaft mode             │
│  Spend TTL 900s                           Kafka UI (:9080)       │
└───────────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| offer-service | 8081 | Offer CRUD, campaigns, audit log, analytics, Kafka events |
| partner-service | 8082 | Merchant registration, approval lifecycle, tier management |
| eligibility-service | 8083 | Brand match + activation fatigue limit checks |
| redemption-service | 8084 | Activations, transactions, cashback, revenue ledger |
| customer-data-service | 8085 | 9 customer profiles, segments, lifecycle classification |
| transaction-data-service | 8086 | 90-day transaction history, spend summaries by category |
| bff | 3000 | JWT auth, routing, AI recommendations, Redis cache, circuit breaker |
| customer-app | 5173 | React PWA — 7 pages, 9 personas, A/B toggle, mobile-first |
| merchant-portal | 5174 | React — 8 pages, offer management, analytics, AI suggestions |
| colleague-portal | 5175 | React — 9 pages, ops, compliance, exec dashboard |
| PostgreSQL | 5432 | 7 schemas (Docker: cc-postgres) |
| Redis | 6379 | Cache layer (Docker: cc-redis) |
| Kafka | 9092 | KRaft event streaming (Docker) |
| Kafka UI | 9080 | Web-based Kafka monitoring |

## Authentication

JWT Bearer tokens — login at `/login` on each portal.

| Email | Password | Role | Access |
|-------|----------|------|--------|
| customer@demo.com … customer9@demo.com | demo1234 | CUSTOMER | Customer app (9 personas) |
| merchant@demo.com | demo1234 | MERCHANT | Merchant portal |
| colleague@demo.com | demo1234 | COLLEAGUE | Colleague portal |
| exec@demo.com | demo1234 | EXEC | Colleague portal + exec dashboard |

Legacy `X-API-Key` headers still accepted for backward compatibility:
`customer-demo-key` / `merchant-demo-key` / `admin-demo-key`

## Key Features

- **Offer Lifecycle**: DRAFT → PENDING_REVIEW → APPROVED → LIVE → PAUSED/EXPIRED/RETIRED
- **Campaign Management**: Group offers with targeting, scheduling, budgets
- **Compliance Checking**: FCA Fair Value, ASA Misleading Claims, prohibited categories
- **Eligibility Engine**: Brand-match + activation fatigue limit
- **Cashback Processing**: Activate → Purchase → Auto-credit cashback
- **AI Personalisation**: Claude / OpenAI / Gemini — rule-based fallback if no key
- **A/B Mode Toggle**: `?mode=rule-based|ai` or `/demo` page side-by-side compare
- **9 Customer Personas**: PREMIER/MASS_AFFLUENT/MASS_MARKET × NEW/GROWING/MATURE/AT_RISK
- **Executive Dashboard**: Platform KPIs + AI narrative (revenue, conversion, tier distribution)
- **Redis Caching**: Profile 300s, offers 60s, spend summaries 900s
- **Circuit Breaker**: 5 failures → OPEN, half-open probe after 30s
- **Audit Trail**: Full history of all offer and partner status changes
- **Progressive Web App**: Installable from browser, offline-capable
- **Responsive UI**: Mobile / tablet / desktop — all three portals

## Revenue Model

Tier-based bank commission on cashback earned:

| Partner Tier | Bank Commission |
|-------------|----------------|
| BRONZE | 15% |
| SILVER | 12% |
| GOLD | 10% |
| PLATINUM | 8% |

Tracked in `redemptions.revenue_ledger`.

## Tech Stack

- **Backend:** Java 17 / Spring Boot 3.2 / JPA / Flyway
- **BFF:** Node.js 20 / Express 4 / ioredis
- **Frontend:** React 18 / TypeScript 5 / Vite 5 (PWA)
- **Database:** PostgreSQL 16 (schema-per-service, 7 schemas)
- **Cache:** Redis 7
- **Events:** Apache Kafka (KRaft mode)
- **Containers:** Docker / Docker Compose
- **Cloud:** GCP Cloud Run · Cloud SQL · Firebase Hosting

## GCP Deployment

Scripts in `infrastructure/gcp/`:

```powershell
.\infrastructure\gcp\deploy.ps1                          # Full deploy (all services)
.\infrastructure\gcp\deploy-bff-frontend.ps1             # BFF + 3 frontends only
.\infrastructure\gcp\rebuild-java.ps1                    # Java services only
```

## Project Structure

```
connected-commerce/
├── scripts/
│   ├── start.ps1                   # Start all 10 services (background)
│   └── stop.ps1                    # Stop all services
│
├── services/
│   ├── offer-service/              # Java — offers, campaigns, audit, analytics
│   ├── partner-service/            # Java — merchants, KYB, tiers, CRM
│   ├── eligibility-service/        # Java — brand match + fatigue checks
│   ├── redemption-service/         # Java — activations, cashback, revenue
│   ├── customer-data-service/      # Java — 9 customer profiles + classifications
│   ├── transaction-data-service/   # Java — 90-day transaction history
│   └── bff/                        # Node.js — auth, routing, AI, cache, circuit breaker
│       └── .env.example            # Copy to .env — add AI key to enable AI recs
│
├── apps/
│   ├── customer-app/               # React PWA — 7 pages, 9 personas
│   ├── merchant-portal/            # React — 8 pages
│   └── colleague-portal/           # React — 9 pages
│
├── infrastructure/
│   ├── docker/                     # init-db.sql
│   └── gcp/                        # Cloud Run + Firebase deploy scripts
│
├── docs/context/                   # Architecture documentation
│   ├── CONTEXT.md                  # Master overview
│   ├── ARCHITECTURE.md             # System design
│   ├── API-CONTRACTS.md            # Every endpoint
│   ├── DATA-MODEL.md               # Every table/column
│   ├── FEATURE-REGISTRY.md         # Feature inventory
│   ├── JOURNEY-PLANS.md            # 9 persona demo scripts
│   └── MOBILE-API.md               # Mobile API reference
│
├── docker-compose.yml              # PostgreSQL + Redis + Kafka
├── SETUP.md                        # First-time setup guide
└── START.md                        # Post-reboot quick start
```

## Documentation

See `docs/context/` for comprehensive documentation:
- `CONTEXT.md` — Start here: full project overview and setup
- `ARCHITECTURE.md` — System design and service details
- `API-CONTRACTS.md` — Complete API reference
- `DATA-MODEL.md` — Database schema reference
- `FEATURE-REGISTRY.md` — Every feature with its file inventory
- `JOURNEY-PLANS.md` — 9 persona demo walkthrough scripts
