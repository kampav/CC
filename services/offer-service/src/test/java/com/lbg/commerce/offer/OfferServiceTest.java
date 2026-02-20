package com.lbg.commerce.offer;

import com.lbg.commerce.offer.model.*;
import com.lbg.commerce.offer.repository.OfferAuditLogRepository;
import com.lbg.commerce.offer.repository.OfferRepository;
import com.lbg.commerce.offer.service.OfferEventPublisher;
import com.lbg.commerce.offer.service.OfferService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferAuditLogRepository auditLogRepository;

    @Mock
    private OfferEventPublisher eventPublisher;

    private OfferService offerService;

    @BeforeEach
    void setUp() {
        offerService = new OfferService(offerRepository, auditLogRepository, eventPublisher);
    }

    @Test
    void createOffer_setsDefaultValues() {
        var request = new CreateOfferRequest(
                UUID.randomUUID(), "10% Cashback at Tesco", "Get 10% back on groceries",
                null, "Groceries", new BigDecimal("10.00"), new BigDecimal("50.00"),
                new BigDecimal("5.00"), "Terms apply", null, null,
                null, null, null, null, "merchant@test.com"
        );

        when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> {
            Offer o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(auditLogRepository.save(any())).thenReturn(null);

        Offer result = offerService.createOffer(request);

        assertNotNull(result.getId());
        assertEquals("10% Cashback at Tesco", result.getTitle());
        assertEquals(OfferType.CASHBACK, result.getOfferType()); // default
        assertEquals(Brand.BRAND_A, result.getBrand()); // default
        assertEquals(RedemptionType.CARD_LINKED, result.getRedemptionType()); // default

        // Verify audit log was created
        verify(auditLogRepository).save(any(OfferAuditLog.class));
    }

    @Test
    void createOffer_respectsExplicitValues() {
        var request = new CreateOfferRequest(
                UUID.randomUUID(), "Brand B Exclusive", null,
                OfferType.VOUCHER, "Fashion", new BigDecimal("15.00"), null,
                null, null, Brand.BRAND_B, null,
                RedemptionType.VOUCHER_CODE, 1000, null, null, "admin"
        );

        when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> {
            Offer o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(auditLogRepository.save(any())).thenReturn(null);

        Offer result = offerService.createOffer(request);

        assertEquals(OfferType.VOUCHER, result.getOfferType());
        assertEquals(Brand.BRAND_B, result.getBrand());
        assertEquals(RedemptionType.VOUCHER_CODE, result.getRedemptionType());
        assertEquals(1000, result.getMaxActivations());
    }

    @Test
    void updateOffer_onlyUpdatesDraftOffers() {
        UUID offerId = UUID.randomUUID();
        Offer existing = createTestOffer(offerId, OfferStatus.DRAFT);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(existing));
        when(offerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateOfferRequest(
                "Updated Title", null, null, null, null,
                null, null, null, null, null, null, null, null, null
        );

        Offer result = offerService.updateOffer(offerId, request);
        assertEquals("Updated Title", result.getTitle());
    }

    @Test
    void updateOffer_rejectsLiveOffers() {
        UUID offerId = UUID.randomUUID();
        Offer existing = createTestOffer(offerId, OfferStatus.LIVE);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(existing));

        var request = new UpdateOfferRequest(
                "Sneaky Update", null, null, null, null,
                null, null, null, null, null, null, null, null, null
        );

        assertThrows(IllegalStateException.class,
                () -> offerService.updateOffer(offerId, request));
    }

    @Test
    void changeStatus_validTransition() {
        UUID offerId = UUID.randomUUID();
        Offer offer = createTestOffer(offerId, OfferStatus.DRAFT);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(offerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogRepository.save(any())).thenReturn(null);

        var request = new StatusChangeRequest(OfferStatus.PENDING_REVIEW, "Ready for review", "merchant@test.com");
        Offer result = offerService.changeStatus(offerId, request);

        assertEquals(OfferStatus.PENDING_REVIEW, result.getStatus());

        ArgumentCaptor<OfferAuditLog> auditCaptor = ArgumentCaptor.forClass(OfferAuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        assertEquals(OfferStatus.DRAFT, auditCaptor.getValue().getPreviousStatus());
        assertEquals(OfferStatus.PENDING_REVIEW, auditCaptor.getValue().getNewStatus());
    }

    @Test
    void changeStatus_invalidTransition_throws() {
        UUID offerId = UUID.randomUUID();
        Offer offer = createTestOffer(offerId, OfferStatus.DRAFT);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        var request = new StatusChangeRequest(OfferStatus.LIVE, "Skip to live", "admin");

        assertThrows(IllegalStateException.class,
                () -> offerService.changeStatus(offerId, request));
        verify(offerRepository, never()).save(any());
    }

    @Test
    void changeStatus_retiredIsTerminal() {
        UUID offerId = UUID.randomUUID();
        Offer offer = createTestOffer(offerId, OfferStatus.RETIRED);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        var request = new StatusChangeRequest(OfferStatus.LIVE, "Resurrect", "admin");

        assertThrows(IllegalStateException.class,
                () -> offerService.changeStatus(offerId, request));
    }

    @Test
    void getOffer_notFound_returnsEmpty() {
        UUID id = UUID.randomUUID();
        when(offerRepository.findById(id)).thenReturn(Optional.empty());

        assertTrue(offerService.getOffer(id).isEmpty());
    }

    @Test
    void changeStatus_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(offerRepository.findById(id)).thenReturn(Optional.empty());

        var request = new StatusChangeRequest(OfferStatus.PENDING_REVIEW, null, null);

        assertThrows(OfferService.OfferNotFoundException.class,
                () -> offerService.changeStatus(id, request));
    }

    // ─── Test helpers ───────────────────────────────────

    private Offer createTestOffer(UUID id, OfferStatus status) {
        Offer offer = new Offer();
        offer.setId(id);
        offer.setMerchantId(UUID.randomUUID());
        offer.setTitle("Test Offer");
        offer.setDescription("A test offer");
        offer.setOfferType(OfferType.CASHBACK);
        offer.setCashbackRate(new BigDecimal("5.00"));
        offer.setStatus(status);
        offer.setBrand(Brand.BRAND_A);
        offer.setRedemptionType(RedemptionType.CARD_LINKED);
        return offer;
    }
}
