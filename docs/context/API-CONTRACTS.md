# Connected Commerce - API Contracts

> **WHAT IS THIS?** This file documents every URL (endpoint) our app responds to. When you visit a URL or send data to it, this tells you what to send and what you'll get back.
>
> **Version:** v1.2.0

---

## Authentication

### JWT Bearer (preferred — v1.1.0+)

Login first to get a token, then include it in every request:

```powershell
# Login
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' `
  -Method POST -ContentType 'application/json' `
  -Body '{"email":"customer@demo.com","password":"demo1234"}'
$token = $resp.token
$headers = @{ Authorization = "Bearer $token" }
```

Demo users (password: `demo1234`):

| Email | Role | Persona |
|-------|------|---------|
| customer@demo.com | CUSTOMER | Alice — PREMIER, EXPERIENCE_SEEKER |
| customer2@demo.com | CUSTOMER | Ben — MASS_AFFLUENT, BRAND_LOYAL |
| customer3@demo.com | CUSTOMER | Cara — MASS_MARKET, DEAL_SEEKER |
| customer4@demo.com | CUSTOMER | Dan — PREMIER, BRAND_LOYAL |
| customer5@demo.com | CUSTOMER | Emma — MASS_AFFLUENT, CONVENIENCE_SHOPPER |
| customer6@demo.com | CUSTOMER | Frank — MASS_MARKET, DEAL_SEEKER, AT_RISK |
| customer7@demo.com | CUSTOMER | Grace — PREMIER, EXPERIENCE_SEEKER |
| customer8@demo.com | CUSTOMER | Harry — MASS_AFFLUENT, BRAND_LOYAL |
| customer9@demo.com | CUSTOMER | Isla — MASS_MARKET, CONVENIENCE_SHOPPER, NEW |
| merchant@demo.com | MERCHANT | Merchant user |
| colleague@demo.com | COLLEAGUE | Colleague user |
| exec@demo.com | EXEC | Executive user |

### Legacy X-API-Key (backward compat)

| API Key | Role |
|---------|------|
| `customer-demo-key` | CUSTOMER |
| `merchant-demo-key` | MERCHANT |
| `admin-demo-key` | ADMIN |

---

## Auth API

```
POST /api/v1/auth/login    — Email + password → JWT token
GET  /api/v1/auth/me       — Current user info (requires Bearer token)
POST /api/v1/auth/register — Create new user account
```

### Login
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method POST `
  -ContentType 'application/json' `
  -Body '{"email":"customer@demo.com","password":"demo1234"}'
```
Returns: `{ token, user: { id, email, role, customerId, partnerId } }`

---

## BFF Gateway — Port 3000

### Health Check
```powershell
Invoke-RestMethod http://localhost:3000/health
```
Returns: service name, status, upstream service URLs.

---

## Offers API

All offer endpoints are proxied through the BFF at `/api/v1/offers`.

### Create Offer
```
POST /api/v1/offers
Auth: MERCHANT, ADMIN
```
```powershell
$body = @{
    merchantId = "00000000-0000-0000-0000-000000000001"
    title = "10% Cashback at Tesco"
    description = "Get 10% back on all grocery purchases over 10"
    offerType = "CASHBACK"
    category = "Groceries"
    cashbackRate = 10.00
    cashbackCap = 50.00
    minSpend = 10.00
    terms = "Maximum cashback 50 per month."
    brand = "LLOYDS"
    redemptionType = "CARD_LINKED"
    maxActivations = 5000
    imageUrl = "https://example.com/offer-image.png"
    createdBy = "merchant@tesco.com"
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/offers' -Method POST `
  -Body $body -ContentType 'application/json' -Headers $headers
```
Returns: Created offer with `status: "DRAFT"` and `validTransitions`.

### List Offers (paginated)
```
GET /api/v1/offers?status=LIVE&brand=LLOYDS&category=Groceries&page=0&size=20&sortBy=createdAt&sortDir=desc
Auth: Any
```

### Get Offer by ID
```
GET /api/v1/offers/{id}
Auth: Any
```

### Update Offer (DRAFT or PAUSED only)
```
PUT /api/v1/offers/{id}
Auth: MERCHANT, ADMIN
```

### Change Offer Status
```
PATCH /api/v1/offers/{id}/status
Auth: MERCHANT, ADMIN
```
```json
{
    "status": "PENDING_REVIEW",
    "reason": "Ready for compliance review",
    "changedBy": "merchant@tesco.com"
}
```

### Valid Status Transitions
| From | Can Go To |
|------|----------|
| DRAFT | PENDING_REVIEW, RETIRED |
| PENDING_REVIEW | APPROVED, DRAFT, RETIRED |
| APPROVED | LIVE, RETIRED |
| LIVE | PAUSED, EXPIRED, RETIRED |
| PAUSED | LIVE, RETIRED |
| EXPIRED | RETIRED |
| RETIRED | (terminal) |

---

## Partners API

```
GET    /api/v1/partners              -- List partners (Any role)
GET    /api/v1/partners/{id}         -- Get partner (Any role)
POST   /api/v1/partners              -- Create partner (MERCHANT, ADMIN)
PUT    /api/v1/partners/{id}         -- Update partner (MERCHANT, ADMIN)
PATCH  /api/v1/partners/{id}/status  -- Change status (ADMIN only)
```

Partner statuses: PENDING → APPROVED → SUSPENDED → DEACTIVATED

---

## Activations API

```
POST   /api/v1/activations           -- Activate an offer (CUSTOMER, ADMIN)
GET    /api/v1/activations           -- List activations (query: customerId)
```

---

## Transactions API

```
POST   /api/v1/transactions/simulate  -- Simulate a purchase (CUSTOMER, ADMIN)
GET    /api/v1/transactions           -- List transactions (role-filtered)
GET    /api/v1/transactions/cashback  -- Cashback summary (query: customerId)
```

---

## Eligibility API

```
POST   /api/v1/eligibility/check      -- Check eligibility (CUSTOMER, ADMIN)
```
```json
{
    "customerId": "00000000-0000-0000-0000-000000000002",
    "offerId": "YOUR-OFFER-ID"
}
```
Returns: `{ eligible: true/false, reasons: [...] }`

---

## Campaigns API (ADMIN only)

```
GET    /api/v1/campaigns                       -- List campaigns (paginated, ?status=ACTIVE)
POST   /api/v1/campaigns                       -- Create campaign
PUT    /api/v1/campaigns/{id}                  -- Update campaign (partial)
PATCH  /api/v1/campaigns/{id}/status           -- Change campaign status
POST   /api/v1/campaigns/{id}/offers/{offerId} -- Add offer to campaign
DELETE /api/v1/campaigns/{id}/offers/{offerId} -- Remove offer from campaign
```

Campaign statuses: DRAFT → SCHEDULED → ACTIVE → PAUSED → COMPLETED → ARCHIVED

---

## Analytics API

```
GET    /api/v1/analytics/offers                    -- Offer stats by status (MERCHANT, ADMIN)
GET    /api/v1/analytics/redemptions               -- Redemption summary (MERCHANT, ADMIN)
GET    /api/v1/analytics/revenue                   -- Revenue + tier breakdown (EXEC, COLLEAGUE)
GET    /api/v1/analytics/customer-insights/:id     -- AI customer profile summary (COLLEAGUE, EXEC)
```

---

## Audit API (ADMIN only)

```
GET    /api/v1/audit                     -- All audit entries (paginated)
GET    /api/v1/audit/offer/{offerId}     -- Audit entries for one offer
```

---

## Recommendations API (v1.2.0)

### For You (Customer)
```
GET    /api/v1/recommendations/for-you?limit=6&mode=rule-based
Auth: CUSTOMER, ADMIN
```

**Mode parameter:**
- `?mode=rule-based` — rule-based v2 scoring (default)
- `?mode=ai` — AI-powered recommendations (requires API key in .env)
- Also accepts header: `X-Personalization-Mode: ai`

Returns:
```json
{
  "source": "rule-based-v2",
  "mode": "rule-based",
  "customerId": "...",
  "customerSegment": "PREMIER",
  "lifecycleStage": "MATURE",
  "spendPattern": "EXPERIENCE_SEEKER",
  "totalCandidates": 28,
  "activatedCount": 4,
  "recommendations": [
    {
      "id": "...",
      "title": "Premier Inn 15% Cashback",
      "_score": 87,
      "_reason": "Matches EXPERIENCE_SEEKER pattern + Travel spending £1,249",
      "_mode": "rule-based"
    }
  ]
}
```

### A/B Comparison (new in v1.2.0)
```
GET    /api/v1/recommendations/compare?limit=6
Auth: CUSTOMER, ADMIN
```
Returns both modes side-by-side:
```json
{
  "customerId": "...",
  "customerSegment": "PREMIER",
  "ruleBased": { "recommendations": [...] },
  "ai": { "recommendations": [...] }
}
```

### Similar Offers
```
GET    /api/v1/recommendations/similar/{offerId}
Auth: Any
```

### Merchant Insights
```
GET    /api/v1/recommendations/merchant-insights
Auth: MERCHANT, ADMIN
```

### Merchant Next Offer (AI)
```
GET    /api/v1/recommendations/merchant-next-offer
Auth: MERCHANT, ADMIN
```

---

## Customer Profile API (v1.2.0) — customer-data-service port 8085

Proxied through BFF at `/api/v1/customers`:

```
GET    /api/v1/customers/{id}                 -- Full profile + classifications
GET    /api/v1/customers/{id}/summary         -- Lightweight summary (for BFF internal use)
GET    /api/v1/customers/{id}/classifications -- Classification tags only
```

Response:
```json
{
  "id": "c0000000-0000-0000-0000-000000000005",
  "firstName": "Alice",
  "lastName": "Johnson",
  "customerSegment": "PREMIER",
  "lifecycleStage": "MATURE",
  "spendPattern": "EXPERIENCE_SEEKER",
  "incomeBand": "OVER_100K",
  "primarySpendCategory": "Travel",
  "digitalEngagementScore": 89,
  "classifications": [
    { "classificationType": "AFFINITY", "classificationValue": "DINING_AFFINITY", "confidenceScore": 0.87 },
    { "classificationType": "PROPENSITY", "classificationValue": "HIGH_TRAVEL_PROPENSITY", "confidenceScore": 0.91 }
  ]
}
```

Direct service health:
```
GET    http://localhost:8085/api/v1/customers/health
```

---

## Banking Transactions API (v1.2.0) — transaction-data-service port 8086

Proxied through BFF at `/api/v1/banking-transactions`:

```
GET    /api/v1/banking-transactions/customer/{id}?after=<ISO8601>&limit=50
       -- Keyset-paginated transaction history
GET    /api/v1/banking-transactions/customer/{id}/spending-summary?periodType=QUARTERLY
       -- Category spending totals
```

Keyset pagination — use `after` to page through results:
```powershell
# First page
Invoke-RestMethod "http://localhost:3000/api/v1/banking-transactions/customer/$customerId" -Headers $headers

# Next page — use transaction_date of last item as cursor
Invoke-RestMethod "http://localhost:3000/api/v1/banking-transactions/customer/$customerId?after=2025-11-15T10:30:00Z&limit=20" -Headers $headers
```

Spending summary response:
```json
{
  "customerId": "...",
  "periodType": "QUARTERLY",
  "categories": [
    { "category": "Travel", "totalSpend": 1249.50, "transactionCount": 8, "avgTransaction": 156.19 },
    { "category": "Dining", "totalSpend": 408.50, "transactionCount": 12, "avgTransaction": 34.04 }
  ]
}
```

Direct service health:
```
GET    http://localhost:8086/api/v1/banking-transactions/health
```

---

## Mobile API (v1.2.0)

Slim-response endpoints for iOS/Android apps:

```
GET    /api/v1/mobile/home                   -- Home screen (greeting, stats, 6 offers)
GET    /api/v1/mobile/offers?slim=true       -- Slim offer list (id, title, cashbackRate, imageUrl, category)
POST   /api/v1/notifications/register        -- Register FCM push token
```

Mobile home response:
```json
{
  "greeting": "Good morning, Alice",
  "segment": "PREMIER",
  "stats": { "activatedOffers": 4, "pendingCashback": 42.50 },
  "featuredOffers": [...],
  "categories": ["Travel", "Dining", "Groceries"]
}
```

Push notification registration:
```json
{
  "fcmToken": "your-fcm-token",
  "platform": "ios"
}
```

---

## Exec Dashboard API

```
GET    /api/v1/exec/dashboard    -- KPIs, category ROI, tier breakdown, AI narrative (EXEC, COLLEAGUE)
```

---

## Commercial Customer API

```
GET    /api/v1/commercial        -- List commercial customers (COLLEAGUE, EXEC)
POST   /api/v1/commercial        -- Create commercial customer (COLLEAGUE)
PATCH  /api/v1/commercial/{id}/status -- Update KYB status (COLLEAGUE)
```

KYB statuses: PENDING_ONBOARDING → KYB_IN_PROGRESS → APPROVED / REJECTED

---

## Common Response Shapes

### Single Item
```json
{
    "id": "uuid-here",
    "title": "10% Cashback at Tesco",
    "status": "DRAFT",
    "validTransitions": ["PENDING_REVIEW", "RETIRED"]
}
```

### Paginated List
```json
{
    "content": [ ... ],
    "totalElements": 42,
    "totalPages": 3,
    "size": 20,
    "number": 0
}
```

### Error
```json
{
    "error": "Description of what went wrong",
    "correlationId": "unique-trace-id",
    "timestamp": "2026-02-21T10:00:00Z"
}
```

### HTTP Status Codes
| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful read or update |
| 201 | Created | Successful creation (POST) |
| 400 | Bad Request | Missing required field or invalid data |
| 401 | Unauthorized | Missing or invalid token/API key |
| 403 | Forbidden | Token valid but role insufficient |
| 404 | Not Found | Resource with that ID doesn't exist |
| 409 | Conflict | Invalid state transition or editing a LIVE offer |
| 429 | Too Many Requests | Rate limit exceeded (60/min for recommendations) |
| 503 | Service Unavailable | Circuit breaker OPEN — upstream service down |
| 500 | Server Error | Something broke — check server logs |
