package com.lbg.commerce.partner.model;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record PartnerResponse(
        UUID id,
        String businessName,
        String tradingName,
        String registrationNumber,
        String contactEmail,
        String contactName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String postcode,
        PartnerStatus status,
        String category,
        String logoUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String createdBy,
        Set<PartnerStatus> validTransitions
) {
    public static PartnerResponse from(Partner partner) {
        return new PartnerResponse(
                partner.getId(),
                partner.getBusinessName(),
                partner.getTradingName(),
                partner.getRegistrationNumber(),
                partner.getContactEmail(),
                partner.getContactName(),
                partner.getPhone(),
                partner.getAddressLine1(),
                partner.getAddressLine2(),
                partner.getCity(),
                partner.getPostcode(),
                partner.getStatus(),
                partner.getCategory(),
                partner.getLogoUrl(),
                partner.getCreatedAt(),
                partner.getUpdatedAt(),
                partner.getCreatedBy(),
                partner.getStatus().validTransitions()
        );
    }
}
