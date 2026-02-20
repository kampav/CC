package com.lbg.commerce.offer.service;

import com.lbg.commerce.offer.model.OfferEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OfferEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OfferEventPublisher.class);
    private static final String TOPIC = "commerce.offers";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OfferEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(OfferEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.offerId().toString(), event);
            log.info("Published event: type={}, offerId={}", event.eventType(), event.offerId());
        } catch (Exception e) {
            log.warn("Failed to publish event: type={}, offerId={}, error={}",
                    event.eventType(), event.offerId(), e.getMessage());
        }
    }
}
