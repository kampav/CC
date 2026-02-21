# Connected Commerce Platform - AI Assistant Instructions

> **Version:** v1.2.0

## Project Owner
Pav -- Head of Engineering, not a hands-on programmer. Windows machine. Needs complete files, plain English explanations, and zero-error code.

## Critical Rules
1. OUTPUT COMPLETE FILES ONLY -- never partial code or diffs
2. ZERO COMPILE ERRORS -- mentally verify all imports, signatures, and braces before outputting
3. WINDOWS ONLY -- PowerShell commands, backslash paths in commands
4. EXPLAIN EVERYTHING -- no jargon without plain English explanation
5. ALWAYS VERIFY -- provide a URL or command to test every change
6. NEVER ASK TO DEBUG -- if there's an error, fix it yourself
7. NO TYPESCRIPT IN .js FILES -- Node.js crashes silently on type annotations like `(o: any)`
8. NO EM-DASH IN PS1 FILES -- the `--` character corrupts to garbage in PowerShell scripts; use `--` (two hyphens) instead

## Services (v1.2.0)

| Port | Service | Package / Language |
|------|---------|------------------|
| 8081 | offer-service | `com.cc.offer` / Java 17 Spring Boot 3.2.3 |
| 8082 | partner-service | `com.cc.partner` / Java 17 Spring Boot 3.2.3 |
| 8083 | eligibility-service | `com.cc.eligibility` / Java 17 Spring Boot 3.2.3 |
| 8084 | redemption-service | `com.cc.redemption` / Java 17 Spring Boot 3.2.3 |
| 8085 | customer-data-service | `com.cc.customer` / Java 17 Spring Boot 3.2.3 |
| 8086 | transaction-data-service | `com.cc.transaction` / Java 17 Spring Boot 3.2.3 |
| 3000 | BFF | Node.js 20 / Express 4 |
| 5173 | customer-app | React 18 / TypeScript / Vite |
| 5174 | merchant-portal | React 18 / TypeScript / Vite |
| 5175 | colleague-portal | React 18 / TypeScript / Vite |

Infrastructure: PostgreSQL 16, Kafka KRaft, Redis 7

## Code Patterns

### Java (Spring Boot 3 / Java 17)
- Records for DTOs (CreateOfferRequest, OfferResponse, etc.)
- Constructor injection (no @Autowired on fields)
- @Valid for input validation with Jakarta Bean Validation
- Structured logging: `log.info("message: {}", value)` with correlationId from MDC
- ResponseEntity for all controller returns
- Flyway for migrations (NEVER edit existing migrations, create new V(n+1)__description.sql)
- Tests with JUnit 5 + Mockito
- HikariCP: maximum-pool-size=20, minimum-idle=5

### Node.js (Express BFF)
- const by default, let for reassignment
- Propagate X-Correlation-Id header to all upstream calls
- async/await with try/catch
- Consistent error shape: `{ error, correlationId, timestamp }`
- Use ioredis cache.js `cached(key, ttl, fn)` for upstream calls
- Use circuit.js for upstream resilience

### React (TypeScript)
- Functional components with hooks
- Type all props and state
- Mobile-first responsive design
- Use PersonalizationContext for mode state (customer app)

## Naming
- Java packages: `com.cc.{domain}` (e.g., `com.cc.customer`, `com.cc.transaction`)
- API paths: `/api/v1/{resource}`
- Kafka topics: `{domain}.{event}` (e.g., `banking.customers`, `banking.transactions`)
- Database tables: snake_case plural (e.g., profiles, classifications, transactions)
- Database schemas: lowercase noun (offers, partners, redemptions, customers, banking_transactions, identity)
- React components: PascalCase

## Auth (v1.1.0+)
- JWT Bearer tokens: 8h expiry, signed with `JWT_SECRET` from BFF .env
- Auth middleware accepts both `Authorization: Bearer <token>` and legacy `X-API-Key`
- `requireRole(...roles)` guard -- EXEC is treated as having COLLEAGUE privileges
- Customer IDs are UUID format `c0000000-0000-0000-0000-0000000000XX`

## Personalization (v1.2.0)
- Default mode: `rule-based-v2` (segment+lifecycle+spend_pattern scoring)
- AI mode: `?mode=ai` or `X-Personalization-Mode: ai` header
- A/B compare: `GET /api/v1/recommendations/compare`
- Customer profile from: customer-data-service (port 8085)
- Spending data from: transaction-data-service (port 8086)
- Both cached via Redis (profile 300s, offers 60s, spending 900s)

## Context Files
After every change, update: CONTEXT.md, API-CONTRACTS.md, DATA-MODEL.md, FEATURE-REGISTRY.md, STEP-LOG.md
