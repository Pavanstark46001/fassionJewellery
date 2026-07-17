package com.luxora.jewellery.auth.dto;

import java.util.List;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String fullName,
        String phoneNumber,
        List<String> roles,
        /** Sprint 8: this user's own shareable referral code. */
        String referralCode
) {
}
