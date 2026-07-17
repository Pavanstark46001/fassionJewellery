package com.luxora.jewellery.admin.cms.dto;

import com.luxora.jewellery.cms.entity.SectionType;

import java.util.List;
import java.util.UUID;

public record AdminHomeSectionDto(
        UUID id,
        String title,
        String subtitle,
        SectionType sectionType,
        Integer displayOrder,
        boolean isActive,
        List<AdminHomeSectionItemDto> items
) {
}
