package com.lbg.commerce.partner.controller;

import com.lbg.commerce.partner.model.*;
import com.lbg.commerce.partner.service.PartnerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/partners")
public class PartnerController {

    private static final Logger log = LoggerFactory.getLogger(PartnerController.class);

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    @PostMapping
    public ResponseEntity<PartnerResponse> createPartner(@Valid @RequestBody CreatePartnerRequest request) {
        log.info("POST /api/v1/partners - Creating partner: {}", request.businessName());
        Partner partner = partnerService.createPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(PartnerResponse.from(partner));
    }

    @GetMapping
    public ResponseEntity<Page<PartnerResponse>> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) PartnerStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);

        Page<Partner> partners;
        if (status != null) {
            partners = partnerService.listPartnersByStatus(status, pageable);
        } else {
            partners = partnerService.listPartners(pageable);
        }

        return ResponseEntity.ok(partners.map(PartnerResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartnerResponse> getPartner(@PathVariable UUID id) {
        return partnerService.getPartner(id)
                .map(partner -> ResponseEntity.ok(PartnerResponse.from(partner)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnerResponse> updatePartner(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePartnerRequest request) {
        log.info("PUT /api/v1/partners/{} - Updating partner", id);
        Partner partner = partnerService.updatePartner(id, request);
        return ResponseEntity.ok(PartnerResponse.from(partner));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PartnerResponse> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusChangeRequest request) {
        log.info("PATCH /api/v1/partners/{}/status - Changing to {}", id, request.status());
        Partner partner = partnerService.changeStatus(id, request);
        return ResponseEntity.ok(PartnerResponse.from(partner));
    }
}
