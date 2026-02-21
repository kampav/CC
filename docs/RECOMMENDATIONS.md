# Personalisation & Recommendations

> **Version:** v1.2.0

## Overview

The platform supports two recommendation modes, switchable without code changes:

| Mode | Trigger | Latency | Explainability |
|------|---------|---------|----------------|
| Rule-Based v2 | `?mode=rule-based` (default) | ~50ms | Full score breakdown + reason per offer |
| AI Mode | `?mode=ai` + API key set | ~2-4s | Natural-language reason per offer |

Demo pages:
- `http://localhost:5173/demo` -- side-by-side A/B comparison
- `http://localhost:5173/login` -- persona selector (9 personas)

---

## Rule-Based Algorithm v2 (v1.2.0)

Deterministic, O(n), runs in-process. Pulls real spending data from transaction-data-service.

### Scoring Formula

```
score = categoryAffinity     (0-40 pts)
      + spendPatternMatch    (0-20 pts)
      + segmentAlignment     (0-15 pts)
      + lifecycleUrgency     (0-25 pts)
      + offerUrgency         (0-10 pts)
```

### Factor Details

**Category Affinity (0-40 pts)**
- Fetches 90-day spending summary from transaction-data-service
- Normalises spend by total portfolio spend
- Example: Travel is 60% of Alice's spending → Travel offers score up to 40 pts

**Spend Pattern Alignment (0-20 pts)**
- `DEAL_SEEKER` → rewards high cashback rate offers
- `BRAND_LOYAL` → rewards offers from brands in customer's history
- `EXPERIENCE_SEEKER` → rewards travel, dining, entertainment categories
- `CONVENIENCE_SHOPPER` → rewards contactless/online redemption types

**Segment Alignment (0-15 pts)**
- `PREMIER` / `PRIVATE` → rewards offers with min_spend > £50 (premium positioning)
- `MASS_MARKET` → rewards offers with min_spend < £20 (accessible)
- `MASS_AFFLUENT` → rewards mid-range

**Lifecycle Urgency (0-25 pts)**
- `AT_RISK` → +25 pts (retention: surface highest-value offers)
- `NEW` → +15 pts (onboarding: surface accessible offers)
- `GROWING` → +5 pts
- `MATURE` / `DORMANT` → +0 pts

**Offer Urgency (0-10 pts)**
- Expiring within 7 days → +10 pts
- Expiring within 30 days → +5 pts

### Response fields
```json
{
  "source": "rule-based-v2",
  "mode": "rule-based",
  "customerId": "c0000000-...-0005",
  "customerSegment": "PREMIER",
  "lifecycleStage": "MATURE",
  "spendPattern": "EXPERIENCE_SEEKER",
  "totalCandidates": 28,
  "activatedCount": 4,
  "recommendations": [
    {
      "id": "...",
      "title": "Premier Inn 15% Cashback",
      "cashbackRate": 15.0,
      "_score": 87,
      "_reason": "Matches EXPERIENCE_SEEKER pattern + Travel spending £1,249 (8 transactions)",
      "_mode": "rule-based"
    }
  ]
}
```

---

## Rule-Based Algorithm v1 (Legacy)

Original algorithm (still used if customer-data-service is unavailable):

```
score = (categoryScore[offer.category] x 10)
      + (brandScore[offer.brand] x 5)
      + (offer.cashbackRate)
      + 15  // if expiring within 7 days
```

Where `categoryScore` and `brandScore` are built from activation history:
- Each category activation → +2 to that category's score
- Each brand activation → +1 to that brand's score

---

## AI Mode

### How it works
1. Fetches customer profile from customer-data-service (segment, lifecycle, spend_pattern)
2. Fetches 90-day spending summary from transaction-data-service
3. Same data fetch + filter as rule-based (removes already-activated offers)
4. Builds a natural-language prompt including segment, lifecycle, spend_pattern, income_band, top spending categories, classification tags
5. Sends to AI model with up to 30 candidates
6. Parses `[{offerId, reason}]` array
7. Maps back to full offer objects, attaches `_reason` field

### Enabling

Set ONE key in `services/bff/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-...   # Claude (claude-haiku-4-5-20251001)
OPENAI_API_KEY=sk-...          # OpenAI (gpt-4o-mini)
GEMINI_API_KEY=AIza...         # Gemini (gemini-1.5-flash)
```

Key is auto-detected by prefix. Or pass per-request:
```
X-AI-Key: sk-ant-...
```

### Fallback
If AI returns an error (429 rate limit, auth failure, timeout >8s), the service **automatically falls back to rule-based v2** and logs the error. The response will show `"source": "rule-based-v2"`.

Check `C:\Projects\CC\extracted\connected-commerce\logs\bff-err.log` for the exact error.

---

## A/B Mode Toggle

Switch modes without changing code:

```powershell
# Login and get token
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method POST `
  -ContentType 'application/json' -Body '{"email":"customer6@demo.com","password":"demo1234"}'
$token = $resp.token
$h = @{ Authorization = "Bearer $token" }

# Rule-based v2 (Frank - AT_RISK - expect retention offers)
Invoke-RestMethod 'http://localhost:3000/api/v1/recommendations/for-you?mode=rule-based' -Headers $h

# AI mode
Invoke-RestMethod 'http://localhost:3000/api/v1/recommendations/for-you?mode=ai' -Headers $h

# Both side-by-side
Invoke-RestMethod 'http://localhost:3000/api/v1/recommendations/compare' -Headers $h
```

Or use the header:
```powershell
$h = @{ Authorization = "Bearer $token"; "X-Personalization-Mode" = "ai" }
Invoke-RestMethod 'http://localhost:3000/api/v1/recommendations/for-you' -Headers $h
```

---

## Customer App Toggle

In the Customer App (`http://localhost:5173`):
- Header pill toggle: **[Rule-Based | AI Powered]**
- Mode persisted to `localStorage` key: `cc_persona_mode`
- Mode badge shown on each offer card (grey "RULES" or purple "AI")
- `_reason` shown on expand/hover

Demo page (`http://localhost:5173/demo`):
- Two-column layout: Rule-Based | AI
- Both modes fetched simultaneously
- Score breakdown visible in rule-based column

---

## Customer Personas for Demo (v1.2.0)

| Persona | Login | Segment | Pattern | Lifecycle | Best Demo |
|---------|-------|---------|---------|-----------|-----------|
| Alice | customer@ | PREMIER | EXPERIENCE_SEEKER | MATURE | Travel + dining offers, high scores |
| Ben | customer2@ | MASS_AFFLUENT | BRAND_LOYAL | MATURE | Brand-matched offers (Tesco, Boots) |
| Cara | customer3@ | MASS_MARKET | DEAL_SEEKER | NEW | High cashback% + onboarding boost |
| Dan | customer4@ | PREMIER | BRAND_LOYAL | GROWING | Electronics: Amazon/Currys/Apple |
| Emma | customer5@ | MASS_AFFLUENT | CONVENIENCE_SHOPPER | GROWING | Fashion + online/contactless |
| Frank | customer6@ | MASS_MARKET | DEAL_SEEKER | AT_RISK | Retention: +25pts, high-value urgent offers |
| Grace | customer7@ | PREMIER | EXPERIENCE_SEEKER | MATURE | Travel + wellness blend |
| Harry | customer8@ | MASS_AFFLUENT | BRAND_LOYAL | GROWING | Electronics + gaming |
| Isla | customer9@ | MASS_MARKET | CONVENIENCE_SHOPPER | NEW | Onboarding: low min_spend offers |

**Best demo contrast:** Login as Frank (AT_RISK) vs Alice (PREMIER) -- dramatically different offer rankings.

---

## Caching

Redis caches upstream calls to avoid latency on repeated requests:

| Data | TTL | Redis Key Pattern |
|------|-----|------------------|
| Customer profile (customer-data-service) | 300s | `customer:profile:<uuid>` |
| All LIVE offers (offer-service) | 60s | `offers:live` |
| Customer spending summary (transaction-data-service) | 900s | `customer:spending:<uuid>` |

Cache is bypassed on first request, warmed on subsequent requests. If Redis is down, BFF fetches uncached (no service disruption).

---

## Adding a New Application

To onboard a new app into the recommendation system:

1. Authenticate: `POST /api/v1/auth/login` → get JWT token
2. Call `GET /api/v1/recommendations/for-you?mode=rule-based` with `Authorization: Bearer <token>`
3. Optionally add `?mode=ai` or `X-Personalization-Mode: ai` header to enable AI mode
4. Use `?limit=N` (default 6, max ~30)
5. For mobile: add `User-Agent: CCPlatform-iOS/1.0` or `CCPlatform-Android/1.0` for slim responses

No other integration needed -- the BFF handles all upstream service calls.
