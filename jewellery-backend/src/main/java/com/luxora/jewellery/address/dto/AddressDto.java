package com.luxora.jewellery.address.dto;

import java.util.UUID;

public record AddressDto(
        UUID id,
        String label,
        String fullName,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        boolean isDefault
) {
}
