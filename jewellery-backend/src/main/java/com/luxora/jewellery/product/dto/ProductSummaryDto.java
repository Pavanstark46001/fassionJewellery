package com.luxora.jewellery.product.dto;

import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.entity.StockStatus;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight product shape for listing/grid views (catalog browse, homepage
 * carousels). Deliberately excludes long description / SEO fields that only
 * the detail page needs.
 */
public record ProductSummaryDto(
        UUID id,
        String ornamentId,
        String name,
        String slug,
        String shortDescription,
        BigDecimal basePrice,
        BigDecimal discountedPrice,
        MetalType metalType,
        boolean isFeatured,
        StockStatus stockStatus,
        String primaryImageUrl,
        String categoryName,
        String categorySlug
) {
}
