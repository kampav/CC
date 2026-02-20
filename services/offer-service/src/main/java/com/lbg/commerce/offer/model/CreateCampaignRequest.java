package com.lbg.commerce.offer.model;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record CreateCampaignRequest(
        @NotBlank(message = "Campaign name is required")
        String name,
        String description,
        String targetSegment,
        String targetBrands,
        Integer priority,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        BigDecimal budgetGbp,
        List<String> offerIds,
        String createdBy
) {}
