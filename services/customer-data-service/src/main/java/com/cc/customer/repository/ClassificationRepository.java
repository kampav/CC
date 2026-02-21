package com.cc.customer.repository;

import com.cc.customer.model.Classification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassificationRepository extends JpaRepository<Classification, UUID> {
    List<Classification> findByCustomerProfileId(UUID customerId);
}
