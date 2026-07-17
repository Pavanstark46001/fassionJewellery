package com.luxora.jewellery.pos.dto;

import java.util.UUID;

/**
 * Result row for {@code GET /api/v1/admin/pos/customers/search} - a
 * lightweight registered-customer lookup by phone number, so staff can
 * optionally link a POS sale to a real account instead of ringing it up as
 * an anonymous walk-in. Not a full CRM search.
 */
public record PosCustomerSearchDto(
        UUID id,
        String fullName,
        String email,
        String phoneNumber
) {
}
