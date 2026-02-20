package com.lbg.commerce.redemption.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID activationId,
        UUID customerId,
        UUID merchantId,
        BigDecimal amount,
        String currency,
        String cardLastFour,
        String description,
        TransactionStatus status,
        OffsetDateTime transactionDate,
        BigDecimal cashbackAmount
) {
    public static TransactionResponse from(Transaction tx, BigDecimal cashbackAmount) {
        return new TransactionResponse(
                tx.getId(),
                tx.getActivationId(),
                tx.getCustomerId(),
                tx.getMerchantId(),
                tx.getAmount(),
                tx.getCurrency(),
                tx.getCardLastFour(),
                tx.getDescription(),
                tx.getStatus(),
                tx.getTransactionDate(),
                cashbackAmount
        );
    }
}
