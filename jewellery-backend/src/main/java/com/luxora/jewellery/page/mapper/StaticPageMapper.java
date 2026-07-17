package com.luxora.jewellery.page.mapper;

import com.luxora.jewellery.page.dto.StaticPageDto;
import com.luxora.jewellery.page.entity.StaticPage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StaticPageMapper {

    StaticPageDto toDto(StaticPage staticPage);
}
