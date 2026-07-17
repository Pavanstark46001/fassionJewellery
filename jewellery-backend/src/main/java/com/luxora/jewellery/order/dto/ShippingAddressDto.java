package com.luxora.jewellery.order.dto;

public record ShippingAddressDto(
        String fullName,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country
) {
}
