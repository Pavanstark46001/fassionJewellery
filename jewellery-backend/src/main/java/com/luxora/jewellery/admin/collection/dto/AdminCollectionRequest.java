package com.luxora.jewellery.admin.collection.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminCollectionRequest(
        @NotBlank(message = "Name is required")
        String name,

        /** Optional - auto-derived from {@code name} via {@code SlugUtil} when blank. */
        String slug,

        String description,

        String imageUrl,

        Boolean isFeatured,

        Integer displayOrder,

        Boolean isActive,

        String metaTitle,

        String metaDescription
) {
}
