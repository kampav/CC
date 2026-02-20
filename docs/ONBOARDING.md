# Connected Commerce — Colleague Onboarding

## What Is This?

A microservices platform for a UK bank's cashback rewards programme. It allows customers to activate offers, earn cashback, and receive personalised recommendations.

---

## Architecture

```
Customer App  (5173) ─┐
Merchant Portal (5174) ─┤──► BFF (3000) ──► offer-service      (8081) ──► PostgreSQL: offers schema
Colleague Portal(5175) ─┘         │
                                   ├──► partner-service    (8082) ──► PostgreSQL: partners schema
                                   ├──► eligibility-service(8083) ──► PostgreSQL: (uses offers)
                                   └──► redemption-service  (8084) ──► PostgreSQL: redemptions schema
                                                    │
                                                    └──► Kafka (9092) — async events
```

All services share one PostgreSQL instance (`connected_commerce` database) with separate schemas. BFF is the single entry point for all frontends.

---

## Quickstart

```powershell
# Start everything (no pop-up windows, logs in C:\Projects\CC\logs\)
.\start-platform.ps1

# Wait ~60 seconds, then verify
.\check-health.ps1

# Stop everything
.\stop-platform.ps1
```

**Demo portal:** http://localhost:3000/demo/

---

## API Keys (MVP hardcoded, replace with DB in production)

| Key | Role | Use |
|-----|------|-----|
| `customer-demo-key` | CUSTOMER | Browse offers, activate, view cashback |
| `merchant-demo-key` | MERCHANT | Create/manage offers, view analytics |
| `admin-demo-key` | ADMIN | Full access, colleague portal |

Pass as: `X-API-Key: <key>` header.

---

## Database

- Host: `localhost:5432` (Docker container `cc-postgres`)
- Database: `connected_commerce`
- User/pass: `commerce` / `commerce_dev`
- Schema migrations: Flyway, run automatically on service startup
- All seed INSERT statements use `ON CONFLICT DO NOTHING` — safe to restart

To connect directly:
```bash
docker exec -it cc-postgres psql -U commerce -d connected_commerce
```

---

## Adding a New Service

1. Create a Spring Boot service with:
   - `application.yml` pointing to `connected_commerce` DB, unique schema name
   - Flyway migrations in `src/main/resources/db/migration/`
2. Add its URL to `services/bff/.env` (e.g. `MY_SERVICE_URL=http://localhost:8085`)
3. Add a route file in `services/bff/src/routes/`
4. Mount it in `services/bff/src/index.js`

---

## Adding a New Frontend App

1. `npm create vite@latest my-app -- --template react-ts`
2. Set CORS in BFF `src/index.js` → add `http://localhost:<port>` to `origin` array
3. All API calls go to `http://localhost:3000/api/v1/...` with `X-API-Key` header
4. Add to `start-platform.ps1` `Start-ViteBg` call

---

## Scaling for 25 Million Customers

The customer-facing path is: **BFF → offer-service → redemption-service**

### Stateless design ✓
All services are stateless (no session, no in-process state). Scale horizontally by running multiple instances behind a load balancer.

### Kubernetes (recommended for 25M)
```yaml
# Example: scale BFF and redemption-service
kubectl scale deployment bff --replicas=10
kubectl scale deployment redemption-service --replicas=8
```

### Key scaling considerations

| Concern | Solution |
|---------|----------|
| DB connections | Use PgBouncer connection pooler (each Spring Boot instance pools 10–20 connections; 8 instances × 20 = 160 connections) |
| Offer catalogue reads | Cache in Redis (offers change rarely; TTL 60s eliminates 95%+ DB reads) |
| Recommendations CPU | Rule-based is O(n) in-memory — add BFF replicas; Gemini AI calls are I/O-bound, scale naturally |
| Activation writes | Partition `redemptions.activations` by `customer_id` hash for write throughput |
| Kafka | Use 8+ partitions on event topics; consumer groups auto-distribute load |
| Cold start | Merchant-facing (offer-service, partner-service) can scale down to 1 replica off-peak; customer-facing keeps minimum 3 replicas |

### Environment variables for production
```bash
# Add to each service's deployment env
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_URL=jdbc:postgresql://<RDS_HOST>:5432/connected_commerce
JAVA_OPTS=-Xms512m -Xmx1g -XX:+UseG1GC
```

---

## Personalisation

See [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) for full details on rule-based vs AI modes.

**TL;DR for new apps:** Call `GET /api/v1/recommendations/for-you` with `X-API-Key` header. Optionally add `X-AI-Key: <gemini-key>` to get AI recommendations. The BFF handles everything else.
