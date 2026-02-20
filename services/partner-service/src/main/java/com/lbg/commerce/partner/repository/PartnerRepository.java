package com.lbg.commerce.partner.repository;

import com.lbg.commerce.partner.model.Partner;
import com.lbg.commerce.partner.model.PartnerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {

    Page<Partner> findByStatus(PartnerStatus status, Pageable pageable);

    Optional<Partner> findByContactEmail(String contactEmail);

    Page<Partner> findByCategory(String category, Pageable pageable);

    boolean existsByContactEmail(String contactEmail);

    long countByStatus(PartnerStatus status);
}
