package com.lbg.commerce.offer.controller;

import com.lbg.commerce.offer.model.*;
import com.lbg.commerce.offer.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    public ResponseEntity<CampaignResponse> create(@Valid @RequestBody CreateCampaignRequest request) {
        Campaign campaign = campaignService.createCampaign(request);
        return ResponseEntity.status(201).body(CampaignResponse.from(campaign));
    }

    @GetMapping
    public ResponseEntity<Page<CampaignResponse>> list(
            @RequestParam(required = false) CampaignStatus status,
            Pageable pageable) {
        Page<CampaignResponse> page = campaignService.listCampaigns(status, pageable)
                .map(CampaignResponse::from);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponse> getById(@PathVariable UUID id) {
        return campaignService.getCampaign(id)
                .map(c -> ResponseEntity.ok(CampaignResponse.from(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignResponse> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        Campaign campaign = campaignService.updateCampaign(id, body);
        return ResponseEntity.ok(CampaignResponse.from(campaign));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(new HashMap<>(Map.of("error", "status is required")));
        }
        CampaignStatus target;
        try {
            target = CampaignStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new HashMap<>(Map.of("error", "Invalid status: " + statusStr)));
        }
        String changedBy = body.getOrDefault("changedBy", "system");
        Campaign campaign = campaignService.changeStatus(id, target, changedBy);
        return ResponseEntity.ok(CampaignResponse.from(campaign));
    }

    @PostMapping("/{id}/offers")
    public ResponseEntity<CampaignResponse> addOffers(
            @PathVariable UUID id,
            @RequestBody Map<String, List<String>> body) {
        List<String> offerIds = body.getOrDefault("offerIds", List.of());
        Campaign campaign = campaignService.addOffersToCampaign(id, offerIds);
        return ResponseEntity.ok(CampaignResponse.from(campaign));
    }

    @DeleteMapping("/{id}/offers/{offerId}")
    public ResponseEntity<CampaignResponse> removeOffer(
            @PathVariable UUID id,
            @PathVariable UUID offerId) {
        Campaign campaign = campaignService.removeOfferFromCampaign(id, offerId);
        return ResponseEntity.ok(CampaignResponse.from(campaign));
    }
}
