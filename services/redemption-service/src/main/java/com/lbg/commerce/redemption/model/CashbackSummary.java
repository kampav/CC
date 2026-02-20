package com.lbg.commerce.redemption.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CashbackSummary(
        UUID customerId,
        BigDecimal totalCashback,
        int totalTransactions,
        List<CashbackCreditResponse> credits
) {}
