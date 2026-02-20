package com.lbg.commerce.redemption.controller;

import com.lbg.commerce.redemption.model.*;
import com.lbg.commerce.redemption.service.TransactionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/simulate")
    public ResponseEntity<TransactionResponse> simulateTransaction(
            @Valid @RequestBody SimulateTransactionRequest request) {
        log.info("POST /api/v1/transactions/simulate - activationId={}, amount={}",
                request.activationId(), request.amount());
        TransactionResponse response = transactionService.simulateTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<?> listTransactions(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) UUID merchantId) {
        if (customerId != null) {
            return ResponseEntity.ok(transactionService.listTransactionsByCustomer(customerId));
        }
        if (merchantId != null) {
            return ResponseEntity.ok(transactionService.listTransactionsByMerchant(merchantId));
        }
        return ResponseEntity.ok(transactionService.listAllTransactions());
    }

    @GetMapping("/cashback")
    public ResponseEntity<CashbackSummary> getCashbackSummary(@RequestParam UUID customerId) {
        return ResponseEntity.ok(transactionService.getCashbackSummary(customerId));
    }
}
