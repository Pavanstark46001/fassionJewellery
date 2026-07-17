package com.luxora.jewellery.product.dto;

import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.entity.StockStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailDto(
        UUID id,
        String ornamentId,
        String name,
        String slug,
        String shortDescription,
        String description,
        BigDecimal basePrice,
        BigDecimal discountedPrice,
        MetalType metalType,
        BigDecimal weightGrams,
        UUID categoryId,
        String categoryName,
        String categorySlug,
        UUID subCategoryId,
        String subCategoryName,
        String subCategorySlug,
        boolean isActive,
        boolean isFeatured,
        StockStatus stockStatus,
        String metaTitle,
        String metaDescription,
        List<ProductImageDto> images,
        List<String> collectionSlugs,
        List<String> occasionSlugs,
        Double averageRating,
        int reviewCount
) {
}
