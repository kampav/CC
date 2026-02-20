package com.lbg.commerce.offer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/offers")
public class OfferHealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "offer-service",
                "status", "UP",
                "version", "0.1.0-SNAPSHOT",
                "timestamp", Instant.now().toString()
        ));
    }
}
