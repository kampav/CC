package com.lbg.commerce.redemption.repository;

import com.lbg.commerce.redemption.model.CashbackCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CashbackCreditRepository extends JpaRepository<CashbackCredit, UUID> {

    List<CashbackCredit> findByCustomerIdOrderByCreditedAtDesc(UUID customerId);

    List<CashbackCredit> findByOfferIdOrderByCreditedAtDesc(UUID offerId);

    List<CashbackCredit> findByMerchantIdOrderByCreditedAtDesc(UUID merchantId);

    @Query("SELECT COALESCE(SUM(c.cashbackAmount), 0) FROM CashbackCredit c WHERE c.customerId = :customerId")
    BigDecimal sumCashbackByCustomerId(@Param("customerId") UUID customerId);

    @Query("SELECT COALESCE(SUM(c.cashbackAmount), 0) FROM CashbackCredit c WHERE c.merchantId = :merchantId")
    BigDecimal sumCashbackByMerchantId(@Param("merchantId") UUID merchantId);

    @Query("SELECT COALESCE(SUM(c.cashbackAmount), 0) FROM CashbackCredit c")
    BigDecimal sumAllCashback();
}
