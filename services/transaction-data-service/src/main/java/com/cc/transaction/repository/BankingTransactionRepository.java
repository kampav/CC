package com.cc.transaction.repository;

import com.cc.transaction.model.BankingTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BankingTransactionRepository extends JpaRepository<BankingTransaction, UUID> {

    // Keyset pagination: fetch transactions older than cursor (by transactionDate)
    @Query("SELECT t FROM BankingTransaction t WHERE t.customerId = :customerId " +
           "AND (:after IS NULL OR t.transactionDate < :after) " +
           "ORDER BY t.transactionDate DESC")
    List<BankingTransaction> findByCustomerIdKeyset(
        @Param("customerId") UUID customerId,
        @Param("after") OffsetDateTime after,
        Pageable pageable
    );

    List<BankingTransaction> findByCustomerIdOrderByTransactionDateDesc(UUID customerId, Pageable pageable);
}
