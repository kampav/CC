# Connected Commerce -- Colleague Onboarding

> **Version:** v1.2.0

## What Is This?

A microservices platform for a UK bank's cashback rewards programme. It allows customers to activate offers, earn cashback, and receive personalised AI or rule-based recommendations based on their banking profile and transaction history.

---

## Architecture

```
Core Banking (simulated via Kafka seed data)
  banking.customers (3 partitions) ──► customer-data-service (8085) ──► customers schema
  banking.transactions (6 partitions) ► transaction-data-service (8086) ──► banking_transactions schema

Customer App  (5173) ─┐
Merchant Portal (5174) ─┤──► BFF (3000) ──► offer-service      (8081) ──► PostgreSQL: offers
Colleague Portal(5175) ─┘         │
                                   ├──► partner-service    (8082) ──► PostgreSQL: partners
                                   ├──► eligibility-service(8083) ──► stateless
                                   ├──► redemption-service  (8084) ──► PostgreSQL: redemptions
                                   ├──► customer-data-service (8085) ──► PostgreSQL: customers
                                   ├──► transaction-data-service (8086) ──► PostgreSQL: banking_transactions
                                   └──► Redis (6379) -- caching (profile 5min, offers 1min, spending 15min)

Infrastructure: PostgreSQL (5432) + Kafka KRaft (9092) + Redis (6379) + Kafka UI (9080)
```

All services share one PostgreSQL instance (`connected_commerce` database) with separate schemas. BFF is the single entry point for all frontends.

---

## Port Map

| Port | Service |
|------|---------|
| 5173 | Customer App (React) |
| 5174 | Merchant Portal (React) |
| 5175 | Colleague Portal (React) |
| 3000 | BFF (Node/Express) |
| 8081 | offer-service (Spring Boot) |
| 8082 | partner-service (Spring Boot) |
| 8083 | eligibility-service (Spring Boot) |
| 8084 | redemption-service (Spring Boot) |
| 8085 | customer-data-service (Spring Boot) -- NEW v1.2.0 |
| 8086 | transaction-data-service (Spring Boot) -- NEW v1.2.0 |
| 5432 | PostgreSQL (Docker: cc-postgres) |
| 6379 | Redis (Docker: cc-redis) -- NEW v1.2.0 |
| 9080 | Kafka UI |
| 9092 | Kafka |

---

## Quickstart

```powershell
# 1. Start Docker containers (PostgreSQL + Kafka + Redis)
docker compose up -d

# 2. Start all 10 services
.\scripts\start.ps1

# 3. Wait ~90 seconds for Java services to compile and start
# BFF prints OK / FAILED on port 3000

# 4. Open the apps
#    http://localhost:5173  -- Customer App
#    http://localhost:5174  -- Merchant Portal
#    http://localhost:5175  -- Colleague Portal
#    http://localhost:5173/demo  -- A/B Personalization Demo

# Stop everything
.\scripts\stop.ps1
```

Logs are in `C:\Projects\CC\extracted\connected-commerce\logs\` (gitignored).

---

## Authentication

### Login (JWT Bearer)

All portals show a `/login` page. Use these demo accounts (password: `demo1234`):

| Email | Role | Persona Description |
|-------|------|---------------------|
| customer@demo.com | CUSTOMER | Alice -- PREMIER, Travel+Dining, EXPERIENCE_SEEKER |
| customer2@demo.com | CUSTOMER | Ben -- MASS_AFFLUENT, Grocery+Health, BRAND_LOYAL |
| customer3@demo.com | CUSTOMER | Cara -- MASS_MARKET, Student, DEAL_SEEKER, NEW |
| customer4@demo.com | CUSTOMER | Dan -- PREMIER, Electronics, BRAND_LOYAL |
| customer5@demo.com | CUSTOMER | Emma -- MASS_AFFLUENT, Fashion, CONVENIENCE_SHOPPER |
| customer6@demo.com | CUSTOMER | Frank -- MASS_MARKET, Grocery, DEAL_SEEKER, AT_RISK |
| customer7@demo.com | CUSTOMER | Grace -- PREMIER, Travel+Wellness, EXPERIENCE_SEEKER |
| customer8@demo.com | CUSTOMER | Harry -- MASS_AFFLUENT, Electronics+Gaming, BRAND_LOYAL |
| customer9@demo.com | CUSTOMER | Isla -- MASS_MARKET, Convenience, NEW |
| merchant@demo.com | MERCHANT | Merchant portal access |
| colleague@demo.com | COLLEAGUE | Colleague portal access |
| exec@demo.com | EXEC | Executive dashboard access |

The Customer App login page has a persona selector dropdown -- choose a persona to pre-fill the email.

### Legacy API Keys (backward compat)

| Key | Role |
|-----|------|
| `customer-demo-key` | CUSTOMER |
| `merchant-demo-key` | MERCHANT |
| `admin-demo-key` | ADMIN |

Pass as: `X-API-Key: <key>` header.

---

## Database

- Host: `localhost:5432` (Docker container `cc-postgres`)
- Database: `connected_commerce`
- User/pass: `commerce` / `commerce_dev`
- Schemas: offers, partners, redemptions, eligibility, identity, customers, banking_transactions
- All seed INSERT statements use `ON CONFLICT DO NOTHING` -- safe to restart

```bash
docker exec -it cc-postgres psql -U commerce -d connected_commerce
```

---

## Kafka Topics

| Topic | Partitions | Description |
|-------|-----------|-------------|
| offer.events | 1 | Offer status change events |
| banking.customers | 3 | Customer profile update events |
| banking.transactions | 6 | Transaction events (6 partitions for 25M scale) |

---

## Adding a New Service

1. Create a Spring Boot service with:
   - `application.yml` pointing to `connected_commerce` DB, unique schema name
   - Flyway migrations in `src/main/resources/db/migration/`
   - HikariCP: `maximum-pool-size: 20`, `minimum-idle: 5`
2. Add its URL to `services/bff/.env` (e.g. `MY_SERVICE_URL=http://localhost:8087`)
3. Add a route file in `services/bff/src/routes/`
4. Mount it in `services/bff/src/index.js`
5. Add to `scripts/start.ps1` `Start-JavaService` call
6. Add a CI job in `.github/workflows/ci.yml`

---

## Adding a New Frontend App

1. `npm create vite@latest my-app -- --template react-ts`
2. Set CORS in BFF `src/index.js` → add `http://localhost:<port>` to `origin` array
3. All API calls go to `http://localhost:3000/api/v1/...` with `Authorization: Bearer <token>` header
4. Add to `scripts/start.ps1` `Start-ViteBg` call

---

## Personalisation

See [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) and [docs/context/JOURNEY-PLANS.md](./context/JOURNEY-PLANS.md) for full details.

**TL;DR:** Call `GET /api/v1/recommendations/for-you?mode=rule-based` with Bearer token.
- Add `?mode=ai` to switch to AI mode (requires API key in `.env`)
- Use `GET /api/v1/recommendations/compare` for side-by-side A/B comparison
- Visit `http://localhost:5173/demo` for visual A/B demo

---

## Scaling for 25 Million Customers

| Pattern | Implementation |
|---------|---------------|
| Keyset pagination | transaction-data-service: `?after=<ISO8601>` cursor, no OFFSET |
| Kafka partitioning | banking.transactions: 6 partitions, customer_id partition key |
| Redis caching | BFF: profiles 5min, offers 1min, spending 15min |
| HikariCP pool | All Java services: max 20, min-idle 5 |
| Composite indexes | (customer_id, transaction_date DESC) on transactions |
| Circuit breaker | BFF: 5 failures → OPEN, half-open 30s |
| Cloud Run | GCP: min=1, max=100 replicas per service |
| Stateless design | All services: no session, scale horizontally |

### Environment variables for production
```bash
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_URL=jdbc:postgresql://<CLOUD_SQL_HOST>:5432/connected_commerce
JAVA_OPTS=-Xms512m -Xmx1g -XX:+UseG1GC
```

---

## GCP Deployment (Scaffold Ready)

Infrastructure manifests are in `infrastructure/gcp/`:
- `cloud-run/` -- Cloud Run YAML per service
- `pubsub/topics.yaml` -- Pub/Sub (replaces Kafka on GCP)
- `cloud-sql/README.md` -- Cloud SQL connection setup
- `firebase/firebase.json` -- Firebase Hosting for 3 React apps

See `docs/context/ARCHITECTURE.md` for the full GCP deployment diagram.
