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
**Why:** Simpler local setup than running 4 databases. Each service still has its own isolated space.
**Trade-off:** Could create bottleneck at extreme scale, but can split later

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

## ADR-007: API-Key Auth Instead of JWT
**Date:** 2026-02-17
**What we chose:** Simple API-key lookup in BFF middleware instead of JWT tokens
**Why:** Much simpler for MVP demo. Three hardcoded keys (customer, merchant, admin) with role/userId injection. No token refresh, no auth server needed.
**Trade-off:** Not production-ready — keys are static, no real user management. JWT can be added later without changing backend services (BFF already injects identity headers).

## ADR-008: Rule-Based Recommendations with Vertex AI Scaffold
**Date:** 2026-02-18
**What we chose:** Implement recommendation engine as rule-based scoring in the BFF, with Vertex AI fallback when API key is provided
**Why:** Works immediately without ML infrastructure. Scoring considers category affinity, brand affinity, cashback rate, recency, and urgency. Can switch to ML model by just setting environment variables.
**Trade-off:** Rule-based engine is less sophisticated than ML, but good enough for MVP

## ADR-009: Client-Side Compliance Checks
**Date:** 2026-02-18
**What we chose:** Compliance rules (FCA Fair Value, ASA Misleading Claims, etc.) run in the colleague portal frontend
**Why:** Fast iteration — rules can be updated without backend deployment. BLOCK-severity failures prevent offer approval in the UI.
**Trade-off:** Not enforced at the API level — a direct API call could bypass checks. For production, should also validate server-side.

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
