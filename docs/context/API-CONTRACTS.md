# Connected Commerce - API Contracts

> **WHAT IS THIS?** This file documents every URL (endpoint) our app responds to. When you visit a URL or send data to it, this tells you what to send and what you'll get back.

---

## Authentication

All API requests through the BFF require an `X-API-Key` header:

| API Key | Role | Description |
|---------|------|-------------|
| `customer-demo-key` | CUSTOMER | Bank customer access |
| `merchant-demo-key` | MERCHANT | Merchant access |
| `admin-demo-key` | ADMIN | Full colleague/admin access |

```powershell
# Example: Add header to all requests
$headers = @{ "X-API-Key" = "merchant-demo-key" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/offers" -Headers $headers
```

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
$headers = @{ "X-API-Key" = "merchant-demo-key" }
$body = @{
    merchantId = "00000000-0000-0000-0000-000000000001"
    title = "10% Cashback at Tesco"
    description = "Get 10% back on all grocery purchases over £10"
    offerType = "CASHBACK"
    category = "Groceries"
    cashbackRate = 10.00
    cashbackCap = 50.00
    minSpend = 10.00
    terms = "Maximum cashback £50 per month."
    brand = "LLOYDS"
    redemptionType = "CARD_LINKED"
    maxActivations = 5000
    imageUrl = "https://example.com/offer-image.png"
    createdBy = "merchant@tesco.com"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/offers" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```
Returns: Created offer with `status: "DRAFT"` and `validTransitions`.

### List Offers (paginated)
```
GET /api/v1/offers?status=LIVE&brand=LLOYDS&category=Groceries&page=0&size=20&sortBy=createdAt&sortDir=desc
Auth: Any
```
Parameters:
- `page` — page number (default: 0)
- `size` — items per page, max 100 (default: 20)
- `status` — DRAFT, PENDING_REVIEW, APPROVED, LIVE, PAUSED, EXPIRED, RETIRED
- `merchantId` — filter by merchant UUID
- `brand` — LLOYDS, HALIFAX, BOS, SCOTTISH_WIDOWS
- `category` — any category string
- `sortBy` — field to sort (default: createdAt)
- `sortDir` — asc or desc (default: desc)

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
Only include fields you want to change. Fields: title, description, offerType, category, cashbackRate, cashbackCap, minSpend, terms, brand, redemptionType, maxActivations, imageUrl, startDate, endDate.

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
GET    /api/v1/partners              — List partners (Any role)
GET    /api/v1/partners/{id}         — Get partner (Any role)
POST   /api/v1/partners              — Create partner (MERCHANT, ADMIN)
PUT    /api/v1/partners/{id}         — Update partner (MERCHANT, ADMIN)
PATCH  /api/v1/partners/{id}/status  — Change status (ADMIN only)
```

Partner statuses: PENDING → APPROVED → SUSPENDED → DEACTIVATED

---

## Activations API

```
POST   /api/v1/activations           — Activate an offer (CUSTOMER, ADMIN)
GET    /api/v1/activations            — List activations (query: customerId)
```

### Activate an Offer
```powershell
$headers = @{ "X-API-Key" = "customer-demo-key" }
$body = @{
    customerId = "00000000-0000-0000-0000-000000000002"
    offerId = "YOUR-OFFER-ID"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/activations" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

---

## Transactions API

```
POST   /api/v1/transactions/simulate  — Simulate a purchase (CUSTOMER, ADMIN)
GET    /api/v1/transactions            — List transactions (role-filtered)
GET    /api/v1/transactions/cashback   — Cashback summary (query: customerId)
```

### Simulate Transaction
```powershell
$headers = @{ "X-API-Key" = "customer-demo-key" }
$body = @{
    customerId = "00000000-0000-0000-0000-000000000002"
    activationId = "YOUR-ACTIVATION-ID"
    amount = 50.00
    cardLastFour = "4321"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/transactions/simulate" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

### Transaction List (role-filtered)
- CUSTOMER role: automatically filtered to own transactions
- MERCHANT/ADMIN role: can query by `customerId` or `merchantId`, or see all

### Cashback Summary
```powershell
$headers = @{ "X-API-Key" = "customer-demo-key" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/transactions/cashback?customerId=00000000-0000-0000-0000-000000000002" -Headers $headers
```
Returns: `{ customerId, totalCashback, totalTransactions, credits: [...] }`

---

## Eligibility API

```
POST   /api/v1/eligibility/check      — Check eligibility (CUSTOMER, ADMIN)
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
GET    /api/v1/campaigns                       — List campaigns (paginated, ?status=ACTIVE)
POST   /api/v1/campaigns                       — Create campaign
PUT    /api/v1/campaigns/{id}                   — Update campaign (partial)
PATCH  /api/v1/campaigns/{id}/status            — Change campaign status
POST   /api/v1/campaigns/{id}/offers/{offerId}  — Add offer to campaign
DELETE /api/v1/campaigns/{id}/offers/{offerId}  — Remove offer from campaign
```

Campaign statuses: DRAFT → SCHEDULED → ACTIVE → PAUSED → COMPLETED → ARCHIVED

---

## Analytics API

```
GET    /api/v1/analytics/offers                — Offer stats by status (MERCHANT, ADMIN)
GET    /api/v1/analytics/redemptions           — Redemption summary (MERCHANT, ADMIN)
```

### Offer Analytics
Returns: `{ totalOffers, count_draft, count_live, count_pending_review, ... }`

### Redemption Analytics
Returns: `{ totalActivations, totalTransactions, totalCashbackPaid }`

Optional query: `?merchantId=UUID` for merchant-specific stats.

---

## Audit API (ADMIN only)

```
GET    /api/v1/audit                           — All audit entries (paginated)
GET    /api/v1/audit/offer/{offerId}           — Audit entries for one offer
```

---

## Recommendations API

### For You (Customer)
```
GET    /api/v1/recommendations/for-you?limit=6
Auth: CUSTOMER, ADMIN
```
Returns: `{ source, customerId, totalCandidates, activatedCount, categoryPreferences, recommendations: [...] }`

### Similar Offers
```
GET    /api/v1/recommendations/similar/{offerId}
Auth: Any
```
Returns: `{ offerId, similar: [...] }`

### Merchant Insights
```
GET    /api/v1/recommendations/merchant-insights
Auth: MERCHANT, ADMIN
```
Returns: `{ source, totalOffers, analytics, categoryPerformance, brandDistribution, cashbackTiers, recommendations: [...] }`

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
    "timestamp": "2026-02-18T10:00:00Z"
}
```

### HTTP Status Codes
| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful read or update |
| 201 | Created | Successful creation (POST) |
| 400 | Bad Request | Missing required field or invalid data |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | API key valid but role insufficient |
| 404 | Not Found | Resource with that ID doesn't exist |
| 409 | Conflict | Invalid state transition or editing a LIVE offer |
| 500 | Server Error | Something broke — check server logs |
