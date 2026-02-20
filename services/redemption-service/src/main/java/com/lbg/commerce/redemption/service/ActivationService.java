package com.lbg.commerce.redemption.service;

import com.lbg.commerce.redemption.model.*;
import com.lbg.commerce.redemption.repository.ActivationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ActivationService {

    private static final Logger log = LoggerFactory.getLogger(ActivationService.class);

    private final ActivationRepository activationRepository;
    private final RestTemplate restTemplate;

    public ActivationService(ActivationRepository activationRepository) {
        this.activationRepository = activationRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public Activation activateOffer(CreateActivationRequest request) {
        log.info("Activating offer: customerId={}, offerId={}", request.customerId(), request.offerId());

        // Check not already activated
        if (activationRepository.existsByCustomerIdAndOfferId(request.customerId(), request.offerId())) {
            throw new IllegalStateException("Offer already activated by this customer");
        }

        // Fetch offer details from offer-service
        Map<String, Object> offer = fetchOffer(request.offerId());
        if (offer == null) {
            throw new OfferNotFoundException(request.offerId());
        }

        String offerStatus = (String) offer.get("status");
        if (!"LIVE".equals(offerStatus)) {
            throw new IllegalStateException("Offer is not LIVE. Current status: " + offerStatus);
        }

        Activation activation = new Activation();
        activation.setCustomerId(request.customerId());
        activation.setOfferId(request.offerId());
        activation.setOfferTitle((String) offer.get("title"));

        String merchantIdStr = (String) offer.get("merchantId");
        if (merchantIdStr != null) {
            activation.setMerchantId(UUID.fromString(merchantIdStr));
        }

        Number cashbackRate = (Number) offer.get("cashbackRate");
        if (cashbackRate != null) {
            activation.setCashbackRate(BigDecimal.valueOf(cashbackRate.doubleValue()));
        }

        Number cashbackCap = (Number) offer.get("cashbackCap");
        if (cashbackCap != null) {
            activation.setCashbackCap(BigDecimal.valueOf(cashbackCap.doubleValue()));
        }

        Number minSpend = (Number) offer.get("minSpend");
        if (minSpend != null) {
            activation.setMinSpend(BigDecimal.valueOf(minSpend.doubleValue()));
        }

        String endDateStr = (String) offer.get("endDate");
        if (endDateStr != null) {
            activation.setExpiresAt(java.time.OffsetDateTime.parse(endDateStr));
        }

        Activation saved = activationRepository.save(activation);
        log.info("Offer activated: activationId={}, offerId={}", saved.getId(), saved.getOfferId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Activation> getActivation(UUID id) {
        return activationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Activation> listCustomerActivations(UUID customerId) {
        return activationRepository.findByCustomerIdOrderByActivatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public long countActiveActivations(UUID customerId) {
        return activationRepository.countByCustomerIdAndStatus(customerId, ActivationStatus.ACTIVE);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchOffer(UUID offerId) {
        String offerServiceUrl = System.getProperty("offer.service.url", "http://localhost:8081");
        try {
            return restTemplate.getForObject(offerServiceUrl + "/api/v1/offers/" + offerId, Map.class);
        } catch (Exception e) {
            log.warn("Failed to fetch offer {}: {}", offerId, e.getMessage());
            return null;
        }
    }

    public static class OfferNotFoundException extends RuntimeException {
        public OfferNotFoundException(UUID id) {
            super("Offer not found: " + id);
        }
    }

    public static class ActivationNotFoundException extends RuntimeException {
        public ActivationNotFoundException(UUID id) {
            super("Activation not found: " + id);
        }
    }
}
