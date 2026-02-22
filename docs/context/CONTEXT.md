# Connected Commerce Platform - Master Context File

> **IMPORTANT FOR AI:** Read this ENTIRE file before writing ANY code. This file is the single source of truth.

---

## WHO IS BUILDING THIS?

**Name:** Pav
**Role:** Head of Engineering at Lloyds Banking Group
**Operating System:** Windows 11
**Terminal:** PowerShell, Windows Command Prompt, or Git Bash
**Code Editor:** VS Code

---

## WHAT IS THIS PROJECT?

**In plain English:** An app where shops (merchants) can post special offers (like "10% cashback at Tesco"), and bank customers see those offers in their banking app. When a customer shops at that store, they automatically get money back.

**Technical name:** Connected Commerce Platform — a two-sided marketplace connecting LBG retail customers with commercial banking clients (merchants) through personalised offers, cashback rewards, and loyalty experiences.

**Who uses it:**
- **Customers** (bank app users) — browse offers, activate cashback, earn rewards
- **Merchants** (shops/businesses) — create offers, track performance, manage budgets
- **Bank colleagues** (internal staff) — approve offers, manage compliance, run campaigns, view analytics

---

## PROJECT STRUCTURE

```
connected-commerce/
├── docker-compose.yml              # Starts PostgreSQL, Kafka, Kafka UI
├── infrastructure/docker/
│   └── init-db.sql                 # Creates database schemas on first run
│
├── services/
│   ├── offer-service/              # Java — offers, campaigns, audit (port 8081)
│   ├── partner-service/            # Java — merchant registration (port 8082)
│   ├── eligibility-service/        # Java — eligibility checks (port 8083)
│   ├── redemption-service/         # Java — activations, transactions, cashback (port 8084)
│   ├── customer-data-service/      # Java — bank profiles, classifications (port 8085) NEW v1.2
│   ├── transaction-data-service/   # Java — MCC transactions, spending summaries (port 8086) NEW v1.2
│   └── bff/                        # Node.js — API gateway, auth, A/B recommendations, mobile API (port 3000)
│
├── apps/
│   ├── customer-app/               # React — customer-facing UI (port 5173)
│   ├── merchant-portal/            # React — merchant dashboard UI (port 5174)
│   └── colleague-portal/           # React — internal admin UI (port 5175)
│
└── docs/context/                   # Architecture docs (this folder)
```

---

## TECHNOLOGY STACK

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Backend services language |
| Spring Boot | 3.2.3 | Java web framework |
| Maven | 3.9+ | Java build tool (via `mvnw` wrapper) |
| PostgreSQL | 16 | Database |
| Apache Kafka | 7.6.0 (KRaft) | Event messaging |
| Flyway | (bundled) | Database migrations |
| Node.js | 20+ | BFF runtime |
| Express | 4.x | BFF web framework |
| React | 18 | Frontend UI library |
| TypeScript | 5.x | Frontend type safety |
| Vite | 5.x | Frontend build tool |
| Docker | Latest | Container runtime |

---

## HOW TO START THE PROJECT

### Step 1: Start Infrastructure
```powershell
cd C:\Projects\CC\extracted\connected-commerce
docker compose up -d
# Wait 15 seconds, then verify:
docker compose ps   # Should show cc-postgres, cc-redis, cc-kafka running
```

### Step 2: Start all services (single command)
```powershell
.\scripts\start.ps1
# Java services take ~90s to compile. BFF prints OK/FAILED on port 3000.
```

Or use stop/start cycle:
```powershell
.\scripts\stop.ps1 ; .\scripts\start.ps1
```

### Verify Everything
| Service | URL | Expected |
|---------|-----|----------|
| Kafka UI | http://localhost:9080 | Kafka monitoring dashboard |
| Offer Service | http://localhost:8081/api/v1/offers/health | `{"status":"UP"}` |
| Partner Service | http://localhost:8082/api/v1/partners/health | `{"status":"UP"}` |
| BFF | http://localhost:3000/health | `{"status":"UP"}` |
| Customer App | http://localhost:5173 | Redirects to /login → customer@demo.com / demo1234 |
| Merchant Portal | http://localhost:5174 | Redirects to /login → merchant@demo.com / demo1234 |
| Colleague Portal | http://localhost:5175 | Redirects to /login → colleague@demo.com / demo1234 |
| Exec Dashboard | http://localhost:5175/exec-dashboard | Login as exec@demo.com / demo1234 |

---

## SERVICES STATUS

| Service | Status | Port | Key Features |
|---------|--------|------|-------------|
| PostgreSQL | RUNNING (Docker) | 5432 | 7 schemas: offers, partners, eligibility, redemptions, identity, customers, banking_transactions |
| Redis | RUNNING (Docker) | 6379 | BFF caching — profile 5min, offers 1min, spending 15min |
| Kafka | RUNNING (Docker) | 9092 | KRaft mode, 3 topics: commerce.offers, banking.customers, banking.transactions |
| Kafka UI | RUNNING (Docker) | 9080 | Web-based Kafka monitoring |
| offer-service | **COMPLETE** | 8081 | Offers CRUD, campaigns, audit log, analytics, Kafka events, commission_rate |
| partner-service | **COMPLETE** | 8082 | Partner CRUD, tier model, commercial_customers KYB + CRM enrichment (V4) |
| eligibility-service | **COMPLETE** | 8083 | Brand match + fatigue limit checks |
| redemption-service | **COMPLETE** | 8084 | Activations, transactions, cashback, revenue_ledger |
| **customer-data-service** | **COMPLETE v1.2** | 8085 | Bank-style profiles, lifecycle/segment/spend_pattern, classifications, Kafka consumer |
| **transaction-data-service** | **COMPLETE v1.2** | 8086 | MCC-enriched transactions, keyset pagination, spending summaries, Kafka consumer |
| bff | **COMPLETE v1.2** | 3000 | JWT auth, A/B recommendations (rule-based v2 + AI), Redis cache, circuit breaker, mobile API |
| customer-app | **COMPLETE v1.2** | 5173 | 9 personas, A/B toggle, /demo page, segment-aware home, mode badges |
| merchant-portal | **COMPLETE** | 5174 | Login + 8 pages: Dashboard, Offers, Create, Edit, Detail, Profile, Transactions, AI Suggestions |
| colleague-portal | **COMPLETE** | 5175 | Login + 10 pages: Dashboard, Exec Dashboard, Offer Review, Merchant/Commercial Onboarding, Campaigns, Customer Insights, Analytics, Audit, Compliance |

---

## CURRENT PROGRESS

**Version:** v1.3.0 — **Status:** COMPLETE — deployed live on GCP

**v1.1.0 features:**
- Offer lifecycle, campaigns, compliance, audit
- Partner/merchant management with tier model (BRONZE→PLATINUM)
- Customer cashback flow with bank revenue ledger
- JWT auth (email/password login, all 3 portals)
- AI recommendations: personalized feed, merchant next-offer, customer insights
- Exec dashboard: KPIs, category ROI, merchant tier breakdown, AI narrative
- Commercial customer KYB onboarding workflow
- Rule-based fallback when no AI key set

**v1.2.0 additions:**
- 2 new Java microservices (customer-data-service 8085, transaction-data-service 8086)
- Bank-style customer profiles: segment, lifecycle, spend_pattern, income_band, classifications
- 90-day MCC-enriched transaction history, keyset pagination, spending summaries
- Kafka topics: banking.customers (3 partitions), banking.transactions (6 partitions)
- Redis caching in BFF (ioredis): profile 5min, offers 1min, spending 15min
- BFF circuit breaker (5 failures → OPEN) and rate limiting
- A/B personalization: rule-based v2 scoring (segment/lifecycle/spend-pattern) vs AI
- `/api/v1/recommendations/compare` endpoint — both modes side-by-side
- 9 distinct customer demo personas (customer@…customer9@demo.com, all pw: demo1234)
- Customer App: A/B toggle, /demo page, segment-aware hero, mode badges on cards
- Mobile API layer: slim endpoints, push notification scaffold
- GCP infrastructure manifests: Cloud Run, Cloud SQL, Pub/Sub, Firebase
- partner-service V4: CRM-grade commercial customer fields

**v1.3.0 additions:**
- GCP deployment LIVE: Cloud Run (7 services) + Cloud SQL + Firebase Hosting (3 apps)
  - https://cc-customer-0315.web.app
  - https://cc-merchant-0315.web.app
  - https://cc-colleague-0315.web.app
- Progressive Web App (PWA): installable from browser, service worker cache-first
- Full responsive UI: mobile (<768px) / tablet (768-1023px) / desktop (>=1024px)
  - `useBreakpoint` hook in all 3 apps
  - Customer App: mobile hamburger + slide-down nav
  - Merchant/Colleague portals: icon-only sidebar (tablet) + overlay drawer (mobile)
  - All 30+ pages: responsive grids, stackable two-panel layouts, scrollable tables
- HikariCP `minimum-idle: 0` on all Java services (Cloud Run scale-to-zero safe)
- BFF->Java OIDC token auth on Cloud Run via `gcpAuth.js`
- Docker multi-stage builds for all 7 services
- GitHub Actions CI (BFF + Java + 3 frontend builds)

---

## DEMO FLOW

**Quick start:**
1. Login at each portal (`/login`) — all pw: `demo1234`
2. **Merchant** (5174): Create offer → Submit for Review → AI Suggestions tab
3. **Colleague** (5175): Review/approve offer → Commercial Onboarding → Customer Insights
4. **Customer** (5173): Browse → Activate → Simulate transaction → View cashback
5. **Exec Dashboard** (5175/exec-dashboard, login as exec@demo.com): KPIs + AI narrative

**v1.2.0 A/B Demo:**
6. Customer App (5173): Use persona selector on login → choose Frank (AT_RISK) → observe high-cashback retention offers
7. Toggle [Rule-Based | AI] in header → compare offer rankings and reasoning
8. Navigate to `/demo` → side-by-side comparison of both modes
9. Switch persona to Alice (PREMIER) → observe travel/dining dominance vs Frank

**Verify new services (after ~90s):**
```powershell
curl http://localhost:8085/api/v1/customers/health
curl http://localhost:8086/api/v1/banking-transactions/health
```

See `docs/context/JOURNEY-PLANS.md` for all 9 persona journey scripts.
6. **Kafka UI** (9080): See offer.events messages

---

## KEY DECISIONS

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| ADR-001 | Project structure | Monorepo | Easier for AI context, atomic commits |
| ADR-002 | Kafka mode | KRaft (no Zookeeper) | Simpler, fewer containers |
| ADR-003 | Database | Single Postgres, schemas per service | Simple local setup |
| ADR-004 | Frontend build | Vite | Faster than CRA, modern standard |
| ADR-005 | API docs | SpringDoc (auto-generated) | Always in sync |
| ADR-006 | State machine | In-code enum with transition map | Self-documenting |
| ADR-007 | Auth (v1.1) | JWT Bearer in BFF + pg identity schema | Real login, backward-compat X-API-Key kept |
| ADR-008 | Recommendations | Rule-based + Gemini/OpenAI/Claude AI | Auto-detects key prefix, graceful fallback |
| ADR-011 | Revenue model | Tier commission in revenue_ledger | Bank earns % of cashback per transaction |
| ADR-012 | Identity storage | BFF-managed identity schema via pg | Avoids adding auth to Java services |
| ADR-009 | Compliance | Client-side checks in colleague portal | Fast iteration, no backend needed |
| ADR-010 | Analytics | Direct SQL queries via JPA | No Kafka consumer pipeline needed for MVP |

---

## CONTEXT FILES INDEX

| File | Purpose |
|------|---------|
| `CONTEXT.md` | This file — master overview, setup guide, status |
| `ARCHITECTURE.md` | System diagram, service details, communication patterns |
| `API-CONTRACTS.md` | Every API endpoint with request/response examples |
| `DATA-MODEL.md` | Every database table and column |
| `FEATURE-REGISTRY.md` | Every feature with all its files listed |
| `DECISIONS.md` | Architecture Decision Records |
| `STEP-LOG.md` | Build diary — what was built and when |
| `ERROR-PLAYBOOK.md` | Common errors and how to fix them |
| `SESSION-PROMPTS.md` | AI session starter prompts |
