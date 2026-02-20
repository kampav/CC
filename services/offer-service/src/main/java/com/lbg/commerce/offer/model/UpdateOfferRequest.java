package com.lbg.commerce.offer.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record UpdateOfferRequest(
        @Size(max = 255)
        String title,

        String description,

        OfferType offerType,

        @Size(max = 100)
        String category,

        @DecimalMin("0.00")
        @DecimalMax("100.00")
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

        OffsetDateTime endDate
) {}
