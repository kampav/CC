package com.lbg.commerce.redemption.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CashbackCreditResponse(
        UUID id,
        UUID offerId,
        UUID merchantId,
        BigDecimal transactionAmount,
        BigDecimal cashbackRate,
        BigDecimal cashbackAmount,
        CashbackStatus status,
        OffsetDateTime creditedAt
) {
    public static CashbackCreditResponse from(CashbackCredit credit) {
        return new CashbackCreditResponse(
                credit.getId(),
                credit.getOfferId(),
                credit.getMerchantId(),
                credit.getTransactionAmount(),
                credit.getCashbackRate(),
                credit.getCashbackAmount(),
                credit.getStatus(),
                credit.getCreditedAt()
        );
    }
}
