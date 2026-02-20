package com.lbg.commerce.offer.repository;

import com.lbg.commerce.offer.model.Campaign;
import com.lbg.commerce.offer.model.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    Page<Campaign> findByStatus(CampaignStatus status, Pageable pageable);
    long countByStatus(CampaignStatus status);
}
