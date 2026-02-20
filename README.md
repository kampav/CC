# Connected Commerce Platform

> Bridging Retail & Commercial Banking through Merchant Offers, Cashback & Loyalty

## Overview

A two-sided marketplace connecting Lloyds Banking Group retail customers with commercial banking clients (merchants) through personalised offers, cashback rewards, and loyalty experiences.

**Three portals:**
- **Customer App** — Browse offers, activate cashback, track earnings
- **Merchant Portal** — Create offers, view analytics, manage performance
- **Colleague Portal** — Review compliance, manage campaigns, approve merchants

## Quick Start

```powershell
# 1. Start infrastructure (Postgres, Kafka, Kafka UI)
cd C:\Projects\CC\extracted\connected-commerce
docker compose up -d
# Wait 15 seconds for services to initialise

# 2. Start backend services (each in a separate terminal)
cd services\offer-service && .\mvnw spring-boot:run       # Port 8081
cd services\partner-service && .\mvnw spring-boot:run      # Port 8082
cd services\eligibility-service && .\mvnw spring-boot:run   # Port 8083
cd services\redemption-service && .\mvnw spring-boot:run    # Port 8084

# 3. Start BFF gateway
cd services\bff && npm install && npm start                # Port 3000

# 4. Start frontend apps
cd apps\customer-app && npm install && npm run dev         # Port 5173
cd apps\merchant-portal && npm install && npm run dev      # Port 5174
cd apps\colleague-portal && npm install && npm run dev     # Port 5175
```

## Demo Flow

1. **Merchant Portal** (http://localhost:5174) — Create an offer, submit for review
2. **Colleague Portal** (http://localhost:5175) — Run compliance checks, approve offer, set to LIVE
3. **Customer App** (http://localhost:5173) — Browse offers, check eligibility, activate
4. **Customer App** — Simulate a transaction, see cashback credited
5. **Merchant Portal** — View analytics dashboard with category performance and insights
6. **Kafka UI** (http://localhost:9080) — See offer lifecycle events

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CHANNELS                             │
│  Customer App    │  Merchant Portal   │  Colleague Portal    │
│  React (:5173)   │  React (:5174)     │  React (:5175)       │
└───────┬──────────┴────────┬───────────┴────────┬────────────┘
        │                   │                    │
┌───────▼───────────────────▼────────────────────▼────────────┐
│              BFF Gateway (Node.js/Express :3000)             │
│      API-Key Auth │ Role Guards │ Correlation IDs            │
│      Route Proxying │ Recommendation Engine                  │
└───────┬───────────────────┬────────────────────┬────────────┘
        │                   │                    │
┌───────▼───────────────────▼────────────────────▼────────────┐
│              Backend Microservices (Spring Boot 3)            │
│  ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │   Offer    │ │  Partner    │ │ Eligibility │ │Redemp-  ││
│  │  Service   │ │  Service    │ │  Service    │ │ tion    ││
│  │  (:8081)   │ │  (:8082)    │ │  (:8083)    │ │ Service ││
│  │            │ │             │ │             │ │ (:8084) ││
│  │ Offers     │ │ Merchants   │ │ Brand match │ │Activate ││
│  │ Campaigns  │ │ Onboarding  │ │ Fatigue     │ │Transact ││
│  │ Audit logs │ │ Audit logs  │ │ checks      │ │Cashback ││
│  └─────┬──────┘ └──────┬──────┘ └─────────────┘ └────┬────┘│
└────────┼───────────────┼──────────────────────────────┼─────┘
         │               │                              │
┌────────▼───────────────▼──────────────────────────────▼─────┐
│  PostgreSQL 16 (:5432)         │  Apache Kafka (:9092)       │
│  ┌────────┐ ┌────────┐        │  offer.events topic          │
│  │offers  │ │partners│        │  KRaft mode (no Zookeeper)   │
│  │schema  │ │schema  │        │                              │
│  └────────┘ └────────┘        │  Kafka UI (:9080)            │
│  ┌──────────┐                 │                              │
│  │redemp-   │                 │                              │
│  │tions     │                 │                              │
│  └──────────┘                 │                              │
└───────────────────────────────┴──────────────────────────────┘
```

## Services

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| offer-service | 8081 | Complete | Offer CRUD, campaigns, audit log, analytics, Kafka events |
| partner-service | 8082 | Complete | Merchant registration, approval lifecycle |
| eligibility-service | 8083 | Complete | Brand match + fatigue limit checks |
| redemption-service | 8084 | Complete | Activations, transactions, cashback credits |
| bff | 3000 | Complete | Auth, routing, recommendation engine |
| customer-app | 5173 | Complete | 6 pages: Home, Browse, Detail, My Offers, Cashback, Transactions |
| merchant-portal | 5174 | Complete | 8 pages: Dashboard, Offers, Create, Edit, Detail, Profile, Transactions |
| colleague-portal | 5175 | Complete | 7 pages: Dashboard, Offer Review, Merchants, Campaigns, Analytics, Audit, Compliance |
| PostgreSQL | 5432 | Docker | 4 schemas: offers, partners, eligibility, redemptions |
| Kafka | 9092 | Docker | KRaft mode event streaming |
| Kafka UI | 9080 | Docker | Web-based Kafka monitoring |

## Project Structure

```
connected-commerce/
├── docker-compose.yml              # Infrastructure: Postgres + Kafka + Kafka UI
├── infrastructure/docker/
│   └── init-db.sql                 # Creates database schemas
│
├── services/
│   ├── offer-service/              # Java — 29 source files
│   │   └── src/main/java/com/lbg/commerce/offer/
│   │       ├── controller/         # OfferController, CampaignController, AuditController, OfferAnalyticsController
│   │       ├── model/              # Offer, Campaign, OfferStatus, DTOs
│   │       ├── repository/         # OfferRepository, CampaignRepository, AuditLogRepository
│   │       ├── service/            # OfferService, CampaignService, OfferEventPublisher
│   │       └── config/             # CorrelationIdFilter, GlobalExceptionHandler
│   │
│   ├── partner-service/            # Java — 15 source files
│   │   └── src/main/java/com/lbg/commerce/partner/
│   │       ├── controller/         # PartnerController
│   │       ├── model/              # Partner, PartnerStatus, DTOs
│   │       ├── repository/         # PartnerRepository
│   │       ├── service/            # PartnerService
│   │       └── config/             # CorrelationIdFilter, GlobalExceptionHandler
│   │
│   ├── eligibility-service/        # Java — 7 source files
│   │   └── src/main/java/com/lbg/commerce/eligibility/
│   │       ├── controller/         # EligibilityController
│   │       ├── model/              # EligibilityRequest, EligibilityResponse
│   │       ├── service/            # EligibilityService
│   │       └── config/             # CorrelationIdFilter, GlobalExceptionHandler
│   │
│   ├── redemption-service/         # Java — 24 source files
│   │   └── src/main/java/com/lbg/commerce/redemption/
│   │       ├── controller/         # ActivationController, TransactionController, RedemptionAnalyticsController
│   │       ├── model/              # Activation, Transaction, CashbackCredit, DTOs
│   │       ├── repository/         # ActivationRepository, TransactionRepository, CashbackCreditRepository
│   │       ├── service/            # ActivationService, TransactionService
│   │       └── config/             # CorrelationIdFilter, GlobalExceptionHandler
│   │
│   └── bff/                        # Node.js — 11 source files
│       └── src/
│           ├── index.js            # Express server, middleware, route mounting
│           ├── middleware/auth.js   # API-key validation, role injection
│           └── routes/             # offers, partners, activations, transactions,
│                                   # eligibility, analytics, campaigns, audit, recommendations
│
├── apps/
│   ├── customer-app/               # React — 10 source files
│   │   └── src/
│   │       ├── App.tsx             # Router (6 routes)
│   │       ├── api/client.ts       # API client (10 methods)
│   │       ├── components/Layout.tsx
│   │       ├── types/index.ts
│   │       └── pages/              # Home, OfferFeed, OfferDetail, MyOffers, MyCashback, TransactionHistory
│   │
│   ├── merchant-portal/            # React — 11 source files
│   │   └── src/
│   │       ├── App.tsx             # Router (8 routes)
│   │       ├── api/client.ts       # API client (12 methods)
│   │       ├── components/Layout.tsx
│   │       ├── types/index.ts
│   │       └── pages/              # Dashboard, OfferList, CreateOffer, EditOffer, OfferDetail,
│   │                               # PartnerProfile, TransactionHistory
│   │
│   └── colleague-portal/           # React — 10 source files
│       └── src/
│           ├── App.tsx             # Router (7 routes)
│           ├── api/client.ts       # API client (15+ methods)
│           ├── components/Layout.tsx
│           └── pages/              # Dashboard, OfferReview, MerchantOnboarding, CampaignManagement,
│                                   # Analytics, AuditLog, Compliance
│
└── docs/context/                   # Architecture documentation
    ├── CONTEXT.md                  # Master overview, setup guide
    ├── ARCHITECTURE.md             # System diagram, service details
    ├── API-CONTRACTS.md            # Every API endpoint documented
    ├── DATA-MODEL.md               # Every database table/column
    ├── FEATURE-REGISTRY.md         # Every feature with all its files
    ├── DECISIONS.md                # Architecture Decision Records
    ├── STEP-LOG.md                 # Build diary
    ├── ERROR-PLAYBOOK.md           # Common errors and fixes
    └── SESSION-PROMPTS.md          # AI session starters
```

## Authentication (MVP)

| API Key | Role | Access |
|---------|------|--------|
| `customer-demo-key` | CUSTOMER | Browse offers, activate, view own transactions/cashback |
| `merchant-demo-key` | MERCHANT | Manage offers, view analytics, manage profile |
| `admin-demo-key` | ADMIN | Full access — campaigns, audit, compliance, merchant approval |

## Key Features

- **Offer Lifecycle**: DRAFT → PENDING_REVIEW → APPROVED → LIVE → PAUSED/EXPIRED/RETIRED
- **Campaign Management**: Group offers with targeting, scheduling, budgets
- **Compliance Checking**: FCA Fair Value, ASA Misleading Claims, prohibited categories
- **Eligibility Engine**: Brand-match + activation fatigue limit
- **Cashback Processing**: Activate → Purchase → Auto-credit cashback
- **Personalization**: Rule-based recommendation engine (Vertex AI scaffold ready)
- **Audit Trail**: Full history of all offer/partner status changes
- **Analytics**: Offer metrics, redemption stats, category performance, insights

## Tech Stack

- **Backend:** Java 17 / Spring Boot 3.2.3 / JPA / Flyway
- **BFF:** Node.js 20 / Express 4
- **Frontend:** React 18 / TypeScript 5 / Vite 5
- **Database:** PostgreSQL 16 (schema-per-service)
- **Events:** Apache Kafka (KRaft mode)
- **Containers:** Docker / Docker Compose

## Documentation

See `docs/context/` for comprehensive documentation:
- `CONTEXT.md` — Start here: full project overview and setup
- `ARCHITECTURE.md` — System design and service details
- `API-CONTRACTS.md` — Complete API reference
- `DATA-MODEL.md` — Database schema reference
- `FEATURE-REGISTRY.md` — Every feature with its file inventory
