package com.cc.customer.controller;

import com.cc.customer.model.Classification;
import com.cc.customer.model.CustomerProfile;
import com.cc.customer.model.CustomerSummary;
import com.cc.customer.service.CustomerProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerProfileService service;

    public CustomerController(CustomerProfileService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerProfile> getProfile(@PathVariable UUID id) {
        return service.getProfileWithClassifications(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<CustomerSummary> getSummary(@PathVariable UUID id) {
        return service.getSummary(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/classifications")
    public ResponseEntity<List<Classification>> getClassifications(@PathVariable UUID id) {
        List<Classification> classifications = service.getClassifications(id);
        return ResponseEntity.ok(classifications);
    }
}
