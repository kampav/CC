# Connected Commerce — Quick Start (after reboot)

## 1. Start Docker infrastructure

```powershell
cd C:\Projects\CC\extracted\connected-commerce
docker compose up -d
```

Wait ~15s for PostgreSQL, Redis, and Kafka to be healthy:

```powershell
docker compose ps
```

---

## 2. Start all services

```powershell
.\scripts\start.ps1
```

This starts all 10 services in the background (no popup windows):
- 6 Java microservices (ports 8081–8086) — wait ~90s to compile
- BFF Node.js gateway (port 3000)
- 3 React frontends (ports 5173–5175)

Logs are written to the `logs\` folder.

---

## 3. Open the portals

| URL | Portal | Login |
|-----|--------|-------|
| http://localhost:5173 | Customer App | customer@demo.com / demo1234 |
| http://localhost:5173/demo | A/B Demo | (no login needed) |
| http://localhost:5174 | Merchant Portal | merchant@demo.com / demo1234 |
| http://localhost:5175 | Colleague Portal | colleague@demo.com / demo1234 |
| http://localhost:5175 | Exec Dashboard | exec@demo.com / demo1234 |
| http://localhost:9080 | Kafka UI | — |

Nine customer personas available: `customer@` through `customer9@demo.com` (all pw: `demo1234`)

---

## 4. Stop everything

```powershell
.\scripts\stop.ps1
```

---

## Health checks (after ~90s)

```powershell
curl http://localhost:3000/health
curl http://localhost:8081/actuator/health
curl http://localhost:8085/api/v1/customers/health
curl http://localhost:8086/api/v1/banking-transactions/health
```

---

## Troubleshooting

**Java services failing to start**
```powershell
Get-Content logs\offer-service.log -Tail 30
Get-Content logs\customer-data-service.log -Tail 30
```

**"Found failed migration to version 3" (offer-service)**
```powershell
docker exec cc-postgres psql -U commerce -d connected_commerce -c "DELETE FROM offers.flyway_schema_history WHERE version='3' AND success=false;"
```
Then re-run `.\scripts\start.ps1`.

**Missing customers/banking_transactions schemas**
```powershell
docker exec cc-postgres psql -U commerce -d connected_commerce -c "CREATE SCHEMA IF NOT EXISTS customers; CREATE SCHEMA IF NOT EXISTS banking_transactions; GRANT ALL PRIVILEGES ON SCHEMA customers TO commerce; GRANT ALL PRIVILEGES ON SCHEMA banking_transactions TO commerce;"
```

**BFF not starting / auth errors**
```powershell
Get-Content logs\bff-err.log -Tail 20
```
Ensure `services\bff\.env` exists (copy from `.env.example`).

**Port already in use**
```powershell
.\scripts\stop.ps1
.\scripts\start.ps1
```

---

## AI Recommendations

Set one key in `services\bff\.env`:

| Provider | Key prefix | Free tier |
|----------|-----------|-----------|
| Google Gemini | `AIzaSy…` | Yes (gemini-1.5-flash) |
| OpenAI | `sk-…` | No |
| Anthropic Claude | `sk-ant-…` | No |

BFF auto-detects the provider. No restart needed if you pass `X-AI-Key` header instead.

Toggle mode per request: `?mode=ai` or `?mode=rule-based`
Compare both: `GET /api/v1/recommendations/compare` (with auth header)
