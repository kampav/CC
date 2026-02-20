package com.lbg.commerce.offer.model;

import java.util.Set;
import java.util.Map;

/**
 * Offer lifecycle states with valid transitions.
 * 
 * State Machine:
 *   DRAFT → PENDING_REVIEW → APPROVED → LIVE → PAUSED → LIVE (re-activate)
 *                                         ↓              ↓
 *                                      EXPIRED        RETIRED
 *                                         ↓
 *                                      RETIRED
 * 
 * RETIRED is terminal. EXPIRED can only transition to RETIRED.
 */
public enum OfferStatus {
    DRAFT,
    PENDING_REVIEW,
    APPROVED,
    LIVE,
    PAUSED,
    EXPIRED,
    RETIRED;

    private static final Map<OfferStatus, Set<OfferStatus>> VALID_TRANSITIONS = Map.of(
            DRAFT,          Set.of(PENDING_REVIEW, RETIRED),
            PENDING_REVIEW, Set.of(APPROVED, DRAFT, RETIRED),
            APPROVED,       Set.of(LIVE, RETIRED),
            LIVE,           Set.of(PAUSED, EXPIRED, RETIRED),
            PAUSED,         Set.of(LIVE, RETIRED),
            EXPIRED,        Set.of(RETIRED),
            RETIRED,        Set.of()
    );

    public boolean canTransitionTo(OfferStatus target) {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public Set<OfferStatus> validTransitions() {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of());
    }
}
