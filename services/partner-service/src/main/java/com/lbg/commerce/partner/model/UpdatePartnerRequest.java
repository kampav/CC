package com.lbg.commerce.partner.model;

import jakarta.validation.constraints.*;

public record UpdatePartnerRequest(
        @Size(max = 255)
        String businessName,

        @Size(max = 255)
        String tradingName,

        @Size(max = 50)
        String registrationNumber,

        @Email
        @Size(max = 255)
        String contactEmail,

        @Size(max = 255)
        String contactName,

        @Size(max = 20)
        String phone,

        @Size(max = 255)
        String addressLine1,

        @Size(max = 255)
        String addressLine2,

        @Size(max = 100)
        String city,

        @Size(max = 10)
        String postcode,

        @Size(max = 100)
        String category,

        @Size(max = 500)
        String logoUrl
) {}
