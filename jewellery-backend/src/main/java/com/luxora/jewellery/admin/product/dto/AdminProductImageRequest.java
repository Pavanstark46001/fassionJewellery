package com.luxora.jewellery.admin.product.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * One entry of the {@code images} list on {@link AdminProductRequest}. Maps
 * 1:1 onto a {@code ProductImage} row created/replaced for the product.
 */
public record AdminProductImageRequest(
        @NotBlank(message = "imageUrl is required")
        String imageUrl,

        String altText,

        Integer displayOrder,

        boolean isPrimary
) {
}
