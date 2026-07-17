package com.luxora.jewellery.cms.dto;

import java.util.UUID;

public record BannerDto(
        UUID id,
        String title,
        String subtitle,
        String imageUrl,
        String linkUrl,
        Integer displayOrder,
        boolean isActive
) {
}
