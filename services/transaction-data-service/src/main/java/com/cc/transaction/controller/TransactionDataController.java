package com.cc.transaction.controller;

import com.cc.transaction.model.BankingTransaction;
import com.cc.transaction.model.SpendingCategory;
import com.cc.transaction.service.TransactionDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/banking-transactions")
public class TransactionDataController {

    private final TransactionDataService service;

    public TransactionDataController(TransactionDataService service) {
        this.service = service;
    }

    /**
     * Keyset-paginated transaction history.
     * ?after=<ISO8601 timestamp> — returns transactions before this timestamp
     * ?limit=<n> — page size (default 50, max 100)
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @PathVariable UUID customerId,
            @RequestParam(required = false) String after,
            @RequestParam(defaultValue = "50") int limit) {

        int safeLimit = Math.min(limit, 100);
        OffsetDateTime cursor = after != null ? OffsetDateTime.parse(after) : null;

        List<BankingTransaction> transactions = service.getTransactions(customerId, cursor, safeLimit);

        OffsetDateTime nextCursor = transactions.isEmpty() ? null
            : transactions.get(transactions.size() - 1).getTransactionDate();

        return ResponseEntity.ok(Map.of(
            "customerId", customerId,
            "transactions", transactions,
            "count", transactions.size(),
            "nextCursor", nextCursor != null ? nextCursor.toString() : ""
        ));
    }

    /**
     * Pre-computed spending summary by category.
     * ?periodType=QUARTERLY|MONTHLY|ANNUAL (default QUARTERLY)
     * ?months=3 — legacy param, maps to QUARTERLY
     */
    @GetMapping("/customer/{customerId}/spending-summary")
    public ResponseEntity<Map<String, Object>> getSpendingSummary(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "QUARTERLY") String periodType,
            @RequestParam(required = false) Integer months) {

        // Map ?months param to period type for backward compat
        String resolved = periodType;
        if (months != null) {
            resolved = months <= 1 ? "MONTHLY" : months <= 3 ? "QUARTERLY" : "ANNUAL";
        }

        List<SpendingCategory> summary = service.getSpendingSummary(customerId, resolved);

        return ResponseEntity.ok(Map.of(
            "customerId", customerId,
            "periodType", resolved,
            "categories", summary
        ));
    }
}
