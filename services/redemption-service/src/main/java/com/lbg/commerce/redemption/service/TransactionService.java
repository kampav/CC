package com.lbg.commerce.redemption.service;

import com.lbg.commerce.redemption.model.*;
import com.lbg.commerce.redemption.repository.ActivationRepository;
import com.lbg.commerce.redemption.repository.CashbackCreditRepository;
import com.lbg.commerce.redemption.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final ActivationRepository activationRepository;
    private final CashbackCreditRepository cashbackCreditRepository;

    public TransactionService(TransactionRepository transactionRepository,
                               ActivationRepository activationRepository,
                               CashbackCreditRepository cashbackCreditRepository) {
        this.transactionRepository = transactionRepository;
        this.activationRepository = activationRepository;
        this.cashbackCreditRepository = cashbackCreditRepository;
    }

    @Transactional
    public TransactionResponse simulateTransaction(SimulateTransactionRequest request) {
        log.info("Simulating transaction: activationId={}, amount={}", request.activationId(), request.amount());

        Activation activation = activationRepository.findById(request.activationId())
                .orElseThrow(() -> new ActivationService.ActivationNotFoundException(request.activationId()));

        if (activation.getStatus() != ActivationStatus.ACTIVE) {
            throw new IllegalStateException("Activation is not ACTIVE. Current: " + activation.getStatus());
        }

        // Check min spend
        if (activation.getMinSpend() != null && request.amount().compareTo(activation.getMinSpend()) < 0) {
            throw new IllegalStateException(
                    String.format("Transaction amount £%s is below minimum spend £%s",
                            request.amount(), activation.getMinSpend()));
        }

        // Create transaction
        Transaction tx = new Transaction();
        tx.setActivationId(activation.getId());
        tx.setCustomerId(request.customerId());
        tx.setMerchantId(activation.getMerchantId());
        tx.setAmount(request.amount());
        tx.setDescription(request.description());
        tx.setCardLastFour(request.cardLastFour() != null ? request.cardLastFour() : "1234");
        tx.setStatus(TransactionStatus.MATCHED);

        Transaction savedTx = transactionRepository.save(tx);

        // Calculate cashback
        BigDecimal cashbackAmount = BigDecimal.ZERO;
        if (activation.getCashbackRate() != null) {
            cashbackAmount = request.amount()
                    .multiply(activation.getCashbackRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply cap
            if (activation.getCashbackCap() != null && cashbackAmount.compareTo(activation.getCashbackCap()) > 0) {
                cashbackAmount = activation.getCashbackCap();
            }

            // Create cashback credit
            CashbackCredit credit = new CashbackCredit();
            credit.setTransactionId(savedTx.getId());
            credit.setCustomerId(request.customerId());
            credit.setOfferId(activation.getOfferId());
            credit.setMerchantId(activation.getMerchantId());
            credit.setTransactionAmount(request.amount());
            credit.setCashbackRate(activation.getCashbackRate());
            credit.setCashbackAmount(cashbackAmount);
            credit.setStatus(CashbackStatus.CREDITED);
            cashbackCreditRepository.save(credit);

            // Update transaction status
            savedTx.setStatus(TransactionStatus.CASHBACK_CREDITED);
            transactionRepository.save(savedTx);

            log.info("Cashback credited: txId={}, amount=£{}", savedTx.getId(), cashbackAmount);
        }

        return TransactionResponse.from(savedTx, cashbackAmount);
    }

    @Transactional(readOnly = true)
    public List<Transaction> listTransactionsByCustomer(UUID customerId) {
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> listTransactionsByMerchant(UUID merchantId) {
        return transactionRepository.findByMerchantIdOrderByTransactionDateDesc(merchantId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> listAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CashbackSummary getCashbackSummary(UUID customerId) {
        BigDecimal total = cashbackCreditRepository.sumCashbackByCustomerId(customerId);
        List<CashbackCredit> credits = cashbackCreditRepository.findByCustomerIdOrderByCreditedAtDesc(customerId);
        return new CashbackSummary(
                customerId,
                total,
                credits.size(),
                credits.stream().map(CashbackCreditResponse::from).toList()
        );
    }
}
