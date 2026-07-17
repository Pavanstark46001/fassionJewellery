package com.luxora.jewellery.admin.cms.dto;

import com.luxora.jewellery.cms.entity.SectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminHomeSectionRequest(
        @NotBlank(message = "Title is required")
        String title,

        String subtitle,

        @NotNull(message = "sectionType is required")
        SectionType sectionType,

        Integer displayOrder,

        Boolean isActive
) {
}
