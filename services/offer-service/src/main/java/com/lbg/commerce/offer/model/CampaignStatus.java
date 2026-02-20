package com.lbg.commerce.offer.model;

import java.util.Map;
import java.util.Set;

public enum CampaignStatus {
    DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, ARCHIVED;

    private static final Map<CampaignStatus, Set<CampaignStatus>> TRANSITIONS = Map.of(
            DRAFT, Set.of(SCHEDULED, ACTIVE, ARCHIVED),
            SCHEDULED, Set.of(ACTIVE, DRAFT, ARCHIVED),
            ACTIVE, Set.of(PAUSED, COMPLETED, ARCHIVED),
            PAUSED, Set.of(ACTIVE, COMPLETED, ARCHIVED),
            COMPLETED, Set.of(ARCHIVED),
            ARCHIVED, Set.of()
    );

    public boolean canTransitionTo(CampaignStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public Set<CampaignStatus> validTransitions() {
        return TRANSITIONS.getOrDefault(this, Set.of());
    }
}
