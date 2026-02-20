package com.lbg.commerce.offer;

import com.lbg.commerce.offer.model.OfferStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class OfferStatusTest {

    @ParameterizedTest
    @CsvSource({
            "DRAFT, PENDING_REVIEW, true",
            "DRAFT, RETIRED, true",
            "DRAFT, LIVE, false",
            "DRAFT, APPROVED, false",
            "PENDING_REVIEW, APPROVED, true",
            "PENDING_REVIEW, DRAFT, true",
            "PENDING_REVIEW, RETIRED, true",
            "PENDING_REVIEW, LIVE, false",
            "APPROVED, LIVE, true",
            "APPROVED, RETIRED, true",
            "APPROVED, DRAFT, false",
            "LIVE, PAUSED, true",
            "LIVE, EXPIRED, true",
            "LIVE, RETIRED, true",
            "LIVE, DRAFT, false",
            "PAUSED, LIVE, true",
            "PAUSED, RETIRED, true",
            "PAUSED, DRAFT, false",
            "EXPIRED, RETIRED, true",
            "EXPIRED, LIVE, false",
            "EXPIRED, DRAFT, false",
            "RETIRED, DRAFT, false",
            "RETIRED, LIVE, false",
            "RETIRED, RETIRED, false",
    })
    void testTransitions(OfferStatus from, OfferStatus to, boolean expected) {
        assertEquals(expected, from.canTransitionTo(to),
                String.format("Expected %s -> %s to be %s", from, to, expected));
    }

    @Test
    void retiredIsTerminal() {
        assertTrue(OfferStatus.RETIRED.validTransitions().isEmpty(),
                "RETIRED should have no valid transitions");
    }

    @Test
    void draftHasTwoTransitions() {
        var transitions = OfferStatus.DRAFT.validTransitions();
        assertEquals(2, transitions.size());
        assertTrue(transitions.contains(OfferStatus.PENDING_REVIEW));
        assertTrue(transitions.contains(OfferStatus.RETIRED));
    }

    @Test
    void liveHasThreeTransitions() {
        var transitions = OfferStatus.LIVE.validTransitions();
        assertEquals(3, transitions.size());
        assertTrue(transitions.contains(OfferStatus.PAUSED));
        assertTrue(transitions.contains(OfferStatus.EXPIRED));
        assertTrue(transitions.contains(OfferStatus.RETIRED));
    }
}
