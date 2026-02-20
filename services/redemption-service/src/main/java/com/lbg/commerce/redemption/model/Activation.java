package com.lbg.commerce.redemption.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "activations", schema = "redemptions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "offer_id"}))
public class Activation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @NotNull
    @Column(name = "offer_id", nullable = false)
    private UUID offerId;

    @Column(name = "offer_title")
    private String offerTitle;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @Column(name = "cashback_rate", precision = 5, scale = 2)
    private BigDecimal cashbackRate;

    @Column(name = "cashback_cap", precision = 10, scale = 2)
    private BigDecimal cashbackCap;

    @Column(name = "min_spend", precision = 10, scale = 2)
    private BigDecimal minSpend;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ActivationStatus status = ActivationStatus.ACTIVE;

    @Column(name = "activated_at", nullable = false)
    private OffsetDateTime activatedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        activatedAt = OffsetDateTime.now();
        if (status == null) status = ActivationStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Activation() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }
    public String getOfferTitle() { return offerTitle; }
    public void setOfferTitle(String offerTitle) { this.offerTitle = offerTitle; }
    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }
    public BigDecimal getCashbackRate() { return cashbackRate; }
    public void setCashbackRate(BigDecimal cashbackRate) { this.cashbackRate = cashbackRate; }
    public BigDecimal getCashbackCap() { return cashbackCap; }
    public void setCashbackCap(BigDecimal cashbackCap) { this.cashbackCap = cashbackCap; }
    public BigDecimal getMinSpend() { return minSpend; }
    public void setMinSpend(BigDecimal minSpend) { this.minSpend = minSpend; }
    public ActivationStatus getStatus() { return status; }
    public void setStatus(ActivationStatus status) { this.status = status; }
    public OffsetDateTime getActivatedAt() { return activatedAt; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
