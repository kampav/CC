package com.cc.transaction.service;

import com.cc.transaction.model.BankingTransaction;
import com.cc.transaction.model.SpendingCategory;
import com.cc.transaction.model.SpendingSummary;
import com.cc.transaction.repository.BankingTransactionRepository;
import com.cc.transaction.repository.SpendingSummaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionDataService {

    private static final Logger log = LoggerFactory.getLogger(TransactionDataService.class);

    private final BankingTransactionRepository txnRepo;
    private final SpendingSummaryRepository summaryRepo;

    public TransactionDataService(BankingTransactionRepository txnRepo,
                                   SpendingSummaryRepository summaryRepo) {
        this.txnRepo = txnRepo;
        this.summaryRepo = summaryRepo;
    }

    @Transactional(readOnly = true)
    public List<BankingTransaction> getTransactions(UUID customerId, OffsetDateTime after, int limit) {
        var pageable = PageRequest.of(0, limit);
        return txnRepo.findByCustomerIdKeyset(customerId, after, pageable);
    }

    @Transactional(readOnly = true)
    public List<SpendingCategory> getSpendingSummary(UUID customerId, String periodType) {
        String resolvedPeriod = periodType != null ? periodType.toUpperCase() : "QUARTERLY";
        List<SpendingSummary> summaries = summaryRepo
            .findByCustomerIdAndPeriodTypeOrderByTotalSpendDesc(customerId, resolvedPeriod);

        return summaries.stream()
            .map(s -> new SpendingCategory(
                s.getCategory(),
                s.getTotalSpend(),
                s.getTransactionCount(),
                s.getAvgTransaction()
            ))
            .collect(Collectors.toList());
    }

    @Transactional
    public BankingTransaction save(BankingTransaction transaction) {
        log.debug("Saving transaction for customer: {}", transaction.getCustomerId());
        return txnRepo.save(transaction);
    }
}
