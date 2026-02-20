package com.lbg.commerce.offer.service;

import com.lbg.commerce.offer.model.*;
import com.lbg.commerce.offer.repository.OfferAuditLogRepository;
import com.lbg.commerce.offer.repository.OfferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class OfferService {

    private static final Logger log = LoggerFactory.getLogger(OfferService.class);

    private final OfferRepository offerRepository;
    private final OfferAuditLogRepository auditLogRepository;
    private final OfferEventPublisher eventPublisher;

    public OfferService(OfferRepository offerRepository, OfferAuditLogRepository auditLogRepository,
                        OfferEventPublisher eventPublisher) {
        this.offerRepository = offerRepository;
        this.auditLogRepository = auditLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Offer createOffer(CreateOfferRequest request) {
        log.info("Creating offer: title='{}', merchantId={}", request.title(), request.merchantId());

        Offer offer = new Offer();
        offer.setMerchantId(request.merchantId());
        offer.setTitle(request.title());
        offer.setDescription(request.description());
        offer.setOfferType(request.offerType() != null ? request.offerType() : OfferType.CASHBACK);
        offer.setCategory(request.category());
        offer.setCashbackRate(request.cashbackRate());
        offer.setCashbackCap(request.cashbackCap());
        offer.setMinSpend(request.minSpend());
        offer.setTerms(request.terms());
        offer.setBrand(request.brand() != null ? request.brand() : Brand.BRAND_A);
        offer.setImageUrl(request.imageUrl());
        offer.setRedemptionType(request.redemptionType() != null ? request.redemptionType() : RedemptionType.CARD_LINKED);
        offer.setMaxActivations(request.maxActivations());
        offer.setStartDate(request.startDate());
        offer.setEndDate(request.endDate());
        offer.setCreatedBy(request.createdBy());

        Offer saved = offerRepository.save(offer);

        // Audit the creation
        auditLogRepository.save(new OfferAuditLog(
                saved.getId(), null, OfferStatus.DRAFT, request.createdBy(), "Offer created"));

        // Publish Kafka event
        eventPublisher.publish(OfferEvent.created(saved, MDC.get("correlationId")));

        log.info("Offer created: id={}, status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Offer> getOffer(UUID id) {
        return offerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<Offer> listOffers(Pageable pageable) {
        return offerRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Offer> listOffersByStatus(OfferStatus status, Pageable pageable) {
        return offerRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Offer> listOffersByMerchant(UUID merchantId, Pageable pageable) {
        return offerRepository.findByMerchantId(merchantId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Offer> listLiveOffers(Brand brand, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        if (brand != null) {
            return offerRepository.findActiveLiveOffers(brand, now, pageable);
        }
        return offerRepository.findAllLiveOffers(now, pageable);
    }

    @Transactional
    public Offer updateOffer(UUID id, UpdateOfferRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));

        if (offer.getStatus() != OfferStatus.DRAFT && offer.getStatus() != OfferStatus.PAUSED) {
            throw new IllegalStateException(
                    "Offers can only be edited in DRAFT or PAUSED status. Current: " + offer.getStatus());
        }

        if (request.title() != null) offer.setTitle(request.title());
        if (request.description() != null) offer.setDescription(request.description());
        if (request.offerType() != null) offer.setOfferType(request.offerType());
        if (request.category() != null) offer.setCategory(request.category());
        if (request.cashbackRate() != null) offer.setCashbackRate(request.cashbackRate());
        if (request.cashbackCap() != null) offer.setCashbackCap(request.cashbackCap());
        if (request.minSpend() != null) offer.setMinSpend(request.minSpend());
        if (request.terms() != null) offer.setTerms(request.terms());
        if (request.brand() != null) offer.setBrand(request.brand());
        if (request.imageUrl() != null) offer.setImageUrl(request.imageUrl());
        if (request.redemptionType() != null) offer.setRedemptionType(request.redemptionType());
        if (request.maxActivations() != null) offer.setMaxActivations(request.maxActivations());
        if (request.startDate() != null) offer.setStartDate(request.startDate());
        if (request.endDate() != null) offer.setEndDate(request.endDate());

        log.info("Offer updated: id={}", id);
        return offerRepository.save(offer);
    }

    @Transactional
    public Offer changeStatus(UUID id, StatusChangeRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));

        OfferStatus previousStatus = offer.getStatus();
        offer.transitionTo(request.status()); // Validates transition

        Offer saved = offerRepository.save(offer);

        // Audit the transition
        auditLogRepository.save(new OfferAuditLog(
                id, previousStatus, request.status(), request.changedBy(), request.reason()));

        // Publish Kafka event
        eventPublisher.publish(OfferEvent.statusChanged(saved, previousStatus,
                request.changedBy(), MDC.get("correlationId")));

        log.info("Offer status changed: id={}, {} -> {}", id, previousStatus, request.status());
        return saved;
    }

    // ─── Custom Exceptions ──────────────────────────────

    public static class OfferNotFoundException extends RuntimeException {
        public OfferNotFoundException(UUID id) {
            super("Offer not found: " + id);
        }
    }
}
