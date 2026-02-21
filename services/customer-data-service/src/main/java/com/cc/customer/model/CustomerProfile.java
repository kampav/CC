package com.cc.customer.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles", schema = "customers")
public class CustomerProfile {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "postcode_prefix", length = 4)
    private String postcodePrefix;

    @Column(name = "income_band", length = 30)
    private String incomeBand;

    @Column(name = "customer_segment", length = 30)
    private String customerSegment;

    @Column(name = "lifecycle_stage", length = 30)
    private String lifecycleStage;

    @Column(name = "credit_score_band", length = 20)
    private String creditScoreBand;

    @Column(name = "primary_spend_category", length = 100)
    private String primarySpendCategory;

    @Column(name = "secondary_spend_category", length = 100)
    private String secondarySpendCategory;

    @Column(name = "spend_pattern", length = 50)
    private String spendPattern;

    @Column(name = "digital_engagement_score")
    private Integer digitalEngagementScore;

    @Column(name = "marketing_consent")
    private Boolean marketingConsent = true;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "customerProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Classification> classifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getPostcodePrefix() { return postcodePrefix; }
    public void setPostcodePrefix(String postcodePrefix) { this.postcodePrefix = postcodePrefix; }
    public String getIncomeBand() { return incomeBand; }
    public void setIncomeBand(String incomeBand) { this.incomeBand = incomeBand; }
    public String getCustomerSegment() { return customerSegment; }
    public void setCustomerSegment(String customerSegment) { this.customerSegment = customerSegment; }
    public String getLifecycleStage() { return lifecycleStage; }
    public void setLifecycleStage(String lifecycleStage) { this.lifecycleStage = lifecycleStage; }
    public String getCreditScoreBand() { return creditScoreBand; }
    public void setCreditScoreBand(String creditScoreBand) { this.creditScoreBand = creditScoreBand; }
    public String getPrimarySpendCategory() { return primarySpendCategory; }
    public void setPrimarySpendCategory(String primarySpendCategory) { this.primarySpendCategory = primarySpendCategory; }
    public String getSecondarySpendCategory() { return secondarySpendCategory; }
    public void setSecondarySpendCategory(String secondarySpendCategory) { this.secondarySpendCategory = secondarySpendCategory; }
    public String getSpendPattern() { return spendPattern; }
    public void setSpendPattern(String spendPattern) { this.spendPattern = spendPattern; }
    public Integer getDigitalEngagementScore() { return digitalEngagementScore; }
    public void setDigitalEngagementScore(Integer digitalEngagementScore) { this.digitalEngagementScore = digitalEngagementScore; }
    public Boolean getMarketingConsent() { return marketingConsent; }
    public void setMarketingConsent(Boolean marketingConsent) { this.marketingConsent = marketingConsent; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<Classification> getClassifications() { return classifications; }
    public void setClassifications(List<Classification> classifications) { this.classifications = classifications; }
}
