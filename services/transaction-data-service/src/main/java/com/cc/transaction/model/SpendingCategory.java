package com.cc.transaction.model;

import java.math.BigDecimal;

public record SpendingCategory(
    String category,
    BigDecimal totalSpend,
    Integer transactionCount,
    BigDecimal avgTransaction
) {}
