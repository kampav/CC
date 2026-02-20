package com.lbg.commerce.offer.model;

import java.time.Instant;
import java.util.UUID;

public record OfferEvent(
        String eventType,
        UUID offerId,
        UUID merchantId,
        String title,
        OfferStatus status,
        OfferStatus previousStatus,
        String changedBy,
        String correlationId,
        Instant timestamp
) {
    public static OfferEvent created(Offer offer, String correlationId) {
        return new OfferEvent("offer.created", offer.getId(), offer.getMerchantId(),
                offer.getTitle(), offer.getStatus(), null, offer.getCreatedBy(),
                correlationId, Instant.now());
    }

    public static OfferEvent statusChanged(Offer offer, OfferStatus previousStatus,
                                            String changedBy, String correlationId) {
        return new OfferEvent("offer.status_changed", offer.getId(), offer.getMerchantId(),
                offer.getTitle(), offer.getStatus(), previousStatus, changedBy,
                correlationId, Instant.now());
    }
}
