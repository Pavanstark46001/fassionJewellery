package com.luxora.jewellery.category.dto;

import java.util.UUID;

public record CategoryDto(
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
