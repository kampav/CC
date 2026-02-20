package com.lbg.commerce.offer.repository;

import com.lbg.commerce.offer.model.Brand;
import com.lbg.commerce.offer.model.Offer;
import com.lbg.commerce.offer.model.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    Page<Offer> findByStatus(OfferStatus status, Pageable pageable);

    Page<Offer> findByMerchantId(UUID merchantId, Pageable pageable);

    Page<Offer> findByMerchantIdAndStatus(UUID merchantId, OfferStatus status, Pageable pageable);

    Page<Offer> findByCategory(String category, Pageable pageable);

    Page<Offer> findByBrand(Brand brand, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.status = 'LIVE' " +
           "AND (o.startDate IS NULL OR o.startDate <= :now) " +
           "AND (o.endDate IS NULL OR o.endDate > :now) " +
           "AND o.brand = :brand " +
           "ORDER BY o.createdAt DESC")
    Page<Offer> findActiveLiveOffers(
            @Param("brand") Brand brand,
            @Param("now") OffsetDateTime now,
            Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.status = 'LIVE' " +
           "AND (o.startDate IS NULL OR o.startDate <= :now) " +
           "AND (o.endDate IS NULL OR o.endDate > :now) " +
           "ORDER BY o.createdAt DESC")
    Page<Offer> findAllLiveOffers(@Param("now") OffsetDateTime now, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.status = 'LIVE' " +
           "AND o.endDate IS NOT NULL AND o.endDate <= :now")
    List<Offer> findExpiredLiveOffers(@Param("now") OffsetDateTime now);

    long countByMerchantIdAndStatus(UUID merchantId, OfferStatus status);
}
