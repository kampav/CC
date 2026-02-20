package com.lbg.commerce.offer.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record CampaignResponse(
        UUID id,
        String name,
        String description,
        CampaignStatus status,
        String targetSegment,
        String targetBrands,
        Integer priority,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        BigDecimal budgetGbp,
        BigDecimal spentGbp,
        int offerCount,
        List<CampaignOfferSummary> offers,
        Set<CampaignStatus> validTransitions,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record CampaignOfferSummary(UUID id, String title, String status, String category) {}

    public static CampaignResponse from(Campaign campaign) {
        List<CampaignOfferSummary> offerSummaries = campaign.getOffers().stream()
                .map(o -> new CampaignOfferSummary(o.getId(), o.getTitle(), o.getStatus().name(), o.getCategory()))
                .toList();
        return new CampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getDescription(),
                campaign.getStatus(),
                campaign.getTargetSegment(),
                campaign.getTargetBrands(),
                campaign.getPriority(),
                campaign.getStartDate(),
                campaign.getEndDate(),
                campaign.getBudgetGbp(),
                campaign.getSpentGbp(),
                campaign.getOffers().size(),
                offerSummaries,
                campaign.getStatus().validTransitions(),
                campaign.getCreatedBy(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt()
        );
    }
}
