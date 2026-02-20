package com.lbg.commerce.partner.model;

import java.util.Map;
import java.util.Set;

/**
 * Partner lifecycle states with valid transitions.
 *
 * State Machine:
 *   PENDING → APPROVED → SUSPENDED → APPROVED (re-activate)
 *                ↓            ↓
 *           DEACTIVATED   DEACTIVATED
 *
 * DEACTIVATED is terminal.
 * For MVP: partners are auto-set to APPROVED on registration.
 */
public enum PartnerStatus {
    PENDING,
    APPROVED,
    SUSPENDED,
    DEACTIVATED;

    private static final Map<PartnerStatus, Set<PartnerStatus>> VALID_TRANSITIONS = Map.of(
            PENDING,     Set.of(APPROVED, DEACTIVATED),
            APPROVED,    Set.of(SUSPENDED, DEACTIVATED),
            SUSPENDED,   Set.of(APPROVED, DEACTIVATED),
            DEACTIVATED, Set.of()
    );

    public boolean canTransitionTo(PartnerStatus target) {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public Set<PartnerStatus> validTransitions() {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of());
    }
}
