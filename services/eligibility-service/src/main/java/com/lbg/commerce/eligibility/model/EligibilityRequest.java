package com.lbg.commerce.eligibility.model;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record EligibilityRequest(
        @NotNull(message = "Customer ID is required")
        UUID customerId,

        String brand,

        List<UUID> offerIds
) {}
