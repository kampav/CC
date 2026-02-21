package com.cc.customer.service;

import com.cc.customer.model.Classification;
import com.cc.customer.model.CustomerProfile;
import com.cc.customer.model.CustomerSummary;
import com.cc.customer.repository.ClassificationRepository;
import com.cc.customer.repository.CustomerProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomerProfileService {

    private static final Logger log = LoggerFactory.getLogger(CustomerProfileService.class);

    private final CustomerProfileRepository profileRepository;
    private final ClassificationRepository classificationRepository;

    public CustomerProfileService(CustomerProfileRepository profileRepository,
                                   ClassificationRepository classificationRepository) {
        this.profileRepository = profileRepository;
        this.classificationRepository = classificationRepository;
    }

    @Transactional(readOnly = true)
    public Optional<CustomerProfile> getProfileWithClassifications(UUID customerId) {
        return profileRepository.findByIdWithClassifications(customerId);
    }

    @Transactional(readOnly = true)
    public Optional<CustomerSummary> getSummary(UUID customerId) {
        return profileRepository.findById(customerId).map(p -> new CustomerSummary(
            p.getId(),
            p.getFirstName(),
            p.getCustomerSegment(),
            p.getLifecycleStage(),
            p.getSpendPattern(),
            p.getIncomeBand(),
            p.getPrimarySpendCategory(),
            p.getSecondarySpendCategory(),
            p.getDigitalEngagementScore()
        ));
    }

    @Transactional(readOnly = true)
    public List<Classification> getClassifications(UUID customerId) {
        return classificationRepository.findByCustomerProfileId(customerId);
    }

    @Transactional
    public CustomerProfile upsert(CustomerProfile profile) {
        log.debug("Upserting customer profile: {}", profile.getId());
        return profileRepository.save(profile);
    }
}
