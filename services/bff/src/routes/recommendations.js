const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const OFFER_SERVICE = process.env.OFFER_SERVICE_URL || 'http://localhost:8081';
const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

// AI config — set one of these in .env, or pass X-AI-Key header per request.
const GEMINI_API_KEY    = process.env.GEMINI_API_KEY    || null;
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || null;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || null;
const DEFAULT_AI_KEY    = GEMINI_API_KEY || OPENAI_API_KEY || ANTHROPIC_API_KEY || null;

const GEMINI_MODEL    = 'gemini-1.5-flash';
const GEMINI_URL      = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const OPENAI_URL      = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL    = 'gpt-4o-mini';
const CLAUDE_URL      = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL    = 'claude-haiku-4-5-20251001';

/**
 * Detect provider from key prefix:
 *   sk-ant-… → claude (Anthropic)
 *   sk-…     → openai
 *   AIza…    → gemini (default)
 */
function detectProvider(key) {
  if (!key) return 'gemini';
  if (key.startsWith('sk-ant-')) return 'claude';
  if (key.startsWith('sk-'))    return 'openai';
  return 'gemini';
}

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId, 'Content-Type': 'application/json' };
}

/**
 * Call Google Gemini to rank offer candidates for a customer.
 * Returns [{offerId, reason}] or throws on failure.
 */
async function rankWithGemini(candidates, activations, limit, apiKey) {
  // Build customer preference summary from activation history
  const categoryFreq = {};
  const brandFreq = {};
  activations.forEach(a => {
    if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1;
    if (a.brand) brandFreq[a.brand] = (brandFreq[a.brand] || 0) + 1;
  });

  const offerList = candidates.slice(0, 30).map(o =>
    `ID:${o.id}|${o.title}|${o.category || 'General'}|${o.cashbackRate ? o.cashbackRate + '%' : 'free'}|brand:${o.brand}`
  ).join('\n');

  const prompt = `You are a personalisation engine for a UK bank's cashback rewards platform.

Customer history (category → activations): ${JSON.stringify(categoryFreq)}
Customer history (brand → activations): ${JSON.stringify(brandFreq)}

Available offers (pick top ${limit}):
${offerList}

Return ONLY a JSON array of the top ${limit} offer IDs, ranked by relevance to this customer.
Include a brief, friendly personalisation reason per offer (max 12 words, present tense).
Format: [{"offerId":"...","reason":"..."}]`;

  const response = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 512,
        temperature: 0.2,
      },
    },
    { timeout: 8000 }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return JSON.parse(text);
}

/**
 * Call OpenAI to rank offer candidates for a customer.
 * Returns [{offerId, reason}] or throws on failure.
 */
async function rankWithOpenAI(candidates, activations, limit, apiKey) {
  const categoryFreq = {};
  const brandFreq = {};
  activations.forEach(a => {
    if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1;
    if (a.brand) brandFreq[a.brand] = (brandFreq[a.brand] || 0) + 1;
  });

  const offerList = candidates.slice(0, 30).map(o =>
    `ID:${o.id}|${o.title}|${o.category || 'General'}|${o.cashbackRate ? o.cashbackRate + '%' : 'free'}|brand:${o.brand}`
  ).join('\n');

  const prompt = `You are a personalisation engine for a UK bank's cashback rewards platform.

Customer history (category → activations): ${JSON.stringify(categoryFreq)}
Customer history (brand → activations): ${JSON.stringify(brandFreq)}

Available offers (pick top ${limit}):
${offerList}

Return ONLY a JSON array of the top ${limit} offer IDs, ranked by relevance to this customer.
Include a brief, friendly personalisation reason per offer (max 12 words, present tense).
Format: [{"offerId":"...","reason":"..."}]`;

  const response = await axios.post(
    OPENAI_URL,
    {
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 512,
      temperature: 0.2,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  // OpenAI json_object mode wraps in an object — unwrap if needed
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.offers || Object.values(parsed)[0]);
}

/**
 * Call Anthropic Claude to rank offer candidates for a customer.
 * Returns [{offerId, reason}] or throws on failure.
 */
async function rankWithClaude(candidates, activations, limit, apiKey) {
  const categoryFreq = {};
  const brandFreq = {};
  activations.forEach(a => {
    if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1;
    if (a.brand)    brandFreq[a.brand]        = (brandFreq[a.brand]    || 0) + 1;
  });

  const offerList = candidates.slice(0, 30).map(o =>
    `ID:${o.id}|${o.title}|${o.category || 'General'}|${o.cashbackRate ? o.cashbackRate + '%' : 'free'}|brand:${o.brand}`
  ).join('\n');

  const prompt = `You are a personalisation engine for a UK bank's cashback rewards platform.

Customer history (category → activations): ${JSON.stringify(categoryFreq)}
Customer history (brand → activations): ${JSON.stringify(brandFreq)}

Available offers (pick top ${limit}):
${offerList}

Return ONLY a JSON array of the top ${limit} offer IDs, ranked by relevance to this customer.
Include a brief, friendly personalisation reason per offer (max 12 words, present tense).
Format: [{"offerId":"...","reason":"..."}]`;

  const response = await axios.post(
    CLAUDE_URL,
    {
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  const text = response.data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Claude response');
  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(clean);
}

/**
 * Rule-based scorer (fallback when Gemini is unavailable).
 */
function scoreOffers(allOffers, activations, limit) {
  const activatedIds = new Set(activations.map(a => a.offerId));
  const categoryScores = {};
  const brandScores = {};
  activations.forEach(a => {
    if (a.category) categoryScores[a.category] = (categoryScores[a.category] || 0) + 2;
    if (a.brand) brandScores[a.brand] = (brandScores[a.brand] || 0) + 1;
  });

  return allOffers
    .filter(o => !activatedIds.has(o.id))
    .map(o => {
      let score = 0;
      if (o.category && categoryScores[o.category]) score += categoryScores[o.category] * 10;
      if (o.brand && brandScores[o.brand]) score += brandScores[o.brand] * 5;
      if (o.cashbackRate) score += o.cashbackRate;
      if (o.createdAt) {
        const ageDays = (Date.now() - new Date(o.createdAt).getTime()) / 86400000;
        score += Math.max(0, 10 - ageDays);
      }
      if (o.endDate) {
        const daysLeft = (new Date(o.endDate).getTime() - Date.now()) / 86400000;
        if (daysLeft > 0 && daysLeft <= 7) score += 15;
      }
      return { ...o, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...o }) => o);
}

/**
 * GET /api/v1/recommendations/for-you
 * Personalised offer feed for the authenticated customer.
 * Uses Gemini AI when GEMINI_API_KEY is set; falls back to rule-based scoring.
 */
router.get('/for-you', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.userId;
    const limit = parseInt(req.query.limit) || 6;

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

    const allOffers = offersRes.status === 'fulfilled'
      ? (offersRes.value.data.content || []) : [];
    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data)
          ? activationsRes.value.data
          : activationsRes.value.data.content || [])
      : [];

    const activatedIds = new Set(activations.map(a => a.offerId));
    const candidates = allOffers.filter(o => !activatedIds.has(o.id));

    // Enrich activations with category/brand from offer data (not in ActivationResponse)
    const offerLookup = Object.fromEntries(allOffers.map(o => [o.id, o]));
    const enrichedActivations = activations.map(a => ({
      ...a,
      category: offerLookup[a.offerId]?.category ?? null,
      brand:    offerLookup[a.offerId]?.brand    ?? null,
    }));

    // ── AI path (Gemini or OpenAI) ──────────────────────────────
    // X-AI-Key header overrides env var — demo pages pass key at runtime
    const activeKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;
    if (activeKey && candidates.length > 0) {
      const provider = detectProvider(activeKey);
      try {
        let ranked;
        if (provider === 'openai')  ranked = await rankWithOpenAI(candidates, enrichedActivations, limit, activeKey);
        else if (provider === 'claude') ranked = await rankWithClaude(candidates, enrichedActivations, limit, activeKey);
        else                        ranked = await rankWithGemini(candidates, enrichedActivations, limit, activeKey);

        const offerMap = Object.fromEntries(allOffers.map(o => [o.id, o]));
        const recommendations = ranked
          .filter(r => offerMap[r.offerId])
          .map(r => ({ ...offerMap[r.offerId], _reason: r.reason }));

        const modelName = provider === 'openai' ? OPENAI_MODEL : provider === 'claude' ? CLAUDE_MODEL : GEMINI_MODEL;
        return res.json({
          source: provider,
          model: modelName,
          customerId,
          totalCandidates: candidates.length,
          activatedCount: activatedIds.size,
          recommendations,
        });
      } catch (aiErr) {
        const httpStatus = aiErr.response?.status;
        const detail = aiErr.response?.data?.error?.message || aiErr.response?.data?.error?.code || aiErr.message;
        console.warn(`[${req.correlationId}] ${provider} failed (HTTP ${httpStatus || 'N/A'}): ${detail} — falling back to rule-based`);
      }
    }

    // ── Rule-based fallback ─────────────────────────────────────
    const categoryScores = {};
    const brandScores = {};
    enrichedActivations.forEach(a => {
      if (a.category) categoryScores[a.category] = (categoryScores[a.category] || 0) + 2;
      if (a.brand) brandScores[a.brand] = (brandScores[a.brand] || 0) + 1;
    });

    const recommendations = scoreOffers(allOffers, enrichedActivations, limit);

    res.json({
      source: 'rule-based',
      customerId,
      totalCandidates: allOffers.length,
      activatedCount: activatedIds.size,
      categoryPreferences: categoryScores,
      brandPreferences: brandScores,
      scoringFactors: { categoryWeight: 10, brandWeight: 5, cashbackWeight: 1, urgencyBonus: 15 },
      recommendations,
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Recommendation error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/explain/:offerId
 * Uses Gemini to explain why an offer suits this customer.
 * Falls back to a rule-based explanation if Gemini is unavailable.
 */
router.get('/explain/:offerId', requireRole('CUSTOMER', 'ADMIN'), async (req, res, next) => {
  try {
    const customerId = req.userId;
    const { offerId } = req.params;

    const [offerRes, activationsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers/${offerId}`, { headers: headers(req) }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations`, {
        headers: headers(req),
        params: { customerId },
      }),
    ]);

    if (offerRes.status === 'rejected') {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const offer = offerRes.value.data;
    const activations = activationsRes.status === 'fulfilled'
      ? (Array.isArray(activationsRes.value.data)
          ? activationsRes.value.data
          : activationsRes.value.data.content || [])
      : [];

    const categoryFreq = {};
    activations.forEach(a => {
      if (a.category) categoryFreq[a.category] = (categoryFreq[a.category] || 0) + 1;
    });

    let explanation = null;

    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are a helpful bank assistant. Explain in 2 friendly sentences why this offer suits this customer.
Offer: "${offer.title}" — ${offer.category} — ${offer.cashbackRate ? offer.cashbackRate + '% cashback' : 'free experience'}
Customer's top categories: ${JSON.stringify(categoryFreq)}
Keep it warm, personal, and under 40 words.`;

        const response = await axios.post(
          `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 128, temperature: 0.4 },
          },
          { timeout: 6000 }
        );
        explanation = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      } catch (e) {
        console.warn(`[${req.correlationId}] Gemini explain failed:`, e.message);
      }
    }

    // Fallback explanation
    if (!explanation) {
      const topCategory = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
      explanation = topCategory && topCategory === offer.category
        ? `Based on your ${topCategory} spending history, this offer is a great match for your habits.`
        : `This ${offer.category} offer gives you ${offer.cashbackRate ? offer.cashbackRate + '% cashback' : 'a free experience'} with ${offer.title}.`;
    }

    res.json({
      offerId,
      offer: { title: offer.title, category: offer.category, cashbackRate: offer.cashbackRate },
      explanation,
      source: GEMINI_API_KEY ? 'gemini-ai' : 'rule-based',
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Explain error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/similar/:offerId
 * Returns offers similar to a given offer (same category/brand/type).
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
 * AI-powered "What should I offer next?" for merchants.
 */
router.get('/merchant-next-offer', requireRole('MERCHANT', 'COLLEAGUE', 'EXEC', 'ADMIN'), async (req, res, next) => {
  try {
    const aiKey = req.headers['x-ai-key'] || DEFAULT_AI_KEY;

    // Fetch current offers and analytics
    const [offersRes, analyticsRes] = await Promise.allSettled([
      axios.get(`${OFFER_SERVICE}/api/v1/offers`, { headers: headers(req), params: { size: 100 } }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/redemptions/analytics/summary`, { headers: headers(req) }),
    ]);

    const allOffers = offersRes.status === 'fulfilled' ? (offersRes.value.data.content || offersRes.value.data || []) : [];
    const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};

    // Build category performance
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

    // Rule-based fallback
    if (!suggestions) {
      const underRepresented = Object.entries(categoryStats)
        .filter(([, s]) => s.live === 0 && s.count > 0)
        .map(([cat]) => cat);
      const growthCategories = ['Health & Wellness', 'Sustainable Fashion', 'Electric Vehicle'];
      const suggest = [...underRepresented, ...growthCategories].slice(0, 3);
      suggestions = suggest.map(cat => ({
        title: `${cat} Cashback Offer`,
        category: cat,
        cashbackRate: 10,
        rationale: `${cat} is trending and has low current offer coverage on the platform.`,
      }));
    }

    res.json({
      source: aiKey ? detectProvider(aiKey) : 'rule-based',
      merchantId: req.userId,
      topPerformingCategory: topCategory,
      suggestions,
      categoryStats,
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Next offer error' } : err);
  }
});

/**
 * GET /api/v1/recommendations/merchant-insights
 * Returns targeting insights for merchants.
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
      if (!categoryPerformance[o.category]) {
        categoryPerformance[o.category] = { offers: 0, liveOffers: 0, totalActivations: 0 };
      }
      categoryPerformance[o.category].offers++;
      if (o.status === 'LIVE') categoryPerformance[o.category].liveOffers++;
      categoryPerformance[o.category].totalActivations += o.currentActivations || 0;
    });

    const brandDistribution = {};
    offers.forEach(o => {
      brandDistribution[o.brand] = (brandDistribution[o.brand] || 0) + 1;
    });

    const cashbackTiers = { '0-5%': 0, '5-10%': 0, '10-20%': 0, '20%+': 0 };
    offers.forEach(o => {
      const rate = o.cashbackRate || 0;
      if (rate <= 5) cashbackTiers['0-5%']++;
      else if (rate <= 10) cashbackTiers['5-10%']++;
      else if (rate <= 20) cashbackTiers['10-20%']++;
      else cashbackTiers['20%+']++;
    });

    res.json({
      source: 'rule-based',
      totalOffers: offers.length,
      analytics,
      categoryPerformance,
      brandDistribution,
      cashbackTiers,
      geminiEnabled: !!GEMINI_API_KEY,
      recommendations: [
        offers.filter(o => o.status === 'LIVE' && (o.currentActivations || 0) === 0).length > 0
          ? 'You have live offers with zero activations — consider promoting them'
          : null,
        Object.values(categoryPerformance).some(c => c.liveOffers === 0 && c.offers > 0)
          ? 'Some categories have no live offers — review pending offers'
          : null,
      ].filter(Boolean),
    });
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Insights error' } : err);
  }
});

module.exports = router;
