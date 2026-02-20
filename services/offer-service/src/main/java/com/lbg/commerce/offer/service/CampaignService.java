package com.lbg.commerce.offer.service;

import com.lbg.commerce.offer.model.*;
import com.lbg.commerce.offer.repository.CampaignRepository;
import com.lbg.commerce.offer.repository.OfferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class CampaignService {

    private static final Logger log = LoggerFactory.getLogger(CampaignService.class);

    private final CampaignRepository campaignRepository;
    private final OfferRepository offerRepository;

    public CampaignService(CampaignRepository campaignRepository, OfferRepository offerRepository) {
        this.campaignRepository = campaignRepository;
        this.offerRepository = offerRepository;
    }

    @Transactional
    public Campaign createCampaign(CreateCampaignRequest request) {
        Campaign campaign = new Campaign();
        campaign.setName(request.name());
        campaign.setDescription(request.description());
        campaign.setTargetSegment(request.targetSegment() != null ? request.targetSegment() : "ALL");
        campaign.setTargetBrands(request.targetBrands());
        campaign.setPriority(request.priority() != null ? request.priority() : 0);
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        campaign.setBudgetGbp(request.budgetGbp());
        campaign.setCreatedBy(request.createdBy());
        campaign.setStatus(CampaignStatus.DRAFT);

        if (request.offerIds() != null && !request.offerIds().isEmpty()) {
            Set<Offer> offers = new HashSet<>();
            for (String offerId : request.offerIds()) {
                offerRepository.findById(UUID.fromString(offerId)).ifPresent(offers::add);
            }
            campaign.setOffers(offers);
        }

        Campaign saved = campaignRepository.save(campaign);
        log.info("Created campaign: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }

    @Transactional
    public Campaign updateCampaign(UUID id, Map<String, Object> updates) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found: " + id));

        if (updates.containsKey("name")) campaign.setName((String) updates.get("name"));
        if (updates.containsKey("description")) campaign.setDescription((String) updates.get("description"));
        if (updates.containsKey("targetSegment")) campaign.setTargetSegment((String) updates.get("targetSegment"));
        if (updates.containsKey("targetBrands")) campaign.setTargetBrands((String) updates.get("targetBrands"));
        if (updates.containsKey("priority")) campaign.setPriority(((Number) updates.get("priority")).intValue());
        if (updates.containsKey("budgetGbp") && updates.get("budgetGbp") != null) {
            campaign.setBudgetGbp(new BigDecimal(updates.get("budgetGbp").toString()));
        }
        if (updates.containsKey("startDate") && updates.get("startDate") != null) {
            campaign.setStartDate(OffsetDateTime.parse(updates.get("startDate").toString()));
        }
        if (updates.containsKey("endDate") && updates.get("endDate") != null) {
            campaign.setEndDate(OffsetDateTime.parse(updates.get("endDate").toString()));
        }

        log.info("Updated campaign: id={}, name={}", id, campaign.getName());
        return campaignRepository.save(campaign);
    }

    public Optional<Campaign> getCampaign(UUID id) {
        return campaignRepository.findById(id);
    }

    public Page<Campaign> listCampaigns(CampaignStatus status, Pageable pageable) {
        if (status != null) {
            return campaignRepository.findByStatus(status, pageable);
        }
        return campaignRepository.findAll(pageable);
    }

    @Transactional
    public Campaign changeStatus(UUID id, CampaignStatus targetStatus, String changedBy) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found: " + id));

        if (!campaign.getStatus().canTransitionTo(targetStatus)) {
            throw new IllegalStateException(
                    "Cannot transition campaign from " + campaign.getStatus() + " to " + targetStatus);
        }

        log.info("Campaign {} status change: {} -> {} by {}", id, campaign.getStatus(), targetStatus, changedBy);
        campaign.setStatus(targetStatus);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign addOffersToCampaign(UUID campaignId, List<String> offerIds) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found: " + campaignId));

        for (String offerId : offerIds) {
            offerRepository.findById(UUID.fromString(offerId)).ifPresent(offer -> {
                campaign.getOffers().add(offer);
                offer.setCampaignId(campaignId);
                offerRepository.save(offer);
            });
        }

        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign removeOfferFromCampaign(UUID campaignId, UUID offerId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new NoSuchElementException("Campaign not found: " + campaignId));

        campaign.getOffers().removeIf(o -> o.getId().equals(offerId));
        offerRepository.findById(offerId).ifPresent(offer -> {
            offer.setCampaignId(null);
            offerRepository.save(offer);
        });

        return campaignRepository.save(campaign);
    }
}
