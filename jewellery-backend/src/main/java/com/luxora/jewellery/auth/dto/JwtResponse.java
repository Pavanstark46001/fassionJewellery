package com.luxora.jewellery.auth.dto;

import java.util.List;
import java.util.UUID;

public record JwtResponse(
        String accessToken,
        String tokenType,
        UUID userId,
        String email,
        String fullName,
        List<String> roles
) {
    public static JwtResponse of(String accessToken, UUID userId, String email, String fullName, List<String> roles) {
        return new JwtResponse(accessToken, "Bearer", userId, email, fullName, roles);
    }
}
