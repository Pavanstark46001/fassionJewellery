package com.luxora.jewellery.admin.cms.dto;

import com.luxora.jewellery.cms.entity.ReferenceType;

import java.util.UUID;

/**
 * Raw (unresolved) admin view of a home section item - just the pointer and
 * ordering, not the resolved category/product/etc payload the public
 * {@code HomeSectionService} produces. Good enough for an admin UI that only
 * needs to list/reorder/edit items, not render them.
 */
public record AdminHomeSectionItemDto(
        UUID id,
        UUID homeSectionId,
        ReferenceType referenceType,
        UUID referenceId,
        Integer displayOrder,
        String overrideImageUrl
) {
}
