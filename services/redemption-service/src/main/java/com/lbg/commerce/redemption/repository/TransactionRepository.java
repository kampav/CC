package com.lbg.commerce.redemption.repository;

import com.lbg.commerce.redemption.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByActivationIdOrderByTransactionDateDesc(UUID activationId);

    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(UUID customerId);

    List<Transaction> findByMerchantIdOrderByTransactionDateDesc(UUID merchantId);
}
