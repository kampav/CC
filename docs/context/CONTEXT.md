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
│   └── bff/                        # Node.js — API gateway, auth, recommendations (port 3000)
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
docker compose ps   # Should show 3 containers running
```

### Step 2: Start Java Services (each in a separate terminal)
```powershell
cd services\offer-service
.\mvnw spring-boot:run          # Port 8081

cd services\partner-service
.\mvnw spring-boot:run          # Port 8082

cd services\eligibility-service
.\mvnw spring-boot:run          # Port 8083

cd services\redemption-service
.\mvnw spring-boot:run          # Port 8084
```

### Step 3: Start BFF
```powershell
cd services\bff
npm install
npm start                       # Port 3000
```

### Step 4: Start Frontends
```powershell
cd apps\customer-app
npm install && npm run dev      # Port 5173

cd apps\merchant-portal
npm install && npm run dev      # Port 5174

cd apps\colleague-portal
npm install && npm run dev      # Port 5175
```

### Verify Everything
| Service | URL | Expected |
|---------|-----|----------|
| Kafka UI | http://localhost:9080 | Kafka monitoring dashboard |
| Offer Service | http://localhost:8081/api/v1/offers/health | `{"status":"UP"}` |
| Partner Service | http://localhost:8082/api/v1/partners/health | `{"status":"UP"}` |
| BFF | http://localhost:3000/health | `{"status":"UP"}` |
| Customer App | http://localhost:5173 | Welcome page with offers |
| Merchant Portal | http://localhost:5174 | Dashboard with metrics |
| Colleague Portal | http://localhost:5175 | Admin dashboard |

---

## SERVICES STATUS

| Service | Status | Port | Key Features |
|---------|--------|------|-------------|
| PostgreSQL | RUNNING (Docker) | 5432 | 4 schemas: offers, partners, eligibility, redemptions |
| Kafka | RUNNING (Docker) | 9092 | KRaft mode, offer.events topic |
| Kafka UI | RUNNING (Docker) | 9080 | Web-based Kafka monitoring |
| offer-service | **COMPLETE** | 8081 | Offers CRUD, campaigns, audit log, analytics, Kafka events |
| partner-service | **COMPLETE** | 8082 | Partner CRUD, status lifecycle, audit log |
| eligibility-service | **COMPLETE** | 8083 | Brand match + fatigue limit checks |
| redemption-service | **COMPLETE** | 8084 | Activations, transactions, cashback credits, analytics |
| bff | **COMPLETE** | 3000 | Auth, routing, recommendations engine |
| customer-app | **COMPLETE** | 5173 | 6 pages: Home, Browse, Detail, My Offers, Cashback, Transactions |
| merchant-portal | **COMPLETE** | 5174 | 8 pages: Dashboard, Offers, Create, Edit, Detail, Profile, Transactions |
| colleague-portal | **COMPLETE** | 5175 | 7 pages: Dashboard, Offer Review, Merchants, Campaigns, Analytics, Audit, Compliance |

---

## CURRENT PROGRESS

**Status:** MVP COMPLETE
**Progress:** ████████████████████ 100%

All core features are implemented:
- Offer lifecycle management (CRUD + state machine)
- Partner/merchant management
- Customer activation and cashback flow
- Eligibility checking
- Campaign management
- Compliance checking (FCA/ASA rules)
- Audit trail
- Analytics (offer + redemption metrics)
- Personalization (rule-based recommendations, Vertex AI scaffold)
- Three complete portal UIs (customer, merchant, colleague)

**Pending enhancement:** Vertex AI integration for ML-based recommendations (API key needed).

---

## DEMO FLOW

1. **Merchant Portal** (http://localhost:5174): Create an offer → Submit for Review → (wait for colleague approval)
2. **Colleague Portal** (http://localhost:5175): Review offer → Run compliance checks → Approve → Set to LIVE
3. **Customer App** (http://localhost:5173): Browse offers → Check eligibility → Activate offer
4. **Customer App**: Simulate a transaction → Cashback automatically credited
5. **Customer App**: View cashback in "My Cashback" page
6. **Merchant Portal**: Dashboard shows analytics, category performance, insights
7. **Colleague Portal**: Audit log shows all changes, campaigns group offers
8. **Kafka UI** (http://localhost:9080): See offer.events messages

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
| ADR-007 | Auth (MVP) | API-key in BFF, role injection | Simpler than JWT for demo |
| ADR-008 | Recommendations | Rule-based in BFF + Vertex AI scaffold | Works without ML infra |
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
