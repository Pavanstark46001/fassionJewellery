package com.luxora.jewellery.cms.dto;

import com.luxora.jewellery.cms.entity.SectionType;

import java.util.List;
import java.util.UUID;

public record HomeSectionDto(
        UUID id,
        String title,
        String subtitle,
        SectionType sectionType,
        Integer displayOrder,
        List<HomeSectionItemDto> items
) {
}
