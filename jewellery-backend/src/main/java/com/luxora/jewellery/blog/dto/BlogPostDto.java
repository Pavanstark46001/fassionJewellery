package com.luxora.jewellery.blog.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Full blog post shape - public detail page ({@code GET /api/v1/blog/{slug}})
 * and the admin API (list/get/create/update) all share this one shape rather
 * than duplicating a near-identical admin DTO, since unlike CMS banners/home
 * sections there's no resolved/polymorphic content to hide from the public
 * side here.
 */
public record BlogPostDto(
        UUID id,
        String title,
        String slug,
        String excerpt,
        String content,
        String coverImageUrl,
        String authorName,
        boolean isPublished,
        Instant publishedDate,
        String metaTitle,
        String metaDescription
) {
}
