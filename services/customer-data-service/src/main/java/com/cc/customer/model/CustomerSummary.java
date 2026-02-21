package com.cc.customer.model;

import java.util.UUID;

public record CustomerSummary(
    UUID id,
    String firstName,
    String customerSegment,
    String lifecycleStage,
    String spendPattern,
    String incomeBand,
    String primarySpendCategory,
    String secondarySpendCategory,
    Integer digitalEngagementScore
) {}
