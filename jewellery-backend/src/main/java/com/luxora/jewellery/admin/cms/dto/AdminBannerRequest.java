package com.luxora.jewellery.admin.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminBannerRequest(
        @NotBlank(message = "Title is required")
        String title,

        String subtitle,

        @NotBlank(message = "imageUrl is required")
        String imageUrl,

        String linkUrl,

        Integer displayOrder,

        Boolean isActive
) {
}
