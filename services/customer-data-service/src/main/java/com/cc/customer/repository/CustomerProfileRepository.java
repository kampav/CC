package com.cc.customer.repository;

import com.cc.customer.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {

    @Query("SELECT p FROM CustomerProfile p LEFT JOIN FETCH p.classifications WHERE p.id = :id")
    Optional<CustomerProfile> findByIdWithClassifications(@Param("id") UUID id);
}
