package com.luxora.jewellery.admin.product.dto;

import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.entity.StockStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Create/update payload for {@code POST|PUT /api/v1/admin/products}. Covers
 * every column on {@code Product} plus the associated images and
 * collection/occasion links, which are created/replaced alongside it.
 *
 * <p>{@code isActive}/{@code isFeatured} are boxed (not primitive) so a
 * create request that omits them can default sensibly (active + not
 * featured) rather than silently defaulting to {@code false} the way a
 * missing primitive JSON field would.
 */
public record AdminProductRequest(
        @NotBlank(message = "Name is required")
        String name,

        /** Optional - auto-derived from {@code name} via {@code SlugUtil} when blank. */
        String slug,

        String shortDescription,

        String description,

        @NotNull(message = "basePrice is required")
        BigDecimal basePrice,

        BigDecimal discountedPrice,

        @NotNull(message = "metalType is required")
        MetalType metalType,

        BigDecimal weightGrams,

        @NotNull(message = "categoryId is required")
        UUID categoryId,

        UUID subCategoryId,

        Boolean isActive,

        Boolean isFeatured,

        /** Optional - defaults to {@code IN_STOCK} when omitted. */
        StockStatus stockStatus,

        String metaTitle,

        String metaDescription,

        @Valid
        List<AdminProductImageRequest> images,

        List<UUID> collectionIds,

        List<UUID> occasionIds
) {
}
