package com.luxora.jewellery.admin.blog.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminBlogPostRequest(
        @NotBlank(message = "Title is required")
        String title,

        /** Optional - auto-derived from {@code title} via {@code SlugUtil} when blank. */
        String slug,

        String excerpt,

        @NotBlank(message = "Content is required")
        String content,

        String coverImageUrl,

        String authorName,

        /** Optional - defaults to {@code false} (draft) when omitted. */
        Boolean isPublished,

        String metaTitle,

        String metaDescription
) {
}
