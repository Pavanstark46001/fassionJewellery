package com.luxora.jewellery.pos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Body for {@code POST /api/v1/admin/pos/customers} - staff creating a new
 * customer record on the spot at the till, typically right after a phone
 * search ({@code PosCustomerSearchDto}) came back empty. {@code email} is
 * optional since a walk-in customer may not want to share one; when blank,
 * {@code PosService} derives a placeholder from the phone number so the
 * account still satisfies the unique/non-null email constraint every other
 * account has.
 */
public record PosCreateCustomerRequest(
        @NotBlank(message = "Customer name is required")
        String fullName,

        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @Email(message = "Email must be valid")
        String email
) {
}
