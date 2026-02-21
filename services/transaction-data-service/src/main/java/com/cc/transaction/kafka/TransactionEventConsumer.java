package com.cc.transaction.kafka;

import com.cc.transaction.model.BankingTransaction;
import com.cc.transaction.service.TransactionDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TransactionEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(TransactionEventConsumer.class);

    private final TransactionDataService service;

    public TransactionEventConsumer(TransactionDataService service) {
        this.service = service;
    }

    @KafkaListener(topics = "banking.transactions", groupId = "transaction-data-service")
    public void handleTransactionEvent(BankingTransactionEvent event) {
        if (event == null || event.getCustomerId() == null) {
            log.warn("Received null or invalid BankingTransactionEvent");
            return;
        }

        log.info("Processing BankingTransactionEvent: type={}, customerId={}", event.getEventType(), event.getCustomerId());

        try {
            BankingTransaction txn = new BankingTransaction();
            txn.setCustomerId(UUID.fromString(event.getCustomerId()));
            txn.setAmount(event.getAmount());
            txn.setCurrency(event.getCurrency() != null ? event.getCurrency() : "GBP");
            txn.setMerchantName(event.getMerchantName());
            txn.setMerchantCategoryCode(event.getMerchantCategoryCode());
            txn.setCategory(event.getCategory());
            txn.setSubCategory(event.getSubCategory());
            txn.setChannel(event.getChannel());
            txn.setStatus(event.getStatus() != null ? event.getStatus() : "POSTED");
            txn.setTransactionDate(event.getTransactionDate());
            txn.setPostedDate(event.getPostedDate());

            service.save(txn);
            log.info("BankingTransaction saved for customer: {}", event.getCustomerId());
        } catch (Exception e) {
            log.error("Failed to process BankingTransactionEvent for {}: {}", event.getCustomerId(), e.getMessage(), e);
        }
    }
}
