# Cloud SQL Setup — Connected Commerce

## Instance Configuration

```
Instance ID:  cc-platform-db
Region:       europe-west2 (London)
Tier:         db-custom-4-15360 (4 vCPU, 15 GB RAM) → scales to db-n1-highmem-8
Database:     connected_commerce
Version:      PostgreSQL 16
```

## Connection String Pattern

```
# Via Cloud SQL Proxy (recommended for Cloud Run)
CLOUD_SQL_URL=jdbc:postgresql://localhost/connected_commerce?cloudSqlInstance=PROJECT_ID:europe-west2:cc-platform-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory

# Via VPC Direct (Cloud Run with VPC connector)
CLOUD_SQL_URL=jdbc:postgresql://PRIVATE_IP:5432/connected_commerce
```

## Cloud SQL Proxy (local dev against Cloud SQL)

```bash
./cloud-sql-proxy PROJECT_ID:europe-west2:cc-platform-db --port=5433
# Then connect on localhost:5433
```

## Schemas

| Schema                | Owner Service              | Tables |
|-----------------------|----------------------------|--------|
| offers                | offer-service              | offers, offer_audit_log, campaigns |
| partners              | partner-service            | partners, partner_audit_log, commercial_customers |
| eligibility           | eligibility-service        | (schema only) |
| redemptions           | redemption-service         | activations, transactions, cashback_credits, revenue_ledger |
| customers             | customer-data-service      | profiles, classifications |
| banking_transactions  | transaction-data-service   | transactions, spending_summaries |
| identity              | BFF (Node.js)              | users |
| analytics             | analytics                  | (future) |

## Connection Pooling (25M scale)

- Cloud SQL max_connections: 500
- Each service HikariCP: max 20 connections × 10 replicas = 200 per service
- Total capacity: 6 services × 200 = 1,200 — use Cloud SQL Proxy with pgbouncer or
  switch to Cloud SQL Connector with IAM auth for connection multiplexing.

## Spring Profile (GCP)

In each service `application.yml`:
```yaml
---
spring:
  config:
    activate:
      on-profile: gcp
  datasource:
    url: ${CLOUD_SQL_URL}
    username: ${DB_USER:commerce}
    password: ${DB_PASSWORD}
  kafka:
    bootstrap-servers: ${PUBSUB_ENDPOINT:localhost:9092}
```

## IAM

- Service accounts: `cc-bff@PROJECT_ID.iam.gserviceaccount.com`, etc.
- Role: `roles/cloudsql.client` on each service account
- Secret Manager: `cc-db-url`, `cc-jwt-secret`, `cc-redis-url` (one per service)
