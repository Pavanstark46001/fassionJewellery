package com.luxora.jewellery.admin.page.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminStaticPageRequest(
        /** Optional - auto-derived from {@code title} via {@code SlugUtil} when blank. */
        String slug,

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Content is required")
        String content,

        String metaTitle,

        String metaDescription
) {
}
