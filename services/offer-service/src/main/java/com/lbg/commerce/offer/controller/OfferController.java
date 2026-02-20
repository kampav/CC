package com.lbg.commerce.offer.controller;

import com.lbg.commerce.offer.model.*;
import com.lbg.commerce.offer.service.OfferService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
public class OfferController {

    private static final Logger log = LoggerFactory.getLogger(OfferController.class);

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<OfferResponse> createOffer(@Valid @RequestBody CreateOfferRequest request) {
        log.info("POST /api/v1/offers - Creating offer: {}", request.title());
        Offer offer = offerService.createOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(OfferResponse.from(offer));
    }

    @GetMapping
    public ResponseEntity<Page<OfferResponse>> listOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OfferStatus status,
            @RequestParam(required = false) UUID merchantId,
            @RequestParam(required = false) Brand brand,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);

        Page<Offer> offers;
        if (status == OfferStatus.LIVE) {
            offers = offerService.listLiveOffers(brand, pageable);
        } else if (status != null) {
            offers = offerService.listOffersByStatus(status, pageable);
        } else if (merchantId != null) {
            offers = offerService.listOffersByMerchant(merchantId, pageable);
        } else {
            offers = offerService.listOffers(pageable);
        }

        return ResponseEntity.ok(offers.map(OfferResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOffer(@PathVariable UUID id) {
        return offerService.getOffer(id)
                .map(offer -> ResponseEntity.ok(OfferResponse.from(offer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferResponse> updateOffer(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOfferRequest request) {
        log.info("PUT /api/v1/offers/{} - Updating offer", id);
        Offer offer = offerService.updateOffer(id, request);
        return ResponseEntity.ok(OfferResponse.from(offer));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OfferResponse> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusChangeRequest request) {
        log.info("PATCH /api/v1/offers/{}/status - Changing to {}", id, request.status());
        Offer offer = offerService.changeStatus(id, request);
        return ResponseEntity.ok(OfferResponse.from(offer));
    }
}
