# Demo Journey Plans — Connected Commerce v1.2.0

## Overview

v1.2.0 introduces 9 distinct customer personas, each with a bank-style profile (segment, lifecycle stage,
spend pattern, income band) and 90 days of seeded transaction history. Use these journeys to demonstrate
the contrast between rule-based scoring v2 and AI personalisation.

---

## Persona Reference

| Login | Name | Segment | Spend Pattern | Lifecycle | Key Spend Categories |
|-------|------|---------|---------------|-----------|---------------------|
| customer@demo.com | Alice Morgan | PREMIER | EXPERIENCE_SEEKER | MATURE | Travel + Dining |
| customer2@demo.com | Ben Clarke | MASS_AFFLUENT | BRAND_LOYAL | MATURE | Groceries + Health |
| customer3@demo.com | Cara Singh | MASS_MARKET | DEAL_SEEKER | NEW | Entertainment + Dining |
| customer4@demo.com | Dan Webb | PREMIER | BRAND_LOYAL | GROWING | Electronics + Travel |
| customer5@demo.com | Emma Hayes | MASS_AFFLUENT | CONVENIENCE_SHOPPER | GROWING | Fashion + Dining |
| customer6@demo.com | Frank Osei | MASS_MARKET | DEAL_SEEKER | AT_RISK | Groceries (discount) |
| customer7@demo.com | Grace Liu | PREMIER | EXPERIENCE_SEEKER | MATURE | Travel + Wellness |
| customer8@demo.com | Harry Patel | MASS_AFFLUENT | BRAND_LOYAL | GROWING | Electronics + Entertainment |
| customer9@demo.com | Isla Brown | MASS_MARKET | CONVENIENCE_SHOPPER | NEW | Groceries + Fashion |

All passwords: **demo1234**

---

## Journey 1: Alice (customer@demo.com) — PREMIER · EXPERIENCE_SEEKER

**Profile:** High-income Premier customer with strong travel and dining spend (~£1,665 in 90 days).

**Rule-based v2 demo:**
- Travel offers score highest (travel affinity 40 pts + EXPERIENCE_SEEKER +20 + PREMIER segment +15)
- Dining offers follow (secondary affinity)
- Lifecycle MATURE: stable scores, no urgency bonus

**AI demo:**
- AI generates narrative like: _"Based on your recent British Airways and Eurostar bookings, you'll love this exclusive Premier Inn deal"_
- Expect AI to surface more experience-based offers (wellness, fine dining, boutique travel)

**Key demo moment:** Toggle Rule/AI in header → observe Travel offers dominate both but AI provides richer reasoning.

---

## Journey 2: Ben (customer2@demo.com) — MASS_AFFLUENT · BRAND_LOYAL

**Profile:** Loyal Tesco and Boots customer. Consistent grocery + health spend (~£684 in 90 days).

**Rule-based v2 demo:**
- Grocery offers score high (brand loyalty match)
- BRAND_LOYAL pattern: +20 pts for matching brands (Tesco, Sainsbury's)
- Health & Wellness offers follow

**AI demo:**
- AI recognises brand patterns: _"Your regular Tesco shops make this Sainsbury's offer a natural extension"_

---

## Journey 3: Cara (customer3@demo.com) — MASS_MARKET · DEAL_SEEKER · NEW

**Profile:** New customer, student-age, low income. Entertainment + Dining.

**Rule-based v2 demo:**
- DEAL_SEEKER: offers with cashbackRate ≥ 10% get +20 pts
- NEW lifecycle: +15 onboarding bonus (every offer gets boosted)
- Low min_spend offers favoured (+15 CONVENIENCE points)

**Key demo moment:** Frank (AT_RISK) vs Cara (NEW) — different lifecycle bonuses on same offer set.

---

## Journey 4: Dan (customer4@demo.com) — PREMIER · BRAND_LOYAL · GROWING

**Profile:** Tech enthusiast, high digital engagement score (95/100). Electronics heavy (~£2,582).

**Rule-based v2 demo:**
- Electronics offers dominate (category affinity 40 pts from massive spend)
- BRAND_LOYAL + PREMIER: premium brands Apple, Amazon, Samsung surfaced first
- GROWING lifecycle: no urgency bonus but steady preference scoring

**AI demo:**
- AI picks up Apple/Amazon/Currys brand patterns and highlights tech ecosystem offers

---

## Journey 5: Emma (customer5@demo.com) — MASS_AFFLUENT · CONVENIENCE_SHOPPER · GROWING

**Profile:** Fashion-forward, card-linked offer candidate. Fashion + Dining (~£651).

**Rule-based v2 demo:**
- Fashion affinity strong (ASOS, Zara transactions)
- CONVENIENCE_SHOPPER: low min_spend offers get +15
- Card-linked offers favoured (CARD_LINKED_OFFER_PROPENSITY classification)

---

## Journey 6: Frank (customer6@demo.com) — MASS_MARKET · DEAL_SEEKER · AT_RISK ⚡ KEY DEMO

**Profile:** At-risk customer, low engagement, discount grocery shopper (Lidl, Aldi).

**Rule-based v2 demo:**
- **AT_RISK gets +25 retention urgency bonus** — highest lifecycle bonus
- DEAL_SEEKER + high cashback rate = maximum grocery deal scores
- Any offer with cashbackRate ≥ 10% gets surfaced first

**Verification:**
```powershell
$token = ((curl -s -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"customer6@demo.com","password":"demo1234"}') | ConvertFrom-Json).token

curl "http://localhost:3000/api/v1/recommendations/for-you?mode=rule-based" -H "Authorization: Bearer $token"
# Expect: high-cashback grocery offers with _reason containing "Retention offer"
```

---

## Journey 7: Grace (customer7@demo.com) — PREMIER · EXPERIENCE_SEEKER · MATURE

**Profile:** Similar to Alice but wellness-oriented (Virgin Active, spa). Travel + Wellness (~£1,567).

**AI demo differentiator:**
- AI should surface Premier Inn, Virgin Active, and wellness-adjacent offers
- Distinguish from Alice despite both being PREMIER + EXPERIENCE_SEEKER (different spend mix)

---

## Journey 8: Harry (customer8@demo.com) — MASS_AFFLUENT · BRAND_LOYAL · GROWING

**Profile:** Gaming + Electronics buyer. Amazon, Currys, PlayStation (~£1,377).

**Rule-based v2 demo:**
- Electronics + Entertainment split (gaming sits in Entertainment sub_category)
- BRAND_LOYAL + Amazon/Currys familiarity boosts those retailers

---

## Journey 9: Isla (customer9@demo.com) — MASS_MARKET · CONVENIENCE_SHOPPER · NEW

**Profile:** New customer, value fashion + grocery. Low min-spend offers ideal.

**Rule-based v2 demo:**
- NEW lifecycle: +15 onboarding bonus
- CONVENIENCE_SHOPPER: low min_spend preferred
- Mix of grocery + fashion (Tesco, Primark, Shein)

---

## A/B Demo Walkthrough (http://localhost:5173/demo)

1. Log in as **Frank** (customer6@demo.com) — AT_RISK, DEAL_SEEKER
2. Navigate to `/demo` — two-column layout appears
3. Left column (Rule-Based): high-cashback grocery/retention offers ranked first
4. Right column (AI): if AI key set, narrative explains churn risk and retention value
5. Click any offer card to expand the `_reason` annotation
6. Switch persona from Login to **Alice** — observe complete ranking change
7. Note the spending summary strip above the columns (real transaction data)

---

## Scale Architecture Notes

| Pattern | Detail |
|---------|--------|
| Kafka partitions | banking.transactions: 6 partitions (customer_id hash) |
| Redis cache | Customer profile: 5 min · Offers: 1 min · Spending: 15 min |
| Circuit breaker | Opens after 5 failures / 30s per upstream host |
| Keyset pagination | Transactions use `?after=<timestamp>` cursor (no OFFSET) |
| HikariCP | 20 max / 5 min idle per Java service |
| Cloud Run | min=1 (no cold start) · max=100 replicas per service |
