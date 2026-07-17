package com.luxora.jewellery.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        String phoneNumber,

        /** Sprint 8: optional - another user's shareable referral code. If
         * it matches an existing user, the new account is linked to them via
         * {@code referredByUserId} (see {@code AuthService}). An unknown/
         * invalid code is silently ignored rather than rejecting the whole
         * registration, since a typo here shouldn't block signup. */
        String referralCode
) {
}
