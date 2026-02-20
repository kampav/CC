package com.lbg.commerce.offer.controller;

import com.lbg.commerce.offer.model.OfferAuditLog;
import com.lbg.commerce.offer.repository.OfferAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final OfferAuditLogRepository auditLogRepository;

    public AuditController(OfferAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/offers")
    public ResponseEntity<Page<OfferAuditLog>> listAll(Pageable pageable) {
        return ResponseEntity.ok(auditLogRepository.findAll(pageable));
    }

    @GetMapping("/offers/{offerId}")
    public ResponseEntity<List<OfferAuditLog>> byOffer(@PathVariable UUID offerId) {
        return ResponseEntity.ok(auditLogRepository.findByOfferIdOrderByChangedAtDesc(offerId));
    }
}
