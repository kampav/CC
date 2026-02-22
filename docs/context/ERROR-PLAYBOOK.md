# Connected Commerce - Error Playbook

> **PURPOSE:** When you hit an error, search this file for the error message. The fix is listed right here. No debugging needed.
>
> **FOR AI:** When the human pastes an error, check this playbook FIRST before attempting a fix. If the error is listed here, give the exact fix. If not, add the error and fix to this file after resolving it.

---

## JAVA / SPRING BOOT ERRORS

### "JAVA_HOME is not set"
**When:** Running `.\mvnw spring-boot:run`
**Fix (PowerShell):**
```powershell
# Set JAVA_HOME for current session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
# Make permanent: System Properties → Environment Variables → New System Variable
# Name: JAVA_HOME, Value: C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot
```

### "mvnw.cmd is not recognized" or "not a recognized command"
**When:** First time running Maven wrapper
**Fix:** Use `.\mvnw` (Unix-style wrapper) not `.\mvnw.cmd`. The scripts/run-java-service.ps1 script handles this automatically.

### "Connection refused: localhost:5432"
**When:** Starting a Java service before Docker is running
**Cause:** PostgreSQL container isn't running
**Fix:**
```powershell
docker compose up -d
docker exec cc-postgres pg_isready -U commerce
# Should say "accepting connections"
# NOW start your Java service
```

### "Connection refused: localhost:6379"
**When:** BFF starts but Redis isn't running (v1.2.0+)
**Cause:** cc-redis Docker container isn't running
**Fix:**
```powershell
docker compose up -d
docker logs cc-redis  # should show "Ready to accept connections"
```
Note: BFF falls back to uncached mode if Redis is unavailable — services still work.

### "Flyway migration error" or "relation already exists"
**When:** Running a service after a database reset
**Fix:**
```powershell
docker compose down -v
docker compose up -d
# Wait 15 seconds, then restart your service
```

### "Flyway checksum mismatch"
**When:** An existing migration file was edited after it ran
**Cause:** Someone changed a V1/V2/etc. SQL file that already ran
**Fix:** NEVER edit existing migration files. Create a new V(n+1)__fix.sql instead.
```powershell
# If you must repair:
docker exec -it cc-postgres psql -U commerce -d connected_commerce
# UPDATE flyway_schema_history SET checksum = <new_checksum> WHERE script = 'V3__...sql';
# Better option: drop -v and start fresh
```

### "Port 808x already in use"
**When:** Starting a service when it's already running
**Fix:**
```powershell
# Find what's using the port (replace 8085 with the port number):
Get-NetTCPConnection -LocalPort 8085 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### "Cannot resolve symbol" or "package does not exist"
**When:** Compilation error in Java
**Cause:** Missing import or missing dependency in pom.xml
**Fix:** Ask AI for the COMPLETE file with all imports. Check pom.xml has the needed dependency.

### "No qualifying bean of type" or "Could not autowire"
**When:** Spring Boot fails to start
**Cause:** Missing `@Service`, `@Repository`, or `@Component` annotation
**Fix:** Ask AI for the COMPLETE file. They probably forgot an annotation.

### "Table 'customers.profiles' doesn't exist" (v1.2.0)
**When:** customer-data-service starts but can't find its tables
**Cause:** `customers` schema wasn't created in PostgreSQL
**Fix:**
```powershell
docker exec -it cc-postgres psql -U commerce -d connected_commerce -c "CREATE SCHEMA IF NOT EXISTS customers; GRANT ALL ON SCHEMA customers TO commerce;"
# Then restart customer-data-service -- Flyway will create the tables
```

### "Table 'banking_transactions.transactions' doesn't exist" (v1.2.0)
**When:** transaction-data-service starts but can't find its tables
**Fix:**
```powershell
docker exec -it cc-postgres psql -U commerce -d connected_commerce -c "CREATE SCHEMA IF NOT EXISTS banking_transactions; GRANT ALL ON SCHEMA banking_transactions TO commerce;"
# Then restart transaction-data-service
```

---

## NODE.JS / BFF ERRORS

### "npm ERR! code ENOENT"
**When:** Running `npm install`
**Cause:** You're not in the right folder (no package.json in current directory)
**Fix:**
```powershell
cd C:\Projects\CC\extracted\connected-commerce\services\bff
dir package.json  # Should show the file
```

### "ECONNREFUSED" in BFF
**When:** BFF can't reach a backend service
**Cause:** The backend service isn't running or still starting up
**Fix:** Start the backend service first. Java services take ~90s to compile.

### "MODULE_NOT_FOUND"
**When:** Starting the BFF
**Fix:**
```powershell
cd services\bff
Remove-Item -Recurse -Force node_modules
npm install
node src/index.js
```

### "spendSummary.forEach is not a function" (v1.2.0)
**When:** Recommendations endpoint crashes when fetching spending data
**Cause:** transaction-data-service returns `{ categories: [...] }` not a plain array
**Fix:** Already fixed in v1.2.0. In recommendations.js, the code extracts `.categories`:
```javascript
const spendRaw = spendRes.status === 'fulfilled' ? spendRes.value.data : null;
const spendSummary = Array.isArray(spendRaw) ? spendRaw : (spendRaw?.categories || []);
```

### "SyntaxError: Unexpected token ':'" in BFF
**When:** BFF crashes immediately on start
**Cause:** TypeScript type annotation in a plain .js file (e.g., `(o: any)`)
**Fix:** Remove all TypeScript annotations from .js files. Node.js cannot parse them.

### BFF prints "FAILED" after start
**When:** Running start.ps1 and BFF health check fails
**Fix:**
```powershell
Get-Content C:\Projects\CC\extracted\connected-commerce\logs\bff-err.log -Tail 20
```
Common causes: port 3000 in use, .env missing, PostgreSQL not ready.

### "ioredis connection refused" (v1.2.0)
**When:** BFF logs show Redis connection error
**Cause:** cc-redis container not running
**Fix:** `docker compose up -d` — BFF will reconnect automatically.

---

## DOCKER ERRORS

### "docker: Cannot connect to the Docker daemon"
**Cause:** Docker Desktop isn't running
**Fix:** Open Docker Desktop, wait for the green icon, then retry.

### "port is already allocated"
**When:** `docker compose up`
**Fix:**
```powershell
docker compose down
docker compose up -d
```

### "image not found" or "pull access denied"
**Cause:** Typo in docker-compose.yml or no internet
**Fix:** Check internet connection. Run `docker compose pull` first.

### Container keeps restarting
**Fix:**
```powershell
docker logs cc-postgres
docker logs cc-kafka
docker logs cc-redis
# The error message will tell you what's wrong
```

### "level=warning msg='...version is obsolete'"
**When:** `docker compose up -d` shows a warning
**Cause:** Cosmetic warning about deprecated `version:` field in docker-compose.yml
**Fix:** Nothing to fix -- this is a warning not an error. All containers start successfully.

---

## REACT / FRONTEND ERRORS

### "VITE" not recognized
**Fix:**
```powershell
cd apps\customer-app
npm install
npm run dev
```

### Blank page in browser
**Cause:** Usually a JavaScript error
**Fix:** Open browser Developer Tools (F12) → Console tab → copy the red error text → paste to AI

### "Cannot find module" in React
**Fix:**
```powershell
cd apps\customer-app
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Personalization mode not switching (v1.2.0)
**When:** Clicking Rule-Based/AI toggle has no effect
**Cause:** localStorage value may be stale
**Fix:** Open browser DevTools → Application → Local Storage → delete `cc_persona_mode` → refresh

---

## GCP / CLOUD RUN ERRORS

### "The following reserved env names were provided: PORT"
**When:** `gcloud run deploy --port=3000 ...`
**Cause:** Cloud Run reserves `PORT` as an env var and auto-injects it. Passing `--port=3000` as a flag conflicts.
**Fix:** Remove `--port=3000` from the deploy command. The BFF uses `process.env.PORT || 3000` so Cloud Run's auto-injected PORT works correctly.

### "PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections"
**When:** Multiple Java services on Cloud Run hit db-f1-micro (max_connections=25)
**Cause:** `minimum-idle: 1` in HikariCP causes each service instance to hold an open connection even when idle. During scale-up events this exhausts connection slots.
**Fix:** Set `hikari.minimum-idle: 0` in all Java `application-gcp.yml` files. `maximum-pool-size: 2` stays (6 services × 2 = 12 + BFF 3 = 15, well under 25).

### "Error: Request failed with status code 401" on GCP but works locally
**Cause:** BFF calls Java services on Cloud Run without an OIDC token. Cloud Run services default to requiring authentication.
**Fix:** `gcpAuth.js` in BFF adds an `Authorization: Bearer <oidc-token>` header for all `*.run.app` upstream calls. Verify this file exists and the axios interceptor is wired in `index.js`.

### Java service returns 503 immediately on GCP
**Cause:** Service scaled to zero (min-instances=0). First request triggers cold start (~15s).
**Fix:** Pre-warm by hitting the service's `/health` endpoint once before a demo. Or bump BFF circuit breaker timeout.

---

## TYPESCRIPT / VITE BUILD ERRORS

### "error TS6133: 'useBreakpoint' is declared but its value is never read"
**When:** Running `npm run build` after adding `useBreakpoint` import
**Cause:** `noUnusedLocals: true` in tsconfig. Import added but breakpoint variables never used in the component body.
**Fix:** Ensure every file that imports `useBreakpoint` actually uses it:
```tsx
const bp = useBreakpoint();
const isMobile = bp === 'mobile';
const isTablet = bp === 'tablet';
// Use isMobile / isTablet in at least one style prop
```

### "error TS6133: 'CATEGORY_ICONS' is declared but its value is never read"
**Cause:** Same `noUnusedLocals` strictness.
**Fix:** Either use the variable or remove the import entirely.

---

## GIT ERRORS

### "not a git repository"
```powershell
cd C:\Projects\CC\extracted\connected-commerce
git init
git add .
git commit -m "Initial commit"
```

### "refusing to allow force push to protected branch"
**When:** Trying to force-push to main
**Fix:** Don't force push to main. Create a branch, push, and open a PR.

---

## GENERAL TROUBLESHOOTING

### Service health checks
```powershell
# Check all services at once
curl http://localhost:8081/api/v1/offers/health
curl http://localhost:8082/api/v1/partners/health
curl http://localhost:8083/api/v1/eligibility/health
curl http://localhost:8084/api/v1/redemptions/health
curl http://localhost:8085/api/v1/customers/health
curl http://localhost:8086/api/v1/banking-transactions/health
curl http://localhost:3000/health
```

### "Nothing works" -- Full Reset Sequence
```powershell
# 1. Stop everything
.\scripts\stop.ps1
docker compose down -v

# 2. Restart Docker Desktop (close and reopen)

# 3. Start fresh
docker compose up -d   # starts PostgreSQL + Kafka + Redis

# 4. Wait 20 seconds

# 5. Verify containers
docker compose ps
# All containers should say "running" or "healthy"

# 6. Start services
.\scripts\start.ps1
# Wait ~90s for Java services to compile
# BFF prints OK/FAILED on port 3000

# 7. Test one service
curl http://localhost:8081/api/v1/offers/health
```

### AI keeps generating errors
If you've been going back and forth with errors for more than 3 attempts:
1. Copy the ENTIRE error message (not just the first line)
2. Copy the ENTIRE file that's failing
3. Start a NEW chat
4. Paste CONTEXT.md first
5. Then paste the error + file
6. Ask: "This file is throwing this error. Give me the COMPLETE corrected file."
