package com.lbg.commerce.redemption.repository;

import com.lbg.commerce.redemption.model.Activation;
import com.lbg.commerce.redemption.model.ActivationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivationRepository extends JpaRepository<Activation, UUID> {

    List<Activation> findByCustomerIdOrderByActivatedAtDesc(UUID customerId);

    List<Activation> findByCustomerIdAndStatus(UUID customerId, ActivationStatus status);

    boolean existsByCustomerIdAndOfferId(UUID customerId, UUID offerId);

    long countByCustomerIdAndStatus(UUID customerId, ActivationStatus status);

    List<Activation> findByMerchantId(UUID merchantId);

    long countByOfferId(UUID offerId);
}
