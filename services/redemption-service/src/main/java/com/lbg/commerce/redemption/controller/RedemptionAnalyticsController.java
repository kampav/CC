package com.lbg.commerce.redemption.controller;

import com.lbg.commerce.redemption.repository.ActivationRepository;
import com.lbg.commerce.redemption.repository.CashbackCreditRepository;
import com.lbg.commerce.redemption.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/redemptions/analytics")
public class RedemptionAnalyticsController {

    private final ActivationRepository activationRepository;
    private final TransactionRepository transactionRepository;
    private final CashbackCreditRepository cashbackCreditRepository;

    public RedemptionAnalyticsController(ActivationRepository activationRepository,
                                          TransactionRepository transactionRepository,
                                          CashbackCreditRepository cashbackCreditRepository) {
        this.activationRepository = activationRepository;
        this.transactionRepository = transactionRepository;
        this.cashbackCreditRepository = cashbackCreditRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam(required = false) UUID merchantId) {

        Map<String, Object> summary = new LinkedHashMap<>();

        if (merchantId != null) {
            summary.put("merchantId", merchantId);
            summary.put("totalActivations", activationRepository.findByMerchantId(merchantId).size());
            summary.put("totalTransactions", transactionRepository.findByMerchantIdOrderByTransactionDateDesc(merchantId).size());
            BigDecimal totalCashback = cashbackCreditRepository.sumCashbackByMerchantId(merchantId);
            summary.put("totalCashbackPaid", totalCashback);
        } else {
            summary.put("totalActivations", activationRepository.count());
            summary.put("totalTransactions", transactionRepository.count());
            BigDecimal totalCashback = cashbackCreditRepository.sumAllCashback();
            summary.put("totalCashbackPaid", totalCashback);
        }

        return ResponseEntity.ok(summary);
    }
}
