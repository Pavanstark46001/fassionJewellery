package com.luxora.jewellery.review.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewDto(
        UUID id,
        UUID userId,
        String reviewerName,
        int rating,
        String title,
        String comment,
        boolean isVerifiedPurchase,
        Instant createdDate
) {
}
