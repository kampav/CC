package com.cc.customer.kafka;

import com.cc.customer.model.CustomerProfile;
import com.cc.customer.service.CustomerProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CustomerEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(CustomerEventConsumer.class);

    private final CustomerProfileService service;

    public CustomerEventConsumer(CustomerProfileService service) {
        this.service = service;
    }

    @KafkaListener(topics = "banking.customers", groupId = "customer-data-service")
    public void handleCustomerEvent(CustomerEvent event) {
        if (event == null || event.getCustomerId() == null) {
            log.warn("Received null or invalid CustomerEvent");
            return;
        }

        log.info("Processing CustomerEvent: type={}, customerId={}", event.getEventType(), event.getCustomerId());

        try {
            CustomerProfile profile = new CustomerProfile();
            profile.setId(UUID.fromString(event.getCustomerId()));
            profile.setFirstName(event.getFirstName());
            profile.setLastName(event.getLastName());
            profile.setDateOfBirth(event.getDateOfBirth());
            profile.setPostcodePrefix(event.getPostcodePrefix());
            profile.setIncomeBand(event.getIncomeBand());
            profile.setCustomerSegment(event.getCustomerSegment());
            profile.setLifecycleStage(event.getLifecycleStage());
            profile.setCreditScoreBand(event.getCreditScoreBand());
            profile.setPrimarySpendCategory(event.getPrimarySpendCategory());
            profile.setSecondarySpendCategory(event.getSecondarySpendCategory());
            profile.setSpendPattern(event.getSpendPattern());
            profile.setDigitalEngagementScore(event.getDigitalEngagementScore());
            profile.setMarketingConsent(event.getMarketingConsent() != null ? event.getMarketingConsent() : true);

            service.upsert(profile);
            log.info("CustomerProfile upserted: {}", event.getCustomerId());
        } catch (Exception e) {
            log.error("Failed to process CustomerEvent for {}: {}", event.getCustomerId(), e.getMessage(), e);
        }
    }
}
