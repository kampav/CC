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

---

## First-Time Setup

### 1. Clone the repo

```powershell
git clone https://github.com/kampav/CC.git
cd CC
```

### 2. Start the database (PostgreSQL + Kafka)

```powershell
docker compose up -d
```

Wait ~15 seconds. Check it worked:

```powershell
docker ps   # should show cc-postgres and cc-kafka running
```

### 3. Install Node dependencies

```powershell
cd services\bff        && npm install && cd ..\..
cd apps\customer-app   && npm install && cd ..\..
cd apps\merchant-portal  && npm install && cd ..\..
cd apps\colleague-portal && npm install && cd ..\..
```

### 4. Configure the BFF

```powershell
copy services\bff\.env.example services\bff\.env
```

Open `services\bff\.env` in Notepad — you can leave everything as-is for local use.
To enable AI recommendations, paste one API key (see [AI Keys](#ai-recommendations-optional)).

### 5. Start everything

```powershell
.\scripts\start.ps1
```

Wait **~90 seconds** for the Java services to compile and start, then open:

| URL | What |
|-----|------|
| http://localhost:5173 | Customer App |
| http://localhost:5174 | Merchant Portal |
| http://localhost:5175 | Colleague Portal |
| http://localhost:3000/demo | AI Demo Pages |
| http://localhost:9080 | Kafka UI |

### 6. Stop everything

```powershell
.\scripts\stop.ps1
```

---

## Demo Walkthrough

1. **Merchant Portal** → create an offer → submit for review
2. **Colleague Portal** → approve the offer → set to LIVE
3. **Customer App** → browse offers → activate → simulate purchase
4. **Customer App** → Cashback tab → see cashback credited

---

## AI Recommendations (optional)

The platform works without an AI key — it uses rule-based scoring.
To enable AI, paste **one** key into `services\bff\.env`:

| Provider | Key prefix | Get key |
|----------|-----------|---------|
| Google Gemini (free tier) | `AIzaSy…` | https://aistudio.google.com/app/apikey |
| OpenAI | `sk-…` | https://platform.openai.com/api-keys |
| Anthropic Claude | `sk-ant-…` | https://console.anthropic.com/settings/keys |

After editing `.env`, restart the BFF:
```powershell
.\scripts\stop.ps1 ; .\scripts\start.ps1
```

Or try keys live at `http://localhost:3000/demo/ai.html` without restarting.

---

## Troubleshooting

**Java services won't start**
- Ensure Java 17 is installed and `JAVA_HOME` is set:
  `echo $env:JAVA_HOME` → should print a path ending in `jdk-17...`

**"Cannot connect to Docker daemon"**
- Open Docker Desktop and wait for the whale icon to be still

**Port already in use**
- `.\scripts\stop.ps1` then re-run `.\scripts\start.ps1`

**No data showing in the UI**
- Java services take ~90s to start. Check logs in the `logs\` folder:
  `Get-Content logs\offer-service.log -Tail 20`

**AI falls back to rule-based**
- Check `logs\bff-err.log` — it shows the exact API error
- Gemini free tier quota is 15 req/min — wait a moment and retry

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
│   └── bff/             ← Node.js Express   :3000
│       ├── .env.example ← copy to .env
│       └── public/      ← /demo pages
├── apps/
│   ├── customer-app/    ← React Vite        :5173
│   ├── merchant-portal/ ← React Vite        :5174
│   └── colleague-portal/← React Vite        :5175
├── docs/                ← architecture docs
├── docker-compose.yml   ← PostgreSQL + Kafka
└── SETUP.md             ← you are here
```

---

## API Keys (demo only)

| Key | Role | Portals |
|-----|------|---------|
| `customer-demo-key` | Customer | Customer App |
| `merchant-demo-key` | Merchant | Merchant Portal |
| `admin-demo-key` | Admin | Colleague Portal |

---

## Roadmap

### Near term
- [ ] Replace demo API keys with OAuth 2.0 / JWT
- [ ] GitHub Actions CI — build & test on every push

### GCP Deployment
- Cloud Run for BFF and Java services (auto-scales to zero)
- Cloud SQL (PostgreSQL managed)
- Pub/Sub instead of Kafka
- Cloud Load Balancer + custom domain
- Firebase Hosting for frontends

### Mobile (iOS & Android)
- The BFF REST API is the single integration point
- iOS: Swift + URLSession calling `https://your-domain/api/v1/...`
- Android: Kotlin + Retrofit
- Push notifications: Firebase Cloud Messaging → BFF webhook

### Agents & Chatbots
- The BFF already supports Claude, OpenAI, and Gemini via `X-AI-Key` header
- Extend `recommendations.js` to add `/api/v1/chat` endpoint for conversational UI
- Connect to WhatsApp Business API or Slack for chatbot channels
- Agent framework: LangChain / CrewAI can call BFF endpoints as tools
