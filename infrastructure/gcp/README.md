# GCP Deployment — Connected Commerce Platform

> **Demo deployment**: Cloud Run + Cloud SQL + Firebase Hosting
> Target cost: ~$9.50/month | Project: [GCP_PROJECT_ID] | Region: us-central1

## Architecture

```
Firebase Hosting (free)          Cloud Run (free at demo scale)
+---------------------+          +----------------------------------+
| cc-customer    |--/api/**>| bff (min-instances=1)            |
| cc-merchant    |          |   +-> offer-service      (8081)  |
| cc-colleague   |          |   +-> partner-service    (8082)  |
+---------------------+          |   +-> eligibility-service(8083)  |
                                 |   +-> redemption-service (8084)  |
                                 |   +-> customer-data-svc  (8085)  |
                                 |   +-> transaction-data-svc(8086) |
                                 +----------------+-----------------+
                                                  |
                                 +----------------v-----------------+
                                 | Cloud SQL db-f1-micro (~$9.50/mo)|
                                 | PostgreSQL 14, 10GB SSD          |
                                 +----------------------------------+
```

**Key design decisions:**
- Firebase rewrites `/api/**` to BFF Cloud Run — zero CORS issues, React apps unchanged
- Java services scale to 0 (min-instances=0) — no idle compute cost
- BFF stays warm (min-instances=1) — instant first response
- Kafka disabled via `application-gcp.yml` + `@ConditionalOnProperty` — all data from Flyway seeds
- No Redis on GCP (skipped for demo) — BFF falls back to direct calls gracefully

## Cost Breakdown

| Resource | Spec | Monthly Cost |
|----------|------|-------------|
| Cloud SQL | db-f1-micro, PostgreSQL 14 | ~$7.46 |
| Cloud SQL storage | 10 GB SSD | ~$1.70 |
| Cloud Run (all services) | Scale-to-zero at demo traffic | ~$0.00 |
| Firebase Hosting | 3 sites, static files | Free |
| Artifact Registry | ~2 GB Docker images | ~$0.20 |
| **Total** | | **~$9.36/month** |

> **Pause billing**: `gcloud sql instances patch cc-postgres --activation-policy NEVER`
> **Resume**: `gcloud sql instances patch cc-postgres --activation-policy ALWAYS`

## Prerequisites (one-time)

### 1. Install gcloud CLI
Download from: https://cloud.google.com/sdk/docs/install-sdk#windows

After installing:
```powershell
gcloud auth login
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 2. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/
Ensure Docker Desktop is running before deploying.

### 3. Install Firebase CLI
```powershell
npm install -g firebase-tools
firebase login
```

### 4. Create Firebase Hosting sites (one-time)
```powershell
firebase hosting:sites:create cc-customer --project [GCP_PROJECT_ID]
firebase hosting:sites:create cc-merchant --project [GCP_PROJECT_ID]
firebase hosting:sites:create cc-colleague --project [GCP_PROJECT_ID]
```

### 5. Verify everything is ready
```powershell
gcloud version
docker info
firebase --version
```

## Deploy

```powershell
cd C:\Projects\CC\extracted\connected-commerce

# First deploy (~15 min — creates Cloud SQL, builds all images)
.\infrastructure\gcp\deploy.ps1

# Re-deploy without rebuilding images (~3 min)
.\infrastructure\gcp\deploy.ps1 -SkipBuild

# Update React frontends only (~2 min)
.\infrastructure\gcp\deploy.ps1 -OnlyFrontend
```

The script will:
1. Enable GCP APIs (Cloud Run, Cloud SQL, Artifact Registry)
2. Create Cloud SQL `cc-postgres` db-f1-micro instance (5-8 min, first run only)
3. Create `connected_commerce` database + `commerce` user with random password → `secrets.json`
4. Build and push Docker images for all 7 services to Artifact Registry
5. Deploy 6 Java microservices to Cloud Run (no-auth, internal only)
6. Deploy BFF to Cloud Run (public, with upstream service URLs injected)
7. Build 3 React apps with production env and deploy to Firebase Hosting
8. Print all shareable URLs

## Shareable URLs

After deploy, URLs are saved to `infrastructure/gcp/urls.json`.

| App | URL |
|-----|-----|
| Customer App (PWA) | https://[your-customer-site].web.app |
| Merchant Portal | https://[your-merchant-site].web.app |
| Colleague Portal | https://[your-colleague-site].web.app |

### Demo Users (password: `demo1234`)

| Email | Persona | Segment |
|-------|---------|---------|
| customer@demo.com | Alice Morgan | PREMIER |
| customer2@demo.com | Ben Clarke | MASS_AFFLUENT |
| customer3@demo.com | Cara Singh | MASS_MARKET |
| customer4@demo.com | Dan Webb | PREMIER |
| customer5@demo.com | Emma Hayes | MASS_AFFLUENT |
| customer6@demo.com | Frank Osei | MASS_MARKET (AT_RISK) |
| customer7@demo.com | Grace Liu | PREMIER |
| customer8@demo.com | Harry Patel | MASS_AFFLUENT |
| customer9@demo.com | Isla Brown | MASS_MARKET |
| merchant@demo.com | Merchant Portal | — |
| colleague@demo.com | Colleague Portal | — |
| exec@demo.com | Exec Dashboard | — |

## PWA — Install on Mobile

The customer app is a Progressive Web App (PWA). Share the URL with colleagues:

**Android**: Open in Chrome > three-dot menu > Add to Home Screen
**iOS**: Open in Safari > Share > Add to Home Screen

The app caches static assets for offline use and makes live API calls when online.

## Useful Commands

```powershell
# View live BFF logs
gcloud run services logs tail bff --region=us-central1

# View Java service logs
gcloud run services logs tail offer-service --region=us-central1

# List all Cloud Run services
gcloud run services list --region=us-central1

# Check Cloud SQL status
gcloud sql instances describe cc-postgres --format="value(state)"

# Connect to Cloud SQL locally (needs Cloud SQL Auth Proxy)
# Download: https://cloud.google.com/sql/docs/postgres/connect-auth-proxy
./cloud-sql-proxy [GCP_PROJECT_ID]:us-central1:cc-postgres --port=5433
# Then: psql -h localhost -p 5433 -U commerce -d connected_commerce
```

## Files in This Directory

| File/Folder | Purpose |
|-------------|---------|
| `deploy.ps1` | Master deployment script |
| `secrets.json` | Generated DB password — **gitignored, do not commit** |
| `urls.json` | Deployed service URLs — **gitignored** |
| `cloud-run/` | Cloud Run YAML manifests (reference) |
| `cloud-sql/` | Cloud SQL schema and connection reference |
| `firebase/` | Firebase Hosting config reference |
| `pubsub/` | Pub/Sub topic definitions (future Kafka replacement) |

## Troubleshooting

**Java service fails to start (Flyway / Cloud SQL error)**
Grant Cloud SQL Client role to the default compute service account:
```powershell
gcloud projects add-iam-policy-binding [GCP_PROJECT_ID] `
  --member="serviceAccount:$(gcloud iam service-accounts list --format='value(email)' --filter='email~compute')" `
  --role="roles/cloudsql.client"
```

**BFF returns 502 for /api/v1/...**
Check BFF has correct upstream URLs:
```powershell
gcloud run services describe bff --region=us-central1 --format="yaml(spec.template.spec.containers[0].env)"
```

**Firebase deploy fails — site not found**
Run the one-time Firebase site creation commands in the Prerequisites section above.

**Cold start latency on Java services**
Java services (min-instances=0) take ~15s on first request after idle.
Warm them up before a demo by opening each app once.
To eliminate cold starts: edit `deploy.ps1` and change `--min-instances=0` to `--min-instances=1`
(adds ~$3/month per service).

## Local Development (unchanged)

The GCP deployment does not affect the local setup:
```powershell
docker compose up -d
.\scripts\start.ps1
```
Local runs on ports 5173/5174/5175/3000/8081-8086 as documented in ONBOARDING.md.
