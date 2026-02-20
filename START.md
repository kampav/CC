# Connected Commerce — Startup Guide (after reboot)

## 1. Start Docker infrastructure

```bash
cd C:/Projects/CC/extracted/connected-commerce
docker compose up -d
```

Wait ~15s for PostgreSQL and Kafka to be healthy:

```bash
docker compose ps
```

## 2. Fix Flyway if V3 migration failed

If offer-service fails to start with `"Found failed migration to version 3"`, run this repair:

```bash
docker exec cc-postgres psql -U commerce -d connected_commerce \
  -c "DELETE FROM offers.flyway_schema_history WHERE version='3' AND success=false;"
```

Then restart offer-service — it will re-run the fixed V3 (constraint drop now happens first).

## 3. Start Java services (open 4 terminals)

```bash
# Terminal 1
cd services/offer-service && ./mvnw spring-boot:run

# Terminal 2
cd services/partner-service && ./mvnw spring-boot:run

# Terminal 3
cd services/redemption-service && ./mvnw spring-boot:run

# Terminal 4
cd services/eligibility-service && ./mvnw spring-boot:run
```

## 4. Start BFF

```bash
cd services/bff
cp .env.example .env
# Edit .env and add GEMINI_API_KEY if you have one
npm install
npm run dev
```

## 5. Start frontend apps (3 terminals)

```bash
# Customer App (http://localhost:5173)
cd apps/customer-app && npm install && npm run dev

# Merchant Portal (http://localhost:5174)
cd apps/merchant-portal && npm install && npm run dev

# Colleague Portal (http://localhost:5175)
cd apps/colleague-portal && npm install && npm run dev
```

## 6. Demo API keys

| Key | Role | Use |
|-----|------|-----|
| `customer-demo-key` | CUSTOMER | Customer app |
| `merchant-demo-key` | MERCHANT | Merchant portal |
| `admin-demo-key` | ADMIN | Colleague portal |

## 7. Gemini personalisation

Set `GEMINI_API_KEY` in `services/bff/.env` to enable AI-powered recommendations.
Get a free key at https://aistudio.google.com/app/apikey

Test it:
```bash
curl http://localhost:3000/api/v1/recommendations/for-you \
  -H "X-API-Key: customer-demo-key"
```

The response will include `"source": "gemini-ai"` when Gemini is active, or `"source": "rule-based"` as fallback.

New endpoint: `GET /api/v1/recommendations/explain/:offerId` — Gemini explains why an offer suits the customer.
