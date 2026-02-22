package com.lbg.commerce.offer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "offers", schema = "offers")
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "offer_type", nullable = false, length = 50)
    private OfferType offerType = OfferType.CASHBACK;

    @Size(max = 100)
    private String category;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "cashback_rate", precision = 5, scale = 2)
    private BigDecimal cashbackRate;

    @Column(name = "cashback_cap", precision = 10, scale = 2)
    private BigDecimal cashbackCap;

    @Column(name = "min_spend", precision = 10, scale = 2)
    private BigDecimal minSpend = BigDecimal.ZERO;

    @NotBlank
    @Size(max = 3)
    @Column(nullable = false, length = 3)
    private String currency = "GBP";

    @Column(columnDefinition = "TEXT")
    private String terms;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OfferStatus status = OfferStatus.DRAFT;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Brand brand = Brand.BRAND_A;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "redemption_type", length = 50)
    private RedemptionType redemptionType = RedemptionType.CARD_LINKED;

    @Column(name = "max_activations")
    private Integer maxActivations;

    @Column(name = "current_activations", nullable = false)
    private int currentActivations = 0;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Size(max = 100)
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "campaign_id")
    private UUID campaignId;

    // ─── Lifecycle callbacks ────────────────────────────

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (status == null) {
            status = OfferStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // ─── Domain methods ─────────────────────────────────

    public boolean canTransitionTo(OfferStatus targetStatus) {
        return this.status.canTransitionTo(targetStatus);
    }

    public void transitionTo(OfferStatus targetStatus) {
        if (!canTransitionTo(targetStatus)) {
            throw new IllegalStateException(
                    String.format("Cannot transition offer from %s to %s. Valid transitions: %s",
                            this.status, targetStatus, this.status.validTransitions()));
        }
        this.status = targetStatus;
    }

    public boolean isActive() {
        return this.status == OfferStatus.LIVE;
    }

    public boolean isExpired() {
        return this.endDate != null && OffsetDateTime.now().isAfter(this.endDate);
    }

    public boolean hasCapacity() {
        return this.maxActivations == null || this.currentActivations < this.maxActivations;
    }

    public void incrementActivations() {
        this.currentActivations++;
    }

    // ─── Constructors ───────────────────────────────────

    public Offer() {}

    // ─── Getters and Setters ────────────────────────────

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OfferType getOfferType() { return offerType; }
    public void setOfferType(OfferType offerType) { this.offerType = offerType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getCashbackRate() { return cashbackRate; }
    public void setCashbackRate(BigDecimal cashbackRate) { this.cashbackRate = cashbackRate; }

    public BigDecimal getCashbackCap() { return cashbackCap; }
    public void setCashbackCap(BigDecimal cashbackCap) { this.cashbackCap = cashbackCap; }

    public BigDecimal getMinSpend() { return minSpend; }
    public void setMinSpend(BigDecimal minSpend) { this.minSpend = minSpend; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }

    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }

    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public RedemptionType getRedemptionType() { return redemptionType; }
    public void setRedemptionType(RedemptionType redemptionType) { this.redemptionType = redemptionType; }

    public Integer getMaxActivations() { return maxActivations; }
    public void setMaxActivations(Integer maxActivations) { this.maxActivations = maxActivations; }

    public int getCurrentActivations() { return currentActivations; }
    public void setCurrentActivations(int currentActivations) { this.currentActivations = currentActivations; }

    public OffsetDateTime getStartDate() { return startDate; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }

    public OffsetDateTime getEndDate() { return endDate; }
    public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public UUID getCampaignId() { return campaignId; }
    public void setCampaignId(UUID campaignId) { this.campaignId = campaignId; }
}
