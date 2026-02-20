package com.lbg.commerce.offer.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateOfferRequest(
        @NotNull(message = "Merchant ID is required")
        UUID merchantId,

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be 255 characters or fewer")
        String title,

        String description,

        OfferType offerType,

        @Size(max = 100)
        String category,

        @DecimalMin(value = "0.00", message = "Cashback rate must be non-negative")
        @DecimalMax(value = "100.00", message = "Cashback rate cannot exceed 100%")
        BigDecimal cashbackRate,

        BigDecimal cashbackCap,

        BigDecimal minSpend,

        String terms,

        Brand brand,

        @Size(max = 500)
        String imageUrl,

        RedemptionType redemptionType,

        Integer maxActivations,

        OffsetDateTime startDate,

        OffsetDateTime endDate,

        String createdBy
) {}
