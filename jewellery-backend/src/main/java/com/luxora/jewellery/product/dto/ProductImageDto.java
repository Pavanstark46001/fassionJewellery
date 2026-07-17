package com.luxora.jewellery.product.dto;

import java.util.UUID;

public record ProductImageDto(
        UUID id,
        String imageUrl,
        String altText,
        Integer displayOrder,
        boolean isPrimary
) {
}
