package com.luxora.jewellery.collection.mapper;

import com.luxora.jewellery.collection.dto.CollectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CollectionMapper {

    @Mapping(target = "isFeatured", source = "featured")
    @Mapping(target = "isActive", source = "active")
    CollectionDto toDto(com.luxora.jewellery.collection.entity.Collection collection);
}
