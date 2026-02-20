package com.lbg.commerce.redemption.model;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateActivationRequest(
        @NotNull(message = "Customer ID is required")
        UUID customerId,

        @NotNull(message = "Offer ID is required")
        UUID offerId
) {}
