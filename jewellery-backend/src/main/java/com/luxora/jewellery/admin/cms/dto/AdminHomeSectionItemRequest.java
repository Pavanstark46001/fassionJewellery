package com.luxora.jewellery.admin.cms.dto;

import com.luxora.jewellery.cms.entity.ReferenceType;
import jakarta.validation.constraints.NotNull;

/**
 * Admin add/update payload for a single {@code home_section_items} row.
 * {@code referenceId} is stored as a loose pointer (not FK-validated at
 * write time) exactly like the entity - {@code HomeSectionService} is what
 * resolves/validates it into real content when the public homepage is read.
 */
public record AdminHomeSectionItemRequest(
        @NotNull(message = "referenceType is required")
        ReferenceType referenceType,

        @NotNull(message = "referenceId is required")
        java.util.UUID referenceId,

        Integer displayOrder,

        String overrideImageUrl
) {
}
