package com.lbg.commerce.partner.repository;

import com.lbg.commerce.partner.model.PartnerAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnerAuditLogRepository extends JpaRepository<PartnerAuditLog, Long> {

    List<PartnerAuditLog> findByPartnerIdOrderByChangedAtDesc(UUID partnerId);
}
