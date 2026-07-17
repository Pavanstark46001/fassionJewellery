package com.luxora.jewellery.blog.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight shape for the blog listing page - excludes {@code content}
 * (and SEO meta fields), same reasoning as {@code ProductSummaryDto} vs
 * {@code ProductDetailDto}.
 */
public record BlogPostSummaryDto(
        UUID id,
        String title,
        String slug,
        String excerpt,
        String coverImageUrl,
        String authorName,
        Instant publishedDate
) {
}
