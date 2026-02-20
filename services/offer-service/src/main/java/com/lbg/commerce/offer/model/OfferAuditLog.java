package com.lbg.commerce.offer.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "offer_audit_log", schema = "offers")
public class OfferAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offer_id", nullable = false)
    private UUID offerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private OfferStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private OfferStatus newStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private OffsetDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = OffsetDateTime.now();
    }

    public OfferAuditLog() {}

    public OfferAuditLog(UUID offerId, OfferStatus previousStatus, OfferStatus newStatus,
                          String changedBy, String reason) {
        this.offerId = offerId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    // Getters
    public Long getId() { return id; }
    public UUID getOfferId() { return offerId; }
    public OfferStatus getPreviousStatus() { return previousStatus; }
    public OfferStatus getNewStatus() { return newStatus; }
    public String getChangedBy() { return changedBy; }
    public String getReason() { return reason; }
    public OffsetDateTime getChangedAt() { return changedAt; }
}
