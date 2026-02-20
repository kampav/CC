package com.lbg.commerce.eligibility.model;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record EligibilityResponse(
        UUID customerId,
        List<UUID> eligibleOfferIds,
        Map<UUID, String> ineligibleReasons
) {}
