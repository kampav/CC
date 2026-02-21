package com.cc.transaction.kafka;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class BankingTransactionEvent {
    private String eventType;          // TRANSACTION_POSTED, TRANSACTION_REVERSED
    private String transactionId;
    private String customerId;
    private BigDecimal amount;
    private String currency;
    private String merchantName;
    private String merchantCategoryCode;
    private String category;
    private String subCategory;
    private String channel;
    private String status;
    private OffsetDateTime transactionDate;
    private OffsetDateTime postedDate;

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }
    public String getMerchantCategoryCode() { return merchantCategoryCode; }
    public void setMerchantCategoryCode(String merchantCategoryCode) { this.merchantCategoryCode = merchantCategoryCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(OffsetDateTime transactionDate) { this.transactionDate = transactionDate; }
    public OffsetDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(OffsetDateTime postedDate) { this.postedDate = postedDate; }
}
