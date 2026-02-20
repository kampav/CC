const express = require('express');
const axios   = require('axios');
const pool    = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const OFFER_SERVICE      = process.env.OFFER_SERVICE_URL      || 'http://localhost:8081';
const REDEMPTION_SERVICE = process.env.REDEMPTION_SERVICE_URL || 'http://localhost:8084';

function headers(req) {
  return { 'X-Correlation-Id': req.correlationId };
}

// GET /api/v1/analytics/offers?merchantId=...
router.get('/offers', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const params = req.query.merchantId ? { merchantId: req.query.merchantId } : {};
    const { data } = await axios.get(`${OFFER_SERVICE}/api/v1/offers/analytics/summary`, {
      headers: headers(req),
      params,
    });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Offer analytics error' } : err);
  }
});

// GET /api/v1/analytics/redemptions?merchantId=...
router.get('/redemptions', requireRole('MERCHANT', 'ADMIN'), async (req, res, next) => {
  try {
    const params = req.query.merchantId ? { merchantId: req.query.merchantId } : {};
    const { data } = await axios.get(`${REDEMPTION_SERVICE}/api/v1/redemptions/analytics/summary`, {
      headers: headers(req),
      params,
    });
    res.json(data);
  } catch (err) {
    next(err.response ? { status: err.response.status, message: err.response.data?.error || 'Redemption analytics error' } : err);
  }
});

// GET /api/v1/analytics/revenue  — bank commission revenue breakdown
router.get('/revenue', requireRole('EXEC', 'COLLEAGUE'), async (req, res, next) => {
  try {
    const { rows: summary } = await pool.query(`
      SELECT
        COALESCE(SUM(bank_revenue), 0)                                                         AS total_revenue,
        COALESCE(SUM(CASE WHEN ledger_date >= NOW() - INTERVAL '30 days' THEN bank_revenue END), 0) AS revenue_30d,
        COALESCE(SUM(CASE WHEN ledger_date >= NOW() - INTERVAL '7  days' THEN bank_revenue END), 0) AS revenue_7d,
        COUNT(*)                                                                               AS total_entries,
        COUNT(DISTINCT merchant_id)                                                            AS merchant_count,
        COUNT(DISTINCT customer_id)                                                            AS customer_count
      FROM redemptions.revenue_ledger
    `).catch(() => ({ rows: [{}] }));

    const { rows: byTier } = await pool.query(`
      SELECT merchant_tier, SUM(bank_revenue) AS revenue, COUNT(*) AS transactions
      FROM redemptions.revenue_ledger
      GROUP BY merchant_tier
      ORDER BY revenue DESC
    `).catch(() => ({ rows: [] }));

    const { rows: byDay } = await pool.query(`
      SELECT DATE_TRUNC('day', ledger_date) AS day,
             SUM(bank_revenue) AS revenue,
             COUNT(*) AS transactions
      FROM redemptions.revenue_ledger
      WHERE ledger_date >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1
    `).catch(() => ({ rows: [] }));

    res.json({
      summary: summary[0],
      byTier,
      dailyTrend: byDay,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/customer-insights/:customerId
router.get('/customer-insights/:customerId', requireRole('COLLEAGUE', 'EXEC'), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const aiKey = req.headers['x-ai-key'] ||
      process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    const [activationsRes, transactionsRes, cashbackRes] = await Promise.allSettled([
      axios.get(`${REDEMPTION_SERVICE}/api/v1/activations?customerId=${customerId}`, { timeout: 4000 }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/transactions?customerId=${customerId}`, { timeout: 4000 }),
      axios.get(`${REDEMPTION_SERVICE}/api/v1/transactions/cashback?customerId=${customerId}`, { timeout: 4000 }),
    ]);

    const activations   = activationsRes.status   === 'fulfilled' ? (Array.isArray(activationsRes.value.data)   ? activationsRes.value.data   : activationsRes.value.data.content   || []) : [];
    const transactions  = transactionsRes.status  === 'fulfilled' ? (Array.isArray(transactionsRes.value.data)  ? transactionsRes.value.data  : transactionsRes.value.data.content  || []) : [];
    const cashbackData  = cashbackRes.status       === 'fulfilled' ? cashbackRes.value.data : {};

    // Category breakdown
    const categoryCount = {};
    activations.forEach(a => {
      const cat = a.category || a.offerTitle?.split(' ')[0] || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const totalSpend = transactions.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const totalCashback = cashbackData.totalCashback || cashbackData.totalCashbackPaid || 0;

    // AI profile summary
    let aiSummary = null;
    if (aiKey && activations.length > 0) {
      const prompt = `You are a bank's AI analyst. Write a 3-sentence profile for this customer based on their loyalty data. Be specific, professional, and suggest one campaign recommendation.
Activations: ${activations.length}, Categories: ${JSON.stringify(categoryCount)}, Total spend: £${totalSpend.toFixed(2)}, Cashback earned: £${parseFloat(totalCashback).toFixed(2)}`;
      try {
        if (aiKey.startsWith('sk-ant-')) {
          const { data } = await axios.post('https://api.anthropic.com/v1/messages',
            { model: 'claude-haiku-4-5-20251001', max_tokens: 200, messages: [{ role: 'user', content: prompt }] },
            { headers: { 'x-api-key': aiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 8000 });
          aiSummary = data.content?.[0]?.text?.trim();
        } else if (aiKey.startsWith('sk-')) {
          const { data } = await axios.post('https://api.openai.com/v1/chat/completions',
            { model: 'gpt-4o-mini', max_tokens: 200, messages: [{ role: 'user', content: prompt }] },
            { headers: { Authorization: `Bearer ${aiKey}`, 'Content-Type': 'application/json' }, timeout: 8000 });
          aiSummary = data.choices?.[0]?.message?.content?.trim();
        } else if (aiKey.startsWith('AIza')) {
          const { data } = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiKey}`,
            { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 200 } }, { timeout: 8000 });
          aiSummary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      } catch (_) { /* fall through */ }
    }

    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
    if (!aiSummary) {
      aiSummary = `This customer has activated ${activations.length} offers, primarily in ${topCategory}. ` +
        `Total spend tracked: £${totalSpend.toFixed(2)}, cashback earned: £${parseFloat(totalCashback).toFixed(2)}. ` +
        `Recommended: target with a personalised ${topCategory} campaign for next quarter.`;
    }

    res.json({
      customerId,
      activationCount: activations.length,
      transactionCount: transactions.length,
      totalSpendGbp: parseFloat(totalSpend.toFixed(2)),
      totalCashbackGbp: parseFloat(parseFloat(totalCashback).toFixed(2)),
      categoryBreakdown: categoryCount,
      topCategory,
      recentActivations: activations.slice(0, 5),
      recentTransactions: transactions.slice(0, 5),
      aiSummary,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
