package com.luxora.jewellery.occasion.mapper;

import com.luxora.jewellery.occasion.dto.OccasionDto;
import com.luxora.jewellery.occasion.entity.Occasion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OccasionMapper {

    @Mapping(target = "isActive", source = "active")
    OccasionDto toDto(Occasion occasion);
}
