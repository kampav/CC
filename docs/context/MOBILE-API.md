# Mobile API — Connected Commerce v1.2.0

The BFF provides slim, efficient endpoints for iOS (Swift) and Android (Kotlin) native clients.
All endpoints use the same JWT Bearer auth as the web apps.

## Auth

```
Authorization: Bearer <jwt_token>
```

Login flow is identical to web — POST `/api/v1/auth/login` with `{ email, password }`.

## Platform Detection

Mobile clients should set the `User-Agent` header:

| Platform | User-Agent |
|----------|-----------|
| iOS      | `CCPlatform-iOS/1.0` |
| Android  | `CCPlatform-Android/1.0` |

When this User-Agent is detected, slim response mode activates automatically (heavy fields stripped).

## URL Scheme (Deep Links)

| Action | URL |
|--------|-----|
| View offer | `ccplatform://offer/{id}` |
| View cashback | `ccplatform://cashback` |
| Browse category | `ccplatform://browse?category=Travel` |

## Slim Mode

Add `?slim=true` to any request to strip heavy fields (description, terms, imageUrl full res, etc.).
Slim offer fields: `id`, `title`, `cashbackRate`, `category`, `imageUrl`, `endDate`, `brand`.

## Endpoints

### Home Screen
```
GET /api/v1/mobile/home
Authorization: Bearer <token>

Response:
{
  "greeting": "Good morning, Alice!",
  "stats": { "activeOffers": 3, "totalCashback": 47.50, "availableOffers": 28 },
  "offers": [ { "id": "...", "title": "...", "cashbackRate": 10, "category": "Travel" } ],
  "categories": ["Travel", "Dining", "Electronics"]
}
```

### Offer List (Slim)
```
GET /api/v1/mobile/offers?slim=true&category=Travel&size=20
Authorization: Bearer <token>

Response:
{
  "content": [ { "id": "...", "title": "...", "cashbackRate": 5 } ],
  "totalElements": 8,
  "totalPages": 1
}
```

### Personalised Feed (with mode)
```
GET /api/v1/recommendations/for-you?limit=6&mode=rule-based
GET /api/v1/recommendations/for-you?limit=6&mode=ai
Authorization: Bearer <token>
X-Personalization-Mode: ai   (alternative to query param)

Response:
{
  "mode": "rule-based",
  "customerSegment": "PREMIER",
  "recommendations": [
    { "id": "...", "title": "...", "_reason": "Travel affinity", "_mode": "rule-based" }
  ]
}
```

### Push Notification Registration
```
POST /api/v1/notifications/register
Authorization: Bearer <token>
Content-Type: application/json

Body: { "fcmToken": "...", "platform": "ios" }

Response: { "success": true, "customerId": "...", "platform": "ios" }
```

## ETag Support

The `/api/v1/mobile/offers` endpoint supports `If-None-Match` headers:
- Send `If-None-Match: <etag_from_previous_response>`
- Receive `304 Not Modified` if unchanged (saves bandwidth)

## Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 304  | Not Modified (ETag) |
| 401  | Token expired — re-login |
| 429  | Rate limit exceeded (60 req/min for recommendations) |
| 503  | Service unavailable (circuit breaker open) |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/v1/recommendations/*` | 60 req/min |
| All other `/api/v1/*` | 300 req/min |

## Circuit Breaker Headers

When an upstream service is unavailable, the BFF returns cached/fallback data and sets:
```
X-Circuit-Breaker: open
X-Fallback: true
```

## Versioning

Current version: `v1` (path prefix `/api/v1/`).
The BFF version is visible in `GET /health` → `{ "version": "1.2.0" }`.
