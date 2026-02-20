# Connected Commerce - Error Playbook

> **PURPOSE:** When you hit an error, search this file for the error message. The fix is listed right here. No debugging needed.
>
> **FOR AI:** When the human pastes an error, check this playbook FIRST before attempting a fix. If the error is listed here, give the exact fix. If not, add the error and fix to this file after resolving it.

---

## JAVA / SPRING BOOT ERRORS

### "JAVA_HOME is not set"
**When:** Running `.\mvnw.cmd spring-boot:run`
**Fix (PowerShell):**
```powershell
# Find where Java is installed
where java
# Set JAVA_HOME (replace path with your actual Java location)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.2.13-hotspot"
# Make it permanent: search "Environment Variables" in Windows Start menu
# Add JAVA_HOME as a System variable pointing to your Java install folder (WITHOUT \bin)
```

### "mvnw.cmd is not recognized" or "not a recognized command"
**When:** First time running Maven wrapper
**Fix:** The Maven wrapper files need to exist. Run:
```powershell
cd services\offer-service
# If mvnw.cmd doesn't exist, download Maven wrapper:
mvn -N wrapper:wrapper
# OR if you don't have mvn installed, download the wrapper manually:
# Go to https://maven.apache.org/wrapper/ and follow Windows instructions
```
**Alternative:** Install Maven globally: https://maven.apache.org/download.cgi → Add to PATH

### "Connection refused: localhost:5432"
**When:** Starting a Java service before Docker is running
**Cause:** PostgreSQL container isn't running
**Fix:**
```powershell
# Start Docker Desktop first, then:
cd C:\Users\YourName\connected-commerce
docker compose up -d
# Wait 10 seconds, then verify:
docker exec cc-postgres pg_isready -U commerce
# Should say "accepting connections"
# NOW start your Java service
```

### "Flyway migration error" or "relation already exists"
**When:** Running a service after a database reset
**Fix:**
```powershell
# Reset the database completely:
docker compose down -v
docker compose up -d
# Wait 15 seconds for Postgres to initialise
# Then restart your service
```

### "Port 8081 already in use"
**When:** Starting offer-service when it's already running
**Fix:**
```powershell
# Find what's using the port:
netstat -ano | findstr :8081
# Kill the process (replace PID with the number from the last column):
taskkill /PID <PID> /F
# Or just close the PowerShell window where the old service is running
```

### "Cannot resolve symbol" or "package does not exist"
**When:** Compilation error in Java
**Cause:** Missing import or missing dependency in pom.xml
**Fix:** Ask the AI to give you the COMPLETE file with all imports. Never try to fix imports yourself. The AI should also check pom.xml has the needed dependency.

### "No qualifying bean of type" or "Could not autowire"
**When:** Spring Boot fails to start
**Cause:** A class is missing the `@Service`, `@Repository`, or `@Component` annotation
**Fix:** Ask the AI for the COMPLETE file. They probably forgot an annotation.

### "Table 'offers.offers' doesn't exist"
**When:** First request after starting the service
**Cause:** Flyway migration didn't run (wrong schema config)
**Fix:** Check `application.yml` has the correct schema settings. Ask AI for the COMPLETE application.yml.

---

## NODE.JS / BFF ERRORS

### "npm ERR! code ENOENT"
**When:** Running `npm install`
**Cause:** You're not in the right folder (no package.json in current directory)
**Fix:**
```powershell
# Make sure you're in the right folder:
cd C:\Users\YourName\connected-commerce\services\bff
dir package.json
# Should show the file. If not, you're in the wrong folder.
```

### "ECONNREFUSED" in BFF
**When:** BFF can't reach a backend service
**Cause:** The backend service isn't running
**Fix:** Start the backend service first, then the BFF.

### "MODULE_NOT_FOUND"
**When:** Starting the BFF
**Fix:**
```powershell
cd services\bff
del /s /q node_modules
npm install
npm run dev
```

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
**Fix:** Check internet connection. Ask AI for the COMPLETE docker-compose.yml.

### Container keeps restarting
**Fix:**
```powershell
# Check what's wrong:
docker logs cc-postgres
docker logs cc-kafka
# The error message will tell you what's wrong
```

---

## REACT / FRONTEND ERRORS

### "VITE" not recognized
**Fix:**
```powershell
cd apps\customer-app
npm install
npx vite --version
npm run dev
```

### Blank page in browser
**Cause:** Usually a JavaScript error
**Fix:** Open browser Developer Tools (F12) → Console tab → copy the red error text → paste to AI

### "Cannot find module" in React
**Fix:**
```powershell
cd apps\customer-app
del /s /q node_modules
npm install
npm run dev
```

---

## GIT ERRORS

### "not a git repository"
```powershell
cd C:\Users\YourName\connected-commerce
git init
git add .
git commit -m "Initial commit"
```

---

## GENERAL TROUBLESHOOTING

### "Nothing works"
Try this reset sequence:
```powershell
# 1. Stop everything
docker compose down -v

# 2. Restart Docker Desktop (close and reopen it)

# 3. Start fresh
docker compose up -d

# 4. Wait 20 seconds

# 5. Verify
docker compose ps
# All 3 containers should say "running"

# 6. Start ONE service at a time and test it
cd services\offer-service
.\mvnw.cmd spring-boot:run
# Wait for "Started OfferServiceApplication"
# Test: http://localhost:8081/api/v1/offers/health
```

### AI keeps generating errors
If you've been going back and forth with errors for more than 3 attempts:
1. Copy the ENTIRE error message (not just the first line)
2. Copy the ENTIRE file that's failing
3. Start a NEW chat
4. Paste CONTEXT.md first
5. Then paste the error + file
6. Ask: "This file is throwing this error. Give me the COMPLETE corrected file."
