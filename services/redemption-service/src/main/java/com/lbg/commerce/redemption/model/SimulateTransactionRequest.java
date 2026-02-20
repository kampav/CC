package com.lbg.commerce.redemption.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record SimulateTransactionRequest(
        @NotNull(message = "Customer ID is required")
        UUID customerId,

        @NotNull(message = "Activation ID is required")
        UUID activationId,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        BigDecimal amount,

        String description,

        String cardLastFour
) {}
