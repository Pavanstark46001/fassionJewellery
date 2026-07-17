package com.luxora.jewellery.page.dto;

import java.util.UUID;

public record StaticPageDto(
        UUID id,
        String slug,
        String title,
        String content,
        String metaTitle,
        String metaDescription
) {
}
