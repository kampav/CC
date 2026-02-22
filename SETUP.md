# Connected Commerce — Setup Guide

## Prerequisites

Install these **once** before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Git | Any | https://git-scm.com/download/win |
| Docker Desktop | 4+ | https://www.docker.com/products/docker-desktop |
| Java 17 (Temurin) | 17 | https://adoptium.net — tick **"Set JAVA_HOME"** |
| Node.js | 20 LTS | https://nodejs.org |

> After installing Docker Desktop, start it and wait until the whale icon in the system tray stops animating.

Run `check-setup.cmd` to verify everything is installed.

---

## First-Time Setup

### 1. Clone the repo

```powershell
git clone https://github.com/kampav/CC.git
cd CC
```

### 2. Start infrastructure (PostgreSQL + Redis + Kafka)

```powershell
docker compose up -d
```

Wait ~15 seconds. Verify:

```powershell
docker ps   # should show cc-postgres, cc-redis, cc-kafka running
```

### 3. Create new database schemas (first run only)

```powershell
docker exec cc-postgres psql -U commerce -d connected_commerce -c "CREATE SCHEMA IF NOT EXISTS customers; CREATE SCHEMA IF NOT EXISTS banking_transactions; GRANT ALL PRIVILEGES ON SCHEMA customers TO commerce; GRANT ALL PRIVILEGES ON SCHEMA banking_transactions TO commerce;"
```

### 4. Install Node dependencies

```powershell
cd services\bff              && npm install && cd ..\..
cd apps\customer-app         && npm install && cd ..\..
cd apps\merchant-portal      && npm install && cd ..\..
cd apps\colleague-portal     && npm install && cd ..\..
```

### 5. Configure the BFF

```powershell
copy services\bff\.env.example services\bff\.env
```

Open `services\bff\.env` — defaults work for local use. To enable AI recommendations, add **one** API key (see [AI Keys](#ai-recommendations-optional) below).

### 6. Start everything

```powershell
.\scripts\start.ps1
```

Wait **~90 seconds** for the 6 Java services to compile and start, then open:

| URL | What | Login |
|-----|------|-------|
| http://localhost:5173 | Customer App | customer@demo.com / demo1234 |
| http://localhost:5173/demo | A/B Personalisation Demo | (no login) |
| http://localhost:5174 | Merchant Portal | merchant@demo.com / demo1234 |
| http://localhost:5175 | Colleague Portal | colleague@demo.com / demo1234 |
| http://localhost:3000/health | BFF health check | — |
| http://localhost:9080 | Kafka UI | — |

### 7. Stop everything

```powershell
.\scripts\stop.ps1
```

---

## Demo Walkthrough

1. **Merchant Portal** → login as `merchant@demo.com` → create an offer → submit for review
2. **Colleague Portal** → login as `colleague@demo.com` → approve the offer → set to LIVE
3. **Customer App** → login as any persona (e.g. `customer@demo.com`) → browse offers → activate → simulate purchase
4. **Customer App** → Cashback tab → see cashback credited
5. **Customer App** → `/demo` → toggle A/B: rule-based vs AI personalisation side by side
6. **Colleague Portal** → login as `exec@demo.com` → Executive Dashboard → KPIs + AI narrative

---

## Customer Personas

Nine demo customers, all password `demo1234`:

| Email | Name | Segment | Pattern |
|-------|------|---------|---------|
| customer@demo.com | Alice | PREMIER | Experience Seeker |
| customer2@demo.com | Ben | MASS_AFFLUENT | Brand Loyal |
| customer3@demo.com | Cara | MASS_MARKET | Deal Seeker |
| customer4@demo.com | Dan | PREMIER | Brand Loyal |
| customer5@demo.com | Emma | MASS_AFFLUENT | Convenience Shopper |
| customer6@demo.com | Frank | MASS_MARKET | Deal Seeker |
| customer7@demo.com | Grace | PREMIER | Experience Seeker |
| customer8@demo.com | Harry | MASS_AFFLUENT | Brand Loyal |
| customer9@demo.com | Isla | MASS_MARKET | Convenience Shopper |

---

## AI Recommendations (optional)

The platform works without an AI key — it uses rule-based scoring.
To enable AI, paste **one** key into `services\bff\.env`:

| Provider | Key prefix | Model used |
|----------|-----------|------------|
| Google Gemini | `AIzaSy…` | gemini-1.5-flash |
| OpenAI | `sk-…` | gpt-4o-mini |
| Anthropic Claude | `sk-ant-…` | claude-haiku-4-5-20251001 |

The BFF auto-detects the provider from the key prefix. After editing `.env`, restart:
```powershell
.\scripts\stop.ps1 ; .\scripts\start.ps1
```

Or pass the key live via header without restarting:
```bash
curl http://localhost:3000/api/v1/recommendations/for-you \
  -H "Authorization: Bearer <jwt-token>" \
  -H "X-AI-Key: your-key-here"
```

---

## Troubleshooting

**Java services won't start**
- Ensure Java 17 is installed and `JAVA_HOME` is set:
  `echo $env:JAVA_HOME` → should print a path ending in `jdk-17...`
- Check logs: `Get-Content logs\offer-service.log -Tail 30`

**"Cannot connect to Docker daemon"**
- Open Docker Desktop and wait for the whale icon to be still

**Port already in use**
- `.\scripts\stop.ps1` then re-run `.\scripts\start.ps1`

**No data showing in the UI**
- Java services take ~90s to start — check `logs\` folder
- BFF may have started before Java was ready — wait 10s and refresh

**"Found failed migration to version 3"**
- Run: `docker exec cc-postgres psql -U commerce -d connected_commerce -c "DELETE FROM offers.flyway_schema_history WHERE version='3' AND success=false;"`
- Then restart offer-service

**AI falls back to rule-based**
- Check `logs\bff-err.log` for the exact API error
- Gemini free tier: 15 req/min — wait a moment and retry
- Use `gemini-1.5-flash` not `gemini-2.0-flash` (free tier limit=0 on 2.0)

**Customer or transaction data not loading**
- The customers/banking_transactions schemas may not exist yet — run step 3 above
- Check: `Get-Content logs\customer-data-service.log -Tail 20`

---

## Project Structure

```
CC/
├── scripts/              ← start.ps1 · stop.ps1
├── services/
│   ├── offer-service/    ← Java Spring Boot  :8081
│   ├── partner-service/  ← Java Spring Boot  :8082
│   ├── eligibility-service/ ← Java Spring Boot :8083
│   ├── redemption-service/  ← Java Spring Boot :8084
│   ├── customer-data-service/ ← Java Spring Boot :8085
│   ├── transaction-data-service/ ← Java Spring Boot :8086
│   └── bff/             ← Node.js Express   :3000
│       └── .env.example ← copy to .env
├── apps/
│   ├── customer-app/    ← React PWA Vite    :5173
│   ├── merchant-portal/ ← React Vite        :5174
│   └── colleague-portal/← React Vite        :5175
├── infrastructure/
│   ├── docker/          ← init-db.sql
│   └── gcp/             ← Cloud Run + Firebase deploy scripts
├── docs/                ← architecture docs
├── docker-compose.yml   ← PostgreSQL + Redis + Kafka
└── SETUP.md             ← you are here
```

---

## Legacy API Keys

Still accepted for backward compatibility (e.g. curl testing):

| Key | Role |
|-----|------|
| `customer-demo-key` | CUSTOMER |
| `merchant-demo-key` | MERCHANT |
| `admin-demo-key` | ADMIN/COLLEAGUE |

JWT tokens (from `/api/v1/auth/login`) are preferred.

---

## Roadmap

### Done
- [x] JWT authentication + 9 demo personas
- [x] AI recommendations (Claude / OpenAI / Gemini) with A/B toggle
- [x] Redis caching + circuit breaker
- [x] Customer & transaction data services
- [x] GCP deployment: Cloud Run + Cloud SQL + Firebase Hosting
- [x] Progressive Web App (installable from browser)
- [x] Responsive UI: mobile / tablet / desktop

### Next
- [ ] Agents/chatbots: WhatsApp, Slack, LangChain/CrewAI via BFF
- [ ] GitHub Actions CI: customer-data-service + transaction-data-service jobs
