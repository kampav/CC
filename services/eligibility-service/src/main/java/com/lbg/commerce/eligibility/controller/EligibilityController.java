package com.lbg.commerce.eligibility.controller;

import com.lbg.commerce.eligibility.model.EligibilityRequest;
import com.lbg.commerce.eligibility.model.EligibilityResponse;
import com.lbg.commerce.eligibility.service.EligibilityService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/eligibility")
public class EligibilityController {

    private static final Logger log = LoggerFactory.getLogger(EligibilityController.class);

    private final EligibilityService eligibilityService;

    public EligibilityController(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @PostMapping("/check")
    public ResponseEntity<EligibilityResponse> checkEligibility(
            @Valid @RequestBody EligibilityRequest request) {
        log.info("POST /api/v1/eligibility/check - customerId={}", request.customerId());
        EligibilityResponse response = eligibilityService.checkEligibility(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "eligibility-service",
                "status", "UP",
                "version", "0.1.0-SNAPSHOT",
                "timestamp", Instant.now().toString()
        ));
    }
}
