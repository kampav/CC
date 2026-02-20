package com.lbg.commerce.offer.model;

import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull(message = "Target status is required")
        OfferStatus status,

        String reason,

        String changedBy
) {}
