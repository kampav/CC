package com.cc.transaction.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "spending_summaries", schema = "banking_transactions")
public class SpendingSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "period_type", length = 20)
    private String periodType;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_spend", precision = 12, scale = 2)
    private BigDecimal totalSpend;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "avg_transaction", precision = 10, scale = 2)
    private BigDecimal avgTransaction;

    @Column(name = "computed_at")
    private OffsetDateTime computedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        computedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPeriodType() { return periodType; }
    public void setPeriodType(String periodType) { this.periodType = periodType; }
    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }
    public BigDecimal getTotalSpend() { return totalSpend; }
    public void setTotalSpend(BigDecimal totalSpend) { this.totalSpend = totalSpend; }
    public Integer getTransactionCount() { return transactionCount; }
    public void setTransactionCount(Integer transactionCount) { this.transactionCount = transactionCount; }
    public BigDecimal getAvgTransaction() { return avgTransaction; }
    public void setAvgTransaction(BigDecimal avgTransaction) { this.avgTransaction = avgTransaction; }
    public OffsetDateTime getComputedAt() { return computedAt; }
}
