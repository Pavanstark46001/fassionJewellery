package com.luxora.jewellery.occasion.dto;

import java.util.UUID;

public record OccasionDto(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        Integer displayOrder,
        boolean isActive,
        String metaTitle,
        String metaDescription
) {
}
