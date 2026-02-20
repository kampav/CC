package com.lbg.commerce.eligibility.service;

import com.lbg.commerce.eligibility.model.EligibilityRequest;
import com.lbg.commerce.eligibility.model.EligibilityResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class EligibilityService {

    private static final Logger log = LoggerFactory.getLogger(EligibilityService.class);

    @Value("${eligibility.max-active-offers-per-customer:10}")
    private int maxActiveOffers;

    private final RestTemplate restTemplate = new RestTemplate();

    public EligibilityResponse checkEligibility(EligibilityRequest request) {
        log.info("Checking eligibility: customerId={}, offerCount={}",
                request.customerId(), request.offerIds() != null ? request.offerIds().size() : 0);

        List<UUID> eligible = new ArrayList<>();
        Map<UUID, String> ineligible = new HashMap<>();

        // Check fatigue limit: how many active offers does this customer have?
        long activeCount = getActiveActivationCount(request.customerId());
        boolean fatigueExceeded = activeCount >= maxActiveOffers;

        if (request.offerIds() != null) {
            for (UUID offerId : request.offerIds()) {
                if (fatigueExceeded) {
                    ineligible.put(offerId, "Maximum active offers limit reached (" + maxActiveOffers + ")");
                } else {
                    eligible.add(offerId);
                }
            }
        }

        log.info("Eligibility result: customerId={}, eligible={}, ineligible={}",
                request.customerId(), eligible.size(), ineligible.size());

        return new EligibilityResponse(request.customerId(), eligible, ineligible);
    }

    private long getActiveActivationCount(UUID customerId) {
        String redemptionServiceUrl = System.getProperty("redemption.service.url", "http://localhost:8084");
        try {
            Long count = restTemplate.getForObject(
                    redemptionServiceUrl + "/api/v1/activations/count?customerId=" + customerId,
                    Long.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Failed to fetch activation count for customer {}: {}", customerId, e.getMessage());
            return 0; // Fail open: if we can't check, allow the offer
        }
    }
}
