package com.luxora.jewellery.cms.mapper;

import com.luxora.jewellery.cms.dto.HomeSectionDto;
import com.luxora.jewellery.cms.dto.HomeSectionItemDto;
import com.luxora.jewellery.cms.entity.HomeSection;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HomeSectionMapper {

    @Mapping(target = "items", source = "items")
    HomeSectionDto toDto(HomeSection homeSection, List<HomeSectionItemDto> items);
}
