package com.lbg.commerce.redemption.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ActivationResponse(
        UUID id,
        UUID customerId,
        UUID offerId,
        String offerTitle,
        UUID merchantId,
        BigDecimal cashbackRate,
        BigDecimal cashbackCap,
        BigDecimal minSpend,
        ActivationStatus status,
        OffsetDateTime activatedAt,
        OffsetDateTime expiresAt
) {
    public static ActivationResponse from(Activation activation) {
        return new ActivationResponse(
                activation.getId(),
                activation.getCustomerId(),
                activation.getOfferId(),
                activation.getOfferTitle(),
                activation.getMerchantId(),
                activation.getCashbackRate(),
                activation.getCashbackCap(),
                activation.getMinSpend(),
                activation.getStatus(),
                activation.getActivatedAt(),
                activation.getExpiresAt()
        );
    }
}
