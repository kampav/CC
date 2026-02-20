# Personalisation & Recommendations

## Overview

The platform supports two recommendation modes, switchable without code changes:

| Mode | Trigger | Latency | Explainability |
|------|---------|---------|----------------|
| Rule-Based | `GEMINI_API_KEY` empty | ~50ms | Full score breakdown |
| Gemini AI | `GEMINI_API_KEY` set, or `X-AI-Key` header | ~2–4s | Natural-language reason per offer |

Demo pages: `http://localhost:3000/demo/`

---

## Rule-Based Algorithm

Deterministic, O(n), runs in-process. No external calls.

### Steps

1. **Fetch** all LIVE offers (offer-service) + customer activations (redemption-service)
2. **Enrich** activations with `category`/`brand` from offer catalogue (activation records don't store these)
3. **Filter** out already-activated offers
4. **Score** each remaining candidate:

```
score = (categoryScore[offer.category] × 10)
      + (brandScore[offer.brand] × 5)
      + (offer.cashbackRate)          // e.g. 15% → +15
      + 15  // if expiring within 7 days
```

Where `categoryScore` and `brandScore` are built from the customer's activation history:
- Each category activation → +2 to that category's score
- Each brand activation → +1 to that brand's score

5. **Sort** descending, return top N

### Response fields
```json
{
  "source": "rule-based",
  "categoryPreferences": { "Groceries": 4, "Dining": 2 },
  "brandPreferences": { "BRAND_A": 3 },
  "scoringFactors": { "categoryWeight": 10, "brandWeight": 5, "cashbackWeight": 1, "urgencyBonus": 15 },
  "recommendations": [...]
}
```

---

## Gemini AI Mode

### How it works
1. Same data fetch & enrichment as rule-based
2. Builds a natural-language prompt with customer preference profile + up to 30 candidates
3. Sends to `gemini-2.0-flash` with `responseMimeType: application/json`
4. Parses `[{offerId, reason}]` array
5. Maps back to full offer objects, attaches `_reason` field

### Enabling
```bash
# services/bff/.env
GEMINI_API_KEY=AIzaSy...
```

Or pass `X-AI-Key: AIzaSy...` request header (overrides env var — useful for demo pages).

### Fallback
If Gemini returns an error (429 rate limit, auth failure, timeout >8s), the service **automatically falls back to rule-based** and logs the HTTP status + error detail. The response will show `"source": "rule-based"`.

Check `C:\Projects\CC\logs\bff-err.log` for the exact error.

### Free tier limits
- Gemini 2.0 Flash: 15 requests/minute, 1500/day on free tier
- For 25M customers, use a paid project — Gemini Flash is ~$0.075/1M input tokens

---

## Adding a New Application

To onboard a new app into the recommendation system:

1. Call `GET /api/v1/recommendations/for-you` with `X-API-Key: <key>`
2. Optionally pass `X-AI-Key: <gemini-key>` to enable AI mode per-request
3. Use query param `?limit=N` (default 6, max ~30)

No other integration needed — the BFF handles all upstream service calls.
