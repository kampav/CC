package com.lbg.commerce.partner.model;

import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull(message = "Target status is required")
        PartnerStatus status,

        String reason,

        String changedBy
) {}
