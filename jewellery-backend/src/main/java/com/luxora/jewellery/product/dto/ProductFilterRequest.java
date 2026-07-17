package com.luxora.jewellery.product.dto;

import com.luxora.jewellery.product.entity.MetalType;

import java.math.BigDecimal;

/**
 * All the optional query parameters accepted by {@code GET /api/v1/products}.
 * Every field is nullable/optional - {@link com.luxora.jewellery.product.specification.ProductSpecifications}
 * only applies a predicate for the ones that are actually present.
 */
public record ProductFilterRequest(
        String categorySlug,
        String subCategorySlug,
        String collectionSlug,
        String occasionSlug,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        MetalType metalType,
        Boolean featured,
        String q
) {
}
