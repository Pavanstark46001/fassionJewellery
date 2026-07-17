package com.luxora.jewellery.admin.customer.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerSummaryDto(
        UUID id,
        String email,
        String fullName,
        String phoneNumber,
        boolean isActive,
        Instant createdDate,
        long orderCount
) {
}
