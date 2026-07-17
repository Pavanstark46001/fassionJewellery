package com.luxora.jewellery.admin.category.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminCategoryRequest(
        @NotBlank(message = "Name is required")
        String name,

        /** Optional - auto-derived from {@code name} via {@code SlugUtil} when blank. */
        String slug,

        String description,

        String imageUrl,

        Integer displayOrder,

        Boolean isActive,

        String metaTitle,

        String metaDescription
) {
}
