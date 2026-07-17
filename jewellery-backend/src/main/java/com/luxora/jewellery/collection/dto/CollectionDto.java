package com.luxora.jewellery.collection.dto;

import java.util.UUID;

public record CollectionDto(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        boolean isFeatured,
        Integer displayOrder,
        boolean isActive,
        String metaTitle,
        String metaDescription
) {
}
