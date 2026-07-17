package com.luxora.jewellery.cms.mapper;

import com.luxora.jewellery.cms.dto.BannerDto;
import com.luxora.jewellery.cms.entity.Banner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    @Mapping(target = "isActive", source = "active")
    BannerDto toDto(Banner banner);
}
