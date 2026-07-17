package com.luxora.jewellery.admin.cms.dto;

import jakarta.validation.constraints.NotNull;

/** Minimal payload for {@code PATCH .../reorder} - just the new position. */
public record AdminReorderRequest(
        @NotNull(message = "displayOrder is required")
        Integer displayOrder
) {
}
