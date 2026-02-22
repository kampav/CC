# Connected Commerce - Architecture Decisions

> **WHAT IS THIS?** A record of important technical choices. When we chose A over B, this explains why. Helps maintain consistency across sessions.

---

## ADR-001: One Folder for Everything (Monorepo)
**Date:** 2026-02-14
**What we chose:** Put all code in one folder (monorepo) instead of separate repos per service
**Why:** Easier for AI to understand the full project, easier to make cross-service changes, one Docker Compose for everything
**Trade-off:** The folder gets big over time, but that's fine for our scale

## ADR-002: Kafka Without Zookeeper (KRaft Mode)
**Date:** 2026-02-14
**What we chose:** Run Kafka in KRaft mode (no separate Zookeeper container)
**Why:** Fewer containers to manage, simpler Docker Compose, modern recommended approach
**Trade-off:** None significant — KRaft has been stable since Kafka 3.5

## ADR-003: One Database, Separate Schemas
**Date:** 2026-02-14
**What we chose:** One PostgreSQL database with a separate schema per service
**Why:** Simpler local setup than running 6 databases. Each service still has its own isolated space.
**Trade-off:** Could create bottleneck at extreme scale, but can split later
**Note (v1.2.0):** Two new schemas added: `customers` (customer-data-service) and `banking_transactions` (transaction-data-service)

## ADR-004: Vite for React Apps
**Date:** 2026-02-14
**What we chose:** Vite build tool instead of Create React App
**Why:** 10x faster dev server, better TypeScript support, CRA is deprecated
**Trade-off:** None — Vite is the modern standard

## ADR-005: Auto-Generated API Docs (SpringDoc)
**Date:** 2026-02-14
**What we chose:** SpringDoc generates OpenAPI docs automatically from code annotations
**Why:** Documentation always matches actual code
**Trade-off:** None significant

## ADR-006: Lifecycle State Machine in Code
**Date:** 2026-02-14
**What we chose:** Offer/partner/campaign lifecycle states defined as Java enums with transition maps
**Why:** Self-documenting, impossible to make invalid transitions, easy to understand and modify
**Trade-off:** State changes require code change + migration (by design)

## ADR-007: API-Key Auth Initially, JWT in v1.1.0
**Date:** 2026-02-17 (API key) / 2026-02-20 (JWT)
**What we chose:** Started with simple API-key lookup in BFF middleware, upgraded to JWT Bearer tokens in v1.1.0
**Why:** API keys worked for MVP. JWT enables proper multi-user auth, role-based personas, and mobile compatibility.
**Current state:** Both are accepted. JWT is preferred; X-API-Key still works for backward compat.
**Trade-off:** Legacy X-API-Key means two code paths to maintain. Will remove in v2.0.

## ADR-008: Rule-Based Recommendations + AI Toggle
**Date:** 2026-02-18 (v1) / 2026-02-21 (v2)
**What we chose:** Rule-based scoring engine in BFF as default, AI mode optional via `?mode=ai` param or API key
**Why:** Works without ML infrastructure. Rule-based v2 (v1.2.0) is segment+lifecycle+spend_pattern aware. AI mode adds natural language reasoning.
**v1.2.0 enhancement:** A/B comparison endpoint (`/recommendations/compare`) shows both modes side-by-side.
**Trade-off:** Rule-based is deterministic but less contextual than ML. AI adds latency (~2-4s vs ~50ms).

## ADR-009: Client-Side Compliance Checks
**Date:** 2026-02-18
**What we chose:** Compliance rules (FCA Fair Value, ASA Misleading Claims, etc.) run in the colleague portal frontend
**Why:** Fast iteration -- rules can be updated without backend deployment. BLOCK-severity failures prevent offer approval in the UI.
**Trade-off:** Not enforced at the API level -- a direct API call could bypass checks. For production, should also validate server-side.

## ADR-010: Direct SQL for Analytics
**Date:** 2026-02-17
**What we chose:** JPA repository queries for analytics (count by status, sum cashback) instead of Kafka consumer pipeline
**Why:** Much simpler. For MVP scale, a COUNT query is fine. No need for separate analytics tables, ETL jobs, or Kafka consumers.
**Trade-off:** Won't scale to millions of records. For production, add materialized views or a read-replica.

## ADR-011: Campaign Management in Offer Service
**Date:** 2026-02-17
**What we chose:** Campaigns are managed within the offer-service (same database schema, same Spring Boot app) rather than a separate campaign service
**Why:** Campaigns are tightly coupled to offers (many-to-many relationship). Separate service would require cross-service transactions or eventual consistency for something that's fundamentally offer metadata.
**Trade-off:** Offer-service has more responsibilities than ideal. Could extract later if it grows too complex.

## ADR-012: Inline Styles in React
**Date:** 2026-02-17
**What we chose:** Inline CSS styles (`style={{...}}`) in React components rather than CSS modules, Tailwind, or styled-components
**Why:** Zero build configuration, no additional dependencies, all styling visible inline with the JSX. Good for rapid prototyping.
**Trade-off:** No hover states, media queries, or animations without JS workarounds. For production, should migrate to Tailwind or CSS modules.

## ADR-013: Separate Customer Data and Transaction Data Services (v1.2.0)
**Date:** 2026-02-21
**What we chose:** Two dedicated microservices for customer profiles and transaction history, fed from Kafka
**Why:** Models how a real retail bank works — core banking systems publish events, downstream services maintain local read-models. Decouples personalization from identity. Each service can scale independently.
**Services:** customer-data-service (port 8085), transaction-data-service (port 8086)
**Trade-off:** More services to run locally. More complex startup. Justified by realistic banking architecture demo.

## ADR-014: Redis Caching in BFF (v1.2.0)
**Date:** 2026-02-21
**What we chose:** Redis via ioredis for BFF-level caching. TTLs: customer profile 300s, offers 60s, spending 900s.
**Why:** Customer profiles change rarely. Offer catalogue changes infrequently. Caching eliminates 90%+ of upstream calls on repeated requests.
**Implementation:** `services/bff/src/cache.js` — `cached(key, ttl, fn)` helper.
**Trade-off:** Redis becomes a dependency — if it's down, BFF falls back to uncached requests (no hard failure).

## ADR-015: Keyset Pagination Over OFFSET (v1.2.0)
**Date:** 2026-02-21
**What we chose:** Keyset/cursor-based pagination (`?after=<ISO8601 timestamp>`) in transaction-data-service instead of OFFSET
**Why:** OFFSET degrades linearly with page number (OFFSET 1000000 scans 1 million rows). Keyset uses index seek — constant time regardless of page number. Essential for 25M customer scale.
**Implementation:** `BankingTransactionRepository.findByCustomerIdKeyset()` with composite index `(customer_id, transaction_date DESC)`.
**Trade-off:** Cannot jump to arbitrary page number (only forward paging). Acceptable for mobile scroll patterns.

## ADR-016: Circuit Breaker in BFF (v1.2.0)
**Date:** 2026-02-21
**What we chose:** Simple in-process circuit breaker in BFF (`services/bff/src/circuit.js`) — opens after 5 failures in 30s, half-open after 30s.
**Why:** Prevents cascade failures when upstream services (customer-data-service, transaction-data-service) are slow or down. Personalization degrades gracefully to rule-based-only mode.
**Trade-off:** In-process circuit breaker resets on BFF restart. For production, use Redis-backed circuit breaker or a service mesh.

## ADR-017: Kafka for Banking Event Simulation (v1.2.0)
**Date:** 2026-02-21
**What we chose:** Use Kafka (already in stack) to simulate core banking events. New topics: `banking.customers` (3 partitions) and `banking.transactions` (6 partitions).
**Why:** Realistic demonstration of event-driven architecture pattern. Shows how bank systems produce events and downstream services consume them.
**GCP mapping:** Kafka topics map 1:1 to Cloud Pub/Sub topics for GCP deployment.
**Trade-off:** Consumers are scaffolded but simulation is via seed data — actual event production would require a separate simulator service.

## ADR-018: Firebase Hosting Rewrite for Zero-CORS GCP Deploy (v1.3.0)
**Date:** 2026-02-21
**What we chose:** Firebase Hosting serves the 3 React apps and rewrites `/api/**` to the BFF Cloud Run service via `"run": { "serviceId": "bff" }` — no custom domain, no API gateway.
**Why:** Browser sees all requests going to the same Firebase origin. Zero CORS configuration needed. React apps call `/api/v1/...` unchanged — identical to local dev. Firebase Hosting is free. Eliminates Cloud Endpoints cost.
**Implementation:** `apps/*/firebase.json` with `rewrites` array. `.firebaserc` links to `gen-lang-client-0315293206`.
**Trade-off:** Firebase rewrite only works for Cloud Run services in the same GCP project and region. Not suitable if BFF is in a different project/region.

## ADR-019: Kafka Disable via @ConditionalOnProperty + GCP Spring Profile (v1.3.0)
**Date:** 2026-02-21
**What we chose:** Java Kafka consumers annotated with `@ConditionalOnProperty(name="kafka.consumers.enabled", havingValue="true", matchIfMissing=true)`. `application-gcp.yml` sets `kafka.consumers.enabled: false` and excludes `KafkaAutoConfiguration`.
**Why:** GCP demo has no Kafka broker. All demo data is seeded via Flyway V2 migrations. Disabling Kafka at the Spring bean level means no code changes needed between local and GCP — just activate the `gcp` Spring profile.
**Activation:** Set `SPRING_PROFILES_ACTIVE=gcp` as a Cloud Run environment variable.
**Trade-off:** Kafka consumer code is dead on GCP. For a real GCP deployment, replace Kafka with Cloud Pub/Sub subscriptions and re-enable consumers.

## ADR-020: Scale-to-Zero Java Services on Cloud Run (v1.3.0)
**Date:** 2026-02-21
**What we chose:** Java microservices deploy with `min-instances=0`. BFF deploys with `min-instances=1`.
**Why:** Demo traffic is sporadic — most of the time services are idle. Scale-to-zero eliminates idle compute cost entirely. BFF keeps one warm instance for instant response on first page load.
**Cold start impact:** Java services take ~15s to start from cold. For demo, pre-warm by opening each service URL once before presenting.
**Cost:** Cloud Run free tier covers demo scale. BFF min-instances=1 costs ~$0/month at 512MB (well within Cloud Run free tier's 180,000 vCPU-seconds/month).

## ADR-021: Responsive UI via Inline Styles + useBreakpoint Hook (v1.3.0)
**Date:** 2026-02-22
**What we chose:** Keep 100% inline `style={{}}` (no CSS framework, no Tailwind, no media queries) but add a `useBreakpoint` hook that returns `'mobile' | 'tablet' | 'desktop'` based on `window.innerWidth`. Components conditionally apply different style values based on the breakpoint.
**Why:** Inline styles were already established (ADR-012). Adding a breakpoint hook achieves full responsiveness without changing the styling paradigm, adding dependencies, or introducing a build step.
**Breakpoints:** mobile < 768px, tablet 768-1023px, desktop >= 1024px
**Layout approach:** Customer App uses hamburger + slide-down nav on mobile. Merchant/Colleague portals use icon-only sidebar (tablet) or overlay drawer (mobile).
**Table pattern:** `<div className="table-scroll">` wrapper with `overflow-x: auto` in `index.css` + `minWidth` on the `<table>` — preserves table structure while enabling horizontal scroll on mobile.
**Trade-off:** Hover states and animations still require JS. The `useBreakpoint` hook fires a re-render on every resize event (debouncing would improve performance at the cost of complexity — acceptable for demo scale).

## ADR-022: HikariCP minimum-idle=0 for Cloud Run (v1.3.0)
**Date:** 2026-02-22
**What we chose:** Set `hikari.minimum-idle: 0` (not 1 or higher) in all 6 Java service `application-gcp.yml` files.
**Why:** Cloud Run scales Java services to zero between requests. When a service scales back up, it creates a new JVM instance. If minimum-idle=1, each instance immediately holds an open connection — with 6 services and sporadic scale-up events, this exhausted Cloud SQL db-f1-micro's max_connections=25 (6 services × max-pool-size 2 + BFF 3 = 15, but spikes during scale-up caused temporary overflows). Setting minimum-idle=0 means connections are only held while requests are in-flight.
**Trade-off:** First query on a cold connection takes slightly longer (~5ms). Imperceptible at demo scale.
