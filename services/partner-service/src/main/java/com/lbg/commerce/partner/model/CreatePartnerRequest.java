package com.lbg.commerce.partner.model;

import jakarta.validation.constraints.*;

public record CreatePartnerRequest(
        @NotBlank(message = "Business name is required")
        @Size(max = 255, message = "Business name must be 255 characters or fewer")
        String businessName,

        @Size(max = 255)
        String tradingName,

        @Size(max = 50)
        String registrationNumber,

        @NotBlank(message = "Contact email is required")
        @Email(message = "Contact email must be a valid email address")
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
        String logoUrl,

        String createdBy
) {}
