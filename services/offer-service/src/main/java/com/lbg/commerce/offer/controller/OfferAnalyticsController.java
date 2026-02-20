package com.lbg.commerce.offer.controller;

import com.lbg.commerce.offer.model.OfferStatus;
import com.lbg.commerce.offer.repository.OfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers/analytics")
public class OfferAnalyticsController {

    private final OfferRepository offerRepository;

    public OfferAnalyticsController(OfferRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam(required = false) UUID merchantId) {

        Map<String, Object> summary = new LinkedHashMap<>();

        if (merchantId != null) {
            summary.put("merchantId", merchantId);
            for (OfferStatus status : OfferStatus.values()) {
                summary.put("count_" + status.name().toLowerCase(),
                        offerRepository.countByMerchantIdAndStatus(merchantId, status));
            }
        } else {
            long total = offerRepository.count();
            summary.put("totalOffers", total);
            for (OfferStatus status : OfferStatus.values()) {
                summary.put("count_" + status.name().toLowerCase(),
                        offerRepository.findByStatus(status, org.springframework.data.domain.Pageable.unpaged()).getTotalElements());
            }
        }

        return ResponseEntity.ok(summary);
    }
}
