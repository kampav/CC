package com.lbg.commerce.offer.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record OfferResponse(
        UUID id,
        UUID merchantId,
        String title,
        String description,
        OfferType offerType,
        String category,
        BigDecimal cashbackRate,
        BigDecimal cashbackCap,
        BigDecimal minSpend,
        String currency,
        String terms,
        OfferStatus status,
        Brand brand,
        String imageUrl,
        RedemptionType redemptionType,
        Integer maxActivations,
        int currentActivations,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String createdBy,
        Set<OfferStatus> validTransitions
) {
    public static OfferResponse from(Offer offer) {
        return new OfferResponse(
                offer.getId(),
                offer.getMerchantId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getOfferType(),
                offer.getCategory(),
                offer.getCashbackRate(),
                offer.getCashbackCap(),
                offer.getMinSpend(),
                offer.getCurrency(),
                offer.getTerms(),
                offer.getStatus(),
                offer.getBrand(),
                offer.getImageUrl(),
                offer.getRedemptionType(),
                offer.getMaxActivations(),
                offer.getCurrentActivations(),
                offer.getStartDate(),
                offer.getEndDate(),
                offer.getCreatedAt(),
                offer.getUpdatedAt(),
                offer.getCreatedBy(),
                offer.getStatus().validTransitions()
        );
    }
}
