package com.lbg.commerce.offer.repository;

import com.lbg.commerce.offer.model.OfferAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OfferAuditLogRepository extends JpaRepository<OfferAuditLog, Long> {

    List<OfferAuditLog> findByOfferIdOrderByChangedAtDesc(UUID offerId);
}
