package com.lbg.commerce.partner.service;

import com.lbg.commerce.partner.model.*;
import com.lbg.commerce.partner.repository.PartnerAuditLogRepository;
import com.lbg.commerce.partner.repository.PartnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PartnerService {

    private static final Logger log = LoggerFactory.getLogger(PartnerService.class);

    private final PartnerRepository partnerRepository;
    private final PartnerAuditLogRepository auditLogRepository;

    public PartnerService(PartnerRepository partnerRepository, PartnerAuditLogRepository auditLogRepository) {
        this.partnerRepository = partnerRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public Partner createPartner(CreatePartnerRequest request) {
        log.info("Creating partner: businessName='{}', email={}", request.businessName(), request.contactEmail());

        if (partnerRepository.existsByContactEmail(request.contactEmail())) {
            throw new IllegalArgumentException("A partner with this email already exists: " + request.contactEmail());
        }

        Partner partner = new Partner();
        partner.setBusinessName(request.businessName());
        partner.setTradingName(request.tradingName());
        partner.setRegistrationNumber(request.registrationNumber());
        partner.setContactEmail(request.contactEmail());
        partner.setContactName(request.contactName());
        partner.setPhone(request.phone());
        partner.setAddressLine1(request.addressLine1());
        partner.setAddressLine2(request.addressLine2());
        partner.setCity(request.city());
        partner.setPostcode(request.postcode());
        partner.setCategory(request.category());
        partner.setLogoUrl(request.logoUrl());
        partner.setCreatedBy(request.createdBy());
        // MVP: auto-approve on registration
        partner.setStatus(PartnerStatus.APPROVED);

        Partner saved = partnerRepository.save(partner);

        // Audit the creation
        auditLogRepository.save(new PartnerAuditLog(
                saved.getId(), null, PartnerStatus.APPROVED, request.createdBy(), "Partner registered (auto-approved)"));

        log.info("Partner created: id={}, status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Partner> getPartner(UUID id) {
        return partnerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<Partner> listPartners(Pageable pageable) {
        return partnerRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Partner> listPartnersByStatus(PartnerStatus status, Pageable pageable) {
        return partnerRepository.findByStatus(status, pageable);
    }

    @Transactional
    public Partner updatePartner(UUID id, UpdatePartnerRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new PartnerNotFoundException(id));

        if (request.businessName() != null) partner.setBusinessName(request.businessName());
        if (request.tradingName() != null) partner.setTradingName(request.tradingName());
        if (request.registrationNumber() != null) partner.setRegistrationNumber(request.registrationNumber());
        if (request.contactEmail() != null) partner.setContactEmail(request.contactEmail());
        if (request.contactName() != null) partner.setContactName(request.contactName());
        if (request.phone() != null) partner.setPhone(request.phone());
        if (request.addressLine1() != null) partner.setAddressLine1(request.addressLine1());
        if (request.addressLine2() != null) partner.setAddressLine2(request.addressLine2());
        if (request.city() != null) partner.setCity(request.city());
        if (request.postcode() != null) partner.setPostcode(request.postcode());
        if (request.category() != null) partner.setCategory(request.category());
        if (request.logoUrl() != null) partner.setLogoUrl(request.logoUrl());

        log.info("Partner updated: id={}", id);
        return partnerRepository.save(partner);
    }

    @Transactional
    public Partner changeStatus(UUID id, StatusChangeRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new PartnerNotFoundException(id));

        PartnerStatus previousStatus = partner.getStatus();
        partner.transitionTo(request.status());

        Partner saved = partnerRepository.save(partner);

        auditLogRepository.save(new PartnerAuditLog(
                id, previousStatus, request.status(), request.changedBy(), request.reason()));

        log.info("Partner status changed: id={}, {} -> {}", id, previousStatus, request.status());
        return saved;
    }

    // ─── Custom Exceptions ──────────────────────────────

    public static class PartnerNotFoundException extends RuntimeException {
        public PartnerNotFoundException(UUID id) {
            super("Partner not found: " + id);
        }
    }
}
