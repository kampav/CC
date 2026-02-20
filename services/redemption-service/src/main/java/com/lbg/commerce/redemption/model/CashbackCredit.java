package com.lbg.commerce.redemption.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cashback_credits", schema = "redemptions")
public class CashbackCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @NotNull
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @NotNull
    @Column(name = "offer_id", nullable = false)
    private UUID offerId;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @NotNull
    @Column(name = "transaction_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal transactionAmount;

    @NotNull
    @Column(name = "cashback_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal cashbackRate;

    @NotNull
    @Column(name = "cashback_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal cashbackAmount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CashbackStatus status = CashbackStatus.CREDITED;

    @Column(name = "credited_at", nullable = false)
    private OffsetDateTime creditedAt;

    @PrePersist
    protected void onCreate() {
        creditedAt = OffsetDateTime.now();
        if (status == null) status = CashbackStatus.CREDITED;
    }

    public CashbackCredit() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }
    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }
    public BigDecimal getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(BigDecimal transactionAmount) { this.transactionAmount = transactionAmount; }
    public BigDecimal getCashbackRate() { return cashbackRate; }
    public void setCashbackRate(BigDecimal cashbackRate) { this.cashbackRate = cashbackRate; }
    public BigDecimal getCashbackAmount() { return cashbackAmount; }
    public void setCashbackAmount(BigDecimal cashbackAmount) { this.cashbackAmount = cashbackAmount; }
    public CashbackStatus getStatus() { return status; }
    public void setStatus(CashbackStatus status) { this.status = status; }
    public OffsetDateTime getCreditedAt() { return creditedAt; }
}
