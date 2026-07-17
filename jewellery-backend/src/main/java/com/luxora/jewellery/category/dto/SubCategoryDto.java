package com.luxora.jewellery.category.dto;

import java.util.UUID;

public record SubCategoryDto(
        UUID id,
        UUID categoryId,
        String categoryName,
        String name,
        String slug,
        String description,
        String imageUrl,
        Integer displayOrder,
        boolean isActive
) {
}
