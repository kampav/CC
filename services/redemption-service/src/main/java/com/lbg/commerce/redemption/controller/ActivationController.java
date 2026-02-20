package com.lbg.commerce.redemption.controller;

import com.lbg.commerce.redemption.model.*;
import com.lbg.commerce.redemption.service.ActivationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activations")
public class ActivationController {

    private static final Logger log = LoggerFactory.getLogger(ActivationController.class);

    private final ActivationService activationService;

    public ActivationController(ActivationService activationService) {
        this.activationService = activationService;
    }

    @PostMapping
    public ResponseEntity<ActivationResponse> activateOffer(@Valid @RequestBody CreateActivationRequest request) {
        log.info("POST /api/v1/activations - customerId={}, offerId={}", request.customerId(), request.offerId());
        Activation activation = activationService.activateOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ActivationResponse.from(activation));
    }

    @GetMapping
    public ResponseEntity<List<ActivationResponse>> listActivations(@RequestParam UUID customerId) {
        List<Activation> activations = activationService.listCustomerActivations(customerId);
        return ResponseEntity.ok(activations.stream().map(ActivationResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivationResponse> getActivation(@PathVariable UUID id) {
        return activationService.getActivation(id)
                .map(a -> ResponseEntity.ok(ActivationResponse.from(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countActiveActivations(@RequestParam UUID customerId) {
        return ResponseEntity.ok(activationService.countActiveActivations(customerId));
    }
}
