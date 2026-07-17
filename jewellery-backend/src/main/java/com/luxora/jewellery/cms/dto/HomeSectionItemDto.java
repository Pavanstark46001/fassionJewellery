package com.luxora.jewellery.cms.dto;

import com.luxora.jewellery.cms.entity.ReferenceType;

import java.util.UUID;

/**
 * A single, fully-resolved homepage section item. {@code data} holds whatever
 * summary DTO matches {@code referenceType} (CategoryDto, SubCategoryDto,
 * CollectionDto, OccasionDto or ProductSummaryDto) so the frontend can render
 * the whole homepage from this one payload without further API calls.
 */
public record HomeSectionItemDto(
        UUID id,
        ReferenceType referenceType,
        UUID referenceId,
        Integer displayOrder,
        String overrideImageUrl,
        Object data
) {
}
