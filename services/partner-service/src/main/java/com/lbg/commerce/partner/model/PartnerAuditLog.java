package com.lbg.commerce.partner.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "partner_audit_log", schema = "partners")
public class PartnerAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partner_id", nullable = false)
    private UUID partnerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private PartnerStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private PartnerStatus newStatus;

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

    public PartnerAuditLog() {}

    public PartnerAuditLog(UUID partnerId, PartnerStatus previousStatus, PartnerStatus newStatus,
                            String changedBy, String reason) {
        this.partnerId = partnerId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    // Getters
    public Long getId() { return id; }
    public UUID getPartnerId() { return partnerId; }
    public PartnerStatus getPreviousStatus() { return previousStatus; }
    public PartnerStatus getNewStatus() { return newStatus; }
    public String getChangedBy() { return changedBy; }
    public String getReason() { return reason; }
    public OffsetDateTime getChangedAt() { return changedAt; }
}
