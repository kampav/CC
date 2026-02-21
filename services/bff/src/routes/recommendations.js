const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');
const { cached, TTL } = require('../cache');

const router = express.Router();
const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';
const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';
const CUSTOMER_SERVICE = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8085';
const TRANSACTION_SERVICE = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:8086';

// AI config — set one in .env, or pass X-AI-Key header per request.
const GEMINI_API_KEY    = process.env.GEMINI_API_KEY    || null;
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || null;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || null;
const DEFAULT_AI_KEY    = GEMINI_API_KEY || OPENAI_API_KEY || ANTHROPIC_API_KEY || null;

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const OPENAI_URL   = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const CLAUDE_URL   = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

function detectProvider(key) {
  if (!key) return 'gemini';
  if (key.startsWith('sk-ant-')) return 'claude';
  if (key.startsWith('sk-'))     return 'openai';
  return 'gemini';
}

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' };
}

// ── v2 Rule-based Scorer ──────────────────────────────────────────────────────
/**
 * scoreOffersV2 — segment + spend-pattern aware scoring.
 * Factors:
 *   0-40 pts  Category affinity from real spending data
 *   0-20 pts  Spend pattern alignment
 *   0-15 pts  Segment alignment
 *   0-25 pts  Lifecycle urgency (AT_RISK +25, NEW +15)
 *   0-10 pts  Offer urgency (expiry < 7 days)
 *    +rate    Cashback rate added to score
 */
function scoreOffersV2(offers, profile, spendSummary, activations) {
  const activatedIds = new Set(activations.map(a => a.offerId));

  // Build category spend totals from transaction data
  const categorySpend = {};
  let totalSpend = 0;
  (spendSummary || []).forEach(s => {
    const amount = parseFloat(s.totalSpend || s.total_spend || 0);
    categorySpend[s.category] = amount;
    totalSpend += amount;
  });

  // Fallback: build from activation history if no spend data
  const categoryFreq = {};
  const brandFreq = {};
  activations.forEach(a => {
    if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 2;
    if (a.brand)    brandFreq[a.brand]        = (brandFreq[a.brand]    || 0) + 1;
  });

  const segment       = profile?.customerSegment || null;
  const lifecycle     = profile?.lifecycleStage  || null;
  const spendPattern  = profile?.spendPattern    || null;
  const primaryCat    = profile?.primarySpendCategory || null;
  const secondaryCat  = profile?.secondarySpendCategory || null;

  return offers
    .filter(o => !activatedIds.has(o.id))
    .map(o => {
      let score = 0;
      const reasons = [];

      // 1. Category affinity (0-40 pts) — from real transaction spend
      const offerCat = o.category;
      if (offerCat && totalSpend > 0) {
        const catSpend = categorySpend[offerCat] || 0;
        const affinityScore = Math.min(40, Math.round((catSpend / totalSpend) * 40 * 2));
        score += affinityScore;
        if (affinityScore > 10) reasons.push(`High ${offerCat} spend`);
      } else if (offerCat) {
        // Fallback to frequency
        const freq = categoryFreq[offerCat] || 0;
        score += Math.min(40, freq * 8);
        if (freq > 0) reasons.push(`${offerCat} match`);
      }

      // Also score brand affinity
      if (o.brand && brandFreq[o.brand]) {
        score += Math.min(10, brandFreq[o.brand] * 4);
        reasons.push(`${o.brand} affinity`);
      }

      // Profile-based category bonuses
      if (offerCat && primaryCat && offerCat.toLowerCase().includes(primaryCat.toLowerCase())) {
        score += 15;
        reasons.push('Primary category');
      } else if (offerCat && secondaryCat && offerCat.toLowerCase().includes(secondaryCat.toLowerCase())) {
        score += 8;
        reasons.push('Secondary category');
      }

      // 2. Spend pattern alignment (0-20 pts)
      if (spendPattern) {
        if (spendPattern === 'DEAL_SEEKER' && o.cashbackRate >= 10) {
          score += 20; reasons.push('High cashback match');
        } else if (spendPattern === 'DEAL_SEEKER' && o.cashbackRate >= 5) {
          score += 10;
        } else if (spendPattern === 'BRAND_LOYAL' && o.brand && brandFreq[o.brand]) {
          score += 20; reasons.push('Brand loyalty match');
        } else if (spendPattern === 'EXPERIENCE_SEEKER' && ['Travel','Dining','Entertainment'].includes(offerCat)) {
          score += 20; reasons.push('Experience offer');
        } else if (spendPattern === 'CONVENIENCE_SHOPPER' && (!o.minSpend || o.minSpend <= 20)) {
          score += 15; reasons.push('Low barrier offer');
        }
      }

      // 3. Segment alignment (0-15 pts)
      if (segment) {
        if (segment === 'PREMIER' && o.cashbackRate >= 8) {
          score += 15; reasons.push('Premium offer');
        } else if (segment === 'MASS_AFFLUENT' && o.cashbackRate >= 5) {
          score += 10;
        } else if ((segment === 'MASS_MARKET') && (!o.minSpend || o.minSpend <= 30)) {
          score += 10; reasons.push('Accessible offer');
        } else if (segment === 'PRIVATE') {
          score += 15;
        }
      }

      // 4. Lifecycle urgency
      if (lifecycle === 'AT_RISK') {
        score += 25; reasons.push('Retention offer');
      } else if (lifecycle === 'NEW') {
        score += 15; reasons.push('Welcome offer');
      }

      // 5. Cashback rate base score
      if (o.cashbackRate) score += parseFloat(o.cashbackRate);

      // 6. Offer urgency
      if (o.endDate) {
        const daysLeft = (new Date(o.endDate).getTime() - Date.now()) / 86400000;
        if (daysLeft > 0 && daysLeft <= 7) {
          score += 10; reasons.push('Ends soon');
        } else if (daysLeft > 0 && daysLeft <= 30) {
          score += 5;
        }
      }

      const reason = reasons.length > 0 ? reasons.slice(0, 2).join(' · ') : 'Recommended for you';
      return { ...o, _score: score, _reason: reason, _mode: 'rule-based' };
    })
    .sort((a, b) => b._score - a._score);
}

// ── Legacy v1 Rule-based (fallback when no profile data) ─────────────────────
function scoreOffersV1(allOffers, activations, limit) {
  const activatedIds = new Set(activations.map(a => a.offerId));
  const categoryScores = {};
  const brandScores = {};
  activations.forEach(a => {
    if (a.category) categoryScores[a.category] = (categoryScores[a.category] || 0) + 2;
    if (a.brand)    brandScores[a.brand]        = (brandScores[a.brand]    || 0) + 1;
  });

  return allOffers
    .filter(o => !activatedIds.has(o.id))
    .map(o => {
      let score = 0;
      if (o.category && categoryScores[o.category]) score += categoryScores[o.category] * 10;
      if (o.brand && brandScores[o.brand]) score += brandScores[o.brand] * 5;
      if (o.cashbackRate) score += o.cashbackRate;
      if (o.endDate) {
        const daysLeft = (new Date(o.endDate).getTime() - Date.now()) / 86400000;
        if (daysLeft > 0 && daysLeft <= 7) score += 15;
      }
      return { ...o, _score: score, _reason: 'Based on your activity', _mode: 'rule-based' };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

// ── AI ranking functions ──────────────────────────────────────────────────────
function buildAIPrompt(candidates, activations, profile, spendSummary, limit) {
  const categoryFreq = {};
  const brandFreq = {};
  activations.forEach(a => {
    if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1;
    if (a.brand)    brandFreq[a.brand]        = (brandFreq[a.brand]    || 0) + 1;
  });

  const profileSnippet = profile ? `
Customer segment: ${profile.customerSegment || 'unknown'}
Lifecycle stage: ${profile.lifecycleStage || 'unknown'}
Spend pattern: ${profile.spendPattern || 'unknown'}
Income band: ${profile.incomeBand || 'unknown'}
Primary spend: ${profile.primarySpendCategory || 'unknown'}
Classifications: ${(profile.classifications || []).map(c => c.classificationValue).join(', ')}` : '';

  const spendSnippet = spendSummary && spendSummary.length > 0
    ? `\nTop spending categories (90 days): ${spendSummary.slice(0, 5).map(s => `${s.category}: £${parseFloat(s.totalSpend || 0).toFixed(0)}`).join(', ')}`
    : '';

  const offerList = candidates.slice(0, 30).map(o =>
    `ID:${o.id}|${o.title}|${o.category || 'General'}|${o.cashbackRate ? o.cashbackRate + '%' : 'free'}|brand:${o.brand}|minSpend:£${o.minSpend || 0}`
  ).join('\n');

  return `You are a personalisation engine for a UK retail bank's cashback rewards platform.
${profileSnippet}${spendSnippet}
Activation history (category → count): ${JSON.stringify(categoryFreq)}
Activation history (brand → count): ${JSON.stringify(brandFreq)}

Available offers (pick top ${limit}):
${offerList}

Return ONLY a JSON array of the top ${limit} offer IDs, ranked by relevance to this customer.
Include a brief, friendly personalisation reason per offer (max 12 words, present tense).
Format: [{"offerId":"...","reason":"..."}]`;
}

async function rankWithGemini(candidates, activations, profile, spendSummary, limit, apiKey) {
  const prompt = buildAIPrompt(candidates, activations, profile, spendSummary, limit);
  const response = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 512, temperature: 0.2 } },
    { timeout: 8000 }
  );
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return JSON.parse(text);
}

async function rankWithOpenAI(candidates, activations, profile, spendSummary, limit, apiKey) {
  const prompt = buildAIPrompt(candidates, activations, profile, spendSummary, limit);
  const response = await axios.post(
    OPENAI_URL,
    { model: OPENAI_MODEL, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, max_tokens: 512, temperature: 0.2 },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 10000 }
  );
  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.offers || Object.values(parsed)[0]);
}

async function rankWithClaude(candidates, activations, profile, spendSummary, limit, apiKey) {
  const prompt = buildAIPrompt(candidates, activations, profile, spendSummary, limit);
  const response = await axios.post(
    CLAUDE_URL,
    { model: CLAUDE_MODEL, max_tokens: 512, messages: [{ role: 'user', content: prompt }] },
    { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 10000 }
  );
  const text = response.data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Claude response');
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

// ── Helper: fetch profile + spend from new services ──────────────────────────
async function fetchCustomerContext(customerId, req) {
  const [profileRes, spendRes] = await Promise.allSettled([
    axios.get(`${CUSTOMER_SERVICE}/api/v1/customers/${customerId}/summary`, {
      headers: headers(req), timeout: 2000,
    }),
    axios.get(`${TRANSACTION_SERVICE}/api/v1/banking-transactions/customer/${customerId}/spending-summary`, {
      headers: headers(req), params: { months: 3 }, timeout: 2000,
    }),
  ]);

  const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
  const spendRaw = spendRes.status === 'fulfilled' ? spendRes.value.data : null;
  const spendSummary = Array.isArray(spendRaw) ? spendRaw : (spendRaw?.categories || []);

  return { profile, spendSummary };
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/recommendations/for-you
 * Personalised offer feed. Supports ?mode=rule-based|ai or X-Personalization-Mode header.
 */
router.get('/for-you', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const limit = parseInt(req.query.limit) || 6;
    const mode = req.headers['x-personalization-mode'] || req.query.mode || 'rule-based';

    const [offersRes, activationsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, {
        headers: headers(req),
        params: { status: 'LIVE', size: 100 },
      }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, {
        headers: headers(req),
        params: { customerId },
      }),
    ]);

    const allOffers = offersRes.status === 'fulfilled' ? (offersRes.value.data.content || []) : [];
    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data) ? activationsRes.value.data : activationsRes.value.data.content || [])
      : [];

    const activatedIds = new Set(activations.map(a => a.offerId));
    const offerLookup = Object.fromEntries(allOffers.map(o => [o.id, o]));
    const enrichedActivations = activations.map(a => ({
      ...a,
      category: offerLookup[a.offerId]?.category ?? null,
      brand:    offerLookup[a.offerId]?.brand    ?? null,
    }));

    const candidates = allOffers.filter(o => !activatedIds.has(o.id));

    // Fetch customer context from new services (non-blocking — fallback to null if unavailable)
    const { profile, spendSummary } = await fetchCustomerContext(customerId, req);

    // ── AI mode ──────────────────────────────────────────────────────────────
    const activeKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;
    if ((mode === 'ai') && candidates.length > 0 && activeKey) {
      const provider = detectProvider(activeKey);
      try {
        let ranked;
        if (provider === 'openai')  ranked = await rankWithOpenAI(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);
        else if (provider === 'claude') ranked = await rankWithClaude(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);
        else                        ranked = await rankWithGemini(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);

        const offerMap = Object.fromEntries(allOffers.map(o => [o.id, o]));
        const recommendations = ranked
          .filter(r => offerMap[r.offerId])
          .map(r => ({ ...offerMap[r.offerId], _reason: r.reason, _mode: 'ai' }));

        const modelName = provider === 'openai' ? OPENAI_MODEL : provider === 'claude' ? CLAUDE_MODEL : GEMINI_MODEL;
        return res.json({
          mode: 'ai',
          source: provider,
          model: modelName,
          customerId,
          customerSegment: profile?.customerSegment || null,
          totalCandidates: candidates.length,
          activatedCount: activatedIds.size,
          recommendations,
          _meta: { scoringVersion: 'v2', customerSegment: profile?.customerSegment || null },
        });
      } catch (aiErr) {
        const detail = aiErr.response?.data?.error?.message || aiErr.message;
        console.warn(`[${req.correlationId}] ${provider} failed: ${detail} — falling back to rule-based`);
      }
    }

    // ── Rule-based v2 ─────────────────────────────────────────────────────────
    const scored = profile
      ? scoreOffersV2(allOffers, profile, spendSummary, enrichedActivations)
      : scoreOffersV1(allOffers, enrichedActivations, limit * 4);

    const recommendations = scored.slice(0, limit).map(({ _score, ...o }) => o);

    const categoryScores = {};
    const brandScores = {};
    enrichedActivations.forEach(a => {
      if (a.category) categoryScores[a.category] = (categoryScores[a.category] || 0) + 2;
      if (a.brand)    brandScores[a.brand]        = (brandScores[a.brand]    || 0) + 1;
    });

    res.json({
      mode: 'rule-based',
      source: 'rule-based',
      customerId,
      customerSegment: profile?.customerSegment || null,
      lifecycleStage: profile?.lifecycleStage || null,
      spendPattern: profile?.spendPattern || null,
      totalCandidates: candidates.length,
      activatedCount: activatedIds.size,
      categoryPreferences: categoryScores,
      brandPreferences: brandScores,
      scoringFactors: { categoryAffinity: '0-40', spendPattern: '0-20', segmentAlignment: '0-15', lifecycleUrgency: '0-25', offerUrgency: '0-10' },
      recommendations,
      _meta: { scoringVersion: 'v2', customerSegment: profile?.customerSegment || null },
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Recommendation error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/compare
 * Side-by-side rule-based vs AI comparison (demo endpoint).
 * Returns both sets simultaneously.
 */
router.get('/compare', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const limit = parseInt(req.query.limit) || 6;
    const activeKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;

    const [offersRes, activationsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, {
        headers: headers(req),
        params: { status: 'LIVE', size: 100 },
      }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, {
        headers: headers(req),
        params: { customerId },
      }),
    ]);

    const allOffers = offersRes.status === 'fulfilled' ? (offersRes.value.data.content || []) : [];
    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data) ? activationsRes.value.data : activationsRes.value.data.content || [])
      : [];

    const activatedIds = new Set(activations.map(a => a.offerId));
    const offerLookup = Object.fromEntries(allOffers.map(o => [o.id, o]));
    const enrichedActivations = activations.map(a => ({
      ...a,
      category: offerLookup[a.offerId]?.category ?? null,
      brand:    offerLookup[a.offerId]?.brand    ?? null,
    }));

    const { profile, spendSummary } = await fetchCustomerContext(customerId, req);

    // Always compute rule-based
    const scored = profile
      ? scoreOffersV2(allOffers, profile, spendSummary, enrichedActivations)
      : scoreOffersV1(allOffers, enrichedActivations, limit * 4);
    const ruleBasedRecs = scored.slice(0, limit).map(({ _score, ...o }) => o);

    // Try AI if key present
    let aiRecs = null;
    let aiSource = null;
    let aiError = null;

    const candidates = allOffers.filter(o => !activatedIds.has(o.id));
    if (activeKey && candidates.length > 0) {
      const provider = detectProvider(activeKey);
      try {
        let ranked;
        if (provider === 'openai')  ranked = await rankWithOpenAI(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);
        else if (provider === 'claude') ranked = await rankWithClaude(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);
        else                        ranked = await rankWithGemini(candidates, enrichedActivations, profile, spendSummary, limit, activeKey);

        const offerMap = Object.fromEntries(allOffers.map(o => [o.id, o]));
        aiRecs = ranked.filter(r => offerMap[r.offerId]).map(r => ({ ...offerMap[r.offerId], _reason: r.reason, _mode: 'ai' }));
        aiSource = provider;
      } catch (e) {
        aiError = e.message;
        console.warn(`[${req.correlationId}] compare AI failed:`, e.message);
      }
    }

    res.json({
      customerId,
      customerSegment: profile?.customerSegment || null,
      lifecycleStage: profile?.lifecycleStage || null,
      spendPattern: profile?.spendPattern || null,
      totalCandidates: candidates.length,
      activatedCount: activatedIds.size,
      ruleBasedRecommendations: ruleBasedRecs,
      aiRecommendations: aiRecs,
      aiSource,
      aiError,
      aiAvailable: !!activeKey,
      spendSummary: spendSummary ? spendSummary.slice(0, 5) : [],
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Compare error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/explain/:offerId
 */
router.get('/explain/:offerId', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.customerId || req.userId;
    const { offerId } = req.params;

    const [offerRes, activationsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers/${offerId}`, { headers: headers(req) }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, { headers: headers(req), params: { customerId } }),
    ]);

    if (offerRes.status === 'rejected') return res.status(404).json({ error: 'Offer not found' });

    const offer = offerRes.value.data;
    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data) ? activationsRes.value.data : activationsRes.value.data.content || [])
      : [];

    const categoryFreq = {};
    activations.forEach(a => { if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1; });

    let explanation = null;
    const activeKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;
    const { profile } = await fetchCustomerContext(customerId, req);

    if (activeKey) {
      const provider = detectProvider(activeKey);
      const prompt = `You are a helpful bank assistant. Explain in 2 friendly sentences why this offer suits this customer.
Offer: "${offer.title}" — ${offer.category} — ${offer.cashbackRate ? offer.cashbackRate + '% cashback' : 'free experience'}
Customer segment: ${profile?.customerSegment || 'unknown'}, spend pattern: ${profile?.spendPattern || 'unknown'}
Top categories: ${JSON.stringify(categoryFreq)}
Keep it warm, personal, and under 40 words.`;

      try {
        if (provider === 'claude') {
          const { data } = await axios.post(CLAUDE_URL,
            { model: CLAUDE_MODEL, max_tokens: 128, messages: [{ role: 'user', content: prompt }] },
            { headers: { 'x-api-key': activeKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 6000 });
          explanation = data.content?.[0]?.text?.trim();
        } else if (provider === 'openai') {
          const { data } = await axios.post(OPENAI_URL,
            { model: OPENAI_MODEL, max_tokens: 128, messages: [{ role: 'user', content: prompt }] },
            { headers: { Authorization: `Bearer ${activeKey}`, 'Content-Type': 'application/json' }, timeout: 6000 });
          explanation = data.choices?.[0]?.message?.content?.trim();
        } else {
          const { data } = await axios.post(`${GEMINI_URL}?key=${activeKey}`,
            { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 128, temperature: 0.4 } },
            { timeout: 6000 });
          explanation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      } catch (e) {
        console.warn(`[${req.correlationId}] explain AI failed:`, e.message);
      }
    }

    if (!explanation) {
      const topCategory = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
      explanation = topCategory && topCategory === offer.category
        ? `Based on your ${topCategory} spending, this offer is a great match for your habits.`
        : `This ${offer.category} offer gives you ${offer.cashbackRate ? offer.cashbackRate + '% cashback' : 'a free experience'} with ${offer.title}.`;
    }

    res.json({
      offerId,
      offer: { title: offer.title, category: offer.category, cashbackRate: offer.cashbackRate },
      explanation,
      source: activeKey ? detectProvider(activeKey) : 'rule-based',
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Explain error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/similar/:offerId
 */
router.get('/similar/:offerId', async (req, res, next) => {
  try {
    const [offerRes, allRes] = await Promise.all([
      axios.get(`${OFFER_SERVICE}/api/v1/offers/${req.params.offerId}`, { headers: headers(req) }),
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, { headers: headers(req), params: { status: 'LIVE', size: 50 } }),
    ]);

    const targetOffer = offerRes.data;
    const allOffers = allRes.data.content || [];

    const similar = allOffers
      .filter(o => o.id !== targetOffer.id)
      .map(o => {
        let score = 0;
        if (o.category === targetOffer.category) score += 20;
        if (o.brand === targetOffer.brand) score += 10;
        if (o.offerType === targetOffer.offerType) score += 5;
        return { ...o, _score: score };
      })
      .filter(o => o._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 4)
      .map(({ _score, ...o }) => o);

    res.json({ offerId: req.params.offerId, similar });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Similar offers error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/merchant-next-offer
 */
router.get('/merchant-next-offer', requireRole('MERCHANT', 'COLLEAGUE', 'EXEC', 'ADMIN'), async (req, res, next) => {
  try {
    const aiKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;

    const [offersRes, analyticsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, { headers: headers(req), params: { size: 100 } }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/redemptions/analytics/summary`, { headers: headers(req) }),
    ]);

    const allOffers = offersRes.status === 'fulfilled' ? (offersRes.value.data.content || offersRes.value.data || []) : [];
    const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};

    const categoryStats = {};
    allOffers.forEach(o => {
      const cat = o.category || 'General';
      if (!categoryStats[cat]) categoryStats[cat] = { count: 0, live: 0, activations: 0 };
      categoryStats[cat].count++;
      if (o.status === 'LIVE') categoryStats[cat].live++;
      categoryStats[cat].activations += o.currentActivations || o.current_activations || 0;
    });

    const liveCount   = allOffers.filter(o => o.status === 'LIVE').length;
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1].activations - a[1].activations)[0]?.[0] || 'Dining';

    let suggestions = null;

    if (aiKey) {
      const provider = detectProvider(aiKey);
      const prompt = `You are a retail strategy AI for a UK bank's cashback rewards platform.
A merchant wants to know what cashback offer to launch next.

Current live offers by category: ${JSON.stringify(categoryStats)}
Platform analytics: ${JSON.stringify({ liveOffers: liveCount, ...analytics })}

Suggest 3 specific new cashback offer ideas with:
- offer title
- category
- suggested cashback rate (%)
- brief rationale (1 sentence)

Return ONLY JSON: [{"title":"...","category":"...","cashbackRate":5,"rationale":"..."}]`;

      try {
        let text;
        if (provider === 'claude') {
          const { data } = await axios.post(CLAUDE_URL,
            { model: CLAUDE_MODEL, max_tokens: 400, messages: [{ role: 'user', content: prompt }] },
            { headers: { 'x-api-key': aiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 10000 });
          text = data.content?.[0]?.text;
        } else if (provider === 'openai') {
          const { data } = await axios.post(OPENAI_URL,
            { model: OPENAI_MODEL, max_tokens: 400, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } },
            { headers: { Authorization: `Bearer ${aiKey}`, 'Content-Type': 'application/json' }, timeout: 10000 });
          text = data.choices?.[0]?.message?.content;
        } else {
          const { data } = await axios.post(`${GEMINI_URL}?key=${aiKey}`,
            { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 400, temperature: 0.4 } },
            { timeout: 10000 });
          text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }
        if (text) {
          const clean = text.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(clean);
          suggestions = Array.isArray(parsed) ? parsed : (parsed.suggestions || parsed.offers || Object.values(parsed)[0]);
        }
      } catch (aiErr) {
        console.warn(`[${req.correlationId}] merchant-next-offer AI error:`, aiErr.message);
      }
    }

    if (!suggestions) {
      const underRepresented = Object.entries(categoryStats)
        .filter(([, s]) => s.live === 0 && s.count > 0).map(([cat]) => cat);
      const growthCategories = ['Health & Wellness', 'Sustainable Fashion', 'Electric Vehicle'];
      suggestions = [...underRepresented, ...growthCategories].slice(0, 3).map(cat => ({
        title: `${cat} Cashback Offer`, category: cat, cashbackRate: 10,
        rationale: `${cat} is trending and has low current offer coverage on the platform.`,
      }));
    }

    res.json({ source: aiKey ? detectProvider(aiKey) : 'rule-based', merchantId: req.userId, topPerformingCategory: topCategory, suggestions, categoryStats });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Next offer error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/merchant-insights
 */
router.get('/merchant-insights', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const [offersRes, analyticsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, { headers: headers(req), params: { size: 100 } }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/redemptions/analytics/summary`, { headers: headers(req) }),
    ]);

    const offers = offersRes.status === 'fulfilled' ? (offersRes.value.data.content || []) : [];
    const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};

    const categoryPerformance = {};
    offers.forEach(o => {
      if (!o.category) return;
      if (!categoryPerformance[o.category]) categoryPerformance[o.category] = { offers: 0, liveOffers: 0, totalActivations: 0 };
      categoryPerformance[o.category].offers++;
      if (o.status === 'LIVE') categoryPerformance[o.category].liveOffers++;
      categoryPerformance[o.category].totalActivations += o.currentActivations || 0;
    });

    const brandDistribution = {};
    offers.forEach(o => { brandDistribution[o.brand] = (brandDistribution[o.brand] || 0) + 1; });

    const cashbackTiers = { '0-5%': 0, '5-10%': 0, '10-20%': 0, '20%+': 0 };
    offers.forEach(o => {
      const rate = o.cashbackRate || 0;
      if (rate <= 5) cashbackTiers['0-5%']++;
      else if (rate <= 10) cashbackTiers['5-10%']++;
      else if (rate <= 20) cashbackTiers['10-20%']++;
      else cashbackTiers['20%+']++;
    });

    res.json({
      source: 'rule-based', totalOffers: offers.length, analytics, categoryPerformance,
      brandDistribution, cashbackTiers, geminiEnabled: !!GEMINI_API_KEY,
      recommendations: [
        offers.filter(o => o.status === 'LIVE' && (o.currentActivations || 0) === 0).length > 0
          ? 'You have live offers with zero activations — consider promoting them' : null,
        Object.values(categoryPerformance).some(c => c.liveOffers === 0 && c.offers > 0)
          ? 'Some categories have no live offers — review pending offers' : null,
      ].filter(Boolean),
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Insights error' } : err);
  }
});

module.exports = router;
