package com.cc.customer.kafka;

import java.time.LocalDate;

public class CustomerEvent {
    private String eventType;   // CUSTOMER_CREATED, CUSTOMER_UPDATED, SEGMENT_CHANGED
    private String customerId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String postcodePrefix;
    private String incomeBand;
    private String customerSegment;
    private String lifecycleStage;
    private String creditScoreBand;
    private String primarySpendCategory;
    private String secondarySpendCategory;
    private String spendPattern;
    private Integer digitalEngagementScore;
    private Boolean marketingConsent;

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
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
}
